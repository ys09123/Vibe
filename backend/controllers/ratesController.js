const exchangeRateService = require('../services/exchangeRateService');
const cacheService = require('../services/cacheService');
const { RATE_DECIMAL_PLACES } = require('../utils/constants');

async function getLatestRates(req, res, next) {
    try {
        const base = (req.query.base || 'USD').toUpperCase();
        const todayDateStr = new Date().toISOString().split('T')[0];

        // Check if we have a cached rate for today (probe one pair)
        const probe = base === 'USD' ? 'EUR' : 'USD';
        const cached = cacheService.getCachedRate(base, probe, todayDateStr);

        if (cached) {
            // We have today's data cached — return all cached rates for this base
            const allCached = cacheService.getAllCachedRatesForBase(base, todayDateStr);
            if (Object.keys(allCached).length > 10) {
                return res.json({ success: true, data: allCached });
            }
        }

        // Cache miss or insufficient — fetch from API
        const rates = await exchangeRateService.getLatestRates(base);
        const roundedRates = {};
        for (const [currency, rate] of Object.entries(rates)) {
            roundedRates[currency] = Number(rate.toFixed(RATE_DECIMAL_PLACES));
        }
        cacheService.bulkSetCachedRates(base, roundedRates, todayDateStr);

        res.json({ success: true, data: roundedRates });
    } catch (error) {
        next(error);
    }
}

async function getHistoryRates(req, res, next) {
    try {
        const base = (req.query.base || 'USD').toUpperCase();
        const target = (req.query.target || 'EUR').toUpperCase();
        const days = Math.min(parseInt(req.query.days) || 30, 90);

        const today = new Date();
        const resultData = [];
        let apiAttempted = false;
        let apiFailed = false;

        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];

            const cached = cacheService.getCachedRate(base, target, dateStr);
            if (cached) {
                resultData.push({ date: dateStr, rate: cached });
                continue;
            }

            if (apiFailed) continue;

            // Try the historical API (paid tier only — returns null on free)
            apiAttempted = true;
            const year = d.getFullYear();
            const month = d.getMonth() + 1; // No zero-padding per API spec
            const day = d.getDate();

            const apiRates = await exchangeRateService.getHistoricalRate(base, year, month, day);
            if (apiRates && apiRates[target]) {
                const rate = Number(apiRates[target].toFixed(RATE_DECIMAL_PLACES));
                cacheService.setCachedRate(base, target, rate, dateStr);
                resultData.push({ date: dateStr, rate });
            } else {
                apiFailed = true;
            }
        }

        // If we got nothing from API, fall back to whatever cache has
        let dataSource = 'cache';
        if (resultData.length === 0) {
            const fallback = cacheService.getCachedHistory(base, target, days);
            fallback.forEach(row => resultData.push(row));
        } else if (apiAttempted && !apiFailed) {
            dataSource = 'api';
        } else if (apiAttempted && apiFailed) {
            dataSource = 'partial';
        }

        res.json({
            success: true,
            data: resultData,
            dataSource
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getLatestRates,
    getHistoryRates
};

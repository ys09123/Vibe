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
        const todayDateStr = today.toISOString().split('T')[0];

        // Ensure today's rate is cached if possible via standard pair endpoint (supported on free tier)
        if (!cacheService.getCachedRate(base, target, todayDateStr)) {
            try {
                const pairData = await exchangeRateService.getPairRate(base, target);
                if (pairData && pairData.rate) {
                    cacheService.setCachedRate(base, target, Number(pairData.rate.toFixed(RATE_DECIMAL_PLACES)), todayDateStr);
                }
            } catch (e) {
                // Non-fatal if offline
            }
        }

        // Retrieve existing history from SQLite cache
        const history = cacheService.getCachedHistory(base, target, days);
        const cachedMap = new Map(history.map(item => [item.date, item.rate]));

        const resultData = [];
        const missingDates = [];

        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];

            if (cachedMap.has(dateStr)) {
                resultData.push({ date: dateStr, rate: cachedMap.get(dateStr) });
            } else {
                missingDates.push({ date: dateStr, d });
            }
        }

        let apiAttempted = false;
        let apiFailed = false;

        // If any historical dates are missing, probe the historical endpoint on one date first
        if (missingDates.length > 0) {
            const probe = missingDates[0];
            apiAttempted = true;
            const probeRate = await exchangeRateService.getHistoricalRate(
                base,
                probe.d.getFullYear(),
                probe.d.getMonth() + 1,
                probe.d.getDate()
            );

            if (probeRate && probeRate[target]) {
                const rate = Number(probeRate[target].toFixed(RATE_DECIMAL_PLACES));
                cacheService.setCachedRate(base, target, rate, probe.date);
                resultData.push({ date: probe.date, rate });

                // Key has historical access. Fetch remaining missing dates in small batches
                const remaining = missingDates.slice(1);
                const batchSize = 5;
                for (let i = 0; i < remaining.length; i += batchSize) {
                    const batch = remaining.slice(i, i + batchSize);
                    const batchResults = await Promise.all(
                        batch.map(async item => {
                            const rates = await exchangeRateService.getHistoricalRate(
                                base,
                                item.d.getFullYear(),
                                item.d.getMonth() + 1,
                                item.d.getDate()
                            );
                            if (rates && rates[target]) {
                                const r = Number(rates[target].toFixed(RATE_DECIMAL_PLACES));
                                cacheService.setCachedRate(base, target, r, item.date);
                                return { date: item.date, rate: r };
                            }
                            return null;
                        })
                    );
                    batchResults.filter(Boolean).forEach(r => resultData.push(r));
                }
            } else {
                // Free tier or historical unavailable; stop here
                apiFailed = true;
            }
        }

        resultData.sort((a, b) => (a.date > b.date ? 1 : -1));

        const dataSource = apiAttempted && !apiFailed && resultData.length === days
            ? 'api'
            : (resultData.length > 0 ? 'partial' : 'cache');

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

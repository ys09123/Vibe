const exchangeRateService = require('../services/exchangeRateService');
const cacheService = require('../services/cacheService');
const { TRAVEL_CURRENCIES, FALLBACK_CURRENCIES, CURRENCY_SYMBOLS, CONVERSION_DECIMAL_PLACES } = require('../utils/constants');

async function calculateBudget(req, res, next) {
    try {
        const { baseCurrency, amount } = req.body;

        if (!baseCurrency || typeof baseCurrency !== 'string' || !/^[A-Z]{3}$/.test(baseCurrency)) {
            return res.status(400).json({
                success: false,
                error: { code: 'INVALID_INPUT', message: 'Invalid base currency format' }
            });
        }
        if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                error: { code: 'INVALID_INPUT', message: 'Amount must be a positive number' }
            });
        }

        const todayDateStr = new Date().toISOString().split('T')[0];

        // Try cache first
        let rates = cacheService.getAllCachedRatesForBase(baseCurrency, todayDateStr);
        const allCandidates = [...TRAVEL_CURRENCIES, ...FALLBACK_CURRENCIES];
        const neededCurrencies = allCandidates.filter(c => c !== baseCurrency);
        const hasAllNeeded = neededCurrencies.some(c => rates[c] !== undefined);

        if (!hasAllNeeded || Object.keys(rates).length < 5) {
            const apiRates = await exchangeRateService.getLatestRates(baseCurrency);
            cacheService.bulkSetCachedRates(baseCurrency, apiRates, todayDateStr);
            rates = apiRates;
        }

        // Pick exactly 5 currencies (skip baseCurrency, use fallbacks if needed)
        const targetCurrencies = [];
        for (const currency of allCandidates) {
            if (currency === baseCurrency) continue;
            if (rates[currency]) targetCurrencies.push(currency);
            if (targetCurrencies.length === 5) break;
        }

        const results = targetCurrencies.map(currency => ({
            currency,
            symbol: CURRENCY_SYMBOLS[currency] || currency,
            equivalent: Number((amount * rates[currency]).toFixed(CONVERSION_DECIMAL_PLACES))
        }));

        res.json({ success: true, data: results });
    } catch (error) {
        next(error);
    }
}

module.exports = { calculateBudget };

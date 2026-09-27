const dbModule = require('../database/init');
const exchangeRateService = require('../services/exchangeRateService');
const cacheService = require('../services/cacheService');
const { CONVERSION_DECIMAL_PLACES, RATE_DECIMAL_PLACES, MAX_HISTORY_ENTRIES } = require('../utils/constants');

async function convert(req, res, next) {
    try {
        const { from, to, amount } = req.body;
        const todayDateStr = new Date().toISOString().split('T')[0];

        let rate = cacheService.getCachedRate(from, to, todayDateStr);
        if (!rate) {
            const pairData = await exchangeRateService.getPairRate(from, to);
            rate = pairData.rate;
            cacheService.setCachedRate(from, to, rate, todayDateStr);
        }

        rate = Number(rate.toFixed(RATE_DECIMAL_PLACES));
        const convertedAmount = Number((amount * rate).toFixed(CONVERSION_DECIMAL_PLACES));

        const db = dbModule.db;
        db.prepare(`
            INSERT INTO conversion_history (source_currency, target_currency, amount, converted_amount, rate)
            VALUES (?, ?, ?, ?, ?)
        `).run(from, to, amount, convertedAmount, rate);

        // Prune
        const countRes = db.prepare('SELECT COUNT(*) as count FROM conversion_history').get();
        if (countRes.count > MAX_HISTORY_ENTRIES) {
            db.prepare(`
                DELETE FROM conversion_history 
                WHERE id IN (
                    SELECT id FROM conversion_history 
                    ORDER BY created_at ASC 
                    LIMIT ?
                )
            `).run(countRes.count - MAX_HISTORY_ENTRIES);
        }

        res.json({
            success: true,
            data: {
                from,
                to,
                amount,
                rate,
                convertedAmount,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        next(error);
    }
}

module.exports = { convert };

const dbModule = require('../database/init');
const { CACHE_TTL_HOURS, HISTORY_CACHE_TTL_DAYS } = require('../utils/constants');

function getCachedRate(base, target, date) {
    const db = dbModule.db;
    const result = db.prepare(`
        SELECT rate, fetched_at FROM exchange_rate_cache 
        WHERE base_currency = ? AND target_currency = ? AND rate_date = ?
    `).get(base, target, date);

    if (!result) return null;

    const fetchedAt = new Date(result.fetched_at + 'Z');
    const now = new Date();
    const diffHours = (now - fetchedAt) / (1000 * 60 * 60);

    const todayDateStr = now.toISOString().split('T')[0];
    const ttl = (date === todayDateStr) ? CACHE_TTL_HOURS : (HISTORY_CACHE_TTL_DAYS * 24);

    if (diffHours <= ttl) {
        return result.rate;
    }
    return null;
}

function setCachedRate(base, target, rate, date) {
    const db = dbModule.db;
    db.prepare(`
        INSERT OR REPLACE INTO exchange_rate_cache (base_currency, target_currency, rate, rate_date, fetched_at)
        VALUES (?, ?, ?, ?, datetime('now'))
    `).run(base, target, rate, date);
}

function getCachedHistory(base, target, days) {
    const db = dbModule.db;
    const results = db.prepare(`
        SELECT rate_date as date, rate 
        FROM exchange_rate_cache
        WHERE base_currency = ? AND target_currency = ?
        ORDER BY rate_date DESC
        LIMIT ?
    `).all(base, target, days);
    return results.reverse();
}

function getAllCachedRatesForBase(base, date) {
    const db = dbModule.db;
    const rows = db.prepare(`
        SELECT target_currency, rate FROM exchange_rate_cache
        WHERE base_currency = ? AND rate_date = ?
    `).all(base, date);
    const result = {};
    for (const row of rows) {
        result[row.target_currency] = row.rate;
    }
    return result;
}

function bulkSetCachedRates(base, ratesObj, date) {
    const db = dbModule.db;
    for (const [target, rate] of Object.entries(ratesObj)) {
        db.prepare(`
            INSERT OR REPLACE INTO exchange_rate_cache (base_currency, target_currency, rate, rate_date, fetched_at)
            VALUES (?, ?, ?, ?, datetime('now'))
        `).run(base, target, rate, date);
    }
}

module.exports = {
    getCachedRate,
    getAllCachedRatesForBase,
    setCachedRate,
    getCachedHistory,
    bulkSetCachedRates
};

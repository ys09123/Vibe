const dbModule = require('../database/init');
const { MAX_HISTORY_ENTRIES } = require('../utils/constants');

function getHistory(req, res, next) {
    try {
        const db = dbModule.db;
        const history = db.prepare(`
            SELECT * FROM conversion_history 
            ORDER BY created_at DESC 
            LIMIT ?
        `).all(MAX_HISTORY_ENTRIES);
        
        res.json({ success: true, data: history });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getHistory
};

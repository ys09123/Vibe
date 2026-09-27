const dbModule = require('../database/init');
const { MAX_FAVORITES } = require('../utils/constants');

function getFavorites(req, res, next) {
    try {
        const db = dbModule.db;
        const favorites = db.prepare('SELECT * FROM favorites ORDER BY created_at DESC').all();
        res.json({ success: true, data: favorites });
    } catch (err) {
        next(err);
    }
}

function addFavorite(req, res, next) {
    try {
        const { source_currency, target_currency } = req.body;
        const db = dbModule.db;

        const countRes = db.prepare('SELECT COUNT(*) as count FROM favorites').get();
        if (countRes.count >= MAX_FAVORITES) {
            return res.status(400).json({
                success: false,
                error: { code: 'LIMIT_REACHED', message: `Maximum of ${MAX_FAVORITES} favorites allowed` }
            });
        }

        try {
            db.prepare(`
                INSERT INTO favorites (source_currency, target_currency)
                VALUES (?, ?)
            `).run(source_currency, target_currency);
            res.status(201).json({ success: true, data: { source_currency, target_currency } });
        } catch (dbErr) {
            if (dbErr.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                return res.status(409).json({
                    success: false,
                    error: { code: 'ALREADY_EXISTS', message: 'Favorite already exists' }
                });
            }
            throw dbErr;
        }
    } catch (err) {
        next(err);
    }
}

function deleteFavorite(req, res, next) {
    try {
        const { id } = req.params;
        const db = dbModule.db;
        
        const result = db.prepare('DELETE FROM favorites WHERE id = ?').run(id);
        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Favorite not found' }
            });
        }
        res.json({ success: true, data: { id } });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getFavorites,
    addFavorite,
    deleteFavorite
};

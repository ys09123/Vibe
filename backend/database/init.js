const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'currency.db');
let db = null;

async function initDatabase() {
    const SQL = await initSqlJs();

    if (fs.existsSync(DB_PATH)) {
        const buffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(buffer);
    } else {
        db = new SQL.Database();
    }

    db.run(`
        CREATE TABLE IF NOT EXISTS favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source_currency TEXT NOT NULL,
            target_currency TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now')),
            UNIQUE(source_currency, target_currency)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS conversion_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source_currency TEXT NOT NULL,
            target_currency TEXT NOT NULL,
            amount REAL NOT NULL,
            converted_amount REAL NOT NULL,
            rate REAL NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS exchange_rate_cache (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            base_currency TEXT NOT NULL,
            target_currency TEXT NOT NULL,
            rate REAL NOT NULL,
            rate_date TEXT NOT NULL,
            fetched_at TEXT DEFAULT (datetime('now')),
            UNIQUE(base_currency, target_currency, rate_date)
        )
    `);

    return db;
}

function saveDatabase() {
    if (db) {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(DB_PATH, buffer);
    }
}

function getDb() {
    if (!db) throw new Error('Database not initialized');
    return db;
}

// Helper functions to match better-sqlite3 patterns using sql.js API
function prepare(sql) {
    return {
        get(...params) {
            const stmt = db.prepare(sql);
            stmt.bind(params);
            if (stmt.step()) {
                const row = stmt.getAsObject();
                stmt.free();
                return row;
            }
            stmt.free();
            return undefined;
        },
        all(...params) {
            const results = [];
            const stmt = db.prepare(sql);
            stmt.bind(params);
            while (stmt.step()) {
                results.push(stmt.getAsObject());
            }
            stmt.free();
            return results;
        },
        run(...params) {
            db.run(sql, params);
            saveDatabase();
            return { changes: db.getRowsModified() };
        }
    };
}

module.exports = {
    initDatabase,
    saveDatabase,
    getDb,
    get db() {
        return { prepare };
    }
};

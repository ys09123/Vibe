require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./database/init');
const errorHandler = require('./middleware/errorHandler');

const ratesRoutes = require('./routes/rates');
const convertRoutes = require('./routes/convert');
const favoritesRoutes = require('./routes/favorites');
const historyRoutes = require('./routes/history');
const travelBudgetRoutes = require('./routes/travelBudget');

const app = express();
const PORT = process.env.PORT || 5000;

const userOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim().replace(/\/+$/, ''))
    : [];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        const cleanOrigin = origin.replace(/\/+$/, '');

        // Allow wildcard if configured
        if (process.env.ALLOWED_ORIGINS === '*') return callback(null, true);

        // Allow local development servers
        if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(cleanOrigin)) {
            return callback(null, true);
        }

        // Automatically allow Vercel domains (*.vercel.app)
        if (cleanOrigin.endsWith('.vercel.app')) {
            return callback(null, true);
        }

        // Allow custom domains from ALLOWED_ORIGINS
        if (userOrigins.includes(cleanOrigin)) {
            return callback(null, true);
        }

        return callback(null, false);
    },
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api/rates', ratesRoutes);
app.use('/api/convert', convertRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/travel-budget', travelBudgetRoutes);

// Global Error Handler
app.use(errorHandler);

async function start() {
    try {
        await initDatabase();
        console.log('Database initialized successfully.');
    } catch (error) {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    }

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

start();

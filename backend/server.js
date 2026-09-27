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

const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
    : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://localhost:4173'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('CORS request blocked: origin not allowed'));
    }
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

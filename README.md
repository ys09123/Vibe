# 💱 Currency Conversion Utility

A clean, fast, full-stack currency conversion utility featuring real-time exchange rates, 30-day historical trend visualization, persistent favorites, conversion history, intelligent SQLite caching, and an interactive Travel Budgeting sidebar.

---

## 🚀 Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, Recharts
- **Backend:** Node.js, Express.js
- **Database:** SQLite (via pure-JavaScript `sql.js` for universal compatibility without native compilation)
- **Exchange Rate Provider:** [ExchangeRate-API](https://www.exchangerate-api.com/) (v6)

---

## ✨ Features

1. **Dual Currency Converter**
   - Real-time conversion between 30+ global currencies.
   - Quick currency swap button.
   - Exact forex precision (4 decimal places for rates, 2 for converted amounts).
   - "Save to Favorites" button directly under results.

2. **30-Day Historical Trend Chart**
   - Interactive line chart powered by Recharts.
   - Visualizes rate movements over the last 30 days for any selected currency pair.
   - Hybrid data fetching: seamlessly combines live API data with local SQLite snapshots.
   - Timezone-safe date rendering preventing off-by-one calendar shifts.

3. **Currency Pair Favorites**
   - Quick-access chips to load saved currency pairs with a single click.
   - Persistent storage in SQLite with duplicate prevention.
   - Direct delete controls with real-time UI updates.

4. **Recent Conversion History**
   - Locally stored record of recent conversions with timestamps.
   - Click any historical entry to instantly re-populate the converter.
   - Automatically retains the latest 100 conversions.

5. **Local SQLite Caching & Performance**
   - Cache-first architecture minimizes external API calls and stays well within free-tier limits.
   - 24-hour TTL for live daily exchange rates.
   - 7-day TTL for historical daily snapshots.
   - Non-blocking debounced disk writes and graceful shutdown handlers to protect data integrity.

6. **Travel Budgeting Mode**
   - Slide-in right drawer/sidebar accessible from the header.
   - Enter a budget in your chosen base currency and view simultaneous equivalents in 5 major global currencies (USD, EUR, GBP, JPY, INR).
   - Dynamic fallbacks (AUD, CAD, CHF) ensure 5 comparison currencies are always displayed even when the base currency is in the primary group.

---

## 📁 Project Structure

```text
├── backend/
│   ├── controllers/
│   │   ├── convertController.js       # Handles /api/convert
│   │   ├── favoritesController.js     # Handles /api/favorites CRUD
│   │   ├── historyController.js       # Handles /api/history
│   │   ├── ratesController.js         # Handles /api/rates & /api/rates/history
│   │   └── travelBudgetController.js  # Handles /api/travel-budget
│   ├── database/
│   │   ├── init.js                    # sql.js initialization, schema & persistence
│   │   └── currency.db                # SQLite database file (gitignored)
│   ├── middleware/
│   │   ├── errorHandler.js            # Standardized JSON error response handler
│   │   └── validateRequest.js         # Input validation (currency codes, amounts)
│   ├── routes/                        # Express router definitions
│   ├── services/
│   │   ├── cacheService.js            # SQLite cache read/write/invalidation
│   │   └── exchangeRateService.js     # ExchangeRate-API client
│   ├── utils/
│   │   └── constants.js               # Currency lists, symbols, limits & TTLs
│   ├── .env.example                   # Backend environment template
│   ├── package.json
│   └── server.js                      # Express server entry point & CORS
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ConversionHistory.jsx  # Recent conversion list
│   │   │   ├── CurrencyConverter.jsx  # Core calculator widget
│   │   │   ├── CurrencySelector.jsx   # Styled currency dropdown
│   │   │   ├── ErrorMessage.jsx       # Alert banner component
│   │   │   ├── FavoritesList.jsx      # Saved pairs chips
│   │   │   ├── TravelBudget.jsx       # 5-currency budgeting widget
│   │   │   └── TrendChart.jsx         # 30-day Recharts visualizer
│   │   ├── services/
│   │   │   └── api.js                 # Frontend API client
│   │   ├── App.jsx                    # Main layout with drawer state
│   │   ├── index.css                  # Tailwind CSS directives
│   │   └── main.jsx
│   ├── .env.example                   # Frontend environment template
│   ├── vercel.json                    # Vercel SPA routing configuration
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🔌 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/rates?base=USD` | Returns current exchange rates for a base currency (cache-first). |
| `GET` | `/api/rates/history?base=USD&target=EUR&days=30` | Returns historical rates for chart visualization. |
| `POST` | `/api/convert` | Converts an amount between two currencies and records history. |
| `GET` | `/api/favorites` | Retrieves all saved currency pairs. |
| `POST` | `/api/favorites` | Saves a new currency pair (max 10). |
| `DELETE` | `/api/favorites/:id` | Removes a saved favorite pair. |
| `GET` | `/api/history` | Retrieves recent conversion history (up to 100 items). |
| `POST` | `/api/travel-budget` | Computes equivalent amounts across 5 major currencies simultaneously. |

All responses return standardized JSON:
```json
{
  "success": true,
  "data": { ... }
}
```

---

## 🛠️ Local Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A free API key from [ExchangeRate-API](https://www.exchangerate-api.com/)

---

### 1. Backend Setup

1. Open a terminal in `backend/`:
   ```bash
   cd backend
   npm install
   ```
2. Create a `.env` file from `.env.example`:
   ```env
   EXCHANGERATE_API_KEY=your_api_key_here
   PORT=5000
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
   ```
3. Start the backend:
   ```bash
   npm start
   # Or for auto-reload during development:
   npm run dev
   ```
   The backend will run on `http://localhost:5000`.

---

### 2. Frontend Setup

1. Open a new terminal in `frontend/`:
   ```bash
   cd frontend
   npm install
   ```
2. (Optional) Create a `.env` file if running on a custom backend port:
   ```env
   VITE_API_URL=http://localhost:5000
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## ☁️ Deployment Guide

### Backend on [Render](https://render.com)

1. Connect your GitHub repository to Render and create a **Web Service**.
2. Configure settings:
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. In **Environment Variables**, add:
   - `EXCHANGERATE_API_KEY`: Your ExchangeRate-API key
   - `PORT`: `5000` (or leave default assigned by Render)
   - `ALLOWED_ORIGINS`: Your Vercel frontend URL (e.g. `https://your-app.vercel.app`)

---

### Frontend on [Vercel](https://vercel.com)

1. Connect your GitHub repository to Vercel and create a **New Project**.
2. Configure project settings:
   - **Root Directory:** Click Edit and select `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. In **Environment Variables**, add:
   - `VITE_API_URL`: Your deployed Render service URL (e.g. `https://your-backend.onrender.com`)
4. Click **Deploy**.

*(Note: `frontend/vercel.json` is pre-configured to ensure client-side routing works smoothly).*

---

## 📄 License

MIT

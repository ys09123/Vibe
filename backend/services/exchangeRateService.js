const { EXCHANGERATE_API_BASE } = require('../utils/constants');

function getApiKey() {
    const key = process.env.EXCHANGERATE_API_KEY;
    if (!key) {
        const error = new Error('API key not configured');
        error.code = 'CONFIG_ERROR';
        throw error;
    }
    return key;
}

function checkApiResult(data, status) {
    if (data.result === 'error') {
        const error = new Error(`API Error: ${data['error-type'] || 'Unknown'}`);
        error.code = 'API_ERROR';
        error.status = status;
        throw error;
    }
}

async function getLatestRates(baseCurrency) {
    const key = getApiKey();
    const url = `${EXCHANGERATE_API_BASE}/${key}/latest/${baseCurrency}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        checkApiResult(data, res.status);
        return data.conversion_rates;
    } catch (err) {
        if (!err.code) err.code = 'NETWORK_ERROR';
        throw err;
    }
}

async function getPairRate(base, target) {
    const key = getApiKey();
    const url = `${EXCHANGERATE_API_BASE}/${key}/pair/${base}/${target}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        checkApiResult(data, res.status);
        return { rate: data.conversion_rate, base, target };
    } catch (err) {
        if (!err.code) err.code = 'NETWORK_ERROR';
        throw err;
    }
}

async function getHistoricalRate(base, year, month, day) {
    const key = getApiKey();
    const url = `${EXCHANGERATE_API_BASE}/${key}/history/${base}/${year}/${month}/${day}`;
    try {
        const res = await fetch(url);
        if (res.status === 403) return null;
        const data = await res.json();
        if (data.result === 'error') return null;
        return data.conversion_rates;
    } catch (err) {
        if (err.status === 403) return null;
        if (!err.code) err.code = 'NETWORK_ERROR';
        throw err;
    }
}

module.exports = {
    getLatestRates,
    getPairRate,
    getHistoricalRate
};

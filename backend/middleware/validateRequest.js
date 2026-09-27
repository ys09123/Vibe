function validateCurrencyFormat(currency) {
    return typeof currency === 'string' && currency.length === 3 && /^[A-Z]{3}$/.test(currency);
}

function sendInvalidError(res, message) {
    return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message }
    });
}

const validateCurrencyPair = (req, res, next) => {
    const from = req.body.from || req.body.source_currency;
    const to = req.body.to || req.body.target_currency;
    
    if (!validateCurrencyFormat(from)) {
        return sendInvalidError(res, 'Invalid source currency format');
    }
    if (!validateCurrencyFormat(to)) {
        return sendInvalidError(res, 'Invalid target currency format');
    }
    next();
};

const validateAmount = (req, res, next) => {
    const amount = req.body.amount;
    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
        return sendInvalidError(res, 'Amount must be a positive number');
    }
    next();
};

const validateBase = (req, res, next) => {
    const base = req.query.base || req.body.baseCurrency;
    if (base && !validateCurrencyFormat(base)) {
        return sendInvalidError(res, 'Invalid base currency format');
    }
    next();
};

module.exports = {
    validateCurrencyPair,
    validateAmount,
    validateBase
};

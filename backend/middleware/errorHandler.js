function errorHandler(err, req, res, next) {
    console.error(err);

    let statusCode = 500;
    let code = 'INTERNAL_ERROR';
    let message = 'An unexpected error occurred';

    if (err.code === 'INVALID_INPUT') {
        statusCode = 400;
        code = err.code;
        message = err.message;
    } else if (err.code === 'API_ERROR') {
        statusCode = err.status || 502;
        code = err.code;
        message = err.message || 'Error communicating with external API';
    } else if (err.code === 'CONFIG_ERROR') {
        statusCode = 500;
        code = err.code;
        message = 'Server configuration error';
    } else if (err.code === 'NETWORK_ERROR') {
        statusCode = 503;
        code = err.code;
        message = 'Network error while contacting external services';
    }

    res.status(statusCode).json({
        success: false,
        error: { code, message }
    });
}

module.exports = errorHandler;

const express = require('express');
const router = express.Router();
const convertController = require('../controllers/convertController');
const { validateCurrencyPair, validateAmount } = require('../middleware/validateRequest');

router.post('/', validateCurrencyPair, validateAmount, convertController.convert);

module.exports = router;

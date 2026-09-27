const express = require('express');
const router = express.Router();
const ratesController = require('../controllers/ratesController');
const { validateBase } = require('../middleware/validateRequest');

router.get('/', validateBase, ratesController.getLatestRates);
router.get('/history', validateBase, ratesController.getHistoryRates);

module.exports = router;

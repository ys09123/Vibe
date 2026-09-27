const express = require('express');
const router = express.Router();
const travelBudgetController = require('../controllers/travelBudgetController');
const { validateAmount, validateBase } = require('../middleware/validateRequest');

router.post('/', validateBase, validateAmount, travelBudgetController.calculateBudget);

module.exports = router;

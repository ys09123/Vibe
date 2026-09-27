const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favoritesController');
const { validateCurrencyPair } = require('../middleware/validateRequest');

router.get('/', favoritesController.getFavorites);
router.post('/', validateCurrencyPair, favoritesController.addFavorite);
router.delete('/:id', favoritesController.deleteFavorite);

module.exports = router;

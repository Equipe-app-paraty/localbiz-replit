const express = require('express');
const router = express.Router();
const businessController = require('../controllers/businessController');
const { validateSearch } = require('../middleware/validation');
const cacheMiddleware = require('../middleware/cache');

// Rota para buscar estabelecimentos (com cache de 1 hora)
router.get('/search', validateSearch, cacheMiddleware(3600), businessController.searchBusinesses);

// Rota para obter detalhes de um estabelecimento específico
router.get('/:id', businessController.getBusinessDetails);

module.exports = router;
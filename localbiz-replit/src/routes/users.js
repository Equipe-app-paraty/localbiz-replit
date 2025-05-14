const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');

// Aplicar middleware de autenticação em todas as rotas
router.use(requireAuth);

// Rotas para usuários
router.get('/me', userController.getCurrentUser);
router.patch('/metadata', userController.updateUserMetadata);

module.exports = router;
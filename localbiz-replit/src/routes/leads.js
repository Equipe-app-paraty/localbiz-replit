const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const { requireAuth } = require('../middleware/auth');
const { validateCreateLead, validateUpdateLead } = require('../middleware/validation');

// Aplicar middleware de autenticação em todas as rotas
router.use(requireAuth);

// Rotas para leads
router.post('/', validateCreateLead, leadController.createLead);
router.get('/', leadController.getLeads);
router.put('/:id', validateUpdateLead, leadController.updateLead);
router.delete('/:id', leadController.deleteLead);

module.exports = router;
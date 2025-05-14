const express = require('express');
const router = express.Router();

// Importar rotas específicas
const businessesRouter = require('./businesses');
const leadsRouter = require('./leads');
const usersRouter = require('./users');

// Definir rotas principais
router.use('/businesses', businessesRouter);
router.use('/leads', leadsRouter);
router.use('/users', usersRouter);

module.exports = router;
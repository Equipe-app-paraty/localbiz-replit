const { requireAuth, clerkClient } = require('@clerk/express');

// Middleware que requer autenticação
// O novo SDK usa requireAuth() como uma função que retorna um middleware
const requireAuthMiddleware = requireAuth();

// Middleware para extrair informações do usuário
const extractUserInfo = (req, res, next) => {
  // O middleware clerkMiddleware já adiciona req.auth
  // Podemos adicionar mais informações do usuário se necessário
  if (req.auth && req.auth.userId) {
    // Você pode adicionar mais informações do usuário aqui se necessário
    console.log(`Usuário autenticado: ${req.auth.userId}`);
  }
  next();
};

module.exports = {
  requireAuth: requireAuthMiddleware,
  extractUserInfo
};
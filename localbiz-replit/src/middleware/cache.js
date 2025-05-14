const cacheService = require('../services/cacheService');

/**
 * Middleware para cache de respostas
 * @param {number} duration - Duração do cache em segundos (padrão: 24 horas)
 */
const cacheMiddleware = (duration = 86400) => {
  return async (req, res, next) => {
    // Criar uma chave de cache baseada no método e URL da requisição
    const key = `__cache__${req.method}__${req.originalUrl}`;
    
    try {
      // Verificar se os dados estão em cache
      const cachedData = await cacheService.getCachedData(key);
      
      if (cachedData) {
        // Retornar dados do cache
        return res.json(cachedData);
      }
      
      // Modificar o método res.json para armazenar a resposta em cache
      const originalJson = res.json;
      res.json = function(data) {
        // Restaurar o método original
        res.json = originalJson;
        
        // Armazenar dados em cache
        cacheService.setCachedData(key, data, duration);
        
        // Enviar resposta
        return res.json(data);
      };
      
      next();
    } catch (error) {
      console.error('Erro no middleware de cache:', error);
      next();
    }
  };
};

module.exports = cacheMiddleware;
const redis = require('redis');
const { promisify } = require('util');

class CacheService {
  constructor() {
    this.client = redis.createClient(process.env.REDIS_URL);
    this.defaultExpiration = 86400; // 24 horas
    
    // Promisify Redis methods
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    
    // Error handling
    this.client.on('error', (err) => {
      console.error('Erro no Redis:', err);
    });
  }

  async getCachedData(key) {
    try {
      const data = await this.getAsync(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Erro ao obter dados do cache:', error);
      return null;
    }
  }

  async setCachedData(key, data, expiration = this.defaultExpiration) {
    try {
      await this.setAsync(key, JSON.stringify(data), 'EX', expiration);
      return true;
    } catch (error) {
      console.error('Erro ao definir dados no cache:', error);
      return false;
    }
  }
}

module.exports = new CacheService();
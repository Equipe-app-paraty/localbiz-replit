const { clerkClient } = require('@clerk/express');

class AuthService {
  /**
   * Obtém informações do usuário pelo ID
   * @param {string} userId - ID do usuário no Clerk
   * @returns {Promise<Object>} - Dados do usuário
   */
  async getUserById(userId) {
    try {
      const user = await clerkClient.users.getUser(userId);
      return user;
    } catch (error) {
      console.error('Erro ao obter usuário:', error);
      throw new Error('Falha ao obter informações do usuário');
    }
  }

  // Método verifyToken removido pois não é utilizado e o Clerk já lida com a verificação
}

module.exports = new AuthService();
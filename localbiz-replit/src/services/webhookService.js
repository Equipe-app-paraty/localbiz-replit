const User = require('../models/user');

class WebhookService {
  /**
   * Processa eventos de usuário criado ou atualizado
   * @param {Object} data - Dados do usuário do Clerk
   * @returns {Promise<Object>} - Usuário criado ou atualizado
   */
  async handleUserCreatedOrUpdated(data) {
    try {
      // Verificar se temos os dados necessários
      if (!data || !data.id) {
        throw new Error('Dados de usuário inválidos');
      }

      // Extrair email principal (se disponível)
      let email = null;
      if (data.email_addresses && data.email_addresses.length > 0) {
        email = data.email_addresses[0].email_address;
      }

      // Atualizar ou criar usuário no MongoDB
      const user = await User.findOneAndUpdate(
        { clerkId: data.id },
        {
          clerkId: data.id,
          email: email,
          firstName: data.first_name,
          lastName: data.last_name,
          profileImage: data.profile_image_url,
          updatedAt: new Date()
        },
        { upsert: true, new: true }
      );

      console.log(`Usuário salvo no MongoDB: ${data.id}`);
      return user;
    } catch (error) {
      console.error('Erro ao processar evento de usuário:', error);
      throw error;
    }
  }

  /**
   * Processa eventos de usuário excluído
   * @param {Object} data - Dados do usuário do Clerk
   * @returns {Promise<boolean>} - Resultado da operação
   */
  async handleUserDeleted(data) {
    try {
      if (!data || !data.id) {
        throw new Error('ID de usuário inválido');
      }

      // Remover usuário do MongoDB
      const result = await User.findOneAndDelete({ clerkId: data.id });
      return !!result; // Retorna true se o usuário foi encontrado e removido
    } catch (error) {
      console.error('Erro ao processar exclusão de usuário:', error);
      throw error;
    }
  }
}

module.exports = new WebhookService();
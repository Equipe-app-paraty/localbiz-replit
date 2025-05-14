const User = require('../models/user');
const authService = require('../services/authService');

// Obter perfil do usuário atual
exports.getCurrentUser = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    
    // Buscar usuário no MongoDB
    let user = await User.findOne({ clerkId });
    
    // Se o usuário não existir no MongoDB, buscar do Clerk e criar
    if (!user) {
      const clerkUser = await authService.getUserById(clerkId);
      
      user = new User({
        clerkId,
        email: clerkUser.emailAddresses[0].emailAddress,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        profileImage: clerkUser.profileImageUrl
      });
      
      await user.save();
    }
    
    res.json(user);
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    res.status(500).json({ error: 'Falha ao obter informações do usuário' });
  }
};

// Atualizar metadados do usuário
exports.updateUserMetadata = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    const { metadata } = req.body;
    
    // Atualizar usuário no MongoDB
    const user = await User.findOneAndUpdate(
      { clerkId },
      { $set: { metadata, updatedAt: new Date() } }, // Adicionado updatedAt
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Erro ao atualizar metadados do usuário:', error);
    res.status(500).json({ error: 'Falha ao atualizar metadados do usuário' });
  }
};
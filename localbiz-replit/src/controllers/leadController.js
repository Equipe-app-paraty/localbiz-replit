const Lead = require('../models/lead');
const Business = require('../models/business');

// Criar um novo lead
exports.createLead = async (req, res) => {
  try {
    const { business: businessId, notes, contactMethod } = req.body;
    const userId = req.auth.userId; // Obtido do middleware de autenticação Clerk
    
    // Verificar se o estabelecimento existe
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ error: 'Estabelecimento não encontrado' });
    }
    
    // Verificar se já existe um lead para este estabelecimento e usuário
    const existingLead = await Lead.findOne({ business: businessId, userId });
    if (existingLead) {
      return res.status(400).json({ error: 'Lead já existe para este estabelecimento' });
    }
    
    // Criar novo lead
    const lead = new Lead({
      business: businessId,
      userId,
      notes,
      contactHistory: notes || contactMethod ? [{
        notes,
        contactMethod
      }] : []
    });
    
    await lead.save();
    
    res.status(201).json(lead);
  } catch (error) {
    console.error('Erro ao criar lead:', error);
    res.status(500).json({ error: 'Falha ao criar lead' });
  }
};

// Obter todos os leads do usuário
exports.getLeads = async (req, res) => {
  try {
    const userId = req.auth.userId;
    
    // Buscar leads do usuário com informações do estabelecimento
    const leads = await Lead.find({ userId })
      .populate('business')
      .sort({ createdAt: -1 });
    
    res.json(leads);
  } catch (error) {
    console.error('Erro ao obter leads:', error);
    res.status(500).json({ error: 'Falha ao obter leads' });
  }
};

// Atualizar um lead
exports.updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, contactMethod } = req.body;
    const userId = req.auth.userId;
    
    // Buscar lead
    const lead = await Lead.findById(id);
    
    if (!lead) {
      return res.status(404).json({ error: 'Lead não encontrado' });
    }
    
    // Verificar se o lead pertence ao usuário
    if (lead.userId !== userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    
    // Atualizar status se fornecido
    if (status) {
      lead.status = status;
    }
    
    // Adicionar ao histórico de contato se notas ou método de contato fornecidos
    if (notes || contactMethod) {
      lead.contactHistory.push({
        notes,
        contactMethod
      });
    }
    
    await lead.save();
    
    res.json(lead);
  } catch (error) {
    console.error('Erro ao atualizar lead:', error);
    res.status(500).json({ error: 'Falha ao atualizar lead' });
  }
};

// Excluir um lead
exports.deleteLead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.auth.userId;
    
    // Buscar lead
    const lead = await Lead.findById(id);
    
    if (!lead) {
      return res.status(404).json({ error: 'Lead não encontrado' });
    }
    
    // Verificar se o lead pertence ao usuário
    if (lead.userId !== userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    
    await Lead.findByIdAndDelete(id);
    
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir lead:', error);
    res.status(500).json({ error: 'Falha ao excluir lead' });
  }
};
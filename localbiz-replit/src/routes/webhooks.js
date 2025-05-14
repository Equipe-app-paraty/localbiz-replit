const express = require('express');
const router = express.Router();
const { Webhook } = require('svix');
const webhookService = require('../services/webhookService');

// Rota para webhook do Clerk
router.post('/clerk', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // Logs para depuração
    console.log('===== WEBHOOK DO CLERK RECEBIDO =====');
    console.log('Tipo de req.body:', typeof req.body);
    console.log('É Buffer?', Buffer.isBuffer(req.body));
    
    // Verificar assinatura do webhook
    const webhookSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
    
    if (!webhookSecret) {
      console.error('CLERK_WEBHOOK_SIGNING_SECRET não está definido');
      return res.status(500).json({ error: 'CLERK_WEBHOOK_SIGNING_SECRET não está definido' });
    }
    
    // Obter cabeçalhos Svix
    const svixId = req.headers['svix-id'];
    const svixTimestamp = req.headers['svix-timestamp'];
    const svixSignature = req.headers['svix-signature'];
    
    console.log('Webhook recebido do Clerk');
    console.log('svix-id:', svixId);
    console.log('svix-timestamp:', svixTimestamp);
    console.log('svix-signature:', svixSignature);
    
    // Verificar se todos os cabeçalhos necessários estão presentes
    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error('Cabeçalhos Svix ausentes');
      return res.status(400).json({ error: 'Cabeçalhos Svix ausentes' });
    }
    
    // Verificar a assinatura
    const wh = new Webhook(webhookSecret);
    let payload;
    
    try {
      // CORREÇÃO: Garantir que req.body seja passado como Buffer ou string
      // Não tente converter para objeto antes da verificação
      const payloadString = wh.verify(
        req.body, // Passar o Buffer diretamente
        {
          'svix-id': svixId,
          'svix-timestamp': svixTimestamp,
          'svix-signature': svixSignature
        }
      );
      
      // Agora sim, converter para objeto JSON após a verificação
      payload = JSON.parse(payloadString);
      console.log('Assinatura verificada com sucesso!');
    } catch (error) {
      console.error('Erro na verificação da assinatura:', error.message);
      return res.status(400).json({ error: 'Assinatura inválida' });
    }
    
    // Processar eventos
    const { type, data } = payload;
    console.log(`Evento recebido: ${type}`);
    
    if (type === 'user.created' || type === 'user.updated') {
      await webhookService.handleUserCreatedOrUpdated(data);
      console.log(`Usuário ${type === 'user.created' ? 'criado' : 'atualizado'}: ${data.id}`);
    } else if (type === 'user.deleted') {
      const result = await webhookService.handleUserDeleted(data);
      if (result) {
        console.log(`Usuário removido: ${data.id}`);
      } else {
        console.log(`Usuário não encontrado para remoção: ${data.id}`);
      }
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro no webhook:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { Webhook } = require('svix');
const webhookService = require('../services/webhookService');

router.post('/clerk', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    console.log('===== WEBHOOK DO CLERK RECEBIDO =====');
    
    const webhookSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
    if (!webhookSecret) {
      console.error('CLERK_WEBHOOK_SIGNING_SECRET não está definido');
      return res.status(500).json({ error: 'CLERK_WEBHOOK_SIGNING_SECRET não está definido' });
    }

    // Garantir que temos o corpo da requisição como string
    const payloadString = req.body.toString('utf8');
    
    // Construir cabeçalhos do Svix corretamente
    const svixHeaders = {
      'svix-id': req.headers['svix-id'],
      'svix-timestamp': req.headers['svix-timestamp'],
      'svix-signature': req.headers['svix-signature']
    };
    
    // Log dos cabeçalhos para debug
    console.log('Headers recebidos:', svixHeaders);
    
    if (!svixHeaders['svix-id'] || !svixHeaders['svix-timestamp'] || !svixHeaders['svix-signature']) {
      console.error('Cabeçalhos Svix ausentes');
      return res.status(400).json({ error: 'Cabeçalhos Svix ausentes' });
    }

    // Criar instância do Webhook e verificar
    const wh = new Webhook(webhookSecret);
    const payload = wh.verify(payloadString, svixHeaders);
    
    // Converter payload para objeto
    const body = JSON.parse(payload);
    console.log('Payload verificado:', body);
    
    // Processar eventos
    const { type, data } = body;
    
    if (type === 'user.created' || type === 'user.updated') {
      await webhookService.handleUserCreatedOrUpdated(data);
      console.log(`Usuário ${type === 'user.created' ? 'criado' : 'atualizado'}: ${data.id}`);
    } else if (type === 'user.deleted') {
      await webhookService.handleUserDeleted(data);
      console.log(`Usuário removido: ${data.id}`);
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(400).json({ error: 'Assinatura inválida' });
  }
});

module.exports = router;

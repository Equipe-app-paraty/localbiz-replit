const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { clerkMiddleware } = require('@clerk/express');

// Carrega variáveis de ambiente
dotenv.config();

// Importa rotas
const apiRoutes = require('./routes/api');
const webhookRoutes = require('./routes/webhooks');

// Inicializa o app Express
const app = express();

// Middleware de segurança e CORS
app.use(helmet());
app.use(cors());

// REGISTRE O WEBHOOK ANTES DOS PARSERS GLOBAIS
app.use('/webhooks', webhookRoutes);

// Agora sim, pode usar os parsers globais para o resto da API
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(clerkMiddleware()); // Middleware do Clerk

// Adicione este log antes da conexão
console.log('MONGODB_URI:', process.env.MONGODB_URI);

// Conecta ao MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado ao MongoDB'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Rotas
app.use('/api', apiRoutes);
app.use('/webhooks', webhookRoutes);

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Adicione estes logs no início do arquivo, após o require('dotenv').config()
console.log('Variáveis do Clerk:');
console.log('CLERK_PUBLISHABLE_KEY:', process.env.CLERK_PUBLISHABLE_KEY ? 'Definida' : 'Não definida');
console.log('CLERK_SECRET_KEY:', process.env.CLERK_SECRET_KEY ? 'Definida' : 'Não definida');
console.log('CLERK_WEBHOOK_SIGNING_SECRET:', process.env.CLERK_WEBHOOK_SIGNING_SECRET ? 'Definida' : 'Não definida');

module.exports = app;

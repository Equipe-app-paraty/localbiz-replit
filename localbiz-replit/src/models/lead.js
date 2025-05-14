const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' },
  status: { type: String, enum: ['New', 'Contacted', 'Not Interested', 'Converted'], default: 'New' },
  notes: String,
  contactHistory: [{
    date: { type: Date, default: Date.now },
    notes: String,
    contactMethod: String
  }],
  userId: { type: String, required: true }, // ID do usuário do Clerk
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware para atualizar o campo updatedAt antes de salvar
leadSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Lead', leadSchema);
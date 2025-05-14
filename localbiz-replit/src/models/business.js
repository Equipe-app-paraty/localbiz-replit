const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  googlePlaceId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: String,
  website: String,
  businessType: String,
  openingHours: [String],
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  hasWebsite: Boolean,
  hasPhone: Boolean,
  createdAt: { type: Date, default: Date.now }
});

// Índice para consultas geoespaciais
businessSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Business', businessSchema);
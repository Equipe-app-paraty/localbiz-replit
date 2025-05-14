const Joi = require('joi');
const validator = require('express-joi-validation').createValidator({});

// Esquema de validação para busca de estabelecimentos
const searchValidationSchema = Joi.object({
  location: Joi.string().required(),
  businessType: Joi.string().required(),
  hasWebsite: Joi.boolean(),
  hasPhone: Joi.boolean()
});

// Esquema de validação para criação de lead
const createLeadValidationSchema = Joi.object({
  business: Joi.string().required(),
  notes: Joi.string().allow('', null),
  contactMethod: Joi.string().allow('', null)
});

// Esquema de validação para atualização de lead
const updateLeadValidationSchema = Joi.object({
  status: Joi.string().valid('New', 'Contacted', 'Not Interested', 'Converted'),
  notes: Joi.string().allow('', null),
  contactMethod: Joi.string().allow('', null)
});

module.exports = {
  validateSearch: validator.query(searchValidationSchema),
  validateCreateLead: validator.body(createLeadValidationSchema),
  validateUpdateLead: validator.body(updateLeadValidationSchema)
};
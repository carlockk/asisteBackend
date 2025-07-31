const mongoose = require('mongoose');

const AseoItemSchema = new mongoose.Schema({
  enunciado: { type: String, required: true },
  creadoPor: { type: String },
  creadoEn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AseoItem', AseoItemSchema);

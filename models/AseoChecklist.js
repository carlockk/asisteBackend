const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'AseoItem', required: true },
  cumple: { type: Boolean, required: true },
});

const AseoChecklistSchema = new mongoose.Schema({
  fecha: { type: Date, default: Date.now },
  empleados: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  items: { type: [itemSchema], required: true },
  observaciones: { type: String },
  creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // quien hizo el registro
});

module.exports = mongoose.model('AseoChecklist', AseoChecklistSchema);

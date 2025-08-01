const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'AseoItem' },
  cumple: Boolean,
});

const AseoChecklistSchema = new mongoose.Schema({
  fecha: { type: Date, required: true },
  empleados: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  items: [itemSchema],
  creadoPor: String,
});

module.exports = mongoose.model('AseoChecklist', AseoChecklistSchema);

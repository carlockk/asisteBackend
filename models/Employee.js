// models/Employee.js
const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  puesto: { type: String }, // Opcional, puedes usarlo luego
  photo: { type: String },  // Ruta de la imagen (si se sube)
}, {
  timestamps: true // Esto agrega createdAt y updatedAt automáticamente
});

module.exports = mongoose.model('Employee', employeeSchema);

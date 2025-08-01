const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  correo: { type: String, required: true, unique: true }, // antes "email"
  contraseña: { type: String, required: true }, // antes "password"
  rol: { type: String, enum: ['admin', 'gestor', 'empleado'], default: 'empleado' }
});

module.exports = mongoose.model('User', UserSchema);


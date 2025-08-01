const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();
const path = require('path');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/asiste');

const UserSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  correo: { type: String, required: true, unique: true }, // <-- correo
  contraseña: { type: String, required: true },            // <-- contraseña
  rol: { type: String, enum: ['admin', 'gestor', 'empleado'], default: 'empleado' }
});
const User = mongoose.model('User', UserSchema);

async function crearAdmin() {
  const correo = 'admin@asiste.com';
  const yaExiste = await User.findOne({ correo });
  if (yaExiste) {
    console.log('❌ Ya existe un usuario con ese correo.');
    process.exit();
  }

  const hashed = await bcrypt.hash('admin123', 10);

  const admin = new User({
    nombre: 'Administrador',
    correo,
    contraseña: hashed,
    rol: 'admin'
  });

  await admin.save();
  console.log('✅ Usuario admin creado con éxito: admin@asiste.com / admin123');
  process.exit();
}

crearAdmin();

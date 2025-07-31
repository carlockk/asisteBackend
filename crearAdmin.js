const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();
const path = require('path');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/asiste');

const UserSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rol: { type: String, enum: ['admin', 'gestor', 'empleado'], default: 'empleado' }
});
const User = mongoose.model('User', UserSchema);

async function crearAdmin() {
  const email = 'admin@asiste.com';
  const yaExiste = await User.findOne({ email });
  if (yaExiste) {
    console.log('❌ Ya existe un usuario con ese email.');
    process.exit();
  }

  const hashed = await bcrypt.hash('admin123', 10);

  const admin = new User({
    nombre: 'Administrador',
    email,
    password: hashed,
    rol: 'admin'
  });

  await admin.save();
  console.log('✅ Usuario admin creado con éxito: admin@asiste.com / admin123');
  process.exit();
}

crearAdmin();

const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/User');
const { verificarToken } = require('../middleware/auth');

// ✅ Ruta pública: obtener usuarios filtrados por rol
// Ejemplo: /api/usuarios?rol=empleado
router.get('/', async (req, res) => {
  try {
    const { rol } = req.query;
    const query = rol ? { rol } : {};
    const usuarios = await User.find(query).select('-contraseña');
    res.json(usuarios);
  } catch (error) {
    console.error('❌ Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// 🔒 Ruta protegida: obtener todos los usuarios
router.get('/todos', verificarToken, async (req, res) => {
  try {
    const usuarios = await User.find().select('-contraseña');
    res.json(usuarios);
  } catch (error) {
    console.error('❌ Error al obtener todos los usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// 🔒 Crear nuevo usuario con encriptación y validaciones
router.post('/', verificarToken, async (req, res) => {
  try {
    const { nombre, correo, contraseña, rol } = req.body;

    if (!nombre || !correo || !contraseña || !rol) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const existe = await User.findOne({ correo });
    if (existe) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    const hash = await bcrypt.hash(contraseña, 10);
    const nuevoUsuario = new User({
      nombre,
      correo,
      contraseña: hash,
      rol
    });

    await nuevoUsuario.save();
    const usuarioSinClave = nuevoUsuario.toObject();
    delete usuarioSinClave.contraseña;

    res.status(201).json(usuarioSinClave);
  } catch (error) {
    console.error('❌ Error al crear usuario:', error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// 🔒 Editar usuario
router.put('/:id', verificarToken, async (req, res) => {
  try {
    // Si se está actualizando la contraseña, la encriptamos
    if (req.body.contraseña) {
      req.body.contraseña = await bcrypt.hash(req.body.contraseña, 10);
    }

    const usuarioActualizado = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    const sinClave = usuarioActualizado.toObject();
    delete sinClave.contraseña;
    res.json(sinClave);
  } catch (error) {
    console.error('❌ Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// 🔒 Eliminar usuario
router.delete('/:id', verificarToken, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { verificarToken } = require('../middleware/auth');

// ✅ Ruta pública: obtener usuarios filtrados por rol
// Ej: /api/usuarios?rol=empleado
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

// 🔒 Ruta protegida: obtener todos los usuarios (sin filtro)
router.get('/todos', verificarToken, async (req, res) => {
  try {
    const usuarios = await User.find().select('-contraseña');
    res.json(usuarios);
  } catch (error) {
    console.error('❌ Error al obtener todos los usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// 🔒 Crear nuevo usuario (admin o gestor)
router.post('/', verificarToken, async (req, res) => {
  try {
    const { nombre, correo, contraseña, rol } = req.body;

    // Validación mínima
    if (!nombre || !correo || !contraseña) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    // Verificar duplicado
    const existe = await User.findOne({ correo });
    if (existe) {
      return res.status(409).json({ error: 'Ya existe un usuario con ese correo' });
    }

    const hash = await bcrypt.hash(contraseña, 10);

    const nuevoUsuario = new User({
      nombre,
      correo,
      contraseña: hash,
      rol: rol || 'empleado',
    });

    await nuevoUsuario.save();

    // No retornar contraseña
    const { contraseña: _, ...sinPassword } = nuevoUsuario.toObject();

    res.status(201).json(sinPassword);
  } catch (error) {
    console.error('❌ Error al crear usuario:', error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// 🔒 Editar usuario
router.put('/:id', verificarToken, async (req, res) => {
  try {
    const { nombre, correo, rol } = req.body;
    const updateData = { nombre, correo, rol };

    const usuarioActualizado = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-contraseña');

    if (!usuarioActualizado) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(usuarioActualizado);
  } catch (error) {
    console.error('❌ Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// 🔒 Eliminar usuario
router.delete('/:id', verificarToken, async (req, res) => {
  try {
    const eliminado = await User.findByIdAndDelete(req.params.id);
    if (!eliminado) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ success: true, mensaje: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

module.exports = router;

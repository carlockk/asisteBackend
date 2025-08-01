const express = require('express');
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

// 🔒 Crear nuevo usuario
router.post('/', verificarToken, async (req, res) => {
  try {
    const nuevoUsuario = new User(req.body);
    await nuevoUsuario.save();
    res.status(201).json(nuevoUsuario);
  } catch (error) {
    console.error('❌ Error al crear usuario:', error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// 🔒 Editar usuario
router.put('/:id', verificarToken, async (req, res) => {
  try {
    const usuarioActualizado = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(usuarioActualizado);
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

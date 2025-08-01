// routes/usuarios.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/usuarios?rol=empleado
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

module.exports = router;

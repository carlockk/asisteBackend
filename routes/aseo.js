const express = require('express');
const router = express.Router();
const AseoItem = require('../models/AseoItem');

// Middleware que asume que req.user existe (JWT/session)
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    next();
  };
}

// Obtener todos los ítems (público para empleados logueados)
router.get('/', async (req, res) => {
  try {
    const items = await AseoItem.find().sort({ creadoEn: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener ítems' });
  }
});

// Crear ítem (admin y gestor)
router.post('/', requireRole('admin', 'gestor'), async (req, res) => {
  const { enunciado } = req.body;
  if (!enunciado) return res.status(400).json({ error: 'Enunciado requerido' });

  try {
    const item = new AseoItem({
      enunciado,
      creadoPor: req.user.nombre
    });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear ítem' });
  }
});

// Editar ítem (admin y gestor)
router.put('/:id', requireRole('admin', 'gestor'), async (req, res) => {
  const { enunciado } = req.body;
  try {
    const item = await AseoItem.findByIdAndUpdate(req.params.id, { enunciado }, { new: true });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar ítem' });
  }
});

// Eliminar ítem (solo admin)
router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    await AseoItem.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar ítem' });
  }
});

module.exports = router;

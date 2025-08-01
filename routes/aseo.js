const express = require('express');
const router = express.Router();
const AseoItem = require('../models/AseoItem');
const AseoChecklist = require('../models/AseoChecklist');

// Middleware para restringir por roles
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    next();
  };
}

// 🔹 Obtener todos los ítems
router.get('/items', async (req, res) => {
  try {
    const items = await AseoItem.find().sort({ creadoEn: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener ítems' });
  }
});

// 🔹 Crear ítem
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

// 🔹 Editar ítem
router.put('/:id', requireRole('admin', 'gestor'), async (req, res) => {
  const { enunciado } = req.body;
  try {
    const item = await AseoItem.findByIdAndUpdate(req.params.id, { enunciado }, { new: true });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar ítem' });
  }
});

// 🔹 Eliminar ítem
router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    await AseoItem.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Ítem eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar ítem' });
  }
});

// 🔹 Guardar checklist
router.post('/checklist', requireRole('empleado', 'gestor', 'admin'), async (req, res) => {
  const { empleados, itemsMarcados, observacion } = req.body;

  if (!empleados || !Array.isArray(empleados) || empleados.length === 0) {
    return res.status(400).json({ error: 'Debe seleccionar al menos un empleado' });
  }

  if (!itemsMarcados || typeof itemsMarcados !== 'object') {
    return res.status(400).json({ error: 'Ítems marcados inválidos' });
  }

  try {
    const items = Object.entries(itemsMarcados).map(([itemId, cumple]) => ({
      itemId,
      cumple
    }));

    const nuevoChecklist = new AseoChecklist({
      fecha: new Date(),
      empleados,
      items,
      observaciones: observacion || '',
      creadoPor: req.user._id
    });

    await nuevoChecklist.save();
    res.status(201).json({ mensaje: 'Checklist guardado correctamente' });
  } catch (err) {
    console.error('❌ Error al guardar checklist:', err);
    res.status(500).json({ error: 'Error al guardar checklist' });
  }
});

// 🔹 Ver historial por empleado y/o fechas
router.get('/historial', requireRole('admin', 'gestor'), async (req, res) => {
  const { empleadoId, desde, hasta } = req.query;
  const filtro = {};

  if (empleadoId) filtro.empleados = empleadoId;

  if (desde || hasta) {
    filtro.fecha = {};
    if (desde) filtro.fecha.$gte = new Date(desde);
    if (hasta) filtro.fecha.$lte = new Date(hasta);
  }

  try {
    const historial = await AseoChecklist.find(filtro)
      .populate('empleados', 'nombre apellido correo')
      .populate('items.itemId', 'enunciado')
      .sort({ fecha: -1 });

    res.json(historial);
  } catch (err) {
    console.error('❌ Error al obtener historial:', err);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

module.exports = router;

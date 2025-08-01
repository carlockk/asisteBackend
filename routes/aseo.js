const express = require('express');
const router = express.Router();
const AseoItem = require('../models/AseoItem');
const AseoChecklist = require('../models/AseoChecklist');
const Checklist = require('../models/AseoChecklist'); // Asegúrate de tener este modelo creado

// Middleware
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    next();
  };
}

router.post('/checklist', async (req, res) => {
  const { usuario, itemsMarcados, observacion } = req.body;

  if (!usuario || !itemsMarcados) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  try {
    const nuevoChecklist = new Checklist({
      usuario,
      itemsMarcados,
      observacion,
      fecha: new Date()
    });

    await nuevoChecklist.save();
    res.status(201).json({ mensaje: 'Checklist guardado correctamente' });
  } catch (err) {
    console.error('❌ Error al guardar checklist:', err);
    res.status(500).json({ error: 'Error al guardar checklist' });
  }
});

// Obtener ítems (público)
router.get('/', async (req, res) => {
  try {
    const items = await AseoItem.find().sort({ creadoEn: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener ítems' });
  }
});

// Crear ítem
router.post('/', requireRole('admin', 'gestor'), async (req, res) => {
  const { enunciado } = req.body;
  if (!enunciado) return res.status(400).json({ error: 'Enunciado requerido' });

  try {
    const item = new AseoItem({ enunciado, creadoPor: req.user.nombre });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear ítem' });
  }
});

// Guardar checklist de empleado
router.post('/checklist', requireRole('empleado', 'admin', 'gestor'), async (req, res) => {
  const { itemsMarcados, observacion, hora } = req.body;

  if (!itemsMarcados || typeof itemsMarcados !== 'object') {
    return res.status(400).json({ error: 'Items inválidos' });
  }

  try {
    const items = Object.entries(itemsMarcados).map(([id, cumple]) => ({
      itemId: id,
      cumple
    }));

    const checklist = new AseoChecklist({
      usuario: req.user.nombre,
      items,
      observacion,
      hora
    });

    await checklist.save();
    res.status(201).json({ mensaje: 'Checklist guardado exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar checklist' });
  }
});

module.exports = router;

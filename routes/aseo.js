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

//
// 🔹 Ruta para obtener todos los ítems (disponible para todos los logueados)
//
router.get('/items', async (req, res) => {

  try {
    const items = await AseoItem.find().sort({ creadoEn: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener ítems' });
  }
});

//
// 🔹 Crear ítem (solo admin o gestor)
//
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

//
// 🔹 Editar ítem
//
router.put('/:id', requireRole('admin', 'gestor'), async (req, res) => {
  const { enunciado } = req.body;
  try {
    const item = await AseoItem.findByIdAndUpdate(req.params.id, { enunciado }, { new: true });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar ítem' });
  }
});

//
// 🔹 Eliminar ítem
//
router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    await AseoItem.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Ítem eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar ítem' });
  }
});

//
// 🔹 Guardar checklist (admin, gestor o empleado)
//
router.post('/checklist', requireRole('empleado', 'gestor', 'admin'), async (req, res) => {
  const { empleados, itemsMarcados, observacion } = req.body;

  if (!empleados || !Array.isArray(empleados) || empleados.length === 0 || !itemsMarcados) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    // Convertir itemsMarcados {id1: true, id2: false} a array de { itemId, cumple }
    const items = Object.entries(itemsMarcados).map(([itemId, cumple]) => ({
      itemId,
      cumple
    }));

    const nuevoChecklist = new AseoChecklist({
      fecha: new Date(),
      empleados, // array de IDs de usuarios
      items,
      creadoPor: req.user?.nombre || 'Sistema',
      observacion: observacion || ''
    });

    await nuevoChecklist.save();

    res.status(201).json({ mensaje: 'Checklist guardado correctamente' });
  } catch (err) {
    console.error('❌ Error al guardar checklist:', err);
    res.status(500).json({ error: 'Error al guardar checklist' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const VacationSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  startDate: Date,
  endDate: Date,
  createdAt: { type: Date, default: Date.now }
});
const Vacation = mongoose.model('Vacation', VacationSchema);

// POST /vacations → Crear vacaciones
router.post('/', async (req, res) => {
  const { employeeId, startDate, endDate } = req.body;

  if (!employeeId || !startDate || !endDate) {
    return res.status(400).json({ error: 'Faltan campos' });
  }

  const vacation = new Vacation({ employee: employeeId, startDate, endDate });
  await vacation.save();
  res.json(vacation);
});

// GET /vacations/:employeeId → Vacaciones de un empleado
router.get('/:employeeId', async (req, res) => {
  const vacations = await Vacation.find({ employee: req.params.employeeId });
  res.json(vacations);
});

module.exports = router;

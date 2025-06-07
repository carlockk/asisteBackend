const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/asiste';
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

const EmployeeSchema = new mongoose.Schema({
  identityNumber: String,
  firstName: String,
  lastName: String,
  photo: String,
  address: String,
  phone: String,
  email: String,
  birthday: Date,
  hireDate: Date,
  hourlyRate: Number
});
const Employee = mongoose.model('Employee', EmployeeSchema);

const AttendanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  checkIn: Date,
  checkOut: Date,
  totalHours: Number,
  createdAt: { type: Date, default: Date.now }
});
const Attendance = mongoose.model('Attendance', AttendanceSchema);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

app.post('/employees', upload.single('photo'), async (req, res) => {
  const emp = new Employee({
    ...req.body,
    photo: req.file ? req.file.path : ''
  });
  await emp.save();
  res.json(emp);
});

app.get('/employees', async (req, res) => {
  const employees = await Employee.find();
  res.json(employees);
});

app.get('/employees/:id', async (req, res) => {
  const emp = await Employee.findById(req.params.id);
  res.json(emp);
});

app.put('/employees/:id', async (req, res) => {
  const emp = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(emp);
});

app.delete('/employees/:id', async (req, res) => {
  await Employee.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// ✅ NUEVO flujo mejorado para check-in/check-out
app.post('/attendance', async (req, res) => {
  const { employeeId, checkOut } = req.body;

  if (!employeeId) {
    return res.status(400).json({ error: 'Falta employeeId' });
  }

  if (!checkOut) {
    // Registro de entrada
    const checkInDate = new Date();
    const attendance = new Attendance({
      employee: employeeId,
      checkIn: checkInDate
    });
    await attendance.save();
    return res.json(attendance);
  } else {
    // Registro de salida → buscar el último sin salida
    const lastRecord = await Attendance.findOne({
      employee: employeeId,
      checkOut: { $exists: false }
    }).sort({ checkIn: -1 });

    if (!lastRecord) {
      return res.status(400).json({ error: 'No se encontró entrada activa' });
    }

    const checkOutDate = new Date(checkOut);
    const totalHours = (checkOutDate - new Date(lastRecord.checkIn)) / (1000 * 60 * 60);

    lastRecord.checkOut = checkOutDate;
    lastRecord.totalHours = totalHours;
    await lastRecord.save();

    return res.json(lastRecord);
  }
});

// ✅ Historial por mes
app.get('/attendance', async (req, res) => {
  const { employeeId, month } = req.query;

  if (!employeeId || !month || !/^\d{4}-\d{2}$/.test(month)) {
    return res.status(400).json({ error: 'Parámetros inválidos' });
  }

  const start = new Date(`${month}-01T00:00:00`);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);

  const records = await Attendance.find({
    employee: employeeId,
    checkIn: { $gte: start, $lt: end }
  });

  const total = records.reduce((acc, r) => acc + (r.totalHours || 0), 0);
  res.json({ records, total });
});

app.post('/documents/:employeeId', upload.single('file'), async (req, res) => {
  res.json({ path: req.file.path });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log('Server running on ' + PORT));

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
app.use('/uploads', express.static('uploads'));

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/asiste';
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// 📦 Esquemas
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
  hourlyRate: Number,
});
const Employee = mongoose.model('Employee', EmployeeSchema);

const AttendanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  checkIn: Date,
  checkOut: Date,
  totalHours: Number,
  createdAt: { type: Date, default: Date.now },
});
const Attendance = mongoose.model('Attendance', AttendanceSchema);

// 📷 Subida de foto
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// 📁 Endpoints
app.get('/employees', async (req, res) => {
  const employees = await Employee.find();
  res.json(employees);
});

app.get('/employees/:id', async (req, res) => {
  const emp = await Employee.findById(req.params.id);
  res.json(emp);
});

app.post('/employees', upload.single('photo'), async (req, res) => {
  const data = req.body;
  if (req.file) {
    data.photo = req.file.path;
  }
  const emp = new Employee(data);
  await emp.save();
  res.json(emp);
});

app.put('/employees/:id', async (req, res) => {
  const emp = await Employee.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(emp);
});

app.delete('/employees/:id', async (req, res) => {
  await Employee.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// 🕒 Registro de asistencia (con validación)
app.post('/attendance', async (req, res) => {
  const { employeeId, checkIn, checkOut } = req.body;

  if (!employeeId) {
    return res.status(400).json({ error: 'Falta el ID del empleado' });
  }

  if (checkIn && !checkOut) {
    const existing = await Attendance.findOne({
      employee: employeeId,
      checkOut: { $exists: false },
    });
    if (existing) {
      return res
        .status(400)
        .json({ error: 'Ya existe una entrada sin salida' });
    }
  }

  const checkInDate = checkIn ? new Date(checkIn) : new Date();
  let totalHours = 0;

  if (checkOut) {
    const checkOutDate = new Date(checkOut);
    totalHours = (checkOutDate - checkInDate) / (1000 * 60 * 60);
  }

  const attendance = new Attendance({
    employee: employeeId,
    checkIn: checkInDate,
    checkOut: checkOut ? new Date(checkOut) : undefined,
    totalHours,
  });

  await attendance.save();
  res.json(attendance);
});

// 📊 Historial por mes y año
app.get('/attendance', async (req, res) => {
  const { employeeId, month, year } = req.query;
  if (!employeeId || !month || !year) {
    return res.status(400).json({ error: 'Faltan parámetros' });
  }

  const start = new Date(`${year}-${month}-01`);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);

  const records = await Attendance.find({
    employee: employeeId,
    checkIn: { $gte: start, $lt: end },
  });

  const total = records.reduce((acc, r) => acc + (r.totalHours || 0), 0);
  res.json({ records, total });
});

// 📁 Subir archivos externos si es necesario
app.post('/documents/:employeeId', upload.single('file'), async (req, res) => {
  res.json({ path: req.file.path });
});

// 🚀 Puerto
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log('✅ Servidor corriendo en ' + PORT));

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
  const emp = new Employee({ ...req.body, photo: req.file?.filename });
  await emp.save();
  res.json(emp);
});

app.get('/employees', async (req, res) => {
  const employees = await Employee.find();
  res.json(employees);
});

app.post('/attendance', async (req, res) => {
  const { employeeId, checkIn, checkOut } = req.body;

  const parsedCheckIn = new Date(checkIn || Date.now());
  const parsedCheckOut = checkOut ? new Date(checkOut) : null;

  let totalHours = 0;
  if (parsedCheckIn && parsedCheckOut) {
    totalHours = (parsedCheckOut - parsedCheckIn) / (1000 * 60 * 60);
    totalHours = Math.round(totalHours * 100) / 100;
  }

  const attendance = new Attendance({
    employee: employeeId,
    checkIn: parsedCheckIn,
    checkOut: parsedCheckOut,
    totalHours
  });

  await attendance.save();
  res.json(attendance);
});

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
    checkIn: { $gte: start, $lt: end }
  });

  const total = records.reduce((acc, r) => acc + (r.totalHours || 0), 0);
  res.json({ records, total: Math.round(total * 100) / 100 });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log('Server running on ' + PORT));

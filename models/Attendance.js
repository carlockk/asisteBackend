// models/Attendance.js
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  checkIn: {
    type: Date,
    default: Date.now,
  },
  checkOut: {
    type: Date,
  },
}, {
  timestamps: true // Agrega createdAt y updatedAt
});

module.exports = mongoose.model('Attendance', attendanceSchema);

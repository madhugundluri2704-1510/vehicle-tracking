const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  date: {
    type: String, // YYYY-MM-DD format for easy daily queries
    required: true
  },
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: {
    type: Date,
    default: null
  },
  checkInLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  checkOutLocation: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null }
  },
  assignedVehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    default: null
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late', 'Half-Day'],
    default: 'Present'
  },
  totalHours: {
    type: Number, // In decimal hours (e.g. 7.5)
    default: 0
  },
  overtime: {
    type: Number, // In decimal hours
    default: 0
  },
  activeDrivingTime: {
    type: Number, // In decimal hours
    default: 0
  },
  idleTime: {
    type: Number, // In decimal hours
    default: 0
  },
  breakTime: {
    type: Number, // In decimal hours
    default: 0
  }
}, {
  timestamps: true
});

// Create a compound index to guarantee one attendance record per driver per day
attendanceSchema.index({ driverId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);

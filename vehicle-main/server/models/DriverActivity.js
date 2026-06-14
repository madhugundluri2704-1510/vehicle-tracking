const mongoose = require('mongoose');

const driverActivitySchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  attendanceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attendance',
    default: null
  },
  activityType: {
    type: String,
    enum: ['check-in', 'vehicle-assigned', 'route-started', 'route-completed', 'break-started', 'break-ended', 'check-out'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  details: {
    type: String,
    trim: true,
    default: ''
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DriverActivity', driverActivitySchema);

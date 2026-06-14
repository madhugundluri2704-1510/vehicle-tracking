const mongoose = require('mongoose');

const driverPerformanceSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  distanceCovered: {
    type: Number, // In km
    default: 0
  },
  routesCompleted: {
    type: Number,
    default: 0
  },
  wasteCollected: {
    type: Number, // In kg
    default: 0
  },
  hoursWorked: {
    type: Number, // In decimal hours
    default: 0
  },
  attendanceRate: {
    type: Number, // Percentage (0-100)
    default: 100
  },
  punctualityScore: {
    type: Number, // Score (0-100)
    default: 100
  },
  routeEfficiency: {
    type: Number, // Percentage (0-100)
    default: 100
  },
  safetyScore: {
    type: Number, // Score (0-100, drops on speed alerts or route deviations)
    default: 100
  },
  performanceScore: {
    type: Number, // Overall composite score (0-100)
    default: 80
  }
}, {
  timestamps: true
});

// Compound index to guarantee one performance record per driver per day
driverPerformanceSchema.index({ driverId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DriverPerformance', driverPerformanceSchema);

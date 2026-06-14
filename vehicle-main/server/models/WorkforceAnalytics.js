const mongoose = require('mongoose');

const workforceAnalyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  totalDrivers: {
    type: Number,
    required: true
  },
  presentDrivers: {
    type: Number,
    required: true
  },
  absentDrivers: {
    type: Number,
    required: true
  },
  activeDrivers: {
    type: Number,
    required: true
  },
  onBreakDrivers: {
    type: Number,
    required: true
  },
  overtimeDrivers: {
    type: Number,
    required: true
  },
  attendanceRate: {
    type: Number, // Percentage (0-100)
    required: true
  },
  averageHoursPerDriver: {
    type: Number, // In decimal hours
    required: true
  },
  totalHoursWorked: {
    type: Number, // In decimal hours
    required: true
  },
  predictions: {
    predictedAbsenteeism: {
      type: Number, // Percentage or count
      default: 0
    },
    predictedWorkforceNeeded: {
      type: Number, // Count of drivers
      default: 0
    },
    predictedOvertimeNeeded: {
      type: Number, // In decimal hours
      default: 0
    },
    confidenceScore: {
      type: Number, // Percentage (0-100)
      default: 85
    },
    insights: [{
      type: String
    }]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('WorkforceAnalytics', workforceAnalyticsSchema);

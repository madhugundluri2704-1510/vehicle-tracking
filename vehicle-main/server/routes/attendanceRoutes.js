const express = require('express');
const router = express.Router();
const {
  checkIn,
  checkOut,
  toggleBreak,
  getTodayAttendance,
  getDriverTimeline,
  getWorkforceAnalytics,
  getAttendanceReports,
  getAIPredictions
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');

router.post('/check-in', protect, checkIn);
router.post('/check-out', protect, checkOut);
router.post('/toggle-break', protect, toggleBreak);
router.get('/today', protect, getTodayAttendance);
router.get('/timeline/:driverId', protect, getDriverTimeline);
router.get('/analytics', protect, getWorkforceAnalytics);
router.get('/reports', protect, getAttendanceReports);
router.get('/predictions', protect, getAIPredictions);

module.exports = router;

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
const { roleCheck } = require('../middleware/roleCheck');

router.post('/check-in', protect, checkIn);
router.post('/check-out', protect, checkOut);
router.post('/toggle-break', protect, toggleBreak);
router.get('/today', protect, getTodayAttendance);
router.get('/timeline/:driverId', protect, getDriverTimeline);
router.get('/analytics', protect, roleCheck('admin'), getWorkforceAnalytics);
router.get('/reports', protect, roleCheck('admin'), getAttendanceReports);
router.get('/predictions', protect, roleCheck('admin'), getAIPredictions);

module.exports = router;

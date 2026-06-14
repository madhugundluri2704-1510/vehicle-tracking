const express = require('express');
const router = express.Router();
const {
  getLeaderboard,
  getPerformanceStats,
  getDriverPerformanceDetails,
  getMyPerformance
} = require('../controllers/driverPerformanceController');
const { protect } = require('../middleware/auth');

router.get('/leaderboard', protect, getLeaderboard);
router.get('/stats', protect, getPerformanceStats);
router.get('/me', protect, getMyPerformance);
router.get('/details/:driverId', protect, getDriverPerformanceDetails);

module.exports = router;

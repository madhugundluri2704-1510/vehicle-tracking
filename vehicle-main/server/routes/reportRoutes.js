const express = require('express');
const router = express.Router();
const { getDashboardSummary, getPerformanceReport } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/summary', protect, getDashboardSummary);
router.get('/performance', protect, roleCheck('admin'), getPerformanceReport);

module.exports = router;

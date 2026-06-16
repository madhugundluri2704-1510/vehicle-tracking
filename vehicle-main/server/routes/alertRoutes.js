const express = require('express');
const router = express.Router();
const { getAlerts, acknowledgeAlert, getAlertStats } = require('../controllers/alertController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/stats', protect, getAlertStats);
router.get('/', protect, getAlerts);
router.put('/:id/acknowledge', protect, roleCheck('admin'), acknowledgeAlert);

module.exports = router;

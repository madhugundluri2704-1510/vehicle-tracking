const express = require('express');
const router = express.Router();
const { getDrivers, getDriver, createDriver, updateDriver, deleteDriver, getDriverStats } = require('../controllers/driverController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/stats', protect, getDriverStats);
router.get('/', protect, getDrivers);
router.get('/:id', protect, getDriver);
router.post('/', protect, roleCheck('admin'), createDriver);
router.put('/:id', protect, roleCheck('admin'), updateDriver);
router.delete('/:id', protect, roleCheck('admin'), deleteDriver);

module.exports = router;

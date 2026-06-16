const express = require('express');
const router = express.Router();
const { getVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle, getVehicleStats } = require('../controllers/vehicleController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/stats', protect, getVehicleStats);
router.get('/', protect, getVehicles);
router.get('/:id', protect, getVehicle);
router.post('/', protect, roleCheck('admin'), createVehicle);
router.put('/:id', protect, roleCheck('admin'), updateVehicle);
router.delete('/:id', protect, roleCheck('admin'), deleteVehicle);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getRoutes, getRoute, createRoute, updateRoute, deleteRoute } = require('../controllers/routeController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/', protect, getRoutes);
router.get('/:id', protect, getRoute);
router.post('/', protect, roleCheck('admin'), createRoute);
router.put('/:id', protect, roleCheck('admin'), updateRoute);
router.delete('/:id', protect, roleCheck('admin'), deleteRoute);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getWasteCollections, getWasteCollection, createWasteCollection, updateWasteCollection, deleteWasteCollection, getWasteStats } = require('../controllers/wasteController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/stats', protect, getWasteStats);
router.get('/', protect, getWasteCollections);
router.get('/:id', protect, getWasteCollection);
router.post('/', protect, roleCheck('admin'), createWasteCollection);
router.put('/:id', protect, roleCheck('admin'), updateWasteCollection);
router.delete('/:id', protect, roleCheck('admin'), deleteWasteCollection);

module.exports = router;

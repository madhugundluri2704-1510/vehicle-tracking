const express = require('express');
const router = express.Router();
const { 
  createComplaint, 
  getComplaints, 
  updateComplaintStatus,
  getStats
} = require('../controllers/complaintController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.route('/')
  .post(createComplaint)
  .get(protect, getComplaints);

router.route('/stats')
  .get(protect, getStats);

router.route('/:id/status')
  .put(protect, roleCheck('admin'), updateComplaintStatus);

module.exports = router;

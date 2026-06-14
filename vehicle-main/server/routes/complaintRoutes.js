const express = require('express');
const router = express.Router();
const { 
  createComplaint, 
  getComplaints, 
  updateComplaintStatus,
  getStats
} = require('../controllers/complaintController');

router.route('/')
  .post(createComplaint)
  .get(getComplaints);

router.route('/stats')
  .get(getStats);

router.route('/:id/status')
  .put(updateComplaintStatus);

module.exports = router;

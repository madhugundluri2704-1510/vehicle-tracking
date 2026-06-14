const Complaint = require('../models/Complaint');
const { assignNearestVehicle } = require('../utils/assignmentEngine');

// Create a new complaint (from Citizen or CCTV)
exports.createComplaint = async (req, res) => {
  try {
    const { source, location, ward, zone, citizenDetails, imageUrl, description, priority } = req.body;
    
    // Generate a unique ID (e.g., CMP1024)
    const count = await Complaint.countDocuments();
    const complaintId = `CMP${1000 + count + 1}`;

    const newComplaint = new Complaint({
      complaintId,
      source,
      location,
      ward,
      zone,
      citizenDetails,
      imageUrl,
      description,
      priority: priority || 'Medium'
    });

    await newComplaint.save();

    // Trigger assignment engine
    const io = req.app.get('io');
    if (io) {
      io.emit('new_complaint', newComplaint);
    }
    
    // Automatically try to assign nearest vehicle
    // We pass io so it can emit task_assigned if successful
    await assignNearestVehicle(newComplaint._id, io);

    res.status(201).json({
      success: true,
      message: 'Complaint created successfully',
      complaint: newComplaint
    });
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get all complaints
exports.getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('assignedVehicleId', 'vehicleNumber vehicleType driverName')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints
    });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update complaint status
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    complaint.status = status;
    if (status === 'Completed') {
      complaint.resolvedAt = new Date();
      // Clear vehicle's current task
      if (complaint.assignedVehicleId) {
        const Vehicle = require('../models/Vehicle');
        await Vehicle.findByIdAndUpdate(complaint.assignedVehicleId, { currentTask: null });
      }
    }

    await complaint.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('complaint_updated', complaint);
    }

    res.status(200).json({
      success: true,
      complaint
    });
  } catch (error) {
    console.error('Error updating complaint:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get CCTV Alerts stats for Dashboard
exports.getStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cctvAlertsToday = await Complaint.countDocuments({
      source: 'CCTV',
      createdAt: { $gte: today }
    });

    const citizenComplaintsToday = await Complaint.countDocuments({
      source: 'Citizen',
      createdAt: { $gte: today }
    });

    const totalPending = await Complaint.countDocuments({ status: 'Pending' });
    const totalAssigned = await Complaint.countDocuments({ status: 'Assigned' });

    res.status(200).json({
      success: true,
      stats: {
        cctvAlertsToday,
        citizenComplaintsToday,
        totalPending,
        totalAssigned
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

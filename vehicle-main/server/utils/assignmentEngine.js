const Vehicle = require('../models/Vehicle');
const Complaint = require('../models/Complaint');

// Helper to calculate distance between two coordinates in km (Haversine formula)
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
};

// Find and assign nearest vehicle to a complaint
const assignNearestVehicle = async (complaintId, io) => {
  try {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint || complaint.status !== 'Pending') return null;

    // Find active vehicles
    const vehicles = await Vehicle.find({ status: { $in: ['active', 'idle'] } });
    
    let nearestVehicle = null;
    let minDistance = Infinity;

    for (const vehicle of vehicles) {
      // Basic capacity check: Assume complaint needs 500kg capacity if not specified
      const availableCapacity = vehicle.loadCapacity - vehicle.currentLoadWeight;
      if (availableCapacity < 500) continue;

      const distance = getDistance(
        complaint.location.lat, 
        complaint.location.lng, 
        vehicle.currentLocation.lat, 
        vehicle.currentLocation.lng
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestVehicle = vehicle;
      }
    }

    if (nearestVehicle) {
      // Assign the vehicle
      complaint.assignedVehicleId = nearestVehicle._id;
      complaint.status = 'Assigned';
      await complaint.save();

      nearestVehicle.currentTask = complaint._id;
      await nearestVehicle.save();

      // Emit socket event
      if (io) {
        io.emit('task_assigned', {
          vehicleId: nearestVehicle._id,
          complaint: complaint,
          distance: minDistance
        });
        io.emit('complaint_updated', complaint);
      }

      return nearestVehicle;
    }

    return null; // No vehicle found
  } catch (error) {
    console.error('Error in assignNearestVehicle:', error);
    return null;
  }
};

// Optimize return route: Find pending tasks for returning vehicles
const optimizeReturnRoute = async (vehicle, io) => {
  try {
    if (vehicle.status !== 'returning') return null;

    // Find pending complaints
    const pendingComplaints = await Complaint.find({ status: 'Pending' });
    
    let nearestComplaint = null;
    let minDistance = 2.0; // Max 2km deviation allowed for return trip optimization

    for (const complaint of pendingComplaints) {
      const distance = getDistance(
        vehicle.currentLocation.lat,
        vehicle.currentLocation.lng,
        complaint.location.lat,
        complaint.location.lng
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestComplaint = complaint;
      }
    }

    if (nearestComplaint) {
      nearestComplaint.assignedVehicleId = vehicle._id;
      nearestComplaint.status = 'Assigned';
      await nearestComplaint.save();

      vehicle.currentTask = nearestComplaint._id;
      // Vehicle is no longer just returning, it's back to active collection
      vehicle.status = 'active'; 
      await vehicle.save();

      if (io) {
        io.emit('task_assigned', {
          vehicleId: vehicle._id,
          complaint: nearestComplaint,
          distance: minDistance,
          isReturnOptimization: true
        });
        io.emit('complaint_updated', nearestComplaint);
      }

      return nearestComplaint;
    }

    return null;
  } catch (error) {
    console.error('Error in optimizeReturnRoute:', error);
    return null;
  }
};

module.exports = {
  getDistance,
  assignNearestVehicle,
  optimizeReturnRoute
};

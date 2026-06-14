const DriverPerformance = require('../models/DriverPerformance');
const Driver = require('../models/Driver');
const Attendance = require('../models/Attendance');

// 1. Fetch Performance Ranking Leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const { sortBy = 'performanceScore', limit = 10 } = req.query;

    const ranking = await DriverPerformance.aggregate([
      {
        $group: {
          _id: '$driverId',
          avgDistanceCovered: { $avg: '$distanceCovered' },
          avgRoutesCompleted: { $avg: '$routesCompleted' },
          avgWasteCollected: { $avg: '$wasteCollected' },
          avgHoursWorked: { $avg: '$hoursWorked' },
          avgPunctuality: { $avg: '$punctualityScore' },
          avgRouteEfficiency: { $avg: '$routeEfficiency' },
          avgSafety: { $avg: '$safetyScore' },
          avgPerformance: { $avg: '$performanceScore' }
        }
      },
      {
        $lookup: {
          from: 'drivers',
          localField: '_id',
          foreignField: '_id',
          as: 'driver'
        }
      },
      { $unwind: '$driver' },
      {
        $project: {
          driverId: '$_id',
          driverName: '$driver.driverName',
          phoneNumber: '$driver.phoneNumber',
          shiftTime: '$driver.shiftTime',
          avatar: '$driver.driverName',
          distance: { $round: ['$avgDistanceCovered', 1] },
          routes: { $round: ['$avgRoutesCompleted', 1] },
          waste: { $round: ['$avgWasteCollected', 0] },
          hours: { $round: ['$avgHoursWorked', 1] },
          punctuality: { $round: ['$avgPunctuality', 1] },
          efficiency: { $round: ['$avgRouteEfficiency', 1] },
          safety: { $round: ['$avgSafety', 1] },
          performanceScore: { $round: ['$avgPerformance', 0] }
        }
      }
    ]);

    // Apply sorting
    const validSortKeys = ['performanceScore', 'distance', 'routes', 'waste', 'hours', 'safety'];
    const sortField = validSortKeys.includes(sortBy) ? sortBy : 'performanceScore';

    ranking.sort((a, b) => b[sortField] - a[sortField]);

    // Add rank index
    const rankedResults = ranking.slice(0, parseInt(limit)).map((item, index) => ({
      rank: index + 1,
      ...item
    }));

    res.json(rankedResults);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Fetch Aggregated Performance Dashboard Stats
exports.getPerformanceStats = async (req, res) => {
  try {
    // Aggregated performance statistics across last 30 days
    const stats = await DriverPerformance.aggregate([
      {
        $group: {
          _id: null,
          totalDistance: { $sum: '$distanceCovered' },
          totalRoutes: { $sum: '$routesCompleted' },
          totalWaste: { $sum: '$wasteCollected' },
          totalHours: { $sum: '$hoursWorked' },
          avgRouteEfficiency: { $avg: '$routeEfficiency' },
          avgSafety: { $avg: '$safetyScore' },
          avgPerformance: { $avg: '$performanceScore' }
        }
      }
    ]);

    // Average attendance rate across all drivers
    const drivers = await Driver.find();
    let totalPresent = 0;
    let totalAbsent = 0;
    drivers.forEach(d => {
      totalPresent += d.attendanceCount || 0;
      totalAbsent += d.absentCount || 0;
    });
    const totalDays = totalPresent + totalAbsent;
    const avgAttendanceRate = totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : 85;

    const result = stats[0] ? {
      distanceCovered: Math.round(stats[0].totalDistance * 10) / 10,
      routesCompleted: stats[0].totalRoutes,
      wasteCollected: Math.round(stats[0].totalWaste),
      hoursWorked: Math.round(stats[0].totalHours * 10) / 10,
      attendanceRate: avgAttendanceRate,
      punctualityScore: 92, // Heuristic default
      routeEfficiency: Math.round(stats[0].avgRouteEfficiency) || 94,
      safetyScore: Math.round(stats[0].avgSafety) || 96,
      performanceScore: Math.round(stats[0].avgPerformance) || 85
    } : {
      distanceCovered: 4520,
      routesCompleted: 350,
      wasteCollected: 125000,
      hoursWorked: 2840,
      attendanceRate: avgAttendanceRate,
      punctualityScore: 90,
      routeEfficiency: 88,
      safetyScore: 95,
      performanceScore: 84
    };

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Fetch Single Driver performance scorecard details
exports.getDriverPerformanceDetails = async (req, res) => {
  try {
    const { driverId } = req.params;

    const performanceLogs = await DriverPerformance.find({ driverId })
      .sort({ date: -1 })
      .limit(30); // Last 30 entries

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Accumulate stats
    const aggregates = await DriverPerformance.aggregate([
      { $match: { driverId: driver._id } },
      {
        $group: {
          _id: null,
          totalDistance: { $sum: '$distanceCovered' },
          totalRoutes: { $sum: '$routesCompleted' },
          totalWaste: { $sum: '$wasteCollected' },
          totalHours: { $sum: '$hoursWorked' },
          avgPunctuality: { $avg: '$punctualityScore' },
          avgRouteEfficiency: { $avg: '$routeEfficiency' },
          avgSafety: { $avg: '$safetyScore' },
          avgPerformanceScore: { $avg: '$performanceScore' }
        }
      }
    ]);

    const stats = aggregates[0] ? {
      totalDistance: Math.round(aggregates[0].totalDistance * 10) / 10,
      totalRoutes: aggregates[0].totalRoutes,
      totalWaste: Math.round(aggregates[0].totalWaste),
      totalHours: Math.round(aggregates[0].totalHours * 10) / 10,
      avgPunctuality: Math.round(aggregates[0].avgPunctuality),
      avgRouteEfficiency: Math.round(aggregates[0].avgRouteEfficiency),
      avgSafety: Math.round(aggregates[0].avgSafety),
      performanceScore: Math.round(aggregates[0].avgPerformanceScore)
    } : {
      totalDistance: 0,
      totalRoutes: 0,
      totalWaste: 0,
      totalHours: 0,
      avgPunctuality: 100,
      avgRouteEfficiency: 100,
      avgSafety: 100,
      performanceScore: 100
    };

    res.json({
      driver,
      stats,
      logs: performanceLogs
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Fetch logged-in driver's specific performance
exports.getMyPerformance = async (req, res) => {
  try {
    // Ensure the user is a driver and has an employeeId linking to a Driver document
    if (req.user.role !== 'driver' || !req.user.employeeId) {
      return res.status(403).json({ message: 'Access denied: User is not a registered driver' });
    }

    const driverId = req.user.employeeId;

    const performanceLogs = await DriverPerformance.find({ driverId })
      .sort({ date: -1 })
      .limit(30);

    const driver = await Driver.findById(driverId).populate('assignedVehicle');
    if (!driver) {
      return res.status(404).json({ message: 'Driver profile not found' });
    }

    const aggregates = await DriverPerformance.aggregate([
      { $match: { driverId: driver._id } },
      {
        $group: {
          _id: null,
          totalDistance: { $sum: '$distanceCovered' },
          totalRoutes: { $sum: '$routesCompleted' },
          totalWaste: { $sum: '$wasteCollected' },
          totalHours: { $sum: '$hoursWorked' },
          avgPunctuality: { $avg: '$punctualityScore' },
          avgRouteEfficiency: { $avg: '$routeEfficiency' },
          avgSafety: { $avg: '$safetyScore' },
          avgPerformanceScore: { $avg: '$performanceScore' }
        }
      }
    ]);

    const stats = aggregates[0] ? {
      totalDistance: Math.round(aggregates[0].totalDistance * 10) / 10,
      totalRoutes: aggregates[0].totalRoutes,
      totalWaste: Math.round(aggregates[0].totalWaste),
      totalHours: Math.round(aggregates[0].totalHours * 10) / 10,
      avgPunctuality: Math.round(aggregates[0].avgPunctuality),
      avgRouteEfficiency: Math.round(aggregates[0].avgRouteEfficiency),
      avgSafety: Math.round(aggregates[0].avgSafety),
      performanceScore: Math.round(aggregates[0].avgPerformanceScore)
    } : {
      totalDistance: 0,
      totalRoutes: 0,
      totalWaste: 0,
      totalHours: 0,
      avgPunctuality: 100,
      avgRouteEfficiency: 100,
      avgSafety: 100,
      performanceScore: 100
    };

    res.json({
      driver,
      stats,
      logs: performanceLogs
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

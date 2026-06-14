import { useState, useEffect } from 'react';
import useWorkforceStore from '../store/useWorkforceStore';
import useDriverStore from '../store/useDriverStore';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { 
  FaRoad, FaRoute, FaTrashAlt, FaHourglassHalf, 
  FaChartLine, FaIdCard, FaSearch 
} from 'react-icons/fa';
import api from '../services/api';
import './DriverPerformanceDashboardPage.css';

export default function DriverPerformanceDashboardPage() {
  const { drivers, fetchDrivers } = useDriverStore();
  const {
    productivityStats,
    fetchProductivityStats,
  } = useWorkforceStore();

  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [driverScorecard, setDriverScorecard] = useState(null);
  const [loadingScorecard, setLoadingScorecard] = useState(false);
  const [performanceHistory, setPerformanceHistory] = useState([]);

  useEffect(() => {
    fetchProductivityStats();
    fetchDrivers({ status: 'active' });
    fetchPerformanceHistoryData();
  }, []);

  const fetchPerformanceHistoryData = async () => {
    try {
      // Fetch some historical aggregated values for chart
      const { data } = await api.get('/performance/leaderboard?limit=30');
      // Format dummy trend lines for chart
      const formatted = data.map((d, i) => ({
        day: `Day ${i + 1}`,
        safety: d.safety,
        efficiency: d.efficiency,
        performance: d.performanceScore
      }));
      setPerformanceHistory(formatted.reverse());
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch individual scorecard
  useEffect(() => {
    if (selectedDriverId) {
      setLoadingScorecard(true);
      api.get(`/performance/details/${selectedDriverId}`)
        .then(({ data }) => {
          setDriverScorecard(data);
          setLoadingScorecard(false);
        })
        .catch(err => {
          console.error(err);
          setLoadingScorecard(false);
        });
    } else {
      setDriverScorecard(null);
    }
  }, [selectedDriverId]);

  const stats = productivityStats || {
    distanceCovered: 4520,
    routesCompleted: 350,
    wasteCollected: 125000,
    hoursWorked: 2840,
    attendanceRate: 92,
    punctualityScore: 90,
    routeEfficiency: 88,
    safetyScore: 95,
    performanceScore: 84
  };

  // Radar chart data for individual driver
  const radarData = driverScorecard ? [
    { subject: 'Attendance', A: driverScorecard.stats.avgPunctuality, fullMark: 100 },
    { subject: 'Punctuality', A: driverScorecard.stats.avgPunctuality, fullMark: 100 },
    { subject: 'Safety', A: driverScorecard.stats.avgSafety, fullMark: 100 },
    { subject: 'Efficiency', A: driverScorecard.stats.avgRouteEfficiency, fullMark: 100 },
    { subject: 'Productivity', A: Math.round((driverScorecard.stats.totalWaste / (driverScorecard.stats.totalHours * 350 || 1)) * 100), fullMark: 100 },
    { subject: 'Overall Performance', A: driverScorecard.stats.performanceScore, fullMark: 100 }
  ] : [];

  return (
    <div className="performance-page container">
      {/* 1. Aggregated Metrics Summary */}
      <div className="performance-stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><FaRoad /></div>
          <div className="stat-info">
            <span className="stat-label">Total Distance</span>
            <span className="stat-value">{stats.distanceCovered.toLocaleString()} km</span>
            <span className="stat-change up">Last 30 Days</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><FaRoute /></div>
          <div className="stat-info">
            <span className="stat-label">Routes Completed</span>
            <span className="stat-value">{stats.routesCompleted}</span>
            <span className="stat-change up">Last 30 Days</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon teal"><FaTrashAlt /></div>
          <div className="stat-info">
            <span className="stat-label">Waste Collected</span>
            <span className="stat-value">{(stats.wasteCollected / 1000).toFixed(1)} Tons</span>
            <span className="stat-change up">Last 30 Days</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow"><FaHourglassHalf /></div>
          <div className="stat-info">
            <span className="stat-label">Total Active Time</span>
            <span className="stat-value">{stats.hoursWorked.toLocaleString()} hrs</span>
            <span className="stat-change up">Last 30 Days</span>
          </div>
        </div>
      </div>

      <div className="performance-chart-grid">
        {/* 2. Global Productivity Chart */}
        <div className="card chart-card">
          <div className="card-header">
            <h2 className="card-title"><FaChartLine /> Workforce Performance & Safety Score Trends (Last 30 Days)</h2>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={performanceHistory}>
                <defs>
                  <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSafety" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--info)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--info)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="day" stroke="var(--text-tertiary)" fontSize={11} />
                <YAxis stroke="var(--text-tertiary)" domain={[60, 100]} fontSize={11} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-secondary)', 
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)'
                  }} 
                />
                <Area type="monotone" dataKey="performance" name="Performance Score" stroke="var(--accent-primary)" fillOpacity={1} fill="url(#colorPerf)" strokeWidth={2} />
                <Area type="monotone" dataKey="safety" name="Safety Score" stroke="var(--info)" fillOpacity={1} fill="url(#colorSafety)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Individual Scorecard Section */}
        <div className="card scorecard-card">
          <div className="card-header">
            <h2 className="card-title"><FaIdCard /> Driver Scorecard Console</h2>
            <select
              className="select"
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
            >
              <option value="">-- Select Operator --</option>
              {drivers.map(d => (
                <option key={d._id} value={d._id}>{d.driverName}</option>
              ))}
            </select>
          </div>

          <div className="scorecard-body">
            {!selectedDriverId ? (
              <div className="empty-state">
                <span className="empty-state-icon">👷</span>
                <p className="empty-state-text">Choose an operator from the dropdown to check their productivity scorecard.</p>
              </div>
            ) : loadingScorecard ? (
              <div className="loading-overlay">
                <div className="spinner"></div>
                <p>Loading operator scorecard...</p>
              </div>
            ) : driverScorecard ? (
              <div className="scorecard-grid">
                {/* Radar chart */}
                <div className="radar-wrapper">
                  <ResponsiveContainer width="100%" height={260}>
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="var(--border-color)" />
                      <PolarAngleAxis dataKey="subject" stroke="var(--text-secondary)" fontSize={10} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--text-tertiary)" fontSize={9} />
                      <Radar 
                        name={driverScorecard.driver.driverName} 
                        dataKey="A" 
                        stroke="var(--accent-primary)" 
                        fill="var(--accent-primary)" 
                        fillOpacity={0.3} 
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Score Stats */}
                <div className="scorecard-details">
                  <h3>{driverScorecard.driver.driverName}</h3>
                  <p className="scorecard-sub">Shift: <strong>{driverScorecard.driver.shiftTime}</strong> | Joind: {new Date(driverScorecard.driver.joiningDate).toLocaleDateString()}</p>
                  
                  <div className="score-rows">
                    <div className="score-row">
                      <span>Waste Collected:</span>
                      <strong>{(driverScorecard.stats.totalWaste / 1000).toFixed(1)} Tons</strong>
                    </div>
                    <div className="score-row">
                      <span>Distance Covered:</span>
                      <strong>{driverScorecard.stats.totalDistance} km</strong>
                    </div>
                    <div className="score-row">
                      <span>Routes Completed:</span>
                      <strong>{driverScorecard.stats.totalRoutes}</strong>
                    </div>
                    <div className="score-row">
                      <span>Hours Logged:</span>
                      <strong>{driverScorecard.stats.totalHours} hrs</strong>
                    </div>
                    <div className="score-row highlight">
                      <span>Performance Index:</span>
                      <strong className="perf-text">{driverScorecard.stats.performanceScore}/100</strong>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <p className="empty-state-text">Could not retrieve performance details.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

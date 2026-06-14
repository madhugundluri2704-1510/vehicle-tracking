import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';
import './DriverPortalPage.css';

export default function DriverPortalPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyPerformance = async () => {
      try {
        const response = await api.get('/performance/me');
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load performance data.');
      } finally {
        setLoading(false);
      }
    };
    fetchMyPerformance();
  }, []);

  if (loading) return <div className="portal-loading">Loading your dashboard...</div>;
  if (error) return <div className="portal-error">{error}</div>;
  if (!data) return <div className="portal-error">No data available.</div>;

  const { driver, stats, logs } = data;

  // Format logs for the chart (reverse so it goes oldest to newest)
  const chartData = [...logs].reverse().map(log => ({
    date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: log.performanceScore,
    distance: log.distanceCovered
  }));

  return (
    <div className="driver-portal">
      <div className="portal-header">
        <h1>Welcome back, {driver.driverName}! 🚛</h1>
        <p>Your Personal Performance Dashboard</p>
      </div>

      <div className="profile-card">
        <div className="profile-info">
          <h3>Driver Profile</h3>
          <p><strong>Phone:</strong> {driver.phoneNumber}</p>
          <p><strong>Shift:</strong> <span className={`shift-badge ${driver.shiftTime}`}>{driver.shiftTime}</span></p>
          <p><strong>Status:</strong> {driver.status}</p>
        </div>
        <div className="vehicle-info">
          <h3>Assigned Vehicle</h3>
          {driver.assignedVehicle ? (
            <>
              <p><strong>Number:</strong> {driver.assignedVehicle.vehicleNumber}</p>
              <p><strong>Type:</strong> {driver.assignedVehicle.vehicleType}</p>
            </>
          ) : (
            <p>No vehicle assigned currently.</p>
          )}
        </div>
        <div className="overall-score">
          <h3>Overall Score</h3>
          <div className="score-circle">
            <span className="score-value">{stats.performanceScore}</span>
            <span className="score-max">/100</span>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🗺️</div>
          <div className="stat-details">
            <h4>Total Distance</h4>
            <p>{stats.totalDistance} km</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">♻️</div>
          <div className="stat-details">
            <h4>Waste Collected</h4>
            <p>{stats.totalWaste} kg</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-details">
            <h4>Hours Worked</h4>
            <p>{stats.totalHours} hrs</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-details">
            <h4>Safety Score</h4>
            <p>{stats.avgSafety}%</p>
          </div>
        </div>
      </div>

      <div className="chart-section">
        <h3>Performance Trend (Last 30 Days)</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }} />
              <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Performance Score" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="logs-section">
        <h3>Recent Activity Logs</h3>
        <div className="table-responsive">
          <table className="logs-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Distance (km)</th>
                <th>Waste (kg)</th>
                <th>Hours</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log._id}>
                  <td>{new Date(log.date).toLocaleDateString()}</td>
                  <td>{log.distanceCovered}</td>
                  <td>{log.wasteCollected}</td>
                  <td>{log.hoursWorked}</td>
                  <td><span className={`score-badge ${log.performanceScore >= 80 ? 'good' : log.performanceScore >= 60 ? 'avg' : 'poor'}`}>{log.performanceScore}</span></td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center">No recent activity found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import useWorkforceStore from '../store/useWorkforceStore';
import { FaCrown, FaMedal, FaTrophy, FaSearch, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import './DriverRankingPage.css';

export default function DriverRankingPage() {
  const { leaderboard, loading, fetchLeaderboard } = useWorkforceStore();
  const [sortBy, setSortBy] = useState('performanceScore');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLeaderboard({ sortBy, limit: 25 });
  }, [sortBy]);

  const handleSortChange = (field) => {
    setSortBy(field);
  };

  const filteredLeaderboard = leaderboard.filter(item =>
    item.driverName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Extract Podium (Top 3)
  const top1 = filteredLeaderboard.find(item => item.rank === 1) || filteredLeaderboard[0];
  const top2 = filteredLeaderboard.find(item => item.rank === 2) || filteredLeaderboard[1];
  const top3 = filteredLeaderboard.find(item => item.rank === 3) || filteredLeaderboard[2];

  // Rest of the list (Rank 4+)
  const restOfDrivers = filteredLeaderboard.filter(item => 
    item._id !== top1?._id && item._id !== top2?._id && item._id !== top3?._id
  );

  return (
    <div className="ranking-page container">
      {/* 1. Leaderboard Sort Controls */}
      <div className="ranking-controls card">
        <div className="ranking-filters">
          <span className="filter-label">Sort Leaderboard By:</span>
          <div className="tabs">
            <button 
              className={`tab ${sortBy === 'performanceScore' ? 'active' : ''}`}
              onClick={() => handleSortChange('performanceScore')}
            >
              🏆 Overall Score
            </button>
            <button 
              className={`tab ${sortBy === 'safety' ? 'active' : ''}`}
              onClick={() => handleSortChange('safety')}
            >
              🛡️ Safety
            </button>
            <button 
              className={`tab ${sortBy === 'waste' ? 'active' : ''}`}
              onClick={() => handleSortChange('waste')}
            >
              ♻️ Waste Collected
            </button>
            <button 
              className={`tab ${sortBy === 'distance' ? 'active' : ''}`}
              onClick={() => handleSortChange('distance')}
            >
              📍 Distance
            </button>
          </div>
        </div>

        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            className="input" 
            placeholder="Search driver by name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 2. Top 3 Podium (Only show if search is not filtering away the top ranks) */}
      {!searchTerm && filteredLeaderboard.length >= 3 && (
        <div className="podium-section">
          {/* 2nd Place */}
          {top2 && (
            <div className="podium-card silver">
              <div className="podium-rank"><FaMedal className="silver-medal" /> 2</div>
              <div className="podium-avatar">{top2.driverName[0]}</div>
              <h3 className="podium-name">{top2.driverName}</h3>
              <span className="podium-score">{top2.performanceScore} pts</span>
              <div className="podium-details">
                <span>Shift: <strong>{top2.shiftTime}</strong></span>
                <span>Waste: <strong>{(top2.waste / 1000).toFixed(1)} T</strong></span>
              </div>
            </div>
          )}

          {/* 1st Place */}
          {top1 && (
            <div className="podium-card gold">
              <div className="crown-icon"><FaCrown /></div>
              <div className="podium-rank"><FaTrophy className="gold-trophy" /> 1</div>
              <div className="podium-avatar">{top1.driverName[0]}</div>
              <h3 className="podium-name">{top1.driverName}</h3>
              <span className="podium-score">{top1.performanceScore} pts</span>
              <div className="podium-details">
                <span>Shift: <strong>{top1.shiftTime}</strong></span>
                <span>Waste: <strong>{(top1.waste / 1000).toFixed(1)} T</strong></span>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {top3 && (
            <div className="podium-card bronze">
              <div className="podium-rank"><FaMedal className="bronze-medal" /> 3</div>
              <div className="podium-avatar">{top3.driverName[0]}</div>
              <h3 className="podium-name">{top3.driverName}</h3>
              <span className="podium-score">{top3.performanceScore} pts</span>
              <div className="podium-details">
                <span>Shift: <strong>{top3.shiftTime}</strong></span>
                <span>Waste: <strong>{(top3.waste / 1000).toFixed(1)} T</strong></span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Ranks Table */}
      <div className="card leaderboard-card">
        <div className="card-header">
          <h2 className="card-title">KMC SwachhTrack Driver Standings</h2>
        </div>
        <div className="data-table-wrapper">
          {loading ? (
            <div className="loading-overlay">
              <div className="spinner"></div>
              <p>Loading leaderboard rankings...</p>
            </div>
          ) : filteredLeaderboard.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon">🏆</span>
              <p className="empty-state-text">No rankings available.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Rank</th>
                  <th>Driver Name</th>
                  <th>Shift Time</th>
                  <th>Safety Score</th>
                  <th>Route Efficiency</th>
                  <th>Distance Covered</th>
                  <th>Total Waste Collected</th>
                  <th>Performance Index</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaderboard.map((item, idx) => {
                  const isTop3 = item.rank <= 3;
                  const rankClass = isTop3 ? `rank-pill top-${item.rank}` : 'rank-pill';
                  
                  return (
                    <tr key={item._id} className={isTop3 ? 'row-highlight' : ''}>
                      <td>
                        <span className={rankClass}>{item.rank}</span>
                      </td>
                      <td>
                        <strong>{item.driverName}</strong>
                      </td>
                      <td>
                        <span className="shift-pill">{item.shiftTime}</span>
                      </td>
                      <td>
                        <div className="score-cell">
                          <span>{item.safety}%</span>
                          <span className="indicator-pill green">Active</span>
                        </div>
                      </td>
                      <td>{item.efficiency}%</td>
                      <td>{item.distance} km</td>
                      <td>{(item.waste / 1000).toFixed(1)} Tons</td>
                      <td>
                        <strong className="perf-badge">{item.performanceScore}/100</strong>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

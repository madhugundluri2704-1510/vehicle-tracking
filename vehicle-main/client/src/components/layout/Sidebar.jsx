import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import useThemeStore from '../../store/useThemeStore';
import './Sidebar.css';

const navItems = [
  { path: '/', icon: '📊', label: 'Dashboard' },
  { path: '/tracking', icon: '📍', label: 'Live Tracking' },
  { path: '/routes', icon: '🗺️', label: 'Route Monitoring' },
  { path: '/analytics', icon: '♻️', label: 'Waste Analytics' },
  { path: '/vehicles', icon: '🚛', label: 'Vehicle Management' },
  { path: '/drivers', icon: '👷', label: 'Driver Management' },
  { path: '/attendance', icon: '📅', label: 'Attendance Desk' },
  { path: '/workforce', icon: '👥', label: 'Workforce Hub' },
  { path: '/driver-performance', icon: '📈', label: 'Productivity Stats' },
  { path: '/driver-ranking', icon: '🏆', label: 'Driver Leaderboard' },
  { path: '/attendance-reports', icon: '📑', label: 'Attendance Reports' },
  { path: '/reports', icon: '📋', label: 'Reports' },
  { path: '/complaints', icon: '🚨', label: 'Complaints & CCTV' },
  { path: '/settings', icon: '⚙️', label: 'Settings' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const currentNavItems = user?.role === 'driver' ? [
    { path: '/driver-portal', icon: '🚛', label: 'My Portal' },
    { path: '/settings', icon: '⚙️', label: 'Settings' }
  ] : navItems;

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">🏛️</span>
          {!collapsed && <div className="logo-text-wrap"><span className="logo-text">KMC</span><span className="logo-sub">SwachthTrack</span></div>}
        </div>
        <button className="sidebar-toggle" onClick={onToggle}>{collapsed ? '→' : '←'}</button>
      </div>
      <nav className="sidebar-nav">
        {currentNavItems.map((item) => (
          <NavLink key={item.path} to={item.path} end={item.path === '/'} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={item.label}>
            <span className="nav-icon">{item.icon}</span>
            {!collapsed && <span className="nav-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle theme">
          <span className="nav-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
          {!collapsed && <span className="nav-label">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        <div className="user-section">
          <div className="user-avatar">{user?.username?.[0] || 'A'}</div>
          {!collapsed && (<div className="user-info"><span className="user-name">{user?.username || 'Admin'}</span><span className="user-role">{user?.role || 'admin'}</span></div>)}
        </div>
        <button className="logout-btn" onClick={handleLogout} title="Logout">
          <span className="nav-icon">🚪</span>
          {!collapsed && <span className="nav-label">Logout</span>}
        </button>
      </div>
    </aside>
  );
}

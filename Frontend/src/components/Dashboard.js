// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    totalRooms: 0,
    activeUsers: 0,
    totalMessages: 0,
    codeExecutions: 0
  });
  const [recentRooms, setRecentRooms] = useState([]);
  const [languageStats, setLanguageStats] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch rooms data
      const response = await axios.get('http://localhost:5000/api/rooms');
      const rooms = response.data || [];

      // Calculate statistics
      const activeUsers = rooms.reduce((sum, room) => sum + room.userCount, 0);
      
      setStats({
        totalRooms: rooms.length,
        activeUsers: activeUsers,
        totalMessages: Math.floor(Math.random() * 1000) + 500, // Simulated
        codeExecutions: Math.floor(Math.random() * 500) + 200 // Simulated
      });

      // Get recent rooms
      setRecentRooms(rooms.slice(0, 5));

      // Language statistics
      const langCount = {};
      rooms.forEach(room => {
        langCount[room.language] = (langCount[room.language] || 0) + 1;
      });
      
      const langStatsArray = Object.entries(langCount).map(([lang, count]) => ({
        language: lang,
        count: count,
        percentage: ((count / rooms.length) * 100).toFixed(1)
      }));
      
      setLanguageStats(langStatsArray);

      // Activity data (simulated for chart)
      setActivityData([
        { time: '9 AM', users: 12 },
        { time: '10 AM', users: 25 },
        { time: '11 AM', users: 35 },
        { time: '12 PM', users: 45 },
        { time: '1 PM', users: 38 },
        { time: '2 PM', users: 52 },
        { time: '3 PM', users: 48 }
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const handleCreateRoom = () => {
    onNavigate('create');
  };

  const handleJoinRoom = () => {
    onNavigate('join');
  };

  const languageIcons = {
    javascript: '🟨',
    python: '🐍',
    java: '☕',
    cpp: '⚙️',
    html: '🌐',
    css: '🎨',
    typescript: '💠',
    json: '📋'
  };

  const getLanguageColor = (language) => {
    const colors = {
      javascript: '#F7DF1E',
      python: '#3776AB',
      java: '#007396',
      cpp: '#00599C',
      html: '#E34F26',
      css: '#1572B6',
      typescript: '#3178C6',
      json: '#000000'
    };
    return colors[language] || '#667eea';
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>🚀 Collaborative Code Editor</h1>
            <p className="header-subtitle">Real-time coding workspace for teams</p>
          </div>
          <div className="header-actions">
            <button className="btn-create" onClick={handleCreateRoom}>
              ➕ Create Room
            </button>
            <button className="btn-join" onClick={handleJoinRoom}>
              🚪 Join Room
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-purple">
          <div className="stat-icon">🏠</div>
          <div className="stat-content">
            <h3>{stats.totalRooms}</h3>
            <p>Active Rooms</p>
          </div>
          <div className="stat-trend positive">↗ +12%</div>
        </div>

        <div className="stat-card stat-green">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.activeUsers}</h3>
            <p>Active Users</p>
          </div>
          <div className="stat-trend positive">↗ +8%</div>
        </div>

        <div className="stat-card stat-blue">
          <div className="stat-icon">💬</div>
          <div className="stat-content">
            <h3>{stats.totalMessages}</h3>
            <p>Messages Sent</p>
          </div>
          <div className="stat-trend positive">↗ +25%</div>
        </div>

        <div className="stat-card stat-orange">
          <div className="stat-icon">▶️</div>
          <div className="stat-content">
            <h3>{stats.codeExecutions}</h3>
            <p>Code Executions</p>
          </div>
          <div className="stat-trend positive">↗ +15%</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-content">
        {/* Activity Chart */}
        <div className="dashboard-card activity-card">
          <div className="card-header">
            <h3>📊 User Activity</h3>
            <span className="badge badge-live">● LIVE</span>
          </div>
          <div className="activity-chart">
            {activityData.map((data, index) => (
              <div key={index} className="chart-bar-container">
                <div className="chart-bar" style={{ height: `${(data.users / 60) * 100}%` }}>
                  <span className="bar-value">{data.users}</span>
                </div>
                <span className="bar-label">{data.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Language Statistics */}
        <div className="dashboard-card language-card">
          <div className="card-header">
            <h3>🔤 Language Distribution</h3>
          </div>
          <div className="language-stats">
            {languageStats.length > 0 ? (
              languageStats.map((lang, index) => (
                <div key={index} className="language-item">
                  <div className="language-info">
                    <span className="language-icon">{languageIcons[lang.language] || '📝'}</span>
                    <span className="language-name">{lang.language}</span>
                  </div>
                  <div className="language-progress-container">
                    <div 
                      className="language-progress"
                      style={{ 
                        width: `${lang.percentage}%`,
                        background: getLanguageColor(lang.language)
                      }}
                    ></div>
                  </div>
                  <span className="language-percentage">{lang.percentage}%</span>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No active rooms yet</p>
                <small>Create a room to see statistics</small>
              </div>
            )}
          </div>
        </div>

        {/* Recent Rooms */}
        <div className="dashboard-card recent-rooms-card">
          <div className="card-header">
            <h3>🔥 Active Rooms</h3>
            <button className="refresh-btn" onClick={fetchDashboardData}>🔄</button>
          </div>
          <div className="recent-rooms">
            {recentRooms.length > 0 ? (
              recentRooms.map((room, index) => (
                <div key={index} className="room-item">
                  <div className="room-left">
                    <div className="room-icon" style={{ background: getLanguageColor(room.language) }}>
                      {languageIcons[room.language] || '📝'}
                    </div>
                    <div className="room-info">
                      <h4>Room {room.roomId}</h4>
                      <p>{room.language}</p>
                    </div>
                  </div>
                  <div className="room-right">
                    <div className="user-count">
                      <span className="user-icon">👥</span>
                      <span className="count">{room.userCount}</span>
                    </div>
                    <div className="status-indicator active"></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>🏜️ No active rooms</p>
                <small>Be the first to create a room!</small>
              </div>
            )}
          </div>
        </div>

        {/* Features Overview */}
        <div className="dashboard-card features-card">
          <div className="card-header">
            <h3>✨ Platform Features</h3>
          </div>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">⚡</div>
              <h4>Real-Time Sync</h4>
              <p>Instant code synchronization across all users</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🎤</div>
              <h4>Voice Messages</h4>
              <p>Communicate with voice notes and chat</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">▶️</div>
              <h4>Code Execution</h4>
              <p>Run code in 8+ programming languages</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">💾</div>
              <h4>Auto Save</h4>
              <p>Never lose your work with automatic saving</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🎨</div>
              <h4>Syntax Highlight</h4>
              <p>Beautiful code highlighting with Monaco Editor</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <h4>Live Analytics</h4>
              <p>Track usage and collaboration metrics</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card quick-actions-card">
          <div className="card-header">
            <h3>⚡ Quick Actions</h3>
          </div>
          <div className="quick-actions">
            <button className="action-btn action-purple">
              <span className="action-icon">📝</span>
              <span className="action-text">New JavaScript Project</span>
            </button>
            <button className="action-btn action-blue">
              <span className="action-icon">🐍</span>
              <span className="action-text">Python Workspace</span>
            </button>
            <button className="action-btn action-green">
              <span className="action-icon">☕</span>
              <span className="action-text">Java Environment</span>
            </button>
            <button className="action-btn action-orange">
              <span className="action-icon">🌐</span>
              <span className="action-text">Web Development</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="dashboard-footer">
        <div className="footer-content">
          <p>Made with ❤️ by our Team | Real-Time Collaborative Code Editor</p>
          <div className="footer-links">
            <a href="#docs">📚 Documentation</a>
            <a href="#api">🔌 API</a>
            <a href="#support">💬 Support</a>
            <a href="#github">⭐ GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
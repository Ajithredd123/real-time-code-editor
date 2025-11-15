// src/App.js
import React, { useState } from 'react';
import CodeEditor from './components/CodeEditor';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, create, join, editor

  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  const handleCreateRoom = () => {
    if (!username.trim()) {
      alert('Please enter your name');
      return;
    }
    const newRoomId = generateRoomId();
    setRoomId(newRoomId);
    setCurrentView('editor');
  };

  const handleJoinRoom = () => {
    if (!username.trim()) {
      alert('Please enter your name');
      return;
    }
    if (!roomId.trim()) {
      alert('Please enter a room ID');
      return;
    }
    setCurrentView('editor');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setRoomId('');
    setUsername('');
  };

  // Dashboard View
  if (currentView === 'dashboard') {
    return <Dashboard onNavigate={handleNavigate} />;
  }

  // Editor View
  if (currentView === 'editor') {
    return (
      <div>
        <CodeEditor roomId={roomId} username={username} />
        <button 
          className="back-to-dashboard-btn"
          onClick={handleBackToDashboard}
          title="Back to Dashboard"
        >
          🏠 Dashboard
        </button>
      </div>
    );
  }

  // Create/Join Room View
  return (
    <div className="app-container">
      <div className="welcome-screen">
        <div className="welcome-card">
          <button 
            className="back-btn"
            onClick={() => handleNavigate('dashboard')}
          >
            ← Back to Dashboard
          </button>

          <h1>🚀 {currentView === 'create' ? 'Create New Room' : 'Join Room'}</h1>
          <p className="subtitle">
            {currentView === 'create' 
              ? 'Start a new collaborative coding session'
              : 'Join an existing coding session'
            }
          </p>

          <div className="input-group">
            <label>Your Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (currentView === 'create' ? handleCreateRoom() : handleJoinRoom())}
            />
          </div>

          {currentView === 'join' && (
            <div className="input-group">
              <label>Room ID</label>
              <input
                type="text"
                placeholder="Enter room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
              />
            </div>
          )}

          <button 
            className="btn btn-primary" 
            onClick={currentView === 'create' ? handleCreateRoom : handleJoinRoom}
          >
            {currentView === 'create' ? '✨ Create Room' : '🚪 Join Room'}
          </button>

          <div className="features">
            <div className="feature">
              <span className="feature-icon">✨</span>
              <span>Real-time collaboration</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🎨</span>
              <span>Syntax highlighting</span>
            </div>
            <div className="feature">
              <span className="feature-icon">👥</span>
              <span>Multiple users</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
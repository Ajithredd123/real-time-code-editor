// src/components/CodeEditor.js
import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import socketService from '../services/socketService';
import OutputPanel from './OutputPanel';
import ChatBox from './ChatBox';
import './CodeEditor.css';

const CodeEditor = ({ roomId, username }) => {
  const [code, setCode] = useState('// Loading...');
  const [language, setLanguage] = useState('javascript');
  const [users, setUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [showOutput, setShowOutput] = useState(true);
  const [chatWidth, setChatWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const editorRef = useRef(null);
  const isRemoteChange = useRef(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const socket = socketService.connect();

    socket.on('connect', () => {
      setIsConnected(true);
      socketService.joinRoom(roomId, username);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socketService.onRoomJoined((data) => {
      setCode(data.code);
      setLanguage(data.language);
      setUsers(data.users);
    });

    socketService.onUserJoined((user) => {
      setUsers((prev) => [...prev, user]);
    });

    socketService.onUserLeft((data) => {
      setUsers((prev) => prev.filter((u) => u.id !== data.userId));
    });

    socketService.onCodeUpdate((data) => {
      isRemoteChange.current = true;
      setCode(data.code);
    });

    socketService.onLanguageUpdate((data) => {
      setLanguage(data.language);
    });

    return () => {
      socketService.offAllListeners();
      socketService.disconnect();
    };
  }, [roomId, username]);

  const handleEditorChange = (value) => {
    if (isRemoteChange.current) {
      isRemoteChange.current = false;
      return;
    }

    setCode(value);
    socketService.sendCodeChange(roomId, value);
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    socketService.sendLanguageChange(roomId, newLanguage);
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;

    editor.onDidChangeCursorPosition((e) => {
      const position = e.position;
      socketService.sendCursorMove(roomId, position);
    });
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    alert('Room ID copied to clipboard!');
  };

  const toggleOutput = () => {
    setShowOutput(!showOutput);
  };

  // === Resizable Chat Panel Handlers ===
  const handleMouseDown = () => setIsResizing(true);

  const handleMouseMove = (e) => {
    if (!isResizing) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newWidth = containerRect.right - e.clientX;
    if (newWidth > 240 && newWidth < 600) setChatWidth(newWidth);
  };

  const handleMouseUp = () => setIsResizing(false);

  return (
    <div
      className="code-editor-container"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Header */}
      <div className="editor-header">
        <div className="header-left">
          <h2>Collaborative Code Editor</h2>
          <span
            className={`status-indicator ${
              isConnected ? 'connected' : 'disconnected'
            }`}
          >
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
        </div>

        <div className="header-center">
          <div className="room-info">
            <span>
              Room: <strong>{roomId}</strong>
            </span>
            <button onClick={copyRoomId} className="copy-btn">
              📋 Copy
            </button>
          </div>
        </div>

        <div className="header-right">
          <button onClick={toggleOutput} className="toggle-output-btn">
            {showOutput ? '📊 Hide Output' : '📊 Show Output'}
          </button>
          <select
            value={language}
            onChange={handleLanguageChange}
            className="language-select"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="typescript">TypeScript</option>
            <option value="json">JSON</option>
          </select>
        </div>
      </div>

      {/* Active Users */}
      <div className="users-panel">
        <h4>Active Users ({users.length})</h4>
        <div className="users-list">
          {users.map((user) => (
            <div key={user.id} className="user-badge">
              <span
                className="user-color"
                style={{ backgroundColor: user.color }}
              ></span>
              <span className="user-name">{user.username}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Editor, Output, and Resizable Chat */}
      <div className="editor-output-container">
        <div
          className={`editor-wrapper ${showOutput ? 'with-output' : 'full-width'}`}
        >
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: true },
              automaticLayout: true,
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              tabSize: 2,
            }}
          />
        </div>

        {showOutput && (
          <div className="output-wrapper">
            <OutputPanel code={code} language={language} />
          </div>
        )}

        {/* Drag Handle for Resizing */}
        <div
          className="resize-handle"
          onMouseDown={handleMouseDown}
          title="Drag to resize chat"
        ></div>

        {/* Chat Panel */}
        <div className="chat-panel" style={{ width: `${chatWidth}px` }}>
          <ChatBox
            roomId={roomId}
            username={username}
            currentUserId={username}
          />
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;

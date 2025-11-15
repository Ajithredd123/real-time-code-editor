// src/services/socketService.js
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to server:', this.socket.id);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  joinRoom(roomId, username) {
    if (this.socket) {
      this.socket.emit('join-room', { roomId, username });
    }
  }

  onRoomJoined(callback) {
    if (this.socket) {
      this.socket.on('room-joined', callback);
    }
  }

  onUserJoined(callback) {
    if (this.socket) {
      this.socket.on('user-joined', callback);
    }
  }

  onUserLeft(callback) {
    if (this.socket) {
      this.socket.on('user-left', callback);
    }
  }

  sendCodeChange(roomId, code) {
    if (this.socket) {
      this.socket.emit('code-change', { roomId, code });
    }
  }

  onCodeUpdate(callback) {
    if (this.socket) {
      this.socket.on('code-update', callback);
    }
  }

  sendLanguageChange(roomId, language) {
    if (this.socket) {
      this.socket.emit('language-change', { roomId, language });
    }
  }

  onLanguageUpdate(callback) {
    if (this.socket) {
      this.socket.on('language-update', callback);
    }
  }

  sendCursorMove(roomId, position) {
    if (this.socket) {
      this.socket.emit('cursor-move', { roomId, position });
    }
  }

  onCursorUpdate(callback) {
    if (this.socket) {
      this.socket.on('cursor-update', callback);
    }
  }

  sendMessage(roomId, message, username, type, fileData) {
    if (this.socket) {
      this.socket.emit('send-message', { roomId, message, username, type, fileData });
    }
  }

  onReceiveMessage(callback) {
    if (this.socket) {
      this.socket.on('receive-message', callback);
    }
  }

  onChatHistory(callback) {
    if (this.socket) {
      this.socket.on('chat-history', callback);
    }
  }

  sendTypingStart(roomId, username) {
    if (this.socket) {
      this.socket.emit('typing-start', { roomId, username });
    }
  }

  sendTypingStop(roomId) {
    if (this.socket) {
      this.socket.emit('typing-stop', { roomId });
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user-typing', callback);
    }
  }

  onUserStoppedTyping(callback) {
    if (this.socket) {
      this.socket.on('user-stopped-typing', callback);
    }
  }

  markMessageAsRead(roomId, messageId) {
    if (this.socket) {
      this.socket.emit('message-read', { roomId, messageId });
    }
  }

  onMessageReadUpdate(callback) {
    if (this.socket) {
      this.socket.on('message-read-update', callback);
    }
  }

  offAllListeners() {
    if (this.socket) {
      this.socket.off('room-joined');
      this.socket.off('user-joined');
      this.socket.off('user-left');
      this.socket.off('code-update');
      this.socket.off('language-update');
      this.socket.off('cursor-update');
      this.socket.off('receive-message');
      this.socket.off('chat-history');
      this.socket.off('user-typing');
      this.socket.off('user-stopped-typing');
      this.socket.off('message-read-update');
    }
  }
}

const socketServiceInstance = new SocketService();
export default socketServiceInstance;
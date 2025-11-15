// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const Document = require('./models/Document');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// CORS configuration
app.use(cors());
app.use(express.json());

// Socket.IO setup with CORS
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/collaborative-code';

mongoose.connect(MONGODB_URI)
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// Store active rooms and users
const rooms = new Map();
const chatHistory = new Map(); // Store chat messages per room

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  console.log('🟢 New client connected:', socket.id);

  // Join a room
  socket.on('join-room', async ({ roomId, username }) => {
    socket.join(roomId);
    
    try {
      // Try to find existing document in MongoDB
      let document = await Document.findOne({ roomId });
      
      if (!document) {
        // Create new document if it doesn't exist
        document = await Document.create({
          roomId,
          code: '// Start coding here...\n',
          language: 'javascript',
          collaborators: [{ username, lastActive: new Date() }]
        });
      } else {
        // Update collaborators
        const existingCollaborator = document.collaborators.find(
          c => c.username === username
        );
        if (!existingCollaborator) {
          document.collaborators.push({ username, lastActive: new Date() });
          await document.save();
        }
      }

      // Initialize room in memory if it doesn't exist
      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          code: document.code,
          language: document.language,
          users: []
        });
      }

      const room = rooms.get(roomId);
      
      // Add user to room
      const user = {
        id: socket.id,
        username: username || `User${socket.id.slice(0, 4)}`,
        color: getRandomColor()
      };
      
      room.users.push(user);

      // Send current room state to the new user
      socket.emit('room-joined', {
        code: room.code,
        language: room.language,
        users: room.users
      });

      // Send chat history to new user
      const messages = chatHistory.get(roomId) || [];
      socket.emit('chat-history', messages);

      // Notify others in the room
      socket.to(roomId).emit('user-joined', user);

      console.log(`👤 ${user.username} joined room: ${roomId}`);
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Handle code changes
  socket.on('code-change', async ({ roomId, code }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.code = code;
      
      // Save to MongoDB (debounced in production)
      try {
        await Document.findOneAndUpdate(
          { roomId },
          { 
            code, 
            updatedAt: new Date(),
            $inc: { version: 1 }
          }
        );
      } catch (error) {
        console.error('Error saving code:', error);
      }
      
      // Broadcast to all other users in the room
      socket.to(roomId).emit('code-update', { code, userId: socket.id });
    }
  });

  // Handle language change
  socket.on('language-change', async ({ roomId, language }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.language = language;
      
      // Save to MongoDB
      try {
        await Document.findOneAndUpdate(
          { roomId },
          { language, updatedAt: new Date() }
        );
      } catch (error) {
        console.error('Error saving language:', error);
      }
      
      socket.to(roomId).emit('language-update', { language });
    }
  });

  // Handle cursor position
  socket.on('cursor-move', ({ roomId, position }) => {
    socket.to(roomId).emit('cursor-update', {
      userId: socket.id,
      position
    });
  });

  // Handle chat messages
  socket.on('send-message', ({ roomId, message, username, type, fileData }) => {
    const timestamp = new Date();
    const chatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      username,
      message,
      type: type || 'text', // text, voice, file, image
      fileData: fileData || null,
      timestamp,
      userId: socket.id
    };
    
    // Store message in chat history
    if (!chatHistory.has(roomId)) {
      chatHistory.set(roomId, []);
    }
    chatHistory.get(roomId).push(chatMessage);
    
    // Keep only last 100 messages per room
    if (chatHistory.get(roomId).length > 100) {
      chatHistory.get(roomId).shift();
    }
    
    // Broadcast to all users in the room (including sender)
    io.to(roomId).emit('receive-message', chatMessage);
    
    console.log(`💬 ${username} in ${roomId}: ${type || 'text'} message`);
  });

  // Handle typing indicator
  socket.on('typing-start', ({ roomId, username }) => {
    socket.to(roomId).emit('user-typing', { username, userId: socket.id });
  });

  socket.on('typing-stop', ({ roomId }) => {
    socket.to(roomId).emit('user-stopped-typing', { userId: socket.id });
  });

  // Handle message read receipts
  socket.on('message-read', ({ roomId, messageId }) => {
    socket.to(roomId).emit('message-read-update', { 
      messageId, 
      readBy: socket.id 
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
    
    // Remove user from all rooms
    rooms.forEach((room, roomId) => {
      const userIndex = room.users.findIndex(u => u.id === socket.id);
      if (userIndex !== -1) {
        const user = room.users[userIndex];
        room.users.splice(userIndex, 1);
        
        // Notify others
        io.to(roomId).emit('user-left', { userId: socket.id, username: user.username });
        
        // Clean up empty rooms
        if (room.users.length === 0) {
          rooms.delete(roomId);
          console.log(`🗑️  Empty room deleted: ${roomId}`);
        }
      }
    });
  });
});

// Helper function to generate random colors for users
function getRandomColor() {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// REST API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.get('/api/rooms', (req, res) => {
  const roomsList = Array.from(rooms.entries()).map(([id, data]) => ({
    roomId: id,
    userCount: data.users.length,
    language: data.language
  }));
  res.json(roomsList);
});

app.get('/api/chat-history/:roomId', (req, res) => {
  const { roomId } = req.params;
  const messages = chatHistory.get(roomId) || [];
  res.json({ roomId, messages, count: messages.length });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
// models/Document.js
const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    default: 'Untitled Document'
  },
  code: {
    type: String,
    default: '// Start coding here...\n'
  },
  language: {
    type: String,
    default: 'javascript',
    enum: ['javascript', 'python', 'java', 'cpp', 'html', 'css', 'typescript', 'json']
  },
  owner: {
    type: String,
    required: false
  },
  collaborators: [{
    username: String,
    lastActive: Date
  }],
  version: {
    type: Number,
    default: 1
  },
  history: [{
    code: String,
    timestamp: Date,
    userId: String,
    version: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
DocumentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Document', DocumentSchema);
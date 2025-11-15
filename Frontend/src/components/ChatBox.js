// src/components/ChatBox.js
import React, { useState, useEffect, useRef } from 'react';
import EmojiPicker from 'emoji-picker-react';
import socketService from '../services/socketService';
import './ChatBox.css';

const ChatBox = ({ roomId, username, currentUserId }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [typingUsers, setTypingUsers] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const typingTimeoutRef = useRef(null);
  const recordingIntervalRef = useRef(null);

  useEffect(() => {
    // Listen for chat history when joining room
    socketService.onChatHistory((history) => {
      console.log('📜 Received chat history:', history);
      setMessages(history);
    });

    // Listen for incoming messages
    socketService.onReceiveMessage((message) => {
      console.log('📨 Received message:', message);
      setMessages((prev) => {
        // Prevent duplicate messages
        if (prev.some(m => m.id === message.id)) {
          return prev;
        }
        return [...prev, message];
      });
      
      // Play notification sound for new messages from others
      if (message.userId !== currentUserId) {
        playNotificationSound();
        if (!isOpen) {
          setUnreadCount((prev) => prev + 1);
        }
      }
    });

    // Listen for typing indicators
    socketService.onUserTyping(({ username, userId }) => {
      setTypingUsers((prev) => {
        if (!prev.find(u => u.userId === userId)) {
          return [...prev, { username, userId }];
        }
        return prev;
      });
    });

    socketService.onUserStoppedTyping(({ userId }) => {
      setTypingUsers((prev) => prev.filter(u => u.userId !== userId));
    });

    // Cleanup
    return () => {
      socketService.socket?.off('receive-message');
      socketService.socket?.off('chat-history');
      socketService.socket?.off('user-typing');
      socketService.socket?.off('user-stopped-typing');
    };
  }, [isOpen, currentUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSmJ0fPTgjMGHm7A7+OZSA0PVqvn77BdGQU+ltv0xnMpBSh+zPLaizsIGGS57OihUBELTKXh8bllHAU2jdXzzn0vBSV7yvDejj0JFVy16+ijUxEJS6Lf8rplHAU1jNPzz34wBSh9y/DdkT8KFWO76+mjUxEJSqHf8bllHAU1i9Lz0H4wBSh+y+/dkT8KFWO76+mjUxEJSqDe8rllHAU1i9Lyz38vBSh9y/DdkUAKFGK66+mkUhAKS6Df8blmHAU1i9Hzz38wBSh9y/DdkEAKFWK66+mjUhEJS5/f8bllHAU1i9Hzz38wBSh9y+/dkUAKFWO66umkUhEJSp/e8rhmHAU2jNLyz34wBSh8y+/dkD8KFWO76+mjUhAJSp/f8blmGwU2jNLyzoAwBSh8yu/dkD4KFmS76+mjUREJSZ/f8blmGwU1jNPzzoAwBSh7yu/dkT4KFmS76+ijUREKSp/f8LlmGwU1jNPzzoAwBSh7yu/dkT4KFmS76umjUREKSZ/e8LlmGwU1jNPzz4AwBSh7yu/dkT4KFmS76umjUBEKSZ/e8LlmGwU1jNPzz4AwBSh7yu/dkT4KFmO76umjUBEKSZ/e8LlmGwU1jNPzz4AwBSh7yu/dkT4KFmO76umjUBEKSZ/e8LlmGwU1jNPzz4AwBSh7yu/dkT4KFmO76umjUBEKSZ/e8LlmGwU1jNPzz4AwBSh7yu/dkT4KFmO76umjUBEKSZ/e8LlmGwU1jNPzz4AwBSh7yu/dkT4KFmO76umjUBEKSZ/e8LlmGwU1jNPzz4AwBSh7yu/dkT4KFmO76umjUBEKSZ/e8LlmGwU1jNPzz4AwBSh7yu/dkT4KFmO76umjUBEKSZ/e8LlmGwU1jNPzz4AwBSh7yu/dkT4KFmO76umjUBEKSZ/e8LlmGwU1jNPzz4AwBSh7yu/dkT4KFmO76umjUBEKSZ/e8LlmGwU1jNPzz4AwBSh7yu/dkT4KFmO76umjUBEKSZ/e8LlmGwU1jNPzz4AwBSh7yu/dkT4KFmO76umjUBEKSZ/e8LlmGwU1jNPzz4AwBSh7yu/dkT4KFmO76umjUBEKSZ/e8LlmGwU1jNPzz4AwBSh7yu/dkT4KFmO76umjUBEKSZ/e8LlmGwU1jNPzz4AwBSh7yu/dkT4KFmO76umjUBEKSZ/e8LlmGwU1jNPzz4AwBSh7yu/dkT4KFmO76umjUBEKSZ/e8LlmGwU1jNPzz4AwBSh7yu/dkT4KFmO76umjUBEKSZ/e8LlmGwU1jNPzz4AwBSh7yu/dkT4KFmO76umjUBEKSZ/e8LlmGwU1jNPzz4AwBSh7yu/dkT4KFmO76umjUBEKSZ/e8LlmGwU1jNPzz4AwBSh7yu/dkT4KFmO76umjUBEKSZ/e8LlmGwU1jNPzz4AwBSh7yu/dkT4K');
    audio.volume = 0.3;
    audio.play().catch(() => {}); // Ignore autoplay errors
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (inputMessage.trim() === '') return;

    // Send message via socket
    socketService.sendMessage(
      roomId, 
      inputMessage, 
      username, 
      'text',
      replyTo ? { replyTo } : null
    );
    
    // Stop typing indicator
    socketService.sendTypingStop(roomId);
    
    // Clear input and reply
    setInputMessage('');
    setReplyTo(null);
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    
    // Send typing indicator
    socketService.sendTypingStart(roomId, username);
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      socketService.sendTypingStop(roomId);
    }, 1000);
  };

  const handleEmojiClick = (emojiData) => {
    setInputMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result;
          
          // Send voice message
          socketService.sendMessage(
            roomId,
            `Voice message (${recordingTime}s)`,
            username,
            'voice',
            { audio: base64Audio, duration: recordingTime }
          );
        };

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

    } catch (error) {
      alert('Microphone permission denied or not available');
      console.error('Error accessing microphone:', error);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const cancelVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setRecordingTime(0);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64File = reader.result;
      const fileType = file.type.startsWith('image/') ? 'image' : 'file';
      
      socketService.sendMessage(
        roomId,
        file.name,
        username,
        fileType,
        { 
          file: base64File, 
          fileName: file.name, 
          fileSize: file.size,
          fileType: file.type
        }
      );
    };
    
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };

  const downloadFile = (fileData, fileName) => {
    const link = document.createElement('a');
    link.href = fileData.file;
    link.download = fileName;
    link.click();
  };

  const handleReply = (message) => {
    setReplyTo(message);
    inputRef.current?.focus();
  };

  const cancelReply = () => {
    setReplyTo(null);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const renderMessage = (msg) => {
    switch (msg.type) {
      case 'voice':
        return (
          <div className="voice-message">
            <audio controls src={msg.fileData?.audio}>
              Your browser does not support audio playback.
            </audio>
            <span className="voice-duration">{msg.fileData?.duration}s</span>
          </div>
        );
      
      case 'image':
        return (
          <div className="image-message">
            <img 
              src={msg.fileData?.file} 
              alt={msg.message}
              onClick={() => window.open(msg.fileData?.file, '_blank')}
            />
            <span className="image-name">{msg.message}</span>
          </div>
        );
      
      case 'file':
        return (
          <div className="file-message">
            <div className="file-icon">📄</div>
            <div className="file-info">
              <span className="file-name">{msg.message}</span>
              <span className="file-size">{formatFileSize(msg.fileData?.fileSize)}</span>
            </div>
            <button 
              className="download-btn"
              onClick={() => downloadFile(msg.fileData, msg.message)}
            >
              ⬇
            </button>
          </div>
        );
      
      default:
        return (
          <div className="text-message">
            {msg.fileData?.replyTo && (
              <div className="reply-preview">
                <div className="reply-line"></div>
                <div className="reply-content">
                  <span className="reply-username">{msg.fileData.replyTo.username}</span>
                  <span className="reply-text">{msg.fileData.replyTo.message}</span>
                </div>
              </div>
            )}
            {msg.message}
          </div>
        );
    }
  };

  return (
    <div className={`chat-container ${isOpen ? 'open' : 'closed'}`}>
      {/* Chat Toggle Button */}
      <button 
        className="chat-toggle-btn" 
        onClick={toggleChat}
        title={isOpen ? 'Close Chat' : 'Open Chat'}
      >
        💬 Chat
        {unreadCount > 0 && !isOpen && (
          <span className="unread-badge">{unreadCount}</span>
        )}
      </button>

      {/* Chat Box */}
      {isOpen && (
        <div className="chat-box">
          {/* Chat Header */}
          <div className="chat-header">
            <h3>💬 Team Chat</h3>
            <button className="close-chat-btn" onClick={toggleChat}>
              ✕
            </button>
          </div>

          {/* Messages List */}
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="no-messages">
                <p>👋 Start the conversation!</p>
                <small>Send messages, voice notes, or files</small>
              </div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`message ${msg.userId === currentUserId ? 'own-message' : 'other-message'}`}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleReply(msg);
                  }}
                >
                  <div className="message-header">
                    <span className="message-username">{msg.username}</span>
                    <span className="message-time">{formatTime(msg.timestamp)}</span>
                  </div>
                  <div className="message-content">
                    {renderMessage(msg)}
                  </div>
                  {msg.userId !== currentUserId && (
                    <button 
                      className="reply-btn"
                      onClick={() => handleReply(msg)}
                      title="Reply"
                    >
                      ↩
                    </button>
                  )}
                </div>
              ))
            )}
            
            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <div className="typing-indicator">
                <span>{typingUsers[0].username} is typing</span>
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Reply Preview */}
          {replyTo && (
            <div className="reply-bar">
              <div className="reply-bar-content">
                <span className="reply-bar-label">Replying to {replyTo.username}</span>
                <span className="reply-bar-text">{replyTo.message}</span>
              </div>
              <button className="cancel-reply-btn" onClick={cancelReply}>
                ✕
              </button>
            </div>
          )}

          {/* Voice Recording Interface */}
          {isRecording && (
            <div className="recording-interface">
              <div className="recording-animation">
                <div className="recording-pulse"></div>
                <span className="recording-icon">🎤</span>
              </div>
              <span className="recording-time">{recordingTime}s</span>
              <div className="recording-actions">
                <button className="cancel-record-btn" onClick={cancelVoiceRecording}>
                  ❌ Cancel
                </button>
                <button className="stop-record-btn" onClick={stopVoiceRecording}>
                  ⏹ Send
                </button>
              </div>
            </div>
          )}

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="emoji-picker-container">
              <EmojiPicker onEmojiClick={handleEmojiClick} width={300} height={400} />
            </div>
          )}

          {/* Chat Input */}
          {!isRecording && (
            <form className="chat-input-form" onSubmit={handleSendMessage}>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileSelect}
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              
              <button 
                type="button"
                className="attach-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Attach file"
              >
                📎
              </button>

              <button
                type="button"
                className="emoji-btn"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                title="Insert emoji"
              >
                😊
              </button>

              <input
                ref={inputRef}
                type="text"
                className="chat-input"
                placeholder="Type a message..."
                value={inputMessage}
                onChange={handleInputChange}
                maxLength={1000}
              />

              {inputMessage.trim() ? (
                <button type="submit" className="send-btn">
                  ➤
                </button>
              ) : (
                <button 
                  type="button"
                  className="voice-btn"
                  onClick={startVoiceRecording}
                  title="Record voice message"
                >
                  🎤
                </button>
              )}
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatBox;
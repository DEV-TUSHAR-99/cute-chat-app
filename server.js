const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const crypto = require('crypto');
const ChatSecurity = require('./security');

// Initialize security module
const security = new ChatSecurity();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Store active rooms and their users
const rooms = new Map();
const userRooms = new Map();

// Generate secure random token
function generateToken() {
  return crypto.randomBytes(16).toString('hex');
}

// Apply security middleware
app.use(security.middleware());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10kb' })); // Limit body size

// Apply security headers to all responses
app.use((req, res, next) => {
  const headers = security.getSecurityHeaders();
  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  next();
});

// API to create a new chat room
app.post('/api/create-room', (req, res) => {
  // Rate limit check
  const ip = req.ip || req.connection.remoteAddress;
  const rateCheck = security.checkRateLimit(ip, 'create-room');
  
  if (!rateCheck.allowed) {
    security.logSecurityEvent('RATE_LIMIT_CREATE_ROOM', { ip });
    return res.status(429).json({ 
      error: 'Too many rooms created. Please wait.',
      retryAfter: rateCheck.retryAfter
    });
  }
  
  const roomId = generateToken();
  const joinToken = generateToken();
  const fullToken = `${roomId}_${joinToken}`;
  
  rooms.set(roomId, {
    id: roomId,
    joinToken: joinToken,
    users: [],
    messages: [],
    createdAt: Date.now(),
    expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours expiry
  });
  
  security.logSecurityEvent('ROOM_CREATED', { roomId, ip: security.hashIP(ip) });
  
  res.json({
    roomId: roomId,
    joinLink: `${req.headers.origin || 'http://localhost:3000'}/chat.html?room=${roomId}&token=${joinToken}`,
    token: fullToken
  });
});

// API to verify join token
app.get('/api/verify-room/:roomId', (req, res) => {
  const { roomId } = req.params;
  const { token } = req.query;
  const ip = req.ip || req.connection.remoteAddress;
  
  const room = rooms.get(roomId);
  
  if (!room) {
    return res.status(404).json({ valid: false, error: 'Room not found' });
  }
  
  // Check room expiry
  if (Date.now() > room.expiresAt) {
    rooms.delete(roomId);
    return res.status(410).json({ valid: false, error: 'Room has expired' });
  }
  
  if (room.users.length >= 2) {
    return res.status(403).json({ valid: false, error: 'Room is full' });
  }
  
  // Allow if no users in room yet (creator joining first) - no token needed
  if (room.users.length === 0) {
    security.clearRoomAttempts(roomId, ip);
    return res.json({ valid: true, roomId: roomId });
  }
  
  // For second user joining, token is required
  if (!token) {
    security.logSecurityEvent('TOKEN_MISSING', { roomId, ip: security.hashIP(ip) });
    return res.status(400).json({ valid: false, error: 'Token required to join this room' });
  }
  
  // Validate token format
  const tokenValidation = security.validateToken(token);
  if (!tokenValidation.valid) {
    security.logSecurityEvent('INVALID_TOKEN_FORMAT', { roomId, ip: security.hashIP(ip) });
    return res.status(400).json({ valid: false, error: tokenValidation.reason });
  }
  
  // Track room join attempts
  const attemptCheck = security.trackRoomAttempt(roomId, ip);
  if (!attemptCheck.allowed) {
    security.logSecurityEvent('ROOM_JOIN_BLOCKED', { roomId, ip: security.hashIP(ip), reason: attemptCheck.reason });
    return res.status(403).json({ valid: false, error: attemptCheck.reason });
  }
  
  // Check if token matches (full token or just token part)
  const { tokenPart } = tokenValidation;
  if (token === room.joinToken || tokenPart === room.joinToken) {
    security.clearRoomAttempts(roomId, ip);
    return res.json({ valid: true, roomId: roomId });
  }
  
  security.logSecurityEvent('INVALID_TOKEN', { roomId, ip: security.hashIP(ip) });
  return res.status(403).json({ valid: false, error: 'Invalid token' });
});

// Apply socket security middleware
io.use(security.socketMiddleware());

// Socket.io connection handling
io.on('connection', (socket) => {
  const clientIP = socket.handshake.address;
  console.log('User connected:', socket.id, 'from', security.hashIP(clientIP));
  
  // Join room
  socket.on('join-room', ({ roomId, username }) => {
    // Validate username
    const usernameValidation = security.validateUsername(username);
    if (!usernameValidation.valid) {
      socket.emit('error', { message: usernameValidation.errors.join(', ') });
      return;
    }
    
    const sanitizedUsername = usernameValidation.sanitized;
    
    // Rate limit check for messages
    const rateCheck = security.checkRateLimit(socket.id, 'join');
    if (!rateCheck.allowed) {
      socket.emit('error', { message: rateCheck.reason });
      return;
    }
    
    const room = rooms.get(roomId);
    
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    
    if (room.users.length >= 2) {
      socket.emit('error', { message: 'Room is full' });
      return;
    }
    
    // Check if username already in room
    if (room.users.some(u => u.username.toLowerCase() === sanitizedUsername.toLowerCase())) {
      socket.emit('error', { message: 'Username already taken in this room' });
      return;
    }
    
    // Add user to room
    socket.join(roomId);
    room.users.push({
      id: socket.id,
      username: sanitizedUsername,
      joinedAt: Date.now()
    });
    userRooms.set(socket.id, roomId);
    
    security.logSecurityEvent('USER_JOINED', { 
      roomId, 
      username: sanitizedUsername, 
      ip: security.hashIP(clientIP) 
    });
    
    // Notify user joined
    socket.to(roomId).emit('user-joined', {
      username: sanitizedUsername,
      message: `${sanitizedUsername} joined the chat 💕`
    });
    
    // Send previous messages (decrypt if needed)
    socket.emit('previous-messages', room.messages);
    
    // Notify room is ready if 2 users
    if (room.users.length === 2) {
      io.to(roomId).emit('chat-ready', {
        message: 'Both users connected! Start chatting 💬'
      });
    }
    
    console.log(`${sanitizedUsername} joined room ${roomId}`);
  });
  
  // Handle messages
  socket.on('send-message', ({ roomId, message, type = 'text' }) => {
    // Rate limit check
    const rateCheck = security.checkRateLimit(socket.id, 'message');
    if (!rateCheck.allowed) {
      socket.emit('error', { message: rateCheck.reason });
      return;
    }
    
    // Validate message
    const messageValidation = security.validateMessage(message);
    if (!messageValidation.valid) {
      socket.emit('error', { message: messageValidation.errors.join(', ') });
      return;
    }
    
    const sanitizedMessage = messageValidation.sanitized;
    
    const room = rooms.get(roomId);
    if (!room) return;
    
    const user = room.users.find(u => u.id === socket.id);
    if (!user) return;
    
    const messageData = {
      id: crypto.randomBytes(8).toString('hex'),
      username: user.username,
      message: sanitizedMessage,
      type: type,
      timestamp: Date.now()
    };
    
    // Store message (limit to last 100)
    room.messages.push(messageData);
    if (room.messages.length > 100) {
      room.messages.shift();
    }
    
    // Broadcast to room
    io.to(roomId).emit('new-message', messageData);
    
    // Log message (without content for privacy)
    security.logSecurityEvent('MESSAGE_SENT', { 
      roomId, 
      username: user.username,
      messageLength: sanitizedMessage.length
    });
  });
  
  // Handle typing indicator
  socket.on('typing', ({ roomId, isTyping }) => {
    // Rate limit typing indicators
    const rateCheck = security.checkRateLimit(`${socket.id}:typing`, 'typing');
    if (!rateCheck.allowed) return;
    
    const room = rooms.get(roomId);
    if (!room) return;
    
    const user = room.users.find(u => u.id === socket.id);
    if (!user) return;
    
    socket.to(roomId).emit('user-typing', {
      username: user.username,
      isTyping: isTyping
    });
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    const roomId = userRooms.get(socket.id);
    if (roomId) {
      const room = rooms.get(roomId);
      if (room) {
        const user = room.users.find(u => u.id === socket.id);
        if (user) {
          socket.to(roomId).emit('user-left', {
            username: user.username,
            message: `${user.username} left the chat 😢`
          });
          room.users = room.users.filter(u => u.id !== socket.id);
          
          security.logSecurityEvent('USER_LEFT', { roomId, username: user.username });
          
          // Clean up empty rooms after 1 hour
          if (room.users.length === 0) {
            setTimeout(() => {
              if (rooms.get(roomId)?.users.length === 0) {
                rooms.delete(roomId);
                security.logSecurityEvent('ROOM_DELETED', { roomId, reason: 'empty' });
                console.log(`Room ${roomId} deleted`);
              }
            }, 3600000);
          }
        }
      }
      userRooms.delete(socket.id);
    }
    console.log('User disconnected:', socket.id);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    activeRooms: rooms.size,
    totalUsers: Array.from(rooms.values()).reduce((sum, r) => sum + r.users.length, 0)
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  security.logSecurityEvent('SERVER_ERROR', { 
    error: err.message,
    path: req.path,
    ip: security.hashIP(req.ip || req.connection.remoteAddress)
  });
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Cute Chat Server running on port ${PORT}`);
  console.log(`🔒 Security module loaded`);
  console.log(`📱 Open http://localhost:${PORT} in your browser`);
});

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const sessionRoutes = require('./routes/sessions');
const userRoutes = require('./routes/users');
const treatmentPlanRoutes = require('./routes/treatmentPlans');
const treatmentTemplateRoutes = require('./routes/treatmentTemplates');
const adminRoutes = require('./routes/admin');
// const treatmentRoutes = require('./routes/treatments'); // We'll add this later

// Express app setup
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', // Erlaube alle Origins für die Entwicklung
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  }
});

// Middleware
app.use(cors({
  origin: '*', // Erlaube alle Origins für die Entwicklung
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/treatment-plans', treatmentPlanRoutes);
app.use('/api/treatment-templates', treatmentTemplateRoutes);
app.use('/api/admin', adminRoutes);
// app.use('/api/treatments', treatmentRoutes); // We'll add this later

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Socket.IO events
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Join room based on user ID if provided
  socket.on('join', (userId) => {
    if (userId) {
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined their personal room`);
    }
  });
  
  // Join session room
  socket.on('joinSession', (sessionId) => {
    if (sessionId) {
      socket.join(`session:${sessionId}`);
      console.log(`Client joined session room: ${sessionId}`);
    }
  });
  
  // Leave session room
  socket.on('leaveSession', (sessionId) => {
    if (sessionId) {
      socket.leave(`session:${sessionId}`);
      console.log(`Client left session room: ${sessionId}`);
    }
  });
  
  // Disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Helper function to emit session updates
const emitSessionUpdate = (sessionId, data) => {
  io.to(`session:${sessionId}`).emit('sessionUpdate', data);
};

// Helper function to emit notifications to a specific user
const emitNotification = (userId, notification) => {
  io.to(`user:${userId}`).emit('notification', notification);
};

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io, emitSessionUpdate, emitNotification }; 
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const testRoutes = require("./routes/test");
const app = express();
const socket = require("socket.io");
require("dotenv").config();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB Connection Successful");
    console.log(`📊 Database: ${process.env.MONGO_URL}`);
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:");
    console.error(err.message);
    process.exit(1);
  });

// Health check route
app.get("/ping", (_req, res) => {
  return res.json({ 
    msg: "Ping Successful", 
    status: "OK"
  });
});

// Test routes (for debugging)
app.use("/test", testRoutes);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// 404 handler for undefined routes
app.use("*", (req, res) => {
  res.status(404).json({ 
    error: "Route not found", 
    path: req.originalUrl,
    method: req.method 
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("❌ Server Error:", error);
  res.status(500).json({ 
    error: "Internal server error", 
    message: error.message 
  });
});

// Start server
const server = app.listen(process.env.PORT, () => {
  console.log(`🚀 Server started on port ${process.env.PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Base URL: http://localhost:${process.env.PORT}`);
  console.log(`🧪 Test Routes: http://localhost:${process.env.PORT}/test`);
});

// Socket.io setup with OPTIMIZED configuration to prevent disconnections
const io = socket(server, {
  cors: {
    origin: process.env.ORIGIN,
    credentials: true,
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling'],
  // Increased timeouts to prevent premature disconnections
  pingTimeout: 120000,        // 2 minutes (was 60s)
  pingInterval: 50000,        // 50 seconds (was 25s)
  upgradeTimeout: 30000,      // 30 seconds (was 10s)
  allowEIO3: true,
  // Additional stability options
  maxHttpBufferSize: 1e8,     // 100MB buffer
  allowRequest: (req, callback) => {
    callback(null, true); // Allow all requests
  }
});

// Socket connection handling with improved user management
global.onlineUsers = new Map();
global.userSockets = new Map(); // Map userId to socketId

io.on("connection", (socket) => {
  console.log(`🔌 New socket connection: ${socket.id}`);
  
  // Store reference to current socket
  global.chatSocket = socket;
  
  // Handle user joining
  socket.on("add-user", (userId) => {
    try {
      // Remove user from previous socket if exists
      const previousSocketId = global.userSockets.get(userId);
      if (previousSocketId && previousSocketId !== socket.id) {
        const previousSocket = io.sockets.sockets.get(previousSocketId);
        if (previousSocket) {
          previousSocket.disconnect();
        }
      }
      
      // Update maps
      global.onlineUsers.set(userId, socket.id);
      global.userSockets.set(userId, socket.id);
      
      // Join user to a room for private messaging
      socket.join(`user_${userId}`);
      
      console.log(`👤 User ${userId} added to online users (Socket: ${socket.id})`);
      console.log(`📊 Total online users: ${global.onlineUsers.size}`);
      
      // Emit user status to all clients
      io.emit("user-status-change", {
        userId,
        status: "online",
        socketId: socket.id
      });
    } catch (error) {
      console.error("❌ Error adding user:", error);
    }
  });

  // Handle message sending with FIXED bidirectional delivery
  socket.on("send-msg", (data) => {
    try {
      const { to, from, msg } = data;
      const recipientSocketId = global.onlineUsers.get(to);
      
      console.log(`📤 Message from ${from} to ${to} (Recipient socket: ${recipientSocketId})`);
      
      if (recipientSocketId) {
        // Send message to recipient using io.to() for reliable delivery
        io.to(recipientSocketId).emit("msg-recieve", msg);
        
        // Send delivery confirmation to sender
        socket.emit("msg-delivered", {
          to,
          from,
          msg,
          delivered: true
        });
        
        console.log(`✅ Message delivered to ${to} via socket ${recipientSocketId}`);
      } else {
        // Recipient is offline, send offline notification
        socket.emit("msg-delivered", {
          to,
          from,
          msg,
          delivered: false,
          offline: true
        });
        console.log(`📱 Message from ${from} to ${to} - recipient offline`);
      }
    } catch (error) {
      console.error("❌ Error sending message:", error);
      socket.emit("msg-error", {
        error: "Failed to send message",
        details: error.message
      });
    }
  });

  // Handle typing indicators
  socket.on("typing", (data) => {
    try {
      const { to, from, isTyping } = data;
      const recipientSocketId = global.onlineUsers.get(to);
      
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("typing-indicator", {
          from,
          isTyping
        });
      }
    } catch (error) {
      console.error("❌ Error handling typing indicator:", error);
    }
  });

  // Handle user status requests
  socket.on("get-user-status", (userId) => {
    try {
      const isOnline = global.onlineUsers.has(userId);
      socket.emit("user-status", {
        userId,
        online: isOnline,
        socketId: global.onlineUsers.get(userId) || null
      });
    } catch (error) {
      console.error("❌ Error getting user status:", error);
    }
  });

  // Handle user activity
  socket.on("user-activity", (data) => {
    try {
      const { userId, activity } = data;
      // Broadcast user activity to relevant users
      socket.broadcast.emit("user-activity-update", {
        userId,
        activity
      });
    } catch (error) {
      console.error("❌ Error handling user activity:", error);
    }
  });

  // Handle heartbeat/ping to keep connection alive
  socket.on("ping", () => {
    socket.emit("pong");
  });

  // Handle disconnection with improved cleanup
  socket.on("disconnect", (reason) => {
    console.log(`🔌 Socket disconnected: ${socket.id} (Reason: ${reason})`);
    
    // Find and remove user from online users
    let disconnectedUserId = null;
    for (const [userId, socketId] of global.onlineUsers.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        global.onlineUsers.delete(userId);
        global.userSockets.delete(userId);
        break;
      }
    }
    
    if (disconnectedUserId) {
      console.log(`👤 User ${disconnectedUserId} removed from online users`);
      
      // Emit user status change to all clients
      io.emit("user-status-change", {
        userId: disconnectedUserId,
        status: "offline",
        socketId: null
      });
    }
    
    console.log(`📊 Total online users: ${global.onlineUsers.size}`);
  });

  // Handle connection errors
  socket.on("error", (error) => {
    console.error(`🔌 Socket error for ${socket.id}:`, error);
  });

  // Handle reconnection attempts
  socket.on("reconnect_attempt", (attemptNumber) => {
    console.log(`🔄 Socket ${socket.id} attempting reconnection #${attemptNumber}`);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
});

const router = require("express").Router();

// Test route to verify basic routing
router.get("/", (req, res) => {
  res.json({ 
    message: "Test routes are working!", 
    status: "OK"
  });
});

// Test route for API health check
router.get("/health", (req, res) => {
  res.json({ 
    message: "API is healthy", 
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    status: "OK"
  });
});

// Test route for environment variables
router.get("/env", (req, res) => {
  res.json({ 
    message: "Environment check",
    environment: {
      NODE_ENV: process.env.NODE_ENV || 'development',
      PORT: process.env.PORT || 'Not set',
      MONGO_URL: process.env.MONGO_URL ? 'Set (hidden)' : 'Not set',
      ORIGIN: process.env.ORIGIN || 'Not set'
    },
    status: "OK"
  });
});

// Test route for database connection
router.get("/db", async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const status = mongoose.connection.readyState;
    
    const statusMap = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting"
    };
    
    res.json({ 
      message: "Database status check",
      database: {
        status: statusMap[status] || "unknown",
        readyState: status,
        connected: status === 1
      },
      status: "OK"
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Database check failed",
      error: error.message,
      status: "ERROR"
    });
  }
});

module.exports = router;

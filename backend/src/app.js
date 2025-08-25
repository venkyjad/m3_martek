const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const healthRoutes = require('./routes/health');
const briefsRoutes = require('./routes/briefs');
const creativesRoutes = require('./routes/creatives');
const serviceInitializer = require('./services/init');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substr(2, 9);
  
  // Log incoming request
  logger.info(`Incoming ${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    query: req.query,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    contentLength: req.get('Content-Length')
  }, requestId);

  // Store request start time and ID
  req.requestId = requestId;
  req.startTime = startTime;

  // Override res.json to log responses
  const originalJson = res.json;
  res.json = function(body) {
    const duration = Date.now() - startTime;
    
    // Log response
    logger.info(`Response ${req.method} ${req.path} - ${res.statusCode}`, {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      responseSize: JSON.stringify(body).length
    }, requestId);

    return originalJson.call(this, body);
  };

  next();
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/health', healthRoutes);
app.use('/briefs', briefsRoutes);
app.use('/creatives', creativesRoutes);

// Basic API route
app.get('/', (req, res) => {
  res.json({
    message: 'M3 Slice - Marketing Campaign Planning API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health - System health checks',
      briefs: '/briefs - Marketing brief management, campaign generation, and creative matching',
      creatives: '/creatives - Creatives data ingestion to Qdrant'
    },
    features: [
      'Marketing brief processing',
      'AI campaign plan generation from briefs',
      'AI-powered creative matching for briefs',
      'Creatives data ingestion to Qdrant vector database',
      'Vector similarity search',
      'End-to-end campaign workflow'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const errorDetails = {
    method: req.method,
    path: req.path,
    error: err.message,
    stack: err.stack
  };
  
  logger.error(`Unhandled error in ${req.method} ${req.path}`, errorDetails, req.requestId);
  
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message,
    requestId: req.requestId
  });
});

// 404 handler
app.use('*', (req, res) => {
  logger.warn(`404 Not Found: ${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress
  }, req.requestId);
  
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    requestId: req.requestId
  });
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  server.close((err) => {
    if (err) {
      logger.error('Error during server shutdown', { error: err.message });
      process.exit(1);
    }
    
    logger.info('Server closed successfully. Exiting process.');
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', {
    error: err.message,
    stack: err.stack
  });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection', {
    reason: reason,
    promise: promise
  });
  process.exit(1);
});

const server = app.listen(PORT, async () => {
  logger.info(`🚀 M3 Slice Backend API Server started successfully`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    platform: process.platform,
    pid: process.pid,
    memory: process.memoryUsage()
  });
  
  try {
    // Initialize services after server starts
    logger.info('Initializing backend services...');
    await serviceInitializer.initialize();
    logger.info('✅ All backend services initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize backend services', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
});

module.exports = app;

const express = require('express');
const database = require('../config/database');
const qdrant = require('../config/qdrant');

const router = express.Router();

// General health check
router.get('/', async (req, res) => {
  try {
    const mysqlHealth = await database.checkHealth();
    const qdrantHealth = await qdrant.checkHealth();
    
    const overallStatus = (mysqlHealth.status === 'healthy' && qdrantHealth.status === 'healthy') 
      ? 'healthy' : 'unhealthy';

    const healthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services: {
        api: {
          status: 'healthy-king!',
          message: 'API service is running'
        },
        mysql: mysqlHealth,
        qdrant: qdrantHealth
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0'
    };

    const statusCode = overallStatus === 'healthy' ? 200 : 503;
    res.status(statusCode).json(healthStatus);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Health check failed',
      error: error.message
    });
  }
});

// MySQL specific health check
router.get('/mysql', async (req, res) => {
  try {
    const health = await database.checkHealth();
    const statusCode = health.status === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json({
      service: 'mysql',
      ...health,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      service: 'mysql',
      status: 'error',
      message: 'MySQL health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Qdrant specific health check
router.get('/qdrant', async (req, res) => {
  try {
    const health = await qdrant.checkHealth();
    const statusCode = health.status === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json({
      service: 'qdrant',
      ...health,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      service: 'qdrant',
      status: 'error',
      message: 'Qdrant health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API specific health check
router.get('/api', (req, res) => {
  res.json({
    service: 'api',
    status: 'healthy',
    message: 'API service is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    nodeVersion: process.version,
    platform: process.platform
  });
});

// Readiness check (for Kubernetes/Docker health checks)
router.get('/ready', async (req, res) => {
  try {
    const mysqlHealth = await database.checkHealth();
    const qdrantHealth = await qdrant.checkHealth();
    
    const isReady = mysqlHealth.status === 'healthy' && qdrantHealth.status === 'healthy';
    
    if (isReady) {
      res.status(200).json({
        status: 'ready',
        message: 'All services are ready',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        message: 'Some services are not ready',
        services: {
          mysql: mysqlHealth,
          qdrant: qdrantHealth
        },
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Readiness check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Liveness check (for Kubernetes/Docker health checks)
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    message: 'Service is alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;

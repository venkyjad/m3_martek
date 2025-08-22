const database = require('../config/database');
const qdrant = require('../config/qdrant');

class ServiceInitializer {
  async initialize() {
    console.log('Initializing services...');
    
    try {
      // Initialize MySQL connection
      console.log('Connecting to MySQL...');
      const mysqlConnected = await database.connect();
      
      // Initialize Qdrant connection
      console.log('Connecting to Qdrant...');
      const qdrantConnected = await qdrant.connect();
      
      if (mysqlConnected && qdrantConnected) {
        console.log('All services initialized successfully');
        return true;
      } else {
        console.warn('Some services failed to initialize');
        return false;
      }
    } catch (error) {
      console.error('Service initialization failed:', error.message);
      return false;
    }
  }

  async shutdown() {
    console.log('Shutting down services...');
    
    try {
      await database.close();
      console.log('All services shut down successfully');
    } catch (error) {
      console.error('Error during shutdown:', error.message);
    }
  }
}

const serviceInitializer = new ServiceInitializer();

// Graceful shutdown handlers
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await serviceInitializer.shutdown();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await serviceInitializer.shutdown();
  process.exit(0);
});

module.exports = serviceInitializer;

const mysql = require('mysql2/promise');

class DatabaseConnection {
  constructor() {
    this.pool = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      this.pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_NAME || 'backend_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        acquireTimeout: 60000,
        timeout: 60000
      });

      // Test the connection
      const connection = await this.pool.getConnection();
      await connection.ping();
      connection.release();
      
      this.isConnected = true;
      console.log('MySQL connected successfully');
      return true;
    } catch (error) {
      console.error('MySQL connection failed:', error.message);
      this.isConnected = false;
      return false;
    }
  }

  async checkHealth() {
    try {
      if (!this.pool) {
        return { status: 'disconnected', message: 'Pool not initialized' };
      }

      const connection = await this.pool.getConnection();
      await connection.ping();
      connection.release();
      
      return { status: 'healthy', message: 'MySQL connection is active' };
    } catch (error) {
      return { status: 'unhealthy', message: error.message };
    }
  }

  getPool() {
    return this.pool;
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      this.isConnected = false;
      console.log('MySQL connection closed');
    }
  }
}

const database = new DatabaseConnection();
module.exports = database;

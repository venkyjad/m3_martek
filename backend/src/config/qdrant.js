const { QdrantClient } = require('@qdrant/js-client-rest');

class QdrantConnection {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      this.client = new QdrantClient({
        url: process.env.QDRANT_URL || 'http://localhost:6333',
        apiKey: process.env.QDRANT_API_KEY || undefined
      });

      // Test the connection
      await this.client.getCollections();
      
      this.isConnected = true;
      console.log('Qdrant connected successfully');
      return true;
    } catch (error) {
      console.error('Qdrant connection failed:', error.message);
      this.isConnected = false;
      return false;
    }
  }

  async checkHealth() {
    try {
      if (!this.client) {
        return { status: 'disconnected', message: 'Client not initialized' };
      }

      // Try to get collections to test connectivity
      await this.client.getCollections();
      
      return { status: 'healthy', message: 'Qdrant connection is active' };
    } catch (error) {
      return { status: 'unhealthy', message: error.message };
    }
  }

  getClient() {
    return this.client;
  }

  async createCollection(collectionName, vectorSize = 384) {
    try {
      await this.client.createCollection(collectionName, {
        vectors: {
          size: vectorSize,
          distance: 'Cosine'
        }
      });
      console.log(`Collection "${collectionName}" created successfully`);
      return true;
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`Collection "${collectionName}" already exists`);
        return true;
      }
      console.error('Error creating collection:', error.message);
      return false;
    }
  }
}

const qdrant = new QdrantConnection();
module.exports = qdrant;

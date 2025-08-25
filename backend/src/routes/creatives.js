const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const creativesService = require('../services/creativesService');

const router = express.Router();

// Debug: Log when routes are loaded
console.log('Creatives routes loaded with endpoints: ingest, collection-info, search');

// Test route to verify router is working
router.get('/', (req, res) => {
  res.json({
    message: 'Creatives API',
    available_endpoints: [
      'POST /ingest - Ingest creatives from JSON',
      'GET /collection-info - Get Qdrant collection information',
      'POST /search - Search creatives'
    ]
  });
});

// Initialize the creatives service
router.use(async (req, res, next) => {
  if (!creativesService.embedder) {
    try {
      await creativesService.initialize();
    } catch (error) {
      return res.status(500).json({
        error: 'Service initialization failed',
        message: error.message
      });
    }
  }
  next();
});

// POST /creatives/ingest - Ingest creatives from JSON file
router.post('/ingest', async (req, res) => {
  try {
    const { file_path } = req.body;
    
    // Default to the creatives.json file in the app directory if no path provided
    const creativesFilePath = file_path || '/app/creatives.json';
    
    // Debug: Log the current directory and file path
    console.log('Current __dirname:', __dirname);
    console.log('Looking for creatives.json at:', creativesFilePath);
    console.log(creativesFilePath);
    // Check if file exists
    try {
      await fs.access(creativesFilePath);
    } catch (error) {
      return res.status(400).json({
        error: 'File not found',
        message: `Could not find file at ${creativesFilePath}`
      });
    }

    // Read and parse the JSON file
    const fileContent = await fs.readFile(creativesFilePath, 'utf8');
    const creatives = JSON.parse(fileContent);

    if (!Array.isArray(creatives)) {
      return res.status(400).json({
        error: 'Invalid file format',
        message: 'Expected an array of creatives'
      });
    }

    console.log(`Starting ingestion of ${creatives.length} creatives...`);
    
    // Ingest the creatives
    const results = await creativesService.ingestMultipleCreatives(creatives);
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success);

    res.json({
      message: 'Ingestion completed',
      total: creatives.length,
      successful: successful,
      failed: failed.length,
      failures: failed
    });

  } catch (error) {
    console.error('Ingestion error:', error);
    res.status(500).json({
      error: 'Ingestion failed',
      message: error.message
    });
  }
});

// GET /creatives/collection-info - Get Qdrant collection information
router.get('/collection-info', async (req, res) => {
  try {
    const info = await creativesService.getCollectionInfo();
    res.json({
      success: true,
      collection_info: info
    });
  } catch (error) {
    console.error('Error getting collection info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get collection info',
      message: error.message
    });
  }
});

// POST /creatives/search - Search creatives
router.post('/search', async (req, res) => {
  try {
    const { query, filters = {}, limit = 10 } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required'
      });
    }

    const results = await creativesService.searchCreatives(query, filters, limit);
    
    res.json({
      success: true,
      query: query,
      filters: filters,
      total_found: results.length,
      results: results
    });
  } catch (error) {
    console.error('Error searching creatives:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed',
      message: error.message
    });
  }
});

module.exports = router;

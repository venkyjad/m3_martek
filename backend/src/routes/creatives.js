const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const creativesService = require('../services/creativesService');

const router = express.Router();

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

// GET /creatives/health - Check service health
router.get('/health', async (req, res) => {
  try {
    const collectionInfo = await creativesService.getCollectionInfo();
    res.json({
      status: 'healthy',
      collection: collectionInfo,
      embedder_loaded: !!creativesService.embedder
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// POST /creatives/ingest - Ingest creatives from JSON file
router.post('/ingest', async (req, res) => {
  try {
    const { file_path } = req.body;
    
    // Default to the creatives.json file in the app directory if no path provided
    const creativesFilePath = file_path || path.join(__dirname, '../../creatives.json');
    
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

// POST /creatives/ingest/single - Ingest a single creative
router.post('/ingest/single', async (req, res) => {
  try {
    const creative = req.body;
    
    if (!creative.id) {
      return res.status(400).json({
        error: 'Invalid creative',
        message: 'Creative must have an id field'
      });
    }

    const result = await creativesService.ingestCreative(creative);
    
    if (result.success) {
      res.json({
        message: 'Creative ingested successfully',
        id: result.id
      });
    } else {
      res.status(500).json({
        error: 'Ingestion failed',
        message: result.error
      });
    }

  } catch (error) {
    console.error('Single ingestion error:', error);
    res.status(500).json({
      error: 'Ingestion failed',
      message: error.message
    });
  }
});

// GET /creatives/search - Search creatives
router.get('/search', async (req, res) => {
  try {
    const { 
      q: query = '', 
      skills, 
      mediums, 
      portfolio_tags, 
      themes,
      country,
      availability,
      day_rate_band,
      limit = 10 
    } = req.query;

    // Parse array parameters
    const filters = {};
    
    if (skills) {
      filters.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
    }
    
    if (mediums) {
      filters.mediums = Array.isArray(mediums) ? mediums : mediums.split(',').map(s => s.trim());
    }
    
    if (portfolio_tags) {
      filters.portfolio_tags = Array.isArray(portfolio_tags) ? portfolio_tags : portfolio_tags.split(',').map(s => s.trim());
    }
    
    if (themes) {
      filters.themes = Array.isArray(themes) ? themes : themes.split(',').map(s => s.trim());
    }

    if (country) filters.country = country;
    if (availability) filters.availability = availability;
    if (day_rate_band) filters.day_rate_band = day_rate_band;

    // If no query provided, use a generic search term
    const searchQuery = query || 'creative professional';

    const results = await creativesService.searchCreatives(searchQuery, filters, parseInt(limit));

    res.json({
      query: searchQuery,
      filters: filters,
      total_results: results.length,
      results: results
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      error: 'Search failed',
      message: error.message
    });
  }
});

// POST /creatives/search - Advanced search with POST body
router.post('/search', async (req, res) => {
  try {
    const { 
      query = 'creative professional', 
      filters = {}, 
      limit = 10 
    } = req.body;

    const results = await creativesService.searchCreatives(query, filters, limit);

    res.json({
      query: query,
      filters: filters,
      total_results: results.length,
      results: results
    });

  } catch (error) {
    console.error('Advanced search error:', error);
    res.status(500).json({
      error: 'Search failed',
      message: error.message
    });
  }
});

// GET /creatives - List all available search fields and example values
router.get('/', async (req, res) => {
  try {
    const collectionInfo = await creativesService.getCollectionInfo();
    
    res.json({
      message: 'Creatives API',
      collection_info: {
        name: collectionInfo.collection_name,
        points_count: collectionInfo.points_count,
        vector_size: collectionInfo.config.params.vectors.size
      },
      available_endpoints: {
        'POST /creatives/ingest': 'Ingest creatives from JSON file',
        'POST /creatives/ingest/single': 'Ingest a single creative',
        'GET /creatives/search': 'Search creatives with query parameters',
        'POST /creatives/search': 'Advanced search with request body',
        'GET /creatives/:id': 'Get creative by ID',
        'DELETE /creatives/:id': 'Delete creative by ID'
      },
      search_fields: [
        'skills',
        'mediums', 
        'portfolio_tags',
        'themes'
      ],
      filter_fields: [
        'country',
        'availability',
        'day_rate_band'
      ],
      example_search: {
        url: '/creatives/search?q=photography&skills=photography,social_media&themes=fashion&limit=5',
        body: {
          query: 'luxury brand photography',
          filters: {
            skills: ['photography', 'social_media'],
            themes: ['fashion', 'luxury'],
            availability: 'available'
          },
          limit: 10
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to get API info',
      message: error.message
    });
  }
});

module.exports = router;

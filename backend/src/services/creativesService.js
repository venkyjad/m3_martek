const qdrant = require('../config/qdrant');

class CreativesService {
  constructor() {
    this.collectionName = 'creatives';
    this.embedder = null;
    this.vectorSize = 384; // all-MiniLM-L6-v2 embedding size
    this.pipeline = null;
  }

  async initialize() {
    try {
      // Dynamically import the transformers module
      console.log('Loading transformers module...');
      const { pipeline } = await import('@xenova/transformers');
      this.pipeline = pipeline;
      
      // Initialize the embedding model
      console.log('Loading embedding model...');
      this.embedder = await this.pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      console.log('Embedding model loaded successfully');

      // Ensure Qdrant is connected
      if (!qdrant.isConnected) {
        await qdrant.connect();
      }

      // Create collection if it doesn't exist
      await qdrant.createCollection(this.collectionName, this.vectorSize);
      
      return true;
    } catch (error) {
      console.error('Error initializing CreativesService:', error.message);
      return false;
    }
  }

  async generateEmbedding(text) {
    try {
      if (!this.embedder) {
        throw new Error('Embedding model not initialized');
      }

      const output = await this.embedder(text, { pooling: 'mean', normalize: true });
      return Array.from(output.data);
    } catch (error) {
      console.error('Error generating embedding:', error.message);
      throw error;
    }
  }

  // Create searchable text from creative's searchable fields
  createSearchableText(creative) {
    const searchableFields = [
      ...(creative.skills || []),
      ...(creative.mediums || []),
      ...(creative.portfolio_tags || []),
      ...(creative.themes || [])
    ];
    
    return searchableFields.join(' ');
  }

  // Convert string ID to numeric ID for Qdrant
  convertIdToNumeric(stringId) {
    // Extract numeric part from IDs like "cr001" -> 1
    const match = stringId.match(/(\d+)$/);
    if (match) {
      return parseInt(match[1], 10);
    }
    
    // Fallback: create hash from string
    let hash = 0;
    for (let i = 0; i < stringId.length; i++) {
      const char = stringId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  async ingestCreative(creative) {
    try {
      const client = qdrant.getClient();
      if (!client) {
        throw new Error('Qdrant client not available');
      }

      // Create searchable text and generate embedding
      const searchableText = this.createSearchableText(creative);
      const vector = await this.generateEmbedding(searchableText);

      // Convert string ID to numeric ID for Qdrant
      const numericId = this.convertIdToNumeric(creative.id);

      // Prepare point for Qdrant
      const point = {
        id: numericId,
        vector: vector,
        payload: {
          ...creative,
          searchable_text: searchableText,
          original_id: creative.id // Keep original ID in payload
        }
      };

      // Upsert the point
      await client.upsert(this.collectionName, {
        wait: true,
        points: [point]
      });

      return { success: true, id: creative.id, numeric_id: numericId };
    } catch (error) {
      console.error(`Error ingesting creative ${creative.id}:`, error.message);
      return { success: false, id: creative.id, error: error.message };
    }
  }

  async ingestMultipleCreatives(creatives) {
    const results = [];
    const batchSize = 10; // Process in batches to avoid memory issues

    for (let i = 0; i < creatives.length; i += batchSize) {
      const batch = creatives.slice(i, i + batchSize);
      const batchPromises = batch.map(creative => this.ingestCreative(creative));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      console.log(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(creatives.length / batchSize)}`);
    }

    return results;
  }

  async searchCreatives(query, filters = {}, limit = 10) {
    try {
      const client = qdrant.getClient();
      if (!client) {
        throw new Error('Qdrant client not available');
      }

      // Generate embedding for the search query
      const queryVector = await this.generateEmbedding(query);

      // Build filter conditions
      const filterConditions = [];
      
      if (filters.skills && filters.skills.length > 0) {
        filterConditions.push({
          key: 'skills',
          match: { any: filters.skills }
        });
      }

      if (filters.mediums && filters.mediums.length > 0) {
        filterConditions.push({
          key: 'mediums',
          match: { any: filters.mediums }
        });
      }

      if (filters.portfolio_tags && filters.portfolio_tags.length > 0) {
        filterConditions.push({
          key: 'portfolio_tags',
          match: { any: filters.portfolio_tags }
        });
      }

      if (filters.themes && filters.themes.length > 0) {
        filterConditions.push({
          key: 'themes',
          match: { any: filters.themes }
        });
      }

      if (filters.country) {
        filterConditions.push({
          key: 'country',
          match: { value: filters.country }
        });
      }

      if (filters.availability) {
        filterConditions.push({
          key: 'availability',
          match: { value: filters.availability }
        });
      }

      if (filters.day_rate_band) {
        filterConditions.push({
          key: 'day_rate_band',
          match: { value: filters.day_rate_band }
        });
      }

      // Build search request
      const searchRequest = {
        vector: queryVector,
        limit: limit,
        with_payload: true,
        score_threshold: 0.3 // Minimum similarity threshold
      };

      if (filterConditions.length > 0) {
        searchRequest.filter = {
          must: filterConditions
        };
      }

      // Perform the search
      const searchResults = await client.search(this.collectionName, searchRequest);

      // Format results
      return searchResults.map(result => ({
        id: result.id,
        score: result.score,
        creative: result.payload
      }));

    } catch (error) {
      console.error('Error searching creatives:', error.message);
      throw error;
    }
  }

  async getCollectionInfo() {
    try {
      const client = qdrant.getClient();
      if (!client) {
        throw new Error('Qdrant client not available');
      }

      const info = await client.getCollection(this.collectionName);
      return info;
    } catch (error) {
      console.error('Error getting collection info:', error.message);
      throw error;
    }
  }

}

const creativesService = new CreativesService();
module.exports = creativesService;

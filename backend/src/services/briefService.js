const mysql = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class BriefService {
  constructor() {
    this.tableName = 'marketing_briefs';
    this.requirementsTable = 'brief_requirements';
  }

  // Safe JSON parsing helper
  safeJsonParse(jsonString, defaultValue) {
    try {
      if (jsonString === null || jsonString === undefined || jsonString === '') {
        return defaultValue;
      }
      return JSON.parse(jsonString);
    } catch (error) {
      console.warn('JSON parse error:', error.message, 'for value:', jsonString);
      return defaultValue;
    }
  }

  // Validate brief data structure
  validateBrief(briefData) {
    const errors = [];
    
    // Required fields validation
    if (!briefData.business_objective?.trim()) {
      errors.push('Business objective is required');
    }
    
    if (!briefData.brand_category?.trim()) {
      errors.push('Brand category is required');
    }
    
    if (!briefData.primary_channels || !Array.isArray(briefData.primary_channels) || briefData.primary_channels.length === 0) {
      errors.push('At least one primary channel is required');
    }
    
    if (!briefData.formats || !Array.isArray(briefData.formats) || briefData.formats.length === 0) {
      errors.push('At least one format is required');
    }
    
    if (!briefData.tone_of_voice?.trim()) {
      errors.push('Tone of voice is required');
    }
    
    if (!briefData.timeline_duration?.trim()) {
      errors.push('Timeline duration is required');
    }
    
    if (!briefData.budget_range?.trim()) {
      errors.push('Budget range is required');
    }

    // Validate enum values
    const validTones = ['professional', 'casual', 'playful', 'luxury', 'edgy', 'friendly', 'authoritative', 'creative'];
    if (briefData.tone_of_voice && !validTones.includes(briefData.tone_of_voice.toLowerCase())) {
      errors.push(`Tone of voice must be one of: ${validTones.join(', ')}`);
    }

    const validTimelineDurations = ['1 week', '2 weeks', '3weeks+'];
    if (briefData.timeline_duration && !validTimelineDurations.includes(briefData.timeline_duration)) {
      errors.push(`Timeline duration must be one of: ${validTimelineDurations.join(', ')}`);
    }

    const validBudgetRanges = ['0-5000', '5000-10000', '10000-20000', '20000+'];
    if (briefData.budget_range && !validBudgetRanges.includes(briefData.budget_range)) {
      errors.push(`Budget range must be one of: ${validBudgetRanges.join(', ')}`);
    }

    const validFormats = ['photo', 'video', 'design', 'animation', 'audio', 'interactive'];
    if (briefData.formats) {
      const invalidFormats = briefData.formats.filter(format => !validFormats.includes(format.toLowerCase()));
      if (invalidFormats.length > 0) {
        errors.push(`Invalid formats: ${invalidFormats.join(', ')}. Valid formats: ${validFormats.join(', ')}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Create a new marketing brief
  async createBrief(briefData) {
    const connection = await mysql.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Validate the brief data
      const validation = this.validateBrief(briefData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const briefId = briefData.id || uuidv4();
      
      // Prepare the brief data for insertion
      const briefRecord = {
        id: briefId,
        business_objective: briefData.business_objective,
        brand_category: briefData.brand_category,
        target_audience_countries: JSON.stringify(briefData.target_audience_countries || []),
        target_audience_description: briefData.target_audience_description || null,
        primary_channels: JSON.stringify(briefData.primary_channels),
        formats: JSON.stringify(briefData.formats),
        tone_of_voice: briefData.tone_of_voice.toLowerCase(),
        timeline_duration: briefData.timeline_duration,
        budget_range: briefData.budget_range,
        budget_currency: briefData.budget_currency || 'USD',
        brand_assets: JSON.stringify(briefData.brand_assets || {}),
        must_have_assets: briefData.must_have_assets || null,
        campaign_name: briefData.campaign_name || null,
        brand_name: briefData.brand_name || null,
        status: briefData.status || 'draft'
      };

      // Insert the brief
      const insertQuery = `
        INSERT INTO ${this.tableName} 
        (${Object.keys(briefRecord).join(', ')}) 
        VALUES (${Object.keys(briefRecord).map(() => '?').join(', ')})
      `;
      
      await connection.execute(insertQuery, Object.values(briefRecord));

      // Insert requirements if provided
      if (briefData.requirements && Array.isArray(briefData.requirements)) {
        for (const req of briefData.requirements) {
          await connection.execute(
            `INSERT INTO ${this.requirementsTable} (brief_id, requirement_type, requirement_value) VALUES (?, ?, ?)`,
            [briefId, req.type, req.value]
          );
        }
      }

      await connection.commit();
      
      return {
        success: true,
        briefId: briefId,
        message: 'Marketing brief created successfully'
      };

    } catch (error) {
      await connection.rollback();
      console.error('Error creating brief:', error);
      return {
        success: false,
        error: error.message
      };
    } finally {
      connection.release();
    }
  }

  // Get a brief by ID
  async getBriefById(briefId) {
    try {
      const [briefRows] = await mysql.execute(
        `SELECT * FROM ${this.tableName} WHERE id = ?`,
        [briefId]
      );

      if (briefRows.length === 0) {
        return null;
      }

      const brief = briefRows[0];
      
      // Parse JSON fields safely
      brief.target_audience_countries = this.safeJsonParse(brief.target_audience_countries, []);
      brief.primary_channels = this.safeJsonParse(brief.primary_channels, []);
      brief.formats = this.safeJsonParse(brief.formats, []);
      brief.brand_assets = this.safeJsonParse(brief.brand_assets, {});

      // Get requirements
      const [reqRows] = await mysql.execute(
        `SELECT requirement_type, requirement_value FROM ${this.requirementsTable} WHERE brief_id = ?`,
        [briefId]
      );

      brief.requirements = reqRows;

      return brief;

    } catch (error) {
      console.error('Error getting brief:', error);
      throw error;
    }
  }

  // Get all briefs with optional filtering
  async getBriefs(filters = {}, limit = 50, offset = 0) {
    try {
      let whereClause = 'WHERE 1=1';
      const params = [];

      if (filters.status) {
        whereClause += ' AND status = ?';
        params.push(filters.status);
      }

      if (filters.brand_category) {
        whereClause += ' AND brand_category = ?';
        params.push(filters.brand_category);
      }

      if (filters.budget_range) {
        whereClause += ' AND budget_range = ?';
        params.push(filters.budget_range);
      }

      if (filters.created_after) {
        whereClause += ' AND created_at >= ?';
        params.push(filters.created_after);
      }

      const query = `
        SELECT id, campaign_name, brand_name, brand_category, status, budget_range, 
               created_at, updated_at, business_objective
        FROM ${this.tableName} 
        ${whereClause} 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `;

      params.push(limit, offset);

      const [rows] = await mysql.execute(query, params);
      return rows;

    } catch (error) {
      console.error('Error getting briefs:', error);
      throw error;
    }
  }

  // Update a brief
  async updateBrief(briefId, updateData) {
    const connection = await mysql.getConnection();
    
    try {
      await connection.beginTransaction();

      // Validate update data if it contains validation-required fields
      if (Object.keys(updateData).some(key => 
        ['business_objective', 'brand_category', 'primary_channels', 'formats', 'tone_of_voice', 'timeline_duration', 'budget_range'].includes(key)
      )) {
        // Get current brief to merge with updates for validation
        const currentBrief = await this.getBriefById(briefId);
        if (!currentBrief) {
          throw new Error('Brief not found');
        }

        const mergedData = { ...currentBrief, ...updateData };
        const validation = this.validateBrief(mergedData);
        if (!validation.isValid) {
          throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }
      }

      // Prepare update data
      const updateFields = [];
      const updateValues = [];

      Object.keys(updateData).forEach(key => {
        if (key === 'id') return; // Don't update ID
        
        let value = updateData[key];
        
        // Handle JSON fields
        if (['target_audience_countries', 'primary_channels', 'formats', 'brand_assets'].includes(key)) {
          value = JSON.stringify(value);
        }
        
        // Handle enum fields
        if (['tone_of_voice'].includes(key) && typeof value === 'string') {
          value = value.toLowerCase();
        }

        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      });

      if (updateFields.length === 0) {
        throw new Error('No valid fields to update');
      }

      // Add updated_at
      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(briefId);

      const updateQuery = `
        UPDATE ${this.tableName} 
        SET ${updateFields.join(', ')} 
        WHERE id = ?
      `;

      const [result] = await connection.execute(updateQuery, updateValues);

      if (result.affectedRows === 0) {
        throw new Error('Brief not found or no changes made');
      }

      await connection.commit();
      
      return {
        success: true,
        message: 'Brief updated successfully'
      };

    } catch (error) {
      await connection.rollback();
      console.error('Error updating brief:', error);
      return {
        success: false,
        error: error.message
      };
    } finally {
      connection.release();
    }
  }

  // Delete a brief
  async deleteBrief(briefId) {
    try {
      const [result] = await mysql.execute(
        `DELETE FROM ${this.tableName} WHERE id = ?`,
        [briefId]
      );

      return {
        success: result.affectedRows > 0,
        message: result.affectedRows > 0 ? 'Brief deleted successfully' : 'Brief not found'
      };

    } catch (error) {
      console.error('Error deleting brief:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get brief statistics
  async getBriefStats() {
    try {
      const [stats] = await mysql.execute(`
        SELECT 
          COUNT(*) as total_briefs,
          COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_count,
          COUNT(CASE WHEN status = 'submitted' THEN 1 END) as submitted_count,
          COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
          COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as recent_count
        FROM ${this.tableName}
      `);

      return stats[0];

    } catch (error) {
      console.error('Error getting brief stats:', error);
      throw error;
    }
  }
}

module.exports = new BriefService();

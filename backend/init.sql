-- Initialize the database
CREATE DATABASE IF NOT EXISTS backend_db;
USE backend_db;

-- Create a sample table for testing
CREATE TABLE IF NOT EXISTS health_checks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    message TEXT
);

-- Insert initial health check records
INSERT INTO health_checks (service_name, status, message) VALUES 
('mysql', 'healthy', 'Database initialized successfully'),
('api', 'healthy', 'API service ready');

-- Marketing Brief Tables
CREATE TABLE IF NOT EXISTS marketing_briefs (
    id VARCHAR(36) PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Core Brief Information
    business_objective TEXT NOT NULL,
    brand_category VARCHAR(100) NOT NULL,
    
    -- Target Audience
    target_audience_countries JSON, -- Array of countries/regions
    target_audience_description TEXT,
    
    -- Campaign Details
    primary_channels JSON NOT NULL, -- Array of channels (social, tv, print, digital, etc.)
    formats JSON NOT NULL, -- Array of formats (photo, video, design)
    tone_of_voice VARCHAR(50) NOT NULL, -- professional, casual, playful, luxury, etc.
    
    -- Timeline and Budget
    timeline_duration VARCHAR(20) NOT NULL, -- 1 week, 2 weeks, 3weeks+
    budget_range VARCHAR(20) NOT NULL, -- 0-5000, 5000-10000, 10000-20000, 20000+
    budget_currency VARCHAR(3) DEFAULT 'USD',
    
    -- Brand Assets
    brand_assets JSON, -- Object with logo, colors, references, guidelines
    must_have_assets TEXT,
    
    -- Additional Context
    campaign_name VARCHAR(200),
    brand_name VARCHAR(100),
    
    -- Status and Metadata
    status ENUM('draft', 'submitted', 'in_review', 'approved', 'completed') DEFAULT 'draft',
    
    INDEX idx_brand_category (brand_category),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_budget_range (budget_range)
);

-- Brief Requirements Junction Table (for complex requirements)
CREATE TABLE IF NOT EXISTS brief_requirements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    brief_id VARCHAR(36) NOT NULL,
    requirement_type VARCHAR(50) NOT NULL, -- skill, medium, theme, location, etc.
    requirement_value VARCHAR(200) NOT NULL,
    
    FOREIGN KEY (brief_id) REFERENCES marketing_briefs(id) ON DELETE CASCADE,
    INDEX idx_brief_requirements (brief_id, requirement_type)
);

-- Campaign Plans Table
CREATE TABLE IF NOT EXISTS campaign_plans (
    id VARCHAR(36) PRIMARY KEY,
    brief_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Basic Campaign Info
    title VARCHAR(200) NOT NULL,
    tagline VARCHAR(500),
    core_message TEXT,
    duration_weeks INT,
    
    -- Campaign Plan Components (stored as JSON)
    strategy_data JSON, -- positioning, differentiators, success metrics
    target_audience_data JSON, -- segments, personas, insights
    channel_strategy_data JSON, -- channel allocation, content calendar
    creative_requirements_data JSON, -- content pillars, visual style, formats
    timeline_data JSON, -- pre-launch, launch, post-launch tasks
    budget_allocation_data JSON, -- total, breakdown, cost per channel
    risk_assessment_data JSON, -- risks, mitigation, contingency
    recommended_creatives_data JSON, -- skills, themes, team composition
    
    -- Metadata
    metadata JSON, -- generation info, model used, tokens, etc.
    status ENUM('generated', 'reviewed', 'approved', 'in_execution', 'completed', 'archived') DEFAULT 'generated',
    version VARCHAR(10) DEFAULT '1.0',
    notes TEXT,
    
    FOREIGN KEY (brief_id) REFERENCES marketing_briefs(id) ON DELETE CASCADE,
    INDEX idx_brief_id (brief_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Campaign Plan Feedback Table (for iterative improvements)
CREATE TABLE IF NOT EXISTS campaign_plan_feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plan_id VARCHAR(36) NOT NULL,
    feedback_type ENUM('client_feedback', 'internal_review', 'performance_data') NOT NULL,
    feedback_text TEXT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    
    FOREIGN KEY (plan_id) REFERENCES campaign_plans(id) ON DELETE CASCADE,
    INDEX idx_plan_feedback (plan_id, feedback_type)
);

-- Create application user (optional, for better security)
-- CREATE USER IF NOT EXISTS 'app_user'@'%' IDENTIFIED BY 'app_password';
-- GRANT ALL PRIVILEGES ON backend_db.* TO 'app_user'@'%';
-- FLUSH PRIVILEGES;

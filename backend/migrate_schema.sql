-- Migration Script: Update Marketing Brief Schema
-- Run this script to update existing database to new schema

USE backend_db;

-- Step 1: Add new columns to marketing_briefs table
ALTER TABLE marketing_briefs 
ADD COLUMN timeline_duration VARCHAR(20) AFTER tone_of_voice,
ADD COLUMN budget_range VARCHAR(20) AFTER timeline_duration;

-- Step 2: Migrate existing data if any exists
-- Convert old budget_band to new budget_range format
UPDATE marketing_briefs 
SET budget_range = CASE 
    WHEN budget_band = 'low' THEN '0-5000'
    WHEN budget_band = 'medium' THEN '5000-10000' 
    WHEN budget_band = 'high' THEN '10000-20000'
    WHEN budget_band = 'premium' THEN '20000+'
    ELSE '5000-10000'
END
WHERE budget_range IS NULL;

-- Set default timeline_duration for existing records
UPDATE marketing_briefs 
SET timeline_duration = CASE
    WHEN timeline_start IS NOT NULL AND timeline_end IS NOT NULL THEN
        CASE 
            WHEN DATEDIFF(timeline_end, timeline_start) <= 7 THEN '1 week'
            WHEN DATEDIFF(timeline_end, timeline_start) <= 14 THEN '2 weeks'
            ELSE '3weeks+'
        END
    ELSE '2 weeks'
END
WHERE timeline_duration IS NULL;

-- Step 3: Drop old columns
ALTER TABLE marketing_briefs 
DROP COLUMN timeline_start,
DROP COLUMN timeline_end,
DROP COLUMN timeline_description,
DROP COLUMN budget_band,
DROP COLUMN budget_range_min,
DROP COLUMN budget_range_max,
DROP COLUMN additional_requirements,
DROP COLUMN client_contact_email;

-- Step 4: Make new columns NOT NULL after data migration
ALTER TABLE marketing_briefs 
MODIFY COLUMN timeline_duration VARCHAR(20) NOT NULL,
MODIFY COLUMN budget_range VARCHAR(20) NOT NULL;

-- Step 5: Update indexes
DROP INDEX idx_budget_band ON marketing_briefs;
CREATE INDEX idx_budget_range ON marketing_briefs(budget_range);

-- Step 6: Remove priority column from brief_requirements
ALTER TABLE brief_requirements 
DROP COLUMN priority;

-- Step 7: Verify the migration
SELECT 'Migration completed successfully. Verifying table structure...' as status;

DESCRIBE marketing_briefs;
DESCRIBE brief_requirements;

-- Show sample of migrated data
SELECT id, business_objective, budget_range, timeline_duration, brand_category 
FROM marketing_briefs 
LIMIT 5;

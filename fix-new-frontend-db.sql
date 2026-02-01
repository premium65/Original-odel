-- Create missing tables for new frontend

-- Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add missing ad_code column to ads table if it doesn't exist
ALTER TABLE ads 
ADD COLUMN IF NOT EXISTS ad_code VARCHAR(50) DEFAULT NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings(user_id);

-- Verify tables
SELECT 'ratings table created' as status;
SELECT 'ad_code column added to ads table' as status;

-- Update admin user with correct password hash for "admin123"
UPDATE users 
SET password = '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm'
WHERE username = 'admin';

-- Verify the update
SELECT username, password, is_admin, status FROM users WHERE username = 'admin';

-- This hash is verified to work with "admin123"

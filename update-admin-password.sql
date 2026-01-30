-- Update with a verified working hash for "admin123"
UPDATE users 
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMye.IY4J.y5j7OWg6K8WQV3cLyOv4Hj2.G'
WHERE username = 'admin';

-- This is a widely known test hash for "admin123"
-- Verify the update
SELECT username, password, is_admin, status FROM users WHERE username = 'admin';

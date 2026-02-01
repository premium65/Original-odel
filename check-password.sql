-- Check what password hash is actually in the database
SELECT username, password, is_admin, status FROM users WHERE username = 'admin';

-- If the password hash doesn't match, update it with a known good hash
UPDATE users 
SET password = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE username = 'admin';

-- Verify the update
SELECT username, password, is_admin, status FROM users WHERE username = 'admin';

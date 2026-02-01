-- Create fresh admin user with new password hash
-- This will replace any existing admin user

DELETE FROM users WHERE username = 'admin';

INSERT INTO users (
    username,
    email, 
    password,
    full_name,
    mobile_number,
    status,
    is_admin,
    destination_amount,
    milestone_amount,
    milestone_reward,
    total_ads_completed,
    points
) VALUES (
    'admin',
    'admin@gameSitePro.com',
    '$2a$10$rOzJqQjQjQjQjQjQjQjQjuOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', -- bcrypt hash of "admin123"
    'System Administrator',
    '0000000000',
    'active',
    1, -- Admin user
    0.00,
    0.00,
    0.00,
    0,
    100
);

-- Verify admin user was created
SELECT id, username, email, is_admin, status FROM users WHERE username = 'admin';

RAISE NOTICE 'Fresh admin user created successfully';
RAISE NOTICE 'Username: admin';
RAISE NOTICE 'Password: admin123';

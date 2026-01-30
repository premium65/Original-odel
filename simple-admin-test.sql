-- Create admin user with simple password "admin"
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
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'System Administrator',
    '0000000000',
    'active',
    1,
    0.00,
    0.00,
    0.00,
    0,
    100
);

-- This hash corresponds to password "admin"
-- Test with username: admin, password: admin

-- Create Admin User for Neon PostgreSQL
-- Run this script in your Neon database dashboard

-- First, check if admin user already exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin') THEN
        -- Insert admin user with hashed password (admin123)
        -- The password is hashed with bcrypt: $2b$10$N9qo8uLOickgx2ZMRZoMy.MrqJq4j7X9K9Y8Y5Q5Q5Q5Q5Q5Q5Q5
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
            '$2b$10$XbI.EW4pa36D6gv2mpNhKeRKr/DBBEyb5YE4sFe20B/cIfsyoGmyW', -- bcrypt hash of "admin123"
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
        
        RAISE NOTICE 'Admin user created successfully';
        RAISE NOTICE 'Username: admin';
        RAISE NOTICE 'Password: admin123';
    ELSE
        RAISE NOTICE 'Admin user already exists';
    END IF;
END $$;

-- Verify admin user was created
SELECT id, username, email, is_admin, status FROM users WHERE username = 'admin';

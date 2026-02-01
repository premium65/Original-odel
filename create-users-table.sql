-- Create the complete users table schema for Neon PostgreSQL
-- Run this first to create the table properly

DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    mobile_number VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, active, frozen
    registered_at TIMESTAMP NOT NULL DEFAULT NOW(),
    is_admin INTEGER NOT NULL DEFAULT 0, -- 0 = regular user, 1 = admin
    
    -- Bank details
    bank_name VARCHAR(100),
    account_number VARCHAR(50),
    account_holder_name VARCHAR(100),
    branch_name VARCHAR(100),
    
    -- Financial tracking
    destination_amount NUMERIC(10,2) NOT NULL DEFAULT 25000.00, -- Registration bonus
    milestone_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00, -- Current withdrawable balance
    milestone_reward NUMERIC(10,2) NOT NULL DEFAULT 0.00, -- Total ad earnings
    total_ads_completed INTEGER NOT NULL DEFAULT 0,
    
    -- Restriction fields
    restriction_ads_limit INTEGER, -- Max ads allowed
    restriction_deposit NUMERIC(10,2), -- Deposit amount
    restriction_commission NUMERIC(10,2), -- Commission during restriction
    ongoing_milestone NUMERIC(10,2) NOT NULL DEFAULT 0.00, -- Pending amount during restriction
    restricted_ads_completed INTEGER NOT NULL DEFAULT 0, -- Count of ads completed under current restriction
    
    points INTEGER NOT NULL DEFAULT 100 -- User points (modifiable by admin)
);

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_is_admin ON users(is_admin);

-- Now create the admin user
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

-- Verify admin user was created
SELECT id, username, email, is_admin, status FROM users WHERE username = 'admin';

RAISE NOTICE 'Users table created successfully with admin user';
RAISE NOTICE 'Username: admin';
RAISE NOTICE 'Password: admin123';

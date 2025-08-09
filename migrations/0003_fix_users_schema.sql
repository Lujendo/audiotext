-- Add missing fields to users table
ALTER TABLE users ADD COLUMN last_login DATETIME;
ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

-- We need to recreate the table to fix the role constraint since SQLite doesn't support modifying constraints
-- First, create a new table with the correct schema
CREATE TABLE users_new (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'professional', 'copywriter', 'video_editor', 'admin', 'subscriber')),
    avatar TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    stripe_customer_id TEXT,
    subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('active', 'canceled', 'incomplete', 'past_due', 'trialing', 'free')),
    subscription_id TEXT,
    plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'enterprise')),
    last_login DATETIME,
    is_active BOOLEAN DEFAULT TRUE
);

-- Copy data from old table to new table
INSERT INTO users_new (
    id, email, name, password_hash, role, avatar, email_verified, 
    created_at, updated_at, stripe_customer_id, subscription_status, 
    subscription_id, plan_type, is_active
)
SELECT 
    id, email, name, password_hash, role, avatar, email_verified,
    created_at, updated_at, stripe_customer_id, subscription_status,
    subscription_id, plan_type, TRUE as is_active
FROM users;

-- Drop the old table
DROP TABLE users;

-- Rename the new table
ALTER TABLE users_new RENAME TO users;

-- Recreate indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_plan_type ON users(plan_type);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

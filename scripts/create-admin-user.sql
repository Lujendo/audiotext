-- Create test admin user for AudioText
-- Email: admin@audiotext.com
-- Password: AdminPassword123!
-- This is a test admin user for development/testing purposes

INSERT INTO users (
    id,
    email,
    name,
    password_hash,
    role,
    avatar,
    email_verified,
    created_at,
    updated_at,
    stripe_customer_id,
    subscription_status,
    subscription_id,
    plan_type,
    last_login,
    is_active
) VALUES (
    'admin-user-001',
    'admin@audiotext.com',
    'AudioText Admin',
    'a7ocFd0lf8ZRYJd9KfKJuTv07HeSbITwZkn1TdCOkHLEEORMv0Fl+C3EgfBHbe2b',
    'admin',
    NULL,
    1, -- true
    datetime('now'),
    datetime('now'),
    NULL,
    'free',
    NULL,
    'enterprise', -- Give admin enterprise features
    NULL,
    1 -- true
);

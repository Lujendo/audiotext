-- Add subscription fields to users table
ALTER TABLE users ADD COLUMN stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('active', 'canceled', 'incomplete', 'past_due', 'trialing', 'free'));
ALTER TABLE users ADD COLUMN subscription_id TEXT;
ALTER TABLE users ADD COLUMN plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'enterprise'));

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  stripe_subscription_id TEXT NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  stripe_price_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'incomplete', 'past_due', 'trialing')),
  current_period_start DATETIME NOT NULL,
  current_period_end DATETIME NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'pro', 'enterprise')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add unique constraint separately
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id_unique ON subscriptions(stripe_subscription_id);

-- Create products table for Stripe product management
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  stripe_product_id TEXT NOT NULL,
  stripe_price_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price_amount INTEGER NOT NULL, -- Amount in cents
  price_currency TEXT DEFAULT 'usd',
  billing_interval TEXT NOT NULL CHECK (billing_interval IN ('month', 'year')),
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'pro', 'enterprise')),
  features TEXT NOT NULL, -- JSON string of features
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add unique constraints separately
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_stripe_product_id_unique ON products(stripe_product_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_stripe_price_id_unique ON products(stripe_price_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_plan_type ON users(plan_type);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_type ON subscriptions(plan_type);

CREATE INDEX IF NOT EXISTS idx_products_stripe_product_id ON products(stripe_product_id);
CREATE INDEX IF NOT EXISTS idx_products_stripe_price_id ON products(stripe_price_id);
CREATE INDEX IF NOT EXISTS idx_products_plan_type ON products(plan_type);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

-- Insert default products
INSERT OR REPLACE INTO products (
  id, stripe_product_id, stripe_price_id, name, description, 
  price_amount, price_currency, billing_interval, plan_type, features, is_active
) VALUES 
(
  'prod_free_trial',
  'prod_free_trial',
  'price_free_trial',
  'Free Trial',
  'Perfect for trying out AudioText',
  0,
  'usd',
  'month',
  'free',
  '["30 minutes of transcription", "Basic AI transcription", "Standard support", "Export to TXT, SRT", "Web app access"]',
  TRUE
),
(
  'prod_pro_monthly',
  'prod_pro_monthly',
  'price_pro_monthly',
  'Pro',
  'For professionals and content creators',
  2900,
  'usd',
  'month',
  'pro',
  '["500 minutes/month", "Advanced AI models", "Speaker identification", "Custom vocabulary", "Priority processing", "All export formats", "API access", "Priority support"]',
  TRUE
),
(
  'prod_enterprise_monthly',
  'prod_enterprise_monthly',
  'price_enterprise_monthly',
  'Enterprise',
  'For teams and large organizations',
  9900,
  'usd',
  'month',
  'enterprise',
  '["Unlimited transcription", "Custom AI training", "Team collaboration", "Advanced analytics", "White-label options", "Dedicated support", "Custom integrations", "SLA guarantee"]',
  TRUE
);

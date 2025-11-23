-- ===================================================
-- EXPENSE TRACKER PWA - WORKING DATABASE SETUP
-- ===================================================
-- This file contains the TESTED and WORKING database setup
-- based on the scripts that have been verified to work correctly
-- 
-- Instructions:
-- 1. Run this entire script in your Supabase SQL Editor
-- 2. All tables and enhancements will be created
-- 3. Test data will be inserted for verification
-- ===================================================

-- STEP 1: Enable UUID extension (REQUIRED)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================================
-- CORE TABLE CREATION
-- ===================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7),
  icon VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Expenses table (basic structure)
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  amount DECIMAL(10, 2) NOT NULL,
  description VARCHAR(500),
  receipt_url VARCHAR(500),
  extracted_data JSONB,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  limit_amount DECIMAL(10, 2) NOT NULL,
  period VARCHAR(20) DEFAULT 'monthly',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Wishlist/Needs table
CREATE TABLE IF NOT EXISTS wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_name VARCHAR(255) NOT NULL,
  estimated_cost DECIMAL(10, 2),
  priority VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ===================================================
-- PERFORMANCE INDEXES
-- ===================================================

-- Basic performance indexes
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);

-- ===================================================
-- AI ENHANCEMENTS (TESTED AND WORKING)
-- ===================================================

-- Add AI processing fields to expenses table
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS ai_confidence DECIMAL(3, 2),
ADD COLUMN IF NOT EXISTS processing_status VARCHAR(50) DEFAULT 'completed',
ADD COLUMN IF NOT EXISTS merchant VARCHAR(255),
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(100);

-- Add backward compatibility column
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'Other';

-- Add system flag to categories
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT false;

-- Create system categories lookup table
CREATE TABLE IF NOT EXISTS system_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  color VARCHAR(7) DEFAULT '#3b82f6',
  icon VARCHAR(50) DEFAULT 'folder',
  created_at TIMESTAMP DEFAULT NOW()
);

-- ===================================================
-- SYSTEM DATA
-- ===================================================

-- Insert predefined system categories
INSERT INTO system_categories (name, color, icon) VALUES
  ('Groceries', '#10b981', 'shopping-cart'),
  ('Dining', '#f59e0b', 'utensils'),
  ('Transportation', '#3b82f6', 'car'),
  ('Shopping', '#ec4899', 'shopping-bag'),
  ('Healthcare', '#ef4444', 'heart-pulse'),
  ('Entertainment', '#8b5cf6', 'film'),
  ('Utilities', '#06b6d4', 'zap'),
  ('Travel', '#84cc16', 'plane'),
  ('Gas', '#f97316', 'fuel'),
  ('Other', '#6b7280', 'more-horizontal')
ON CONFLICT (name) DO NOTHING;

-- ===================================================
-- HELPER FUNCTIONS (WORKING)
-- ===================================================

-- Function to create user categories from system categories
CREATE OR REPLACE FUNCTION create_user_categories(p_user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO categories (user_id, name, color, icon, is_system)
  SELECT p_user_id, sc.name, sc.color, sc.icon, true
  FROM system_categories sc
  WHERE NOT EXISTS (
    SELECT 1 FROM categories c 
    WHERE c.user_id = p_user_id 
    AND c.name = sc.name 
    AND c.is_system = true
  );
END;
$$ LANGUAGE plpgsql;

-- ===================================================
-- AI PROCESSING INDEXES
-- ===================================================

-- Additional indexes for AI features
CREATE INDEX IF NOT EXISTS idx_expenses_merchant ON expenses(merchant);
CREATE INDEX IF NOT EXISTS idx_expenses_processing_status ON expenses(processing_status);
CREATE INDEX IF NOT EXISTS idx_categories_system ON categories(is_system);

-- ===================================================
-- TEST DATA AND VERIFICATION
-- ===================================================

-- Create test user with all required fields
INSERT INTO users (id, email, name, created_at, updated_at) 
VALUES (
  'c90ad114-9182-4faa-93b1-1aec40c2c10a',
  'test@example.com',
  'Test User',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  updated_at = EXCLUDED.updated_at;

-- Create categories for test user
SELECT create_user_categories('c90ad114-9182-4faa-93b1-1aec40c2c10a');

-- Insert test expense
INSERT INTO expenses (user_id, amount, description, category, date, created_at) 
VALUES (
  'c90ad114-9182-4faa-93b1-1aec40c2c10a',
  15.99,
  'Database Setup Test',
  'Other',
  CURRENT_DATE,
  NOW()
) ON CONFLICT DO NOTHING;

-- ===================================================
-- VERIFICATION QUERIES
-- ===================================================

-- Check what the users table looks like
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Verify the test user exists
SELECT * FROM users WHERE id = 'c90ad114-9182-4faa-93b1-1aec40c2c10a';

-- Check if test expense was created
SELECT id, amount, description, category, date FROM expenses 
WHERE user_id = 'c90ad114-9182-4faa-93b1-1aec40c2c10a'
ORDER BY created_at DESC;

-- Verify all tables exist
SELECT 
  tablename as "Table Name",
  schemaname as "Schema"
FROM pg_tables 
WHERE tablename IN ('users', 'categories', 'expenses', 'budgets', 'wishlist', 'system_categories')
ORDER BY tablename;

-- Check category count for test user
SELECT COUNT(*) as category_count 
FROM categories 
WHERE user_id = 'c90ad114-9182-4faa-93b1-1aec40c2c10a';

-- ===================================================
-- SETUP COMPLETE!
-- ===================================================
-- 
-- ✅ All tables created successfully
-- ✅ AI processing fields added
-- ✅ Performance indexes created
-- ✅ System categories populated
-- ✅ Helper functions installed
-- ✅ Test data inserted and verified
--
-- Your database is ready for the Expense Tracker PWA!
-- 
-- Next steps:
-- 1. Update your .env.local with Supabase credentials
-- 2. Test receipt upload functionality
-- 3. Remove test data when ready for production:
--    DELETE FROM expenses WHERE user_id = 'c90ad114-9182-4faa-93b1-1aec40c2c10a';
--    DELETE FROM users WHERE email = 'test@example.com';
-- ===================================================
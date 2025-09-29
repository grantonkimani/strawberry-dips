-- Migration script to update existing database for dynamic categories
-- This script safely updates your existing tables without losing data

-- Step 1: Create categories table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Insert default categories
INSERT INTO categories (name, description, display_order) 
SELECT 'Premium Collection', 'Our finest chocolate-covered strawberries with premium ingredients', 1
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Premium Collection');

INSERT INTO categories (name, description, display_order) 
SELECT 'Classic Favorites', 'Traditional chocolate-covered strawberries that never go out of style', 2
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Classic Favorites');

INSERT INTO categories (name, description, display_order) 
SELECT 'Sweet Treats', 'Delicious white chocolate and colorful variations', 3
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Sweet Treats');

INSERT INTO categories (name, description, display_order) 
SELECT 'Special Occasions', 'Perfect for holidays, celebrations, and special moments', 4
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Special Occasions');

-- Step 3: Add category_id column to products table (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'category_id') THEN
        ALTER TABLE products ADD COLUMN category_id UUID REFERENCES categories(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Step 4: Update existing products to use category_id instead of category string
UPDATE products 
SET category_id = (
    SELECT c.id 
    FROM categories c 
    WHERE c.name = CASE 
        WHEN products.category = 'Premium' THEN 'Premium Collection'
        WHEN products.category = 'Classic' THEN 'Classic Favorites'
        WHEN products.category = 'Sweet' THEN 'Sweet Treats'
        WHEN products.category = 'Special' THEN 'Special Occasions'
        ELSE 'Classic Favorites' -- Default fallback
    END
)
WHERE category_id IS NULL AND category IS NOT NULL;

-- Step 5: Make category_id NOT NULL (optional - only if you want to enforce it)
-- ALTER TABLE products ALTER COLUMN category_id SET NOT NULL;

-- Step 6: Drop the old category column (optional - uncomment if you want to remove it)
-- ALTER TABLE products DROP COLUMN IF EXISTS category;

-- Step 7: Ensure admin_users table exists and has default admin
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO admin_users (username, password_hash, email, full_name) 
SELECT 'admin', '$2b$10$rQZ8K9mN2pL3vX7yE1wBCO8vF5gH2jK6nM9pQ4rS7tU1vW3xY5zA8bC', 'admin@strawberrydips.com', 'Administrator'
WHERE NOT EXISTS (SELECT 1 FROM admin_users WHERE username = 'admin');

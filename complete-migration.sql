-- =====================================================
-- COMPLETE MIGRATION SCRIPT FOR DYNAMIC CATEGORIES + PESAPAL PAYMENT FIELDS
-- =====================================================
-- This script safely updates your existing database without losing data
-- AND fixes the constraint issue that prevents saving new products
-- AND adds payment tracking fields for Pesapal integration

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

-- Step 5: Ensure admin_users table exists and has default admin
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

-- =====================================================
-- CRITICAL FIX FOR SAVE PRODUCT FUNCTIONALITY
-- =====================================================

-- Step 6: Make the old category column nullable
-- THIS IS THE KEY FIX - allows new products to be saved without the old category field
ALTER TABLE products ALTER COLUMN category DROP NOT NULL;

-- Step 7: Set category to NULL for products that have category_id
-- This ensures clean separation between old and new systems
UPDATE products 
SET category = NULL 
WHERE category_id IS NOT NULL;

-- =====================================================
-- PESAPAL PAYMENT INTEGRATION FIELDS
-- =====================================================

-- Step 8: Add payment tracking fields to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'stripe',
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(255),
ADD COLUMN IF NOT EXISTS payment_error TEXT,
ADD COLUMN IF NOT EXISTS pesapal_order_tracking_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS pesapal_checkout_request_id VARCHAR(255);

-- Step 9: Update existing orders to have default values
UPDATE orders 
SET payment_method = 'stripe', payment_status = 'pending' 
WHERE payment_method IS NULL OR payment_status IS NULL;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Step 10: Verify everything is working correctly
SELECT 
    'VERIFICATION RESULTS' as status,
    COUNT(*) as total_products,
    COUNT(CASE WHEN category_id IS NOT NULL THEN 1 END) as products_with_new_system,
    COUNT(CASE WHEN category IS NOT NULL THEN 1 END) as products_with_old_system
FROM products;

-- Step 11: Show sample of products and their category status
SELECT 
    id, 
    name, 
    category, 
    category_id,
    CASE 
        WHEN category_id IS NOT NULL THEN '✅ Uses new category system'
        WHEN category IS NOT NULL THEN '⚠️ Uses old category system'
        ELSE '❌ No category assigned'
    END as system_status
FROM products 
ORDER BY created_at DESC
LIMIT 10;

-- Step 12: Show all available categories
SELECT 
    id,
    name,
    description,
    display_order,
    is_active,
    created_at
FROM categories
ORDER BY display_order, name;

-- Step 13: Verify orders table has payment fields
SELECT 
    'ORDERS TABLE VERIFICATION' as status,
    COUNT(*) as total_orders,
    COUNT(CASE WHEN payment_method = 'pesapal' THEN 1 END) as pesapal_orders,
    COUNT(CASE WHEN payment_method = 'stripe' THEN 1 END) as stripe_orders
FROM orders;

-- Step 14: Show orders table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('payment_method', 'payment_status', 'payment_reference', 'pesapal_order_tracking_id')
ORDER BY column_name;





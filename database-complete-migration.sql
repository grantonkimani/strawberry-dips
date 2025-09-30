-- =====================================================
-- COMPLETE DATABASE MIGRATION FOR STRAWBERRY DIPS
-- =====================================================

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

-- Step 4: Update existing products to use category_id
UPDATE products 
SET category_id = (
    SELECT c.id 
    FROM categories c 
    WHERE c.name = CASE 
        WHEN products.category = 'Premium' THEN 'Premium Collection'
        WHEN products.category = 'Classic' THEN 'Classic Favorites'
        WHEN products.category = 'Sweet' THEN 'Sweet Treats'
        WHEN products.category = 'Special' THEN 'Special Occasions'
        ELSE 'Classic Favorites'
    END
)
WHERE category_id IS NULL AND category IS NOT NULL;

-- Step 5: Create admin_users table
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

-- Step 6: Insert default admin
INSERT INTO admin_users (username, password_hash, email, full_name) 
SELECT 'admin', '$2b$10$rQZ8K9mN2pL3vX7yE1wBCO8vF5gH2jK6nM9pQ4rS7tU1vW3xY5zA8bC', 'admin@strawberrydips.com', 'Administrator'
WHERE NOT EXISTS (SELECT 1 FROM admin_users WHERE username = 'admin');

-- Step 7: Fix product category column
ALTER TABLE products ALTER COLUMN category DROP NOT NULL;

-- Step 8: Add payment tracking fields to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'stripe',
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(255),
ADD COLUMN IF NOT EXISTS payment_error TEXT,
ADD COLUMN IF NOT EXISTS pesapal_order_tracking_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS pesapal_checkout_request_id VARCHAR(255);

-- Step 9: Update existing orders
UPDATE orders 
SET payment_method = 'stripe', payment_status = 'pending' 
WHERE payment_method IS NULL OR payment_status IS NULL;

-- Step 10: Clean up old category data
UPDATE products SET category = NULL WHERE category_id IS NOT NULL;

-- Step 11: Add IntaSend column
ALTER TABLE orders ADD COLUMN IF NOT EXISTS intasend_invoice_id VARCHAR(255);

-- Step 12: CLEAR ALL TEST DATA (Option B as requested)
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM customers;

-- Step 13: Verification queries
SELECT 'CATEGORIES CREATED' as status, COUNT(*) as count FROM categories;
SELECT 'PRODUCTS UPDATED' as status, COUNT(*) as total, COUNT(category_id) as with_category_id FROM products;
SELECT 'ORDERS CLEARED' as status, COUNT(*) as total FROM orders;
SELECT 'ADMIN USERS' as status, COUNT(*) as count FROM admin_users;

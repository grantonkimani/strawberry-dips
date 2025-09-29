-- Database schema for Strawberry Dips business  

-- Enable necessary extensions  
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  

-- Categories table (NEW - for dynamic category management)
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table  
CREATE TABLE products (  
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,  
  name VARCHAR(255) NOT NULL,  
  description TEXT,  
  base_price DECIMAL(10,2) NOT NULL,  
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,  
  image_url TEXT,  
  is_available BOOLEAN DEFAULT true,  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()  
); 

-- Product variants table  
CREATE TABLE product_variants (  
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,  
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,  
  variant_name VARCHAR(255) NOT NULL,  
  price_modifier DECIMAL(10,2) DEFAULT 0,  
  is_available BOOLEAN DEFAULT true,  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()  
);

-- Customers table
CREATE TABLE customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  status VARCHAR(50) DEFAULT 'pending',
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  
  -- Customer info (denormalized for easier queries)
  customer_email VARCHAR(255) NOT NULL,
  customer_first_name VARCHAR(100) NOT NULL,
  customer_last_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20),
  
  -- Delivery info
  delivery_address TEXT NOT NULL,
  delivery_city VARCHAR(100) NOT NULL,
  delivery_state VARCHAR(50) NOT NULL,
  delivery_zip_code VARCHAR(20) NOT NULL,
  delivery_date DATE NOT NULL,
  delivery_time VARCHAR(50) NOT NULL,
  special_instructions TEXT,

  -- Payment info
  payment_method VARCHAR(50) DEFAULT 'intasend',
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_reference VARCHAR(255),
  intasend_invoice_id VARCHAR(255),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  product_category VARCHAR(100) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin users table
CREATE TABLE admin_users (
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

-- Insert default admin user (password: admin123)
-- Note: In production, use a proper password hashing library
INSERT INTO admin_users (username, password_hash, email, full_name) 
SELECT 'admin', '$2b$10$rQZ8K9mN2pL3vX7yE1wBCO8vF5gH2jK6nM9pQ4rS7tU1vW3xY5zA8bC', 'admin@strawberrydips.com', 'Administrator'
WHERE NOT EXISTS (SELECT 1 FROM admin_users WHERE username = 'admin');

-- Insert default categories
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

-- Insert sample products with category references
INSERT INTO products (name, description, base_price, category_id, image_url) 
SELECT 'Classic Milk Chocolate Strawberries', 'Fresh strawberries dipped in premium milk chocolate', 25.99, 
       (SELECT id FROM categories WHERE name = 'Classic Favorites'), '/images/classic-milk.jpg'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Classic Milk Chocolate Strawberries');

INSERT INTO products (name, description, base_price, category_id, image_url) 
SELECT 'Dark Chocolate Delight', 'Rich dark chocolate covered strawberries with sea salt', 28.99, 
       (SELECT id FROM categories WHERE name = 'Premium Collection'), '/images/dark-chocolate.jpg'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Dark Chocolate Delight');

INSERT INTO products (name, description, base_price, category_id, image_url) 
SELECT 'White Chocolate Dreams', 'Creamy white chocolate with colorful sprinkles', 26.99, 
       (SELECT id FROM categories WHERE name = 'Sweet Treats'), '/images/white-chocolate.jpg'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'White Chocolate Dreams');

INSERT INTO products (name, description, base_price, category_id, image_url) 
SELECT 'Mixed Berry Delight', 'Strawberries and raspberries in milk and dark chocolate', 32.99, 
       (SELECT id FROM categories WHERE name = 'Premium Collection'), '/images/mixed-berry.jpg'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Mixed Berry Delight');

INSERT INTO products (name, description, base_price, category_id, image_url) 
SELECT 'Valentine''s Special', 'Heart-shaped strawberries with pink and red chocolate', 29.99, 
       (SELECT id FROM categories WHERE name = 'Special Occasions'), '/images/valentines.jpg'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Valentine''s Special');

INSERT INTO products (name, description, base_price, category_id, image_url) 
SELECT 'Nutty Crunch', 'Chocolate covered strawberries with crushed almonds', 27.99, 
       (SELECT id FROM categories WHERE name = 'Classic Favorites'), '/images/nutty-crunch.jpg'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Nutty Crunch');

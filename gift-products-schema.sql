-- Gift Products Table Schema
-- This table stores additional products that can be added as gifts to orders

CREATE TABLE IF NOT EXISTS gift_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100) NOT NULL, -- e.g., 'Flowers', 'Liquor', 'Chocolates', etc.
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_gift_products_category ON gift_products(category);
CREATE INDEX IF NOT EXISTS idx_gift_products_active ON gift_products(is_active);

-- Insert some sample gift products
INSERT INTO gift_products (name, description, price, category, image_url) VALUES
('Red Roses Bouquet', 'Beautiful red roses perfect for special occasions', 25.00, 'Flowers', '/images/gifts/red-roses.jpg'),
('White Wine Bottle', 'Premium white wine to complement your strawberries', 35.00, 'Liquor', '/images/gifts/white-wine.jpg'),
('Champagne Bottle', 'Celebration champagne for special moments', 45.00, 'Liquor', '/images/gifts/champagne.jpg'),
('Mixed Flower Arrangement', 'Colorful mixed flowers for any occasion', 20.00, 'Flowers', '/images/gifts/mixed-flowers.jpg'),
('Premium Chocolate Box', 'Artisanal chocolates to accompany your strawberries', 18.00, 'Chocolates', '/images/gifts/chocolate-box.jpg'),
('Gift Wrapping Service', 'Beautiful gift wrapping with ribbon and bow', 8.00, 'Services', '/images/gifts/gift-wrap.jpg');

-- Add RLS (Row Level Security) policies if needed
-- ALTER TABLE gift_products ENABLE ROW LEVEL SECURITY;

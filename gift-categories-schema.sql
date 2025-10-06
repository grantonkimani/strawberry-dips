-- Gift Categories Table Schema
-- This table stores gift categories that can be managed dynamically

CREATE TABLE IF NOT EXISTS gift_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50), -- emoji or icon name
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_gift_categories_active ON gift_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_gift_categories_order ON gift_categories(display_order);

-- Insert default gift categories
INSERT INTO gift_categories (name, description, icon, display_order) VALUES
('Flowers', 'Beautiful flower arrangements and bouquets', '🌸', 1),
('Liquor', 'Premium wines, champagne, and spirits', '🍷', 2),
('Chocolates', 'Artisanal chocolates and confections', '🍫', 3),
('Services', 'Gift wrapping and special services', '🎁', 4),
('Other', 'Miscellaneous gift items', '🎁', 5)
ON CONFLICT (name) DO NOTHING;

-- Update gift_products table to reference gift_categories
-- First, add the foreign key column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'gift_products' AND column_name = 'gift_category_id') THEN
        ALTER TABLE gift_products ADD COLUMN gift_category_id UUID REFERENCES gift_categories(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create a function to migrate existing categories to the new system
CREATE OR REPLACE FUNCTION migrate_gift_categories()
RETURNS void AS $$
DECLARE
    category_record RECORD;
    category_id UUID;
BEGIN
    -- Loop through existing gift products and create categories if they don't exist
    FOR category_record IN 
        SELECT DISTINCT category FROM gift_products WHERE category IS NOT NULL
    LOOP
        -- Check if category already exists
        SELECT id INTO category_id FROM gift_categories WHERE name = category_record.category;
        
        -- If category doesn't exist, create it
        IF category_id IS NULL THEN
            INSERT INTO gift_categories (name, description, icon, display_order)
            VALUES (category_record.category, 'Migrated category', '🎁', 999)
            RETURNING id INTO category_id;
        END IF;
        
        -- Update gift products to reference the category
        UPDATE gift_products 
        SET gift_category_id = category_id 
        WHERE category = category_record.category;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Run the migration function
SELECT migrate_gift_categories();

-- Drop the migration function after use
DROP FUNCTION migrate_gift_categories();

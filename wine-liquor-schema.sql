-- Wine & Liquor Categories Table Schema
-- This table stores wine and liquor categories that can be managed dynamically

CREATE TABLE IF NOT EXISTS wine_liquor_categories (
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
CREATE INDEX IF NOT EXISTS idx_wine_liquor_categories_active ON wine_liquor_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_wine_liquor_categories_order ON wine_liquor_categories(display_order);

-- Wine & Liquor Products Table Schema
-- This table stores wine and liquor products with alcohol-specific fields

CREATE TABLE IF NOT EXISTS wine_liquor_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100), -- Will be migrated to use wine_liquor_category_id
    wine_liquor_category_id UUID REFERENCES wine_liquor_categories(id) ON DELETE SET NULL,
    image_url TEXT,
    alcohol_content VARCHAR(20), -- e.g., "12.5%", "40%"
    volume VARCHAR(20), -- e.g., "750ml", "1L"
    vintage VARCHAR(10), -- e.g., "2020", "NV" for non-vintage
    region VARCHAR(100), -- e.g., "Napa Valley", "Bordeaux"
    producer VARCHAR(255), -- Winery or distillery name
    grape_variety VARCHAR(100), -- For wines
    spirit_type VARCHAR(100), -- For spirits (Whiskey, Vodka, etc.)
    serving_temperature VARCHAR(50), -- e.g., "Chilled", "Room Temperature"
    food_pairing TEXT, -- Suggested food pairings
    tasting_notes TEXT, -- Professional tasting notes
    is_active BOOLEAN DEFAULT true,
    requires_age_verification BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wine_liquor_products_active ON wine_liquor_products(is_active);
CREATE INDEX IF NOT EXISTS idx_wine_liquor_products_category ON wine_liquor_products(category);
CREATE INDEX IF NOT EXISTS idx_wine_liquor_products_category_id ON wine_liquor_products(wine_liquor_category_id);
CREATE INDEX IF NOT EXISTS idx_wine_liquor_products_price ON wine_liquor_products(price);

-- Insert default wine & liquor categories
INSERT INTO wine_liquor_categories (name, description, icon, display_order) VALUES
('Wines', 'Red, white, and rosé wines from around the world', '🍷', 1),
('Champagne & Sparkling', 'Champagne, prosecco, and other sparkling wines', '🥂', 2),
('Spirits', 'Whiskey, vodka, rum, gin, and other distilled spirits', '🥃', 3),
('Cocktails', 'Pre-mixed cocktails and cocktail ingredients', '🍸', 4),
('Beer & Cider', 'Craft beers, ciders, and other fermented beverages', '🍺', 5),
('Non-Alcoholic', 'Alcohol-free alternatives and mixers', '🥤', 6)
ON CONFLICT (name) DO NOTHING;

-- Create a function to migrate existing categories to the new system
CREATE OR REPLACE FUNCTION migrate_wine_liquor_categories()
RETURNS void AS $$
DECLARE
    category_record RECORD;
    category_id UUID;
BEGIN
    -- Loop through existing wine/liquor products and create categories if they don't exist
    FOR category_record IN 
        SELECT DISTINCT category 
        FROM wine_liquor_products 
        WHERE category IS NOT NULL AND wine_liquor_category_id IS NULL
    LOOP
        -- Check if category already exists
        SELECT id INTO category_id 
        FROM wine_liquor_categories 
        WHERE name = category_record.category;
        
        -- If category doesn't exist, create it
        IF category_id IS NULL THEN
            INSERT INTO wine_liquor_categories (name, description, icon, display_order)
            VALUES (
                category_record.category, 
                'Products in ' || category_record.category || ' category',
                '🍷', -- Default icon
                (SELECT COALESCE(MAX(display_order), 0) + 1 FROM wine_liquor_categories)
            )
            RETURNING id INTO category_id;
        END IF;
        
        -- Update products to use the new category_id
        UPDATE wine_liquor_products 
        SET wine_liquor_category_id = category_id 
        WHERE category = category_record.category AND wine_liquor_category_id IS NULL;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Run the migration function
SELECT migrate_wine_liquor_categories();

-- Add some sample wine and liquor products
INSERT INTO wine_liquor_products (name, description, price, category, alcohol_content, volume, vintage, region, producer, grape_variety, is_active) VALUES
('Cabernet Sauvignon Reserve', 'Full-bodied red wine with rich dark fruit flavors and smooth tannins', 2500.00, 'Wines', '13.5%', '750ml', '2020', 'Napa Valley', 'Stag''s Leap Wine Cellars', 'Cabernet Sauvignon', true),
('Chardonnay Unoaked', 'Crisp white wine with citrus and apple notes', 1800.00, 'Wines', '12.5%', '750ml', '2021', 'Sonoma County', 'Kendall-Jackson', 'Chardonnay', true),
('Prosecco DOCG', 'Italian sparkling wine with delicate bubbles and fresh fruit flavors', 2200.00, 'Champagne & Sparkling', '11.5%', '750ml', 'NV', 'Veneto', 'La Marca', 'Glera', true),
('Single Malt Whiskey', 'Premium Scottish single malt with notes of honey and oak', 4500.00, 'Spirits', '40%', '700ml', '12', 'Highland', 'Glenfiddich', NULL, true),
('Premium Vodka', 'Smooth and clean vodka perfect for cocktails', 3200.00, 'Spirits', '40%', '750ml', NULL, 'Poland', 'Beluga', NULL, true),
('Craft IPA Beer', 'Hoppy India Pale Ale with citrus and pine notes', 800.00, 'Beer & Cider', '6.2%', '500ml', NULL, 'Kenya', 'Tusker', NULL, true)
ON CONFLICT DO NOTHING;

-- Create a view for easy querying of wine/liquor products with category info
CREATE OR REPLACE VIEW wine_liquor_products_with_categories AS
SELECT 
    wlp.*,
    wlc.name as category_name,
    wlc.description as category_description,
    wlc.icon as category_icon,
    wlc.display_order as category_display_order
FROM wine_liquor_products wlp
LEFT JOIN wine_liquor_categories wlc ON wlp.wine_liquor_category_id = wlc.id
WHERE wlp.is_active = true;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_wine_liquor_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_wine_liquor_categories_updated_at
    BEFORE UPDATE ON wine_liquor_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_wine_liquor_updated_at();

CREATE TRIGGER trigger_update_wine_liquor_products_updated_at
    BEFORE UPDATE ON wine_liquor_products
    FOR EACH ROW
    EXECUTE FUNCTION update_wine_liquor_updated_at();

-- Fix the category constraint issue
-- This script makes the old category column nullable so new products can be created

-- Step 1: Make the old category column nullable
ALTER TABLE products ALTER COLUMN category DROP NOT NULL;

-- Step 2: Set category to NULL for products that have category_id
UPDATE products 
SET category = NULL 
WHERE category_id IS NOT NULL;

-- Verify the changes
SELECT 
    id, 
    name, 
    category, 
    category_id,
    CASE 
        WHEN category_id IS NOT NULL THEN 'Uses new category system'
        ELSE 'Uses old category system'
    END as system_type
FROM products 
ORDER BY created_at DESC;

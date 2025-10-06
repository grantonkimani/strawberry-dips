-- Quick test to check if gift_categories table exists and has data
-- Run this in your Supabase SQL editor to diagnose the issue

-- Check if gift_categories table exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gift_categories') 
        THEN 'gift_categories table EXISTS' 
        ELSE 'gift_categories table DOES NOT EXIST' 
    END as table_status;

-- If table exists, check if it has data
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gift_categories') 
        THEN (SELECT COUNT(*) FROM gift_categories)::text || ' categories found'
        ELSE 'Cannot check - table does not exist'
    END as data_status;

-- Check existing gift products and their categories
SELECT 
    category, 
    COUNT(*) as product_count 
FROM gift_products 
GROUP BY category 
ORDER BY category;

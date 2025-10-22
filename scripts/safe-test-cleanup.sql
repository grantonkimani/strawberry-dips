-- =====================================================
-- SAFE TEST DATA CLEANUP - SELECTIVE DELETION
-- =====================================================
-- This script safely deletes only obvious test data
-- Run this in your Supabase SQL editor

-- Step 1: First, let's see what test data we have
SELECT 
    'CURRENT DATA ANALYSIS' as status,
    COUNT(*) as total_orders,
    COUNT(CASE WHEN customer_email LIKE '%test%' THEN 1 END) as test_email_orders,
    COUNT(CASE WHEN customer_email LIKE '%@example%' THEN 1 END) as example_email_orders,
    COUNT(CASE WHEN customer_email LIKE '%@test%' THEN 1 END) as test_domain_orders,
    COUNT(CASE WHEN customer_first_name ILIKE '%test%' THEN 1 END) as test_name_orders,
    COUNT(CASE WHEN customer_email LIKE '%admin%' THEN 1 END) as admin_email_orders
FROM orders;

-- Step 2: Show sample of test orders (preview before deletion)
SELECT 
    id,
    customer_email,
    customer_first_name,
    customer_last_name,
    status,
    payment_status,
    total,
    created_at
FROM orders 
WHERE customer_email LIKE '%test%' 
   OR customer_email LIKE '%@example%'
   OR customer_email LIKE '%@test%'
   OR customer_first_name ILIKE '%test%'
   OR customer_email LIKE '%admin%'
ORDER BY created_at DESC
LIMIT 20;

-- Step 3: Count order items that will be deleted
SELECT 
    'ORDER ITEMS TO DELETE' as status,
    COUNT(*) as total_items
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
WHERE o.customer_email LIKE '%test%' 
   OR o.customer_email LIKE '%@example%'
   OR o.customer_email LIKE '%@test%'
   OR o.customer_first_name ILIKE '%test%'
   OR o.customer_email LIKE '%admin%';

-- Step 4: ACTUAL DELETION (uncomment when ready)
-- WARNING: This will permanently delete test data!

-- Delete order items first (due to foreign key constraints)
-- DELETE FROM order_items 
-- WHERE order_id IN (
--     SELECT id FROM orders 
--     WHERE customer_email LIKE '%test%' 
--        OR customer_email LIKE '%@example%'
--        OR customer_email LIKE '%@test%'
--        OR customer_first_name ILIKE '%test%'
--        OR customer_email LIKE '%admin%'
-- );

-- Delete test orders
-- DELETE FROM orders 
-- WHERE customer_email LIKE '%test%' 
--    OR customer_email LIKE '%@example%'
--    OR customer_email LIKE '%@test%'
--    OR customer_first_name ILIKE '%test%'
--    OR customer_email LIKE '%admin%';

-- Step 5: Verification after deletion
-- SELECT 
--     'CLEANUP COMPLETE' as status,
--     COUNT(*) as remaining_orders,
--     COUNT(CASE WHEN customer_email LIKE '%test%' THEN 1 END) as remaining_test_orders
-- FROM orders;

-- =====================================================
-- DELETE ALL ORDERS - NUCLEAR OPTION
-- =====================================================
-- This will delete ALL orders and order items
-- Perfect for clearing all test data when you're ready for production

-- Step 1: See what will be deleted
SELECT 
    'ALL ORDERS TO DELETE' as status,
    COUNT(*) as total_orders,
    MIN(created_at) as earliest_order,
    MAX(created_at) as latest_order,
    SUM(total) as total_value
FROM orders;

-- Step 2: Count order items that will be deleted
SELECT 
    'ALL ORDER ITEMS TO DELETE' as status,
    COUNT(*) as total_items
FROM order_items;

-- Step 3: Show sample of all orders
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
ORDER BY created_at DESC
LIMIT 10;

-- Step 4: ACTUAL DELETION (uncomment when ready)
-- WARNING: This will delete ALL orders and order items!

-- Delete ALL order items first
-- DELETE FROM order_items;

-- Delete ALL orders
-- DELETE FROM orders;

-- Step 5: Verification
-- SELECT 
--     'CLEANUP COMPLETE' as status,
--     COUNT(*) as remaining_orders
-- FROM orders;

-- =====================================================
-- DATE-BASED CLEANUP - DELETE ALL ORDERS BEFORE TODAY
-- =====================================================
-- This will delete ALL orders created before today
-- Perfect for clearing test data while keeping the system ready for real orders

-- Step 1: See what will be deleted
SELECT 
    'ORDERS TO DELETE' as status,
    COUNT(*) as total_orders,
    MIN(created_at) as earliest_order,
    MAX(created_at) as latest_order,
    SUM(total) as total_value
FROM orders 
WHERE created_at < CURRENT_DATE;

-- Step 2: Show sample of orders that will be deleted
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
WHERE created_at < CURRENT_DATE
ORDER BY created_at DESC
LIMIT 10;

-- Step 3: Count order items that will be deleted
SELECT 
    'ORDER ITEMS TO DELETE' as status,
    COUNT(*) as total_items
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
WHERE o.created_at < CURRENT_DATE;

-- Step 4: ACTUAL DELETION (uncomment when ready)
-- WARNING: This will delete ALL orders before today!

-- Delete order items first
-- DELETE FROM order_items 
-- WHERE order_id IN (
--     SELECT id FROM orders 
--     WHERE created_at < CURRENT_DATE
-- );

-- Delete orders
-- DELETE FROM orders 
-- WHERE created_at < CURRENT_DATE;

-- Step 5: Verification
-- SELECT 
--     'CLEANUP COMPLETE' as status,
--     COUNT(*) as remaining_orders,
--     MIN(created_at) as earliest_remaining_order
-- FROM orders;

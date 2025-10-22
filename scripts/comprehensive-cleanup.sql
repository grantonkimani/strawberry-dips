-- =====================================================
-- COMPREHENSIVE DATA CLEANUP - DELETE ALL ORDERS
-- =====================================================
-- WARNING: This will delete ALL orders and customers!
-- Only use if you want to start completely fresh

-- Step 1: Backup current data (optional but recommended)
-- CREATE TABLE orders_backup AS SELECT * FROM orders;
-- CREATE TABLE order_items_backup AS SELECT * FROM order_items;
-- CREATE TABLE customers_backup AS SELECT * FROM customers;

-- Step 2: Show what will be deleted
SELECT 
    'DATA TO BE DELETED' as status,
    (SELECT COUNT(*) FROM orders) as total_orders,
    (SELECT COUNT(*) FROM order_items) as total_order_items,
    (SELECT COUNT(*) FROM customers) as total_customers;

-- Step 3: Show sample of all data
SELECT 
    'SAMPLE ORDERS' as type,
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
-- WARNING: This will permanently delete ALL order data!

-- Delete in correct order due to foreign key constraints
-- DELETE FROM order_items;
-- DELETE FROM orders;
-- DELETE FROM customers WHERE id NOT IN (
--     SELECT DISTINCT customer_id FROM admin_users WHERE customer_id IS NOT NULL
-- );

-- Step 5: Reset sequences (if using auto-increment IDs)
-- ALTER SEQUENCE orders_id_seq RESTART WITH 1;
-- ALTER SEQUENCE order_items_id_seq RESTART WITH 1;
-- ALTER SEQUENCE customers_id_seq RESTART WITH 1;

-- Step 6: Verification
-- SELECT 
--     'CLEANUP COMPLETE' as status,
--     (SELECT COUNT(*) FROM orders) as remaining_orders,
--     (SELECT COUNT(*) FROM order_items) as remaining_order_items,
--     (SELECT COUNT(*) FROM customers) as remaining_customers;

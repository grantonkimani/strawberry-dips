-- =====================================================
-- COMPLETE DATABASE MIGRATION FOR PESAPAL INTEGRATION
-- =====================================================

-- Step 1: Add payment tracking fields to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'stripe',
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(255),
ADD COLUMN IF NOT EXISTS payment_error TEXT,
ADD COLUMN IF NOT EXISTS pesapal_order_tracking_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS pesapal_checkout_request_id VARCHAR(255);

-- Step 2: Update existing orders to have default values
UPDATE orders 
SET payment_method = 'stripe', payment_status = 'pending' 
WHERE payment_method IS NULL OR payment_status IS NULL;

-- Step 3: Verify the changes
SELECT 
    'ORDERS TABLE VERIFICATION' as status,
    COUNT(*) as total_orders,
    COUNT(CASE WHEN payment_method = 'pesapal' THEN 1 END) as pesapal_orders,
    COUNT(CASE WHEN payment_method = 'stripe' THEN 1 END) as stripe_orders
FROM orders;

-- Step 4: Show orders table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('payment_method', 'payment_status', 'payment_reference', 'pesapal_order_tracking_id', 'customer_first_name', 'customer_last_name')
ORDER BY column_name;





-- Quick test to check if payment fields exist in orders table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('payment_method', 'payment_status', 'customer_first_name', 'customer_last_name')
ORDER BY column_name;





-- Add payment tracking fields to orders table for Pesapal integration

-- Add payment method and status columns
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'stripe',
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(255),
ADD COLUMN IF NOT EXISTS payment_error TEXT;

-- Add Pesapal-specific fields
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS pesapal_order_tracking_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS pesapal_checkout_request_id VARCHAR(255);

-- Update existing orders to have default values
UPDATE orders 
SET payment_method = 'stripe', payment_status = 'pending' 
WHERE payment_method IS NULL OR payment_status IS NULL;





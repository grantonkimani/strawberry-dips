-- Add IntaSend invoice tracking column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS intasend_invoice_id VARCHAR(255);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_intasend_invoice_id ON orders(intasend_invoice_id);

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'intasend_invoice_id';





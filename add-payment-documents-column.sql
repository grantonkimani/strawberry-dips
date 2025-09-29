-- Add column for storing payment document filenames
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_documents TEXT;

-- Add index for faster queries on payment status
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- Add a comment to explain the new column
COMMENT ON COLUMN orders.payment_documents IS 'Comma-separated list of uploaded payment document filenames';



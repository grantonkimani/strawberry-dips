-- Add tracking_code to orders (run in Supabase SQL editor)
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS tracking_code VARCHAR(16) UNIQUE;

-- Helpful index for lookups
CREATE INDEX IF NOT EXISTS idx_orders_tracking_code ON orders(tracking_code);

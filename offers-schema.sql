-- Offers table for product discounts
-- Allows admin to set special prices and discount percentages for products

CREATE TABLE IF NOT EXISTS offers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  offer_price DECIMAL(10,2) NOT NULL,
  discount_percentage DECIMAL(5,2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_dates CHECK (end_date >= start_date),
  CONSTRAINT valid_discount CHECK (discount_percentage >= 0 AND discount_percentage <= 100)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_offers_product_id ON offers(product_id);
CREATE INDEX IF NOT EXISTS idx_offers_active ON offers(is_active);
CREATE INDEX IF NOT EXISTS idx_offers_dates ON offers(start_date, end_date);

-- Note: Uniqueness of active offers per product is enforced in application logic
-- (see /api/offers POST endpoint) since PostgreSQL doesn't allow CURRENT_DATE
-- in index predicates (it's not IMMUTABLE)


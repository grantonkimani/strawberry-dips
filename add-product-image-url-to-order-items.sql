-- Add product_image_url column to order_items table
-- This allows admins to view product images directly from order items

ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS product_image_url TEXT;

-- Backfill existing order items with product images where possible
-- This matches products by name and category to get the image URL
UPDATE order_items oi
SET product_image_url = (
  SELECT p.image_url
  FROM products p
  JOIN categories c ON p.category_id = c.id
  WHERE p.name = oi.product_name
    AND c.name = oi.product_category
    AND p.image_url IS NOT NULL
  LIMIT 1
)
WHERE oi.product_image_url IS NULL;


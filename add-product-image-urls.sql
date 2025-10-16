-- Add image_urls (text[]) to products, default empty array
ALTER TABLE products
ADD COLUMN IF NOT EXISTS image_urls text[] DEFAULT '{}';

-- Backfill image_urls from existing image_url when present and image_urls is empty
UPDATE products
SET image_urls = ARRAY[image_url]
WHERE image_url IS NOT NULL AND (image_urls IS NULL OR array_length(image_urls, 1) IS NULL);

-- Optional: ensure image_url mirrors first element for consistency going forward
-- (Application code will keep image_url in sync on writes.)


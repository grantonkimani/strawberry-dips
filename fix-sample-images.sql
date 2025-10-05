-- Update existing sample gift products to use placeholder images
-- Run this in your Supabase SQL editor to fix the 404 errors

UPDATE gift_products 
SET image_url = '/images/placeholder-gift.svg' 
WHERE image_url IN (
  '/images/gifts/red-roses.jpg',
  '/images/gifts/white-wine.jpg', 
  '/images/gifts/champagne.jpg',
  '/images/gifts/mixed-flowers.jpg',
  '/images/gifts/chocolate-box.jpg',
  '/images/gifts/gift-wrap.jpg'
);

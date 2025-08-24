-- Production Fields for Coffee Products
-- Run this in Supabase SQL Editor to add production-specific fields

-- Add production columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS bean_origin VARCHAR,
ADD COLUMN IF NOT EXISTS roast_level VARCHAR,
ADD COLUMN IF NOT EXISTS production_weight_per_unit DECIMAL(10,3),
ADD COLUMN IF NOT EXISTS production_unit VARCHAR DEFAULT 'lbs',
ADD COLUMN IF NOT EXISTS production_notes TEXT,
ADD COLUMN IF NOT EXISTS processing_method VARCHAR,
ADD COLUMN IF NOT EXISTS flavor_profile TEXT[];

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_bean_origin ON public.products(bean_origin);
CREATE INDEX IF NOT EXISTS idx_products_roast_level ON public.products(roast_level);

-- Update existing products with sample production data
-- Decaf products (Brazilian beans)
UPDATE public.products 
SET 
  bean_origin = 'Brazilian',
  roast_level = 'Medium',
  production_weight_per_unit = 1.0,
  processing_method = 'Washed',
  production_notes = 'Swiss Water Process decaffeination',
  flavor_profile = ARRAY['Chocolate', 'Nutty', 'Low Acidity']
WHERE LOWER(name) LIKE '%decaf%';

-- Espresso/Signature products (Ethiopian beans)
UPDATE public.products 
SET 
  bean_origin = 'Ethiopian',
  roast_level = 'Medium-Dark',
  production_weight_per_unit = 1.0,
  processing_method = 'Natural',
  production_notes = 'Ideal for espresso extraction',
  flavor_profile = ARRAY['Bright', 'Fruity', 'Wine-like']
WHERE LOWER(name) LIKE '%espresso%' OR LOWER(name) LIKE '%signature%';

-- Other whole bean products (Colombian default)
UPDATE public.products 
SET 
  bean_origin = 'Colombian',
  roast_level = 'Medium',
  production_weight_per_unit = 1.0,
  processing_method = 'Washed',
  flavor_profile = ARRAY['Balanced', 'Caramel', 'Clean']
WHERE category = 'WHOLE_BEANS' 
  AND bean_origin IS NULL;

-- Retail packs (smaller portions)
UPDATE public.products 
SET 
  production_weight_per_unit = 0.75,
  production_unit = 'lbs'
WHERE category = 'RETAIL_PACKS' 
  AND production_weight_per_unit IS NULL;

-- Set default production unit for all products
UPDATE public.products 
SET production_unit = 'lbs' 
WHERE production_unit IS NULL;

-- Add hide_prices field to products table
-- Run this in Supabase SQL Editor

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS hide_prices BOOLEAN DEFAULT FALSE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_products_hide_prices ON public.products(hide_prices);

-- Add comment for documentation
COMMENT ON COLUMN public.products.hide_prices IS 'Hide prices from customers when true - for internal security';

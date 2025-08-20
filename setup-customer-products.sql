-- Create customer_products table for product assignments
-- Run this in Supabase SQL Editor

-- Create customer_products table
CREATE TABLE IF NOT EXISTS customer_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    custom_price DECIMAL(10,2),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure a customer can only have one assignment per product
    UNIQUE(user_id, product_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customer_products_user_id ON customer_products(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_products_product_id ON customer_products(product_id);
CREATE INDEX IF NOT EXISTS idx_customer_products_active ON customer_products(is_active);

-- Create a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_customer_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists, then create it
DROP TRIGGER IF EXISTS update_customer_products_updated_at ON customer_products;
CREATE TRIGGER update_customer_products_updated_at
    BEFORE UPDATE ON customer_products
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_products_updated_at();

-- Verify the table was created
SELECT 'Customer Products Table Created Successfully' as status;
SELECT COUNT(*) as total_assignments FROM customer_products;

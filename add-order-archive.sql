-- ============================================================================
-- ORDER ARCHIVE FUNCTIONALITY
-- Run this script in your Supabase SQL Editor to add archive functionality
-- ============================================================================

-- 1. Add is_archived column to orders table (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'is_archived'
    ) THEN
        ALTER TABLE public.orders 
        ADD COLUMN is_archived BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_is_archived ON public.orders(is_archived);
CREATE INDEX IF NOT EXISTS idx_orders_status_archived ON public.orders(status, is_archived);

-- 3. Verify the column was added
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
    AND column_name = 'is_archived';

-- 4. Show current orders structure
SELECT 
    id,
    status,
    is_archived,
    created_at
FROM orders 
ORDER BY created_at DESC 
LIMIT 5;

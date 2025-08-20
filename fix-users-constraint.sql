-- Fix the foreign key constraint issue on users table
-- Run these commands in Supabase SQL Editor

-- 1. First, let's see what the constraint actually is
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name='users'
    AND tc.table_schema = 'public';

-- 2. Drop the problematic foreign key constraint
-- (Run this after confirming what the constraint is from step 1)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- 3. Now try to insert the admin user
INSERT INTO users (
  id,
  email, 
  role, 
  is_active
) VALUES (
  gen_random_uuid(),
  'admin@roasterordering.com',
  'ADMIN',
  true
) ON CONFLICT (email) DO NOTHING;

-- 4. Verify the user was created
SELECT id, email, role, is_active, created_at 
FROM users 
WHERE email = 'admin@roasterordering.com';

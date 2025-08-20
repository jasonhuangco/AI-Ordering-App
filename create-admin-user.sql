-- Simple admin user creation for Supabase
-- Run this in your Supabase SQL Editor

INSERT INTO users (
  id,
  email, 
  role, 
  company_name, 
  contact_name, 
  is_active
) VALUES (
  gen_random_uuid(),
  'admin@roasterordering.com',
  'ADMIN',
  'Roaster Ordering Admin',
  'Admin User',
  true
) ON CONFLICT (email) DO NOTHING;

-- Verify the user was created
SELECT id, email, role, company_name, created_at 
FROM users 
WHERE email = 'admin@roasterordering.com';

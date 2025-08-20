-- Minimal admin user creation for Supabase
-- This creates just the essential fields to avoid foreign key issues

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

-- Verify the user was created
SELECT id, email, role, is_active, created_at 
FROM users 
WHERE email = 'admin@roasterordering.com';

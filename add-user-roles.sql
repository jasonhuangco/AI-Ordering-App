-- Add role-based price visibility system
-- Run this in Supabase SQL Editor

-- STEP 1: Add new enum values (run this first)
-- The database uses an ENUM type for user roles, so we need to add new values to the enum

-- Add new role values to the existing enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'MANAGER';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'EMPLOYEE';

-- Add a comment explaining the roles
COMMENT ON TYPE user_role IS 'User role: ADMIN (full access), MANAGER (full pricing access), EMPLOYEE (limited pricing based on hide_prices setting)';

-- STEP 2: After running the above, run this separately to update existing users
-- (New enum values must be committed before they can be used)

-- Convert existing CUSTOMER users to EMPLOYEE role since they have same permissions
-- UPDATE public.users SET role = 'EMPLOYEE' WHERE role = 'CUSTOMER';

-- This query will show you current roles to verify
-- SELECT DISTINCT role FROM public.users;

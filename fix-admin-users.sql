-- Check for existing admin users and create one if needed
-- Run this in Supabase SQL Editor

-- 1. Check if any admin users exist
SELECT 'Current Admin Users:' as status;
SELECT id, email, role, is_active, contact_name, company_name, created_at 
FROM users 
WHERE role = 'ADMIN';

-- 2. Check if any users exist at all
SELECT 'All Users Count:' as status;
SELECT COUNT(*) as total_users, role 
FROM users 
GROUP BY role;

-- 3. If no admin users exist, create a temporary admin user
-- IMPORTANT: Replace 'your-email@example.com' with your actual email
-- IMPORTANT: Replace 'your-temp-password' with a secure password

DO $$
BEGIN
    -- Check if any admin users exist
    IF NOT EXISTS (SELECT 1 FROM users WHERE role = 'ADMIN') THEN
        -- Create a temporary admin user (you can change this email/password)
        INSERT INTO users (
            id,
            email,
            password,
            role,
            contact_name,
            company_name,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            'admin@owlvericks.com',  -- CHANGE THIS TO YOUR EMAIL
            '$2a$12$LQv3c1yqBwdVzk0XZMJhmuJHmuHJmKbNqd4k3EXOM.rjRdp7pQC.i', -- This is 'admin123' hashed
            'ADMIN',
            'System Administrator',
            'Owlvericks',
            true,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Created admin user: admin@owlvericks.com with password: admin123';
        RAISE NOTICE 'IMPORTANT: Change this password immediately after logging in!';
    ELSE
        RAISE NOTICE 'Admin users already exist - no action taken';
    END IF;
END $$;

-- 4. Verify the result
SELECT 'Admin Users After Script:' as status;
SELECT id, email, role, is_active, contact_name, company_name, created_at 
FROM users 
WHERE role = 'ADMIN';

-- 5. Check if reminder_settings table exists
SELECT 'Checking Reminder Settings Table:' as status;
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'reminder_settings'
) as reminder_table_exists;

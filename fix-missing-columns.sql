-- Quick fix for missing columns in existing tables
-- Run this if you get column errors with the main setup script

-- Fix users table - add password_hash column if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'password_hash'
    ) THEN
        ALTER TABLE users ADD COLUMN password_hash TEXT NOT NULL DEFAULT '';
        RAISE NOTICE 'Added password_hash column to users table';
    ELSE
        RAISE NOTICE 'password_hash column already exists in users table';
    END IF;
END $$;

-- Fix reminder_settings table - add missing columns
DO $$
BEGIN
    -- Add enabled column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reminder_settings' 
        AND column_name = 'enabled'
    ) THEN
        ALTER TABLE reminder_settings ADD COLUMN enabled BOOLEAN NOT NULL DEFAULT false;
        RAISE NOTICE 'Added enabled column to reminder_settings table';
    END IF;
    
    -- Add reminder_day column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reminder_settings' 
        AND column_name = 'reminder_day'
    ) THEN
        ALTER TABLE reminder_settings ADD COLUMN reminder_day INTEGER NOT NULL DEFAULT 1;
        RAISE NOTICE 'Added reminder_day column to reminder_settings table';
    END IF;
    
    -- Add reminder_time column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reminder_settings' 
        AND column_name = 'reminder_time'
    ) THEN
        ALTER TABLE reminder_settings ADD COLUMN reminder_time TIME NOT NULL DEFAULT '09:00:00';
        RAISE NOTICE 'Added reminder_time column to reminder_settings table';
    END IF;
    
    -- Add email_enabled column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reminder_settings' 
        AND column_name = 'email_enabled'
    ) THEN
        ALTER TABLE reminder_settings ADD COLUMN email_enabled BOOLEAN NOT NULL DEFAULT false;
        RAISE NOTICE 'Added email_enabled column to reminder_settings table';
    END IF;
    
    -- Add sms_enabled column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reminder_settings' 
        AND column_name = 'sms_enabled'
    ) THEN
        ALTER TABLE reminder_settings ADD COLUMN sms_enabled BOOLEAN NOT NULL DEFAULT false;
        RAISE NOTICE 'Added sms_enabled column to reminder_settings table';
    END IF;
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Column fixes completed! You can now run the main setup script or try creating an admin user.';
END $$;

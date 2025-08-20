-- Create reminder_settings table for order reminder functionality
-- Run this in Supabase SQL Editor

-- Create reminder_settings table
CREATE TABLE IF NOT EXISTS reminder_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_of_week INTEGER NOT NULL DEFAULT 1, -- 0=Sunday, 1=Monday, ..., 6=Saturday
    hour INTEGER NOT NULL DEFAULT 9, -- Hour of day (0-23)
    is_active BOOLEAN NOT NULL DEFAULT false,
    email_enabled BOOLEAN NOT NULL DEFAULT true,
    sms_enabled BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add constraints
ALTER TABLE reminder_settings 
    ADD CONSTRAINT check_day_of_week CHECK (day_of_week >= 0 AND day_of_week <= 6),
    ADD CONSTRAINT check_hour CHECK (hour >= 0 AND hour <= 23);

-- Create a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_reminder_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reminder_settings_updated_at
    BEFORE UPDATE ON reminder_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_reminder_settings_updated_at();

-- Insert default reminder settings if none exist
INSERT INTO reminder_settings (day_of_week, hour, is_active, email_enabled, sms_enabled)
SELECT 1, 9, false, true, false
WHERE NOT EXISTS (SELECT 1 FROM reminder_settings);

-- Verify the table was created and data inserted
SELECT 'Reminder Settings Table Created Successfully' as status;
SELECT * FROM reminder_settings;

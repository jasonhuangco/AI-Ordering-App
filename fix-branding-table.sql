-- Diagnostic script for branding_settings table issues
-- Run this in Supabase SQL Editor to identify the problem

-- 1. Check if branding_settings table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'branding_settings'
) as table_exists;

-- 2. If table exists, check its structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'branding_settings' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check if there are any records in the table
SELECT COUNT(*) as record_count FROM branding_settings;

-- 4. If table doesn't exist, create it with proper structure
CREATE TABLE IF NOT EXISTS branding_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT DEFAULT 'Roaster Ordering v1',
    logo_url TEXT,
    primary_color TEXT DEFAULT '#8B4513',
    secondary_color TEXT DEFAULT '#D2B48C',
    accent_color TEXT DEFAULT '#DAA520',
    background_color TEXT DEFAULT '#F5F5DC',
    button_color TEXT DEFAULT '#8B4513',
    tagline TEXT DEFAULT 'Premium Wholesale Coffee',
    font_family TEXT DEFAULT 'Inter',
    theme TEXT DEFAULT 'light',
    hero_title TEXT DEFAULT 'Wholesale Coffee Ordering',
    hero_subtitle TEXT DEFAULT 'Made Simple',
    hero_description TEXT DEFAULT 'Streamline your weekly coffee orders with our intuitive platform.',
    show_stats BOOLEAN DEFAULT true,
    show_features BOOLEAN DEFAULT true,
    contact_email TEXT DEFAULT 'support@roasterordering.com',
    contact_phone TEXT DEFAULT '1-800-ROASTER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Insert default branding settings if table is empty
INSERT INTO branding_settings (
    company_name,
    primary_color,
    secondary_color,
    accent_color,
    background_color,
    button_color,
    tagline,
    font_family,
    theme,
    hero_title,
    hero_subtitle,
    hero_description,
    show_stats,
    show_features,
    contact_email,
    contact_phone
) 
SELECT 
    'Roaster Ordering v1',
    '#8B4513',
    '#D2B48C',
    '#DAA520',
    '#F5F5DC',
    '#8B4513',
    'Premium Wholesale Coffee',
    'Inter',
    'light',
    'Wholesale Coffee Ordering',
    'Made Simple',
    'Streamline your weekly coffee orders with our intuitive platform. Designed for cafés, restaurants, and retailers who demand quality and convenience.',
    true,
    true,
    'support@roasterordering.com',
    '1-800-ROASTER'
WHERE NOT EXISTS (SELECT 1 FROM branding_settings);

-- 6. Verify the final state
SELECT * FROM branding_settings;

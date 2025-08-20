-- COMPLETE FIX for branding settings table
-- Run this entire script in Supabase SQL Editor

-- 1. Drop existing table if it has issues
DROP TABLE IF EXISTS branding_settings CASCADE;

-- 2. Create branding_settings table with correct structure
CREATE TABLE branding_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL DEFAULT 'Roaster Ordering v1',
    logo_url TEXT,
    tagline TEXT NOT NULL DEFAULT 'Premium Wholesale Coffee',
    primary_color TEXT NOT NULL DEFAULT '#8B4513',
    secondary_color TEXT NOT NULL DEFAULT '#D2B48C',
    accent_color TEXT NOT NULL DEFAULT '#DAA520',
    background_color TEXT NOT NULL DEFAULT '#F5F5DC',
    button_color TEXT NOT NULL DEFAULT '#8B4513',
    font_family TEXT NOT NULL DEFAULT 'Inter',
    theme TEXT NOT NULL DEFAULT 'light',
    hero_title TEXT NOT NULL DEFAULT 'Wholesale Coffee Ordering',
    hero_subtitle TEXT NOT NULL DEFAULT 'Made Simple',
    hero_description TEXT NOT NULL DEFAULT 'Streamline your weekly coffee orders with our intuitive platform. Designed for cafés, restaurants, and retailers who demand quality and convenience.',
    contact_email TEXT NOT NULL DEFAULT 'support@roasterordering.com',
    contact_phone TEXT NOT NULL DEFAULT '1-800-ROASTER',
    show_features BOOLEAN NOT NULL DEFAULT true,
    show_stats BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Insert default branding settings
INSERT INTO branding_settings (
    company_name,
    logo_url,
    tagline,
    primary_color,
    secondary_color,
    accent_color,
    background_color,
    button_color,
    font_family,
    theme,
    hero_title,
    hero_subtitle,
    hero_description,
    contact_email,
    contact_phone,
    show_features,
    show_stats
) VALUES (
    'Roaster Ordering v1',
    NULL,
    'Premium Wholesale Coffee',
    '#8B4513',
    '#D2B48C',
    '#DAA520',
    '#F5F5DC',
    '#8B4513',
    'Inter',
    'light',
    'Wholesale Coffee Ordering',
    'Made Simple',
    'Streamline your weekly coffee orders with our intuitive platform. Designed for cafés, restaurants, and retailers who demand quality and convenience.',
    'support@roasterordering.com',
    '1-800-ROASTER',
    true,
    true
);

-- 4. Verify the table and data
SELECT 'Table created successfully!' as status;
SELECT * FROM branding_settings;

-- 5. Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'branding_settings' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

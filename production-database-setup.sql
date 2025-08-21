-- Complete Database Setup for Roaster Ordering v1
-- Run this in your Supabase SQL Editor

-- 1. Create or update the users table with password_hash column
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'CUSTOMER' CHECK (role IN ('ADMIN', 'CUSTOMER')),
    customer_code INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    company_name TEXT,
    contact_name TEXT,
    phone TEXT,
    address TEXT,
    notes TEXT
);

-- Add password_hash column if it doesn't exist (for existing tables)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'password_hash'
    ) THEN
        ALTER TABLE users ADD COLUMN password_hash TEXT NOT NULL DEFAULT '';
    END IF;
END $$;

-- 2. Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('WHOLE_BEANS', 'ESPRESSO', 'RETAIL_PACKS', 'ACCESSORIES')),
    price DECIMAL(10,2) NOT NULL,
    weight_grams INTEGER,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_number TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    delivery_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- 6. Create branding_settings table
CREATE TABLE IF NOT EXISTS branding_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL DEFAULT 'Roaster Ordering',
    logo_url TEXT,
    primary_color TEXT NOT NULL DEFAULT '#8B4513',
    secondary_color TEXT NOT NULL DEFAULT '#D2B48C',
    accent_color TEXT NOT NULL DEFAULT '#A0522D',
    contact_email TEXT NOT NULL DEFAULT 'support@roasterordering.com',
    contact_phone TEXT NOT NULL DEFAULT '(555) 123-4567',
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create reminder_settings table
CREATE TABLE IF NOT EXISTS reminder_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enabled BOOLEAN NOT NULL DEFAULT false,
    reminder_day INTEGER NOT NULL DEFAULT 1 CHECK (reminder_day BETWEEN 0 AND 6),
    reminder_time TIME NOT NULL DEFAULT '09:00:00',
    email_enabled BOOLEAN NOT NULL DEFAULT false,
    sms_enabled BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);

-- 9. Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables that need them
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_branding_settings_updated_at ON branding_settings;
CREATE TRIGGER update_branding_settings_updated_at 
    BEFORE UPDATE ON branding_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reminder_settings_updated_at ON reminder_settings;
CREATE TRIGGER update_reminder_settings_updated_at 
    BEFORE UPDATE ON reminder_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 10. Insert default branding settings if none exist
INSERT INTO branding_settings (
    company_name,
    primary_color,
    secondary_color,
    accent_color,
    contact_email,
    contact_phone
) 
SELECT 
    'Roaster Ordering',
    '#8B4513',
    '#D2B48C', 
    '#A0522D',
    'support@roasterordering.com',
    '(555) 123-4567'
WHERE NOT EXISTS (SELECT 1 FROM branding_settings);

-- 11. Insert default reminder settings if none exist
INSERT INTO reminder_settings (
    enabled,
    reminder_day,
    reminder_time,
    email_enabled,
    sms_enabled
)
SELECT 
    false,
    1,
    '09:00:00',
    false,
    false
WHERE NOT EXISTS (SELECT 1 FROM reminder_settings);

-- 12. Create sequence for customer codes
CREATE SEQUENCE IF NOT EXISTS customer_code_seq START WITH 1001;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database setup completed successfully!';
    RAISE NOTICE 'You can now create admin users through the /setup endpoint.';
END $$;

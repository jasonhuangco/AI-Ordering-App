# 🛠️ Manual Supabase Setup Guide

If you're getting API errors with the CLI, follow this manual setup process:

## Step 1: Run Migrations Manually

Go to your Supabase dashboard → **SQL Editor** and run these files **in order**:

### 1. Extensions and Types
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types/enums
CREATE TYPE user_role AS ENUM ('ADMIN', 'CUSTOMER');
CREATE TYPE product_category AS ENUM ('WHOLE_BEANS', 'ESPRESSO', 'RETAIL_PACKS', 'ACCESSORIES');
CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'SHIPPED', 'CANCELLED');
```

### 2. Core Tables
```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'CUSTOMER',
  customer_code INTEGER UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  company_name VARCHAR,
  contact_name VARCHAR,
  phone VARCHAR,
  address TEXT,
  notes TEXT
);

-- Products table
CREATE TABLE public.products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT NOT NULL,
  category product_category NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  unit VARCHAR NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_global BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Orders table
CREATE TABLE public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  sequence_number INTEGER NOT NULL UNIQUE,
  status order_status NOT NULL DEFAULT 'PENDING',
  total_amount DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Order items table
CREATE TABLE public.order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL
);
```

### 3. Additional Tables
```sql
-- Customer-Product assignments
CREATE TABLE public.customer_products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  custom_price DECIMAL(10,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, product_id)
);

-- Favorites table
CREATE TABLE public.favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, product_id)
);

-- Branding settings table
CREATE TABLE public.branding_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_name VARCHAR NOT NULL DEFAULT 'Roaster Ordering',
  logo_url VARCHAR,
  tagline VARCHAR NOT NULL DEFAULT 'Premium Wholesale Coffee',
  primary_color VARCHAR NOT NULL DEFAULT '#8B4513',
  secondary_color VARCHAR NOT NULL DEFAULT '#D2B48C',
  accent_color VARCHAR NOT NULL DEFAULT '#DAA520',
  background_color VARCHAR NOT NULL DEFAULT '#F5F5DC',
  button_color VARCHAR NOT NULL DEFAULT '#8B4513',
  font_family VARCHAR NOT NULL DEFAULT 'Inter',
  theme VARCHAR NOT NULL DEFAULT 'light',
  hero_title VARCHAR NOT NULL DEFAULT 'Wholesale Coffee Ordering',
  hero_subtitle VARCHAR NOT NULL DEFAULT 'Made Simple',
  hero_description TEXT NOT NULL DEFAULT 'Streamline your weekly coffee orders with our intuitive platform.',
  contact_email VARCHAR NOT NULL DEFAULT 'support@roasterordering.com',
  contact_phone VARCHAR NOT NULL DEFAULT '1-800-ROASTER',
  show_features BOOLEAN NOT NULL DEFAULT true,
  show_stats BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### 4. Functions and Sequences
```sql
-- Create sequences
CREATE SEQUENCE customer_code_seq START 1;
CREATE SEQUENCE order_sequence_number_seq START 1;

-- Functions
CREATE OR REPLACE FUNCTION assign_customer_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'CUSTOMER' AND NEW.customer_code IS NULL THEN
    NEW.customer_code := nextval('customer_code_seq');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION assign_order_sequence()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sequence_number IS NULL THEN
    NEW.sequence_number := nextval('order_sequence_number_seq');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 5. Triggers
```sql
-- Create triggers
CREATE TRIGGER trigger_assign_customer_code
  BEFORE INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION assign_customer_code();

CREATE TRIGGER trigger_assign_order_sequence
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION assign_order_sequence();

CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trigger_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trigger_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trigger_customer_products_updated_at
  BEFORE UPDATE ON public.customer_products
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trigger_branding_settings_updated_at
  BEFORE UPDATE ON public.branding_settings
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();
```

### 6. Indexes
```sql
-- Create indexes
CREATE INDEX idx_users_customer_code ON public.users(customer_code);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_is_active ON public.products(is_active);
CREATE INDEX idx_products_is_global ON public.products(is_global);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_sequence_number ON public.orders(sequence_number);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX idx_customer_products_user_id ON public.customer_products(user_id);
CREATE INDEX idx_customer_products_product_id ON public.customer_products(product_id);
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_favorites_product_id ON public.favorites(product_id);
```

## Step 2: Insert Sample Data

```sql
-- Insert default branding settings
INSERT INTO public.branding_settings DEFAULT VALUES;

-- Insert sample products (optional)
INSERT INTO public.products (name, description, category, price, unit, is_active, is_global) VALUES
('House Blend - Medium Roast', 'Our signature blend with notes of chocolate and caramel.', 'WHOLE_BEANS', 12.50, 'per lb', true, true),
('Colombian Single Origin', 'Single-origin beans from the mountains of Colombia.', 'WHOLE_BEANS', 15.00, 'per lb', true, true),
('Ethiopian Yirgacheffe', 'Light roast with floral and tea-like qualities.', 'WHOLE_BEANS', 18.00, 'per lb', true, true),
('Espresso Supreme', 'Our premium espresso blend.', 'ESPRESSO', 14.00, 'per lb', true, true),
('House Blend - 12oz Retail Bag', 'Pre-packaged retail bags of our house blend.', 'RETAIL_PACKS', 8.99, 'per bag', true, true),
('Branded Coffee Cups - 12oz', 'Disposable coffee cups with your logo.', 'ACCESSORIES', 89.99, 'per case', true, true);
```

## Step 3: Set Up RLS Policies

```sql
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branding_settings ENABLE ROW LEVEL SECURITY;

-- Helper functions
CREATE OR REPLACE FUNCTION auth.user_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'ADMIN'
    FROM public.users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Basic policies (add more as needed)
CREATE POLICY "Users can read their own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can read all users" ON public.users FOR SELECT USING (auth.user_is_admin());
CREATE POLICY "Everyone can read active global products" ON public.products FOR SELECT USING (is_active = true AND is_global = true);
CREATE POLICY "Admins can manage all products" ON public.products FOR ALL USING (auth.user_is_admin());
CREATE POLICY "Everyone can read branding settings" ON public.branding_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage branding settings" ON public.branding_settings FOR ALL USING (auth.user_is_admin());

-- User registration trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'CUSTOMER');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 🎯 Troubleshooting Tips

1. **Run each section separately** - Don't copy/paste everything at once
2. **Check for errors** - Look at the bottom of the SQL editor for any error messages
3. **Verify tables were created** - Check the Table Editor to see your tables
4. **Test the trigger** - Try inserting a test record to verify functions work

## ✅ Verification

After setup, verify with:
```sql
-- Check tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Check sample data
SELECT * FROM public.branding_settings;
SELECT count(*) FROM public.products;

-- Test user creation function
SELECT * FROM auth.users;
```

Your database should now be ready! 🎉

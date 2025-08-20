# 🔄 Database Reset Guide

## ⚠️ **WARNING: DATA LOSS**
This will completely wipe your Supabase database tables and start fresh. Make sure you have exported any data you want to keep!

## Option 1: Use the Reset Migration File

Run the reset migration in your Supabase SQL Editor:
- File: `20250819000000_reset_database.sql`

## Option 2: Manual Reset (Copy & Paste)

Go to your Supabase dashboard → **SQL Editor** and run this:

```sql
-- ⚠️ DANGER ZONE: This will delete ALL data!
-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.favorites CASCADE;
DROP TABLE IF EXISTS public.customer_products CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.branding_settings CASCADE;

-- Drop sequences
DROP SEQUENCE IF EXISTS customer_code_seq CASCADE;
DROP SEQUENCE IF EXISTS order_sequence_number_seq CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS assign_customer_code() CASCADE;
DROP FUNCTION IF EXISTS assign_order_sequence() CASCADE;
DROP FUNCTION IF EXISTS handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS auth.user_is_admin() CASCADE;
DROP FUNCTION IF EXISTS auth.get_user_role() CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS product_category CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
```

## ✅ After Reset - Run These In Order:

1. **Extensions and Types**: `20250819000001_extensions_and_types.sql`
2. **Core Tables**: `20250819000002_core_tables.sql`
3. **Additional Tables**: `20250819000003_additional_tables.sql`
4. **Functions**: `20250819000004_sequences_functions.sql`
5. **Triggers**: `20250819000005_triggers.sql`
6. **Indexes**: `20250819000006_indexes.sql`

## 🔍 Verify Reset Worked

Check that tables are gone:
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

Should return no results (or only non-coffee-app tables).

## 🚀 Fresh Start

After reset, you'll have a completely clean database ready for the new schema! Your auth.users table (Supabase's built-in auth) will remain intact, so user accounts won't be deleted.

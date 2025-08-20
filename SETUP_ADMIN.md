# 🚀 Quick Setup - Admin User Creation

## **Issue:** Empty Users Table in Supabase

Your Supabase `users` table is empty, so the admin login won't work. Here's how to fix it:

## **Solution 1: Use Supabase Dashboard (Recommended)**

1. **Go to your Supabase project**: https://supabase.com/dashboard/projects
2. **Find your project**: `rjpcmenbbfolguamfwhh` 
3. **Go to Table Editor** → Select `users` table
4. **Click "Insert"** → "Insert row"
5. **Fill in these values**:
   ```
   id: (click "Generate UUID" or leave empty to auto-generate)
   email: admin@roasterordering.com
   role: ADMIN
   company_name: Roaster Ordering Admin
   contact_name: Admin User
   phone: 1-800-ROASTER
   address: 123 Coffee Street, Bean City, BC 12345
   is_active: true
   created_at: (leave empty for auto)
   updated_at: (leave empty for auto)
   ```
6. **Click "Save"**

## **Solution 2: SQL Query (Advanced)**

1. Go to **SQL Editor** in your Supabase dashboard
2. Run this query:
   ```sql
   INSERT INTO users (
     id, email, role, company_name, contact_name, 
     phone, address, is_active, created_at, updated_at
   ) VALUES (
     gen_random_uuid(),
     'admin@roasterordering.com',
     'ADMIN',
     'Roaster Ordering Admin',
     'Admin User',
     '1-800-ROASTER',
     '123 Coffee Street, Bean City, BC 12345',
     true,
     NOW(),
     NOW()
   );
   ```

## **Add Sample Products (Optional)**

While you're there, add some sample products:

```sql
INSERT INTO products (
  id, name, description, category, unit, price, 
  weight_per_unit, sku, is_active, is_global, created_at, updated_at
) VALUES 
(
  gen_random_uuid(),
  'House Blend - Whole Bean',
  'Our signature house blend, perfect for everyday brewing',
  'WHOLE_BEANS',
  'lb',
  12.50,
  1.0,
  'HB-WB-1LB',
  true,
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Espresso Blend - Ground',
  'Rich espresso blend, pre-ground for espresso machines',
  'ESPRESSO',
  'lb',
  14.00,
  1.0,
  'ESP-GR-1LB',
  true,
  true,
  NOW(),
  NOW()
);
```

## **Test Your Login**

1. **Go to**: http://localhost:3000/login
2. **Enter**: 
   - Email: `admin@roasterordering.com`
   - Password: `admin123` (or any password - validation is currently disabled)
3. **Click Login**

## **Expected Result**

✅ You should be redirected to the admin dashboard
✅ You should see your products in the catalog
✅ All admin features should work

## **If Still Not Working**

Check the browser console (F12) for any error messages and let me know what you see!

# Manual Data Import Guide for Supabase

## Import Order (Important: Follow this sequence due to foreign key relationships)

### 1. Products (No dependencies)
- Go to Supabase Dashboard > Table Editor > products
- Click "Insert" > "Import data" or add manually
- Import all 14 products from data-export.json

### 2. Branding Settings (No dependencies)  
- Go to branding_settings table
- Import the single branding configuration

### 3. Users (Must be created via Auth, not direct table insert)
**⚠️ Important: Users cannot be imported directly into the users table**
- Users must sign up through your app's authentication system
- Or create them via Supabase Auth > Users section in dashboard
- Create these users:
  - admin@roasterordering.com (Admin)
  - jason@morninglavender.com (Customer)
  - restaurant1@example.com (Customer)  
  - retailer1@example.com (Customer)

### 4. Customer Product Assignments (Requires users)
- Only import after users exist
- Links specific products to specific customers

### 5. Orders & Order Items (Requires users and products)
- Import orders first, then order items
- Order items reference both orders and products

### 6. Favorites (Requires users and products)
- Links users to their favorite products

## Quick Copy-Paste Data

### Products (Copy these objects into Supabase):
```json
[paste the products array from data-export.json]
```

### Branding Settings:
```json
[paste the branding_settings array from data-export.json]
```

## Alternative: Use the Import Script
After setting up your .env.local with real Supabase credentials:
```bash
node quick-import.mjs
```

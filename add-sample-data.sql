-- Add sample products to the database
-- Run this in Supabase SQL Editor

INSERT INTO products (
  id,
  name,
  description,
  category,
  unit,
  price,
  weight_per_unit,
  sku,
  is_active,
  is_global,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  'House Blend - Whole Bean',
  'Our signature house blend, perfect for everyday brewing. A smooth, well-balanced coffee with notes of chocolate and caramel.',
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
  'Rich espresso blend, pre-ground for espresso machines. Dark roast with full body and crema.',
  'ESPRESSO',
  'lb',
  14.00,
  1.0,
  'ESP-GR-1LB',
  true,
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Single Origin Ethiopia',
  'Bright and fruity single origin from Ethiopia. Light roast with floral notes and citrus acidity.',
  'WHOLE_BEANS',
  'lb',
  16.50,
  1.0,
  'SO-ETH-1LB',
  true,
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Colombian Medium Roast',
  'Classic Colombian coffee with balanced flavor. Medium roast with nutty undertones.',
  'WHOLE_BEANS',
  'lb',
  13.75,
  1.0,
  'COL-MED-1LB',
  true,
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'French Roast - Dark',
  'Bold and smoky French roast. Full city roast with intense flavor.',
  'WHOLE_BEANS',
  'lb',
  13.25,
  1.0,
  'FR-DARK-1LB',
  true,
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Retail Pack - House Blend',
  '12oz retail bags of our house blend. Case of 12 bags for retail sales.',
  'RETAIL_PACKS',
  'case',
  48.00,
  3.0,
  'RT-HB-12OZ-12PK',
  true,
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Retail Pack - Espresso',
  '12oz retail bags of espresso blend. Case of 12 bags for retail sales.',
  'RETAIL_PACKS',
  'case',
  52.00,
  3.0,
  'RT-ESP-12OZ-12PK',
  true,
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Coffee Filters - #4',
  'High-quality paper filters for drip coffee makers. Box of 100 filters.',
  'ACCESSORIES',
  'box',
  8.99,
  0.5,
  'FILT-4-100',
  true,
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Coffee Grinder Cleaner',
  'Professional grinder cleaning tablets. Keep your grinder in perfect condition.',
  'ACCESSORIES',
  'bottle',
  15.99,
  0.3,
  'CLEAN-GRIND',
  true,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (sku) DO NOTHING;

-- Add sample customer (if not exists)
INSERT INTO users (
  id,
  email,
  role,
  company_name,
  contact_name,
  phone,
  address,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'cafe1@example.com',
  'CUSTOMER',
  'Downtown Cafe',
  'John Smith',
  '555-CAFE-001',
  '456 Main Street, Cafe Town, CT 67890',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Verify the data was inserted
SELECT 'Products:' as table_name, COUNT(*) as record_count FROM products
UNION ALL
SELECT 'Users:', COUNT(*) FROM users;

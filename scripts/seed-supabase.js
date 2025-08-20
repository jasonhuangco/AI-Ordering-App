const { createUser, getAllProducts, createProduct } = require('../src/lib/supabase-admin')
const bcrypt = require('bcryptjs')

async function seedSupabase() {
  console.log('🌱 Seeding Supabase database...')

  try {
    // 1. Create Admin User
    console.log('Creating admin user...')
    const adminPassword = await bcrypt.hash('admin123', 12)
    
    const adminUser = await createUser({
      id: 'admin-001', // Using simple ID instead of complex UUID
      email: 'admin@roasterordering.com',
      role: 'ADMIN',
      company_name: 'Roaster Ordering Admin',
      contact_name: 'Admin User',
      phone: '1-800-ROASTER',
      address: '123 Coffee Street, Bean City, BC 12345'
    })
    console.log('✅ Admin user created:', adminUser.email)

    // 2. Create Sample Customer
    console.log('Creating sample customer...')
    const customerPassword = await bcrypt.hash('customer123', 12)
    
    const customer = await createUser({
      id: 'customer-001',
      email: 'cafe1@example.com', 
      role: 'CUSTOMER',
      company_name: 'Downtown Cafe',
      contact_name: 'John Smith',
      phone: '555-CAFE-001',
      address: '456 Main Street, Cafe Town, CT 67890'
    })
    console.log('✅ Sample customer created:', customer.email)

    // 3. Check if products exist, if not create sample products
    const existingProducts = await getAllProducts()
    if (existingProducts.length === 0) {
      console.log('Creating sample products...')
      
      const sampleProducts = [
        {
          id: 'prod-001',
          name: 'House Blend - Whole Bean',
          description: 'Our signature house blend, perfect for everyday brewing',
          category: 'WHOLE_BEANS',
          unit: 'lb',
          price: 12.50,
          weight_per_unit: 1.0,
          sku: 'HB-WB-1LB'
        },
        {
          id: 'prod-002', 
          name: 'Espresso Blend - Ground',
          description: 'Rich espresso blend, pre-ground for espresso machines',
          category: 'ESPRESSO',
          unit: 'lb',
          price: 14.00,
          weight_per_unit: 1.0,
          sku: 'ESP-GR-1LB'
        },
        {
          id: 'prod-003',
          name: 'Single Origin Ethiopia',
          description: 'Bright and fruity single origin from Ethiopia',
          category: 'WHOLE_BEANS',
          unit: 'lb',
          price: 16.50,
          weight_per_unit: 1.0,
          sku: 'SO-ETH-1LB'
        },
        {
          id: 'prod-004',
          name: 'Retail Pack - House Blend',
          description: '12oz retail bags of our house blend',
          category: 'RETAIL_PACKS',
          unit: 'case',
          price: 48.00,
          weight_per_unit: 3.0, // 12oz x 4 bags
          sku: 'RT-HB-12OZ-4PK'
        }
      ]

      for (const product of sampleProducts) {
        try {
          await createProduct(product)
          console.log(`✅ Created product: ${product.name}`)
        } catch (error) {
          console.log(`⚠️  Product ${product.name} may already exist`)
        }
      }
    } else {
      console.log(`✅ Found ${existingProducts.length} existing products`)
    }

    console.log('\n🎉 Seeding complete!')
    console.log('\n📋 Login credentials:')
    console.log('Admin: admin@roasterordering.com / admin123')
    console.log('Customer: cafe1@example.com / customer123')
    
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    throw error
  }
}

// Run the seed function
seedSupabase()
  .then(() => {
    console.log('✅ Seeding completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  })

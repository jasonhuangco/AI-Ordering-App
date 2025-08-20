require('dotenv').config({ path: '.env.local' });
const { randomUUID } = require('crypto');

// Simple seed script that works with our current setup
async function seedUsers() {
  console.log('🌱 Creating admin and customer users in Supabase...');
  
  const { createClient } = require('@supabase/supabase-js');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // Generate proper UUIDs
    const adminId = randomUUID();
    const customerId = randomUUID();
    
    // Create admin user
    console.log('Creating admin user...');
    const { data: adminData, error: adminError } = await supabase
      .from('users')
      .insert({
        id: adminId,
        email: 'admin@roasterordering.com',
        role: 'ADMIN',
        company_name: 'Roaster Ordering Admin',
        contact_name: 'Admin User',
        phone: '1-800-ROASTER',
        address: '123 Coffee Street, Bean City, BC 12345',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();
    
    if (adminError && adminError.code !== '23505') { // 23505 is unique violation (already exists)
      throw adminError;
    }
    
    console.log('✅ Admin user created/verified:', adminId);
    
    // Create customer user
    console.log('Creating sample customer...');
    const { data: customerData, error: customerError } = await supabase
      .from('users')
      .insert({
        id: customerId,
        email: 'cafe1@example.com',
        role: 'CUSTOMER',
        company_name: 'Downtown Cafe',
        contact_name: 'John Smith',
        phone: '555-CAFE-001',
        address: '456 Main Street, Cafe Town, CT 67890',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();
    
    if (customerError && customerError.code !== '23505') {
      throw customerError;
    }
    
    console.log('✅ Sample customer created/verified');
    
    // Check if products exist
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (productsError) {
      throw productsError;
    }
    
    if (products.length === 0) {
      console.log('Creating sample products...');
      const sampleProducts = [
        {
          id: randomUUID(),
          name: 'House Blend - Whole Bean',
          description: 'Our signature house blend, perfect for everyday brewing',
          category: 'WHOLE_BEANS',
          unit: 'lb',
          price: 12.50,
          weight_per_unit: 1.0,
          sku: 'HB-WB-1LB',
          is_active: true,
          is_global: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: randomUUID(),
          name: 'Espresso Blend - Ground',
          description: 'Rich espresso blend, pre-ground for espresso machines',
          category: 'ESPRESSO',
          unit: 'lb',
          price: 14.00,
          weight_per_unit: 1.0,
          sku: 'ESP-GR-1LB',
          is_active: true,
          is_global: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      const { error: insertError } = await supabase
        .from('products')
        .insert(sampleProducts);
      
      if (insertError) {
        throw insertError;
      }
      
      console.log('✅ Sample products created');
    } else {
      console.log('✅ Products already exist');
    }
    
    console.log('\n🎉 Seeding complete!');
    console.log('\n📋 Login credentials:');
    console.log('🔑 Admin: admin@roasterordering.com / admin123');
    console.log('👤 Customer: cafe1@example.com / customer123');
    console.log('\n🌐 Your app: http://localhost:3000');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedUsers();

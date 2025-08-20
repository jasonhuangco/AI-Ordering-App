const { PrismaClient } = require('@prisma/client')
const fs = require('fs')

const prisma = new PrismaClient()

async function exportData() {
  try {
    console.log('🚀 Starting data export from SQLite...')

    // Export Users (excluding passwords for security)
    console.log('📥 Exporting users...')
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        customerCode: true,
        isActive: true,
        companyName: true,
        contactName: true,
        phone: true,
        address: true,
        notes: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // Export Products
    console.log('📦 Exporting products...')
    const products = await prisma.product.findMany()

    // Export Orders
    console.log('📋 Exporting orders...')
    const orders = await prisma.order.findMany({
      include: {
        items: true
      }
    })

    // Export Favorites
    console.log('❤️ Exporting favorites...')
    const favorites = await prisma.favorite.findMany()

    // Export Customer Product Assignments
    console.log('🔗 Exporting customer product assignments...')
    const customerProducts = await prisma.customerProduct.findMany()

    // Export Branding Settings
    console.log('🎨 Exporting branding settings...')
    const brandingSettings = await prisma.brandingSettings.findMany()

    // Create export object
    const exportData = {
      users: users.map(user => ({
        ...user,
        // Convert Prisma field names to Supabase field names
        customer_code: user.customerCode,
        is_active: user.isActive,
        company_name: user.companyName,
        contact_name: user.contactName,
        created_at: user.createdAt,
        updated_at: user.updatedAt
      })),
      products: products.map(product => ({
        ...product,
        is_active: product.isActive,
        is_global: product.isGlobal,
        created_at: product.createdAt,
        updated_at: product.updatedAt
      })),
      orders: orders.map(order => ({
        ...order,
        user_id: order.userId,
        sequence_number: order.sequenceNumber,
        total_amount: order.total,
        created_at: order.createdAt,
        updated_at: order.updatedAt,
        items: order.items.map(item => ({
          ...item,
          order_id: item.orderId,
          product_id: item.productId,
          unit_price: item.price,
          total_price: item.quantity * item.price
        }))
      })),
      favorites: favorites.map(fav => ({
        ...fav,
        user_id: fav.userId,
        product_id: fav.productId,
        created_at: fav.createdAt
      })),
      customer_products: customerProducts.map(cp => ({
        ...cp,
        user_id: cp.userId,
        product_id: cp.productId,
        custom_price: cp.customPrice,
        is_active: cp.isActive,
        created_at: cp.createdAt,
        updated_at: cp.updatedAt
      })),
      branding_settings: brandingSettings.map(bs => ({
        ...bs,
        logo_url: bs.logoUrl,
        primary_color: bs.primaryColor,
        secondary_color: bs.secondaryColor,
        accent_color: bs.accentColor,
        background_color: bs.backgroundColor,
        button_color: bs.buttonColor,
        font_family: bs.fontFamily,
        hero_title: bs.heroTitle,
        hero_subtitle: bs.heroSubtitle,
        hero_description: bs.heroDescription,
        contact_email: bs.contactEmail,
        contact_phone: bs.contactPhone,
        show_features: bs.showFeatures,
        show_stats: bs.showStats,
        created_at: bs.createdAt,
        updated_at: bs.updatedAt
      }))
    }

    // Write to JSON file
    fs.writeFileSync('data-export.json', JSON.stringify(exportData, null, 2))
    
    console.log('✅ Data export completed!')
    console.log(`📊 Export summary:`)
    console.log(`   👥 Users: ${exportData.users.length}`)
    console.log(`   📦 Products: ${exportData.products.length}`)
    console.log(`   📋 Orders: ${exportData.orders.length}`)
    console.log(`   📝 Order Items: ${exportData.orders.reduce((sum, order) => sum + order.items.length, 0)}`)
    console.log(`   ❤️ Favorites: ${exportData.favorites.length}`)
    console.log(`   🔗 Customer Products: ${exportData.customer_products.length}`)
    console.log(`   🎨 Branding Settings: ${exportData.branding_settings.length}`)
    
    console.log('\n📄 Data exported to: data-export.json')
    console.log('\n🔧 Next steps:')
    console.log('1. Create your Supabase project at https://app.supabase.com')
    console.log('2. Copy your project URL and API keys to .env.local')
    console.log('3. Run: npx supabase db push (to apply migrations)')
    console.log('4. Use the Supabase dashboard or import script to load your data')

  } catch (error) {
    console.error('❌ Export failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

exportData()

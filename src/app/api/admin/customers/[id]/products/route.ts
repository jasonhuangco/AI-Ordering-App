import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../../lib/auth'
import { supabaseAdmin } from '../../../../../../lib/supabase-admin'

// GET /api/admin/customers/[id]/products - Get products and assignment status for a customer
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`📦 Getting products for customer ${params.id}...`)
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const customerId = params.id

    // Get all products
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('name', { ascending: true })

    if (productsError) {
      console.error('❌ Error fetching products:', productsError)
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }

    // Get customer product assignments (if table exists)
    let customerProducts: any[] = []
    try {
      const { data: assignments, error: assignmentsError } = await supabaseAdmin
        .from('customer_products')
        .select('*')
        .eq('user_id', customerId)
        .eq('is_active', true)

      if (!assignmentsError) {
        customerProducts = assignments || []
      }
    } catch (error) {
      // Table might not exist yet, continue without assignments
      console.log('ℹ️ customer_products table not found, showing all as global products')
    }

    // Format products with assignment status
    const formattedProducts = products.map(product => {
      const assignment = customerProducts.find(cp => cp.product_id === product.id)
      
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        isGlobal: product.is_global || true, // Default to global if not specified
        isAssigned: !!assignment,
        customPrice: assignment?.custom_price || null,
        isActive: assignment?.is_active || false,
      }
    })

    console.log(`✅ Found ${formattedProducts.length} products`)
    return NextResponse.json({ products: formattedProducts })
  } catch (error) {
    console.error('❌ Error in customer products GET:', error)
    return NextResponse.json({ error: 'Failed to get customer products' }, { status: 500 })
  }
}

// POST /api/admin/customers/[id]/products - Assign products to a customer
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`📦 Assigning products to customer ${params.id}...`)
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const customerId = params.id
    const body = await request.json()
    const { productIds, customPrices = {} } = body

    if (!Array.isArray(productIds)) {
      return NextResponse.json({ error: 'productIds must be an array' }, { status: 400 })
    }

    // Verify customer exists
    const { data: customer, error: customerError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', customerId)
      .eq('role', 'CUSTOMER')
      .single()

    if (customerError) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    try {
      // Remove existing assignments
      await supabaseAdmin
        .from('customer_products')
        .delete()
        .eq('user_id', customerId)

      // Create new assignments if products are selected
      if (productIds.length > 0) {
        const assignments = productIds.map(productId => ({
          user_id: customerId,
          product_id: productId,
          custom_price: customPrices[productId] || null,
          is_active: true,
        }))

        const { error: insertError } = await supabaseAdmin
          .from('customer_products')
          .insert(assignments)

        if (insertError) {
          console.error('❌ Error inserting assignments:', insertError)
          return NextResponse.json({ error: 'Failed to assign products' }, { status: 500 })
        }
      }

      console.log(`✅ Assigned ${productIds.length} products to customer`)
      return NextResponse.json({
        success: true,
        message: `Assigned ${productIds.length} products to customer`,
      })
    } catch (error) {
      console.log('ℹ️ customer_products table may not exist yet')
      return NextResponse.json({
        success: true,
        message: 'Product assignments feature requires database setup',
      })
    }
  } catch (error) {
    console.error('❌ Error in customer products POST:', error)
    return NextResponse.json({ error: 'Failed to assign products' }, { status: 500 })
  }
}

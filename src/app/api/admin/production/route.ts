import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'
import { createClient } from '@supabase/supabase-js'
import { generateOrderNumberWithSequence } from '../../../../lib/orderUtils'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

interface ProductionItem {
  productId: string
  productName: string
  category: string
  unit: string
  totalQuantity: number
  totalProductionWeight: number
  orderCount: number
  productionDetails: {
    beanOrigin?: string
    roastLevel?: string
    productionWeightPerUnit?: number
    productionUnit?: string
    productionNotes?: string
    processingMethod?: string
    flavorProfile?: string[]
  }
  orders: Array<{
    orderId: string
    orderNumber: string
    customerName: string
    quantity: number
    productionWeight: number
    status: string
    dueDate?: string
  }>
}

interface ProductionSchedule {
  dateRange: {
    startDate: string
    endDate: string
  }
  totalItems: number
  totalOrders: number
  productionItems: ProductionItem[]
  ordersByStatus: Record<string, number>
  summary: {
    totalProducts: number
    totalQuantity: number
    byCategory: Record<string, {
      quantity: number
      products: number
    }>
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const status = searchParams.get('status') || 'all'
    const includeArchived = searchParams.get('includeArchived') === 'true'

    // Default to current week if no dates provided
    const defaultStartDate = startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const defaultEndDate = endDate || new Date().toISOString().split('T')[0]

    console.log('🏭 Getting production schedule...', {
      startDate: defaultStartDate,
      endDate: defaultEndDate,
      status,
      includeArchived
    })

    // Build query for orders with items and products
    let ordersQuery = supabase
      .from('orders')
      .select(`
        id,
        sequence_number,
        status,
        created_at,
        is_archived,
        user:users!orders_user_id_fkey (
          id,
          email,
          company_name,
          contact_name,
          customer_code
        ),
        items:order_items (
          id,
          quantity,
          unit_price,
          product:products!order_items_product_id_fkey (
            id,
            name,
            category,
            unit,
            description,
            bean_origin,
            roast_level,
            production_weight_per_unit,
            production_unit,
            production_notes,
            processing_method,
            flavor_profile
          )
        )
      `)
      .gte('created_at', `${defaultStartDate}T00:00:00.000Z`)
      .lte('created_at', `${defaultEndDate}T23:59:59.999Z`)
      .order('created_at', { ascending: false })

    // Apply status filter
    if (status !== 'all') {
      ordersQuery = ordersQuery.eq('status', status.toUpperCase())
    }
    
    // Always exclude cancelled orders from production schedule
    ordersQuery = ordersQuery.neq('status', 'CANCELLED')

    // Apply archive filter
    if (!includeArchived) {
      ordersQuery = ordersQuery.eq('is_archived', false)
    }

    const { data: orders, error: ordersError } = await ordersQuery

    if (ordersError) {
      console.error('❌ Error fetching orders:', ordersError)
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }

    console.log(`📦 Found ${orders?.length || 0} orders`)

    // Process orders into production items
    const productionMap = new Map<string, ProductionItem>()
    const ordersByStatus: Record<string, number> = {}
    
    orders?.forEach(order => {
      // Count orders by status
      ordersByStatus[order.status] = (ordersByStatus[order.status] || 0) + 1

      // Process each item in the order
      order.items?.forEach((item: any) => {
        const product = item.product
        const productId = product.id
        
        if (!productionMap.has(productId)) {
          const productionWeightPerUnit = product.production_weight_per_unit || 5.0
          productionMap.set(productId, {
            productId: productId,
            productName: product.name,
            category: product.category,
            unit: product.unit,
            totalQuantity: 0,
            totalProductionWeight: 0,
            orderCount: 0,
            productionDetails: {
              beanOrigin: product.bean_origin,
              roastLevel: product.roast_level,
              productionWeightPerUnit: productionWeightPerUnit,
              productionUnit: product.production_unit || 'lbs',
              productionNotes: product.production_notes,
              processingMethod: product.processing_method,
              flavorProfile: product.flavor_profile
            },
            orders: []
          })
        }

        const productionItem = productionMap.get(productId)!
        const productionWeightPerUnit = productionItem.productionDetails.productionWeightPerUnit || 5.0
        const orderProductionWeight = item.quantity * productionWeightPerUnit
        
        productionItem.totalQuantity += item.quantity
        productionItem.totalProductionWeight += orderProductionWeight
        
        // Add order details if not already present
        if (!productionItem.orders.find(o => o.orderId === order.id)) {
          productionItem.orderCount += 1
          productionItem.orders.push({
            orderId: order.id,
            orderNumber: generateOrderNumberWithSequence(
              order.sequence_number, 
              order.created_at, 
              (order.user as any)?.customer_code
            ),
            customerName: (order.user as any)?.company_name || (order.user as any)?.contact_name || (order.user as any)?.email || 'Unknown Customer',
            quantity: item.quantity,
            productionWeight: orderProductionWeight,
            status: order.status,
            dueDate: order.created_at
          })
        } else {
          // Update quantity if order already exists
          const existingOrder = productionItem.orders.find(o => o.orderId === order.id)
          if (existingOrder) {
            existingOrder.quantity += item.quantity
            existingOrder.productionWeight += orderProductionWeight
          }
        }
      })
    })

    // Convert map to array and sort by total quantity descending
    const productionItems = Array.from(productionMap.values())
      .sort((a, b) => b.totalQuantity - a.totalQuantity)

    // Calculate summary statistics
    const totalQuantity = productionItems.reduce((sum, item) => sum + item.totalQuantity, 0)
    const byCategory: Record<string, { quantity: number; products: number }> = {}
    
    productionItems.forEach(item => {
      if (!byCategory[item.category]) {
        byCategory[item.category] = { quantity: 0, products: 0 }
      }
      byCategory[item.category].quantity += item.totalQuantity
      byCategory[item.category].products += 1
    })

    const productionSchedule: ProductionSchedule = {
      dateRange: {
        startDate: defaultStartDate,
        endDate: defaultEndDate
      },
      totalItems: productionItems.length,
      totalOrders: orders?.length || 0,
      productionItems,
      ordersByStatus,
      summary: {
        totalProducts: productionItems.length,
        totalQuantity,
        byCategory
      }
    }

    console.log('✅ Production schedule generated:', {
      items: productionItems.length,
      totalQuantity,
      orders: orders?.length || 0
    })

    return NextResponse.json(productionSchedule)

  } catch (error) {
    console.error('❌ Error in production schedule:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderIds, status } = await request.json()

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: 'Order IDs are required' }, { status: 400 })
    }

    if (!status || !['PENDING', 'CONFIRMED', 'SHIPPED', 'CANCELLED'].includes(status)) {
      return NextResponse.json({ error: 'Valid status is required' }, { status: 400 })
    }

    console.log('🔄 Updating production order statuses...', { orderIds, status })

    // Update order statuses
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .in('id', orderIds)
      .select('id, sequence_number, status')

    if (error) {
      console.error('❌ Error updating order statuses:', error)
      return NextResponse.json({ error: 'Failed to update orders' }, { status: 500 })
    }

    console.log(`✅ Updated ${data?.length || 0} orders to ${status}`)

    return NextResponse.json({ 
      message: `Updated ${data?.length || 0} orders to ${status}`,
      updatedOrders: data
    })

  } catch (error) {
    console.error('❌ Error updating production orders:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

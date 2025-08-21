import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { getAllOrders, createOrder, getUserById, getAllProducts } from '../../../../lib/supabase-admin'
import { generateOrderNumber } from '../../../../lib/orderUtils'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')
    const userId = searchParams.get('userId')
    const customerId = searchParams.get('customerId')
    const includeArchived = searchParams.get('includeArchived') === 'true'
    const archivedOnly = searchParams.get('archivedOnly') === 'true'

    // Get all orders using Supabase function
    const allOrders = await getAllOrders({
      includeArchived,
      archivedOnly,
      userId: userId || customerId || undefined // Support both parameter names for backward compatibility
    })

    // Filter by userId if specified
    let filteredOrders = allOrders
    if (userId) {
      filteredOrders = allOrders.filter(order => order.user?.id === userId)
    }

    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex)

    // Transform orders to match expected format with order numbers
    const transformedOrders = paginatedOrders.map(order => ({
      ...order,
      orderNumber: generateOrderNumber({
        sequenceNumber: order.sequenceNumber,
        createdAt: order.createdAt,
        user: order.user || { customerCode: null }
      })
    }))

    return NextResponse.json({
      orders: transformedOrders,
      pagination: {
        total: filteredOrders.length,
        page,
        limit,
        totalPages: Math.ceil(filteredOrders.length / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching admin orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { customerId, items, notes } = await request.json()

    // Validate request
    if (!customerId || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Customer ID and items are required' },
        { status: 400 }
      )
    }

    // Verify customer exists and has customerCode
    const customer = await getUserById(customerId)

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    if (!customer.customerCode) {
      return NextResponse.json(
        { error: 'Customer does not have a customer code assigned' },
        { status: 400 }
      )
    }

    // Get all products to validate and calculate prices
    const allProducts = await getAllProducts()
    const productMap = new Map(allProducts.map(p => [p.id, p]))

    // Verify all products exist and calculate total
    let total = 0
    const orderItemsWithPrice = items.map((item: { productId: string, quantity: number }) => {
      const product = productMap.get(item.productId)
      if (!product || !product.isActive) {
        throw new Error(`Product ${item.productId} not found or inactive`)
      }
      
      const price = product.price
      const quantity = item.quantity
      total += price * quantity
      
      return {
        product_id: item.productId,
        quantity,
        unit_price: price
      }
    })

    // Create the order using Supabase function
    const newOrder = await createOrder({
      user_id: customerId,
      total_amount: total,
      status: 'PENDING',
      notes,
      items: orderItemsWithPrice
    })

    // Transform the response to match expected format
    const transformedOrder = {
      id: newOrder.id,
      sequenceNumber: newOrder.sequence_number,
      orderNumber: generateOrderNumber({
        sequenceNumber: newOrder.sequence_number,
        createdAt: newOrder.created_at,
        user: { customerCode: customer.customerCode }
      }),
      user: {
        id: customer.id,
        email: customer.email,
        companyName: customer.companyName,
        contactName: customer.contactName,
        phone: customer.phone,
        customerCode: customer.customerCode
      },
      total: newOrder.total_amount,
      status: newOrder.status,
      notes: newOrder.notes,
      createdAt: newOrder.created_at,
      items: newOrder.items?.map((item: any) => {
        const product = productMap.get(item.product_id)
        return {
          id: item.id,
          quantity: item.quantity,
          price: item.unit_price,
          product: {
            name: product?.name || 'Unknown',
            category: product?.category || 'Unknown',
            unit: product?.unit || 'Unknown'
          }
        }
      }) || []
    }

    return NextResponse.json(transformedOrder, { status: 201 })
  } catch (error) {
    console.error('Error creating admin order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

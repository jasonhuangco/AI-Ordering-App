import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { getOrdersByUserId, createOrder, getAllProducts } from '../../../lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const limit = url.searchParams.get('limit')

    const orders = await getOrdersByUserId(session.user.id)
    
    // Apply limit if specified
    const limitedOrders = limit ? orders.slice(0, parseInt(limit)) : orders

    return NextResponse.json(limitedOrders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { items, notes } = body

    // Get all products to validate and get current prices
    const allProducts = await getAllProducts()
    const productMap = new Map(allProducts.map(p => [p.id, p]))

    // Validate products and calculate total with current prices
    let total = 0
    const orderItems = []

    for (const item of items) {
      const product = productMap.get(item.productId)
      if (!product || !product.isActive) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found or inactive` },
          { status: 400 }
        )
      }
      
      // Use current product price, not the price from the request
      const currentPrice = product.price
      const quantity = item.quantity
      total += currentPrice * quantity

      orderItems.push({
        product_id: item.productId,
        quantity: quantity,
        unit_price: currentPrice
      })
    }

    // Create order using Supabase
    const order = await createOrder({
      user_id: session.user.id,
      total_amount: total,
      notes,
      items: orderItems
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

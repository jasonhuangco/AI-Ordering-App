import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../../lib/auth'
import { supabaseAdmin } from '../../../../../../lib/supabase-admin'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const customerId = params.id
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30'

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(period))

    // Get customer details
    const { data: customer, error: customerError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', customerId)
      .single()

    if (customerError || !customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Get customer orders with items
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        total_amount,
        status,
        created_at,
        order_items (
          id,
          quantity,
          unit_price,
          products (
            id,
            name,
            category
          )
        )
      `)
      .eq('user_id', customerId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false })

    if (ordersError) {
      console.error('Error fetching customer orders:', ordersError)
      throw ordersError
    }

    // Calculate customer-specific metrics
    const totalOrders = orders?.length || 0
    const totalSpent = orders?.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0) || 0
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0

    // Order frequency
    const daysSinceFirstOrder = orders && orders.length > 0 
      ? Math.ceil((new Date().getTime() - new Date(orders[orders.length - 1].created_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0
    const orderFrequency = daysSinceFirstOrder > 0 ? totalOrders / (daysSinceFirstOrder / 30) : 0 // orders per month

    // Most ordered products
    const productOrders = orders?.reduce((acc: any, order: any) => {
      order.order_items?.forEach((item: any) => {
        const productId = item.products?.id
        if (!acc[productId]) {
          acc[productId] = {
            id: productId,
            name: item.products?.name || 'Unknown Product',
            category: item.products?.category || 'Unknown',
            totalQuantity: 0,
            totalSpent: 0,
            orderCount: 0
          }
        }
        acc[productId].totalQuantity += item.quantity || 0
        acc[productId].totalSpent += (item.quantity || 0) * (item.unit_price || 0)
        acc[productId].orderCount += 1
      })
      return acc
    }, {}) || {}

    const favoriteProducts = Object.values(productOrders)
      .sort((a: any, b: any) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5)

    // Spending by category
    const spendingByCategory = Object.values(productOrders).reduce((acc: any, product: any) => {
      acc[product.category] = (acc[product.category] || 0) + product.totalSpent
      return acc
    }, {})

    // Monthly spending trend
    const monthlySpending = orders?.reduce((acc: any, order: any) => {
      const month = new Date(order.created_at).toISOString().slice(0, 7) // YYYY-MM format
      acc[month] = (acc[month] || 0) + (order.total_amount || 0)
      return acc
    }, {}) || {}

    const spendingTrend = Object.entries(monthlySpending)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month))

    // Order status distribution
    const ordersByStatus = orders?.reduce((acc: any, order: any) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {}) || {}

    return NextResponse.json({
      customer: {
        id: customer.id,
        email: customer.email,
        companyName: customer.company_name,
        contactName: customer.contact_name,
        customerCode: customer.customer_code,
        createdAt: customer.created_at
      },
      metrics: {
        totalOrders,
        totalSpent,
        averageOrderValue,
        orderFrequency: Math.round(orderFrequency * 100) / 100,
        daysSinceFirstOrder
      },
      favoriteProducts,
      spendingByCategory,
      spendingTrend,
      ordersByStatus,
      recentOrders: orders?.slice(0, 10) || [],
      period: {
        days: parseInt(period),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    })

  } catch (error) {
    console.error('Error fetching customer analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer analytics' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { supabaseAdmin } from '../../../../lib/supabase-admin'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

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
    const period = searchParams.get('period') || '30' // days
    const customerFilter = searchParams.get('customer')

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(period))

    // Base query conditions
    let orderQuery = supabaseAdmin
      .from('orders')
      .select(`
        id,
        user_id,
        total_amount,
        status,
        created_at,
        users (
          email,
          company_name,
          contact_name
        ),
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
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .not('status', 'eq', 'CANCELLED') // Exclude cancelled orders from analytics
      .order('created_at', { ascending: false })

    if (customerFilter) {
      orderQuery = orderQuery.eq('user_id', customerFilter)
    }

    const { data: orders, error: ordersError } = await orderQuery

    if (ordersError) {
      console.error('Error fetching orders for analytics:', ordersError)
      throw ordersError
    }

    // Calculate analytics metrics
    const totalOrders = orders?.length || 0
    const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Orders by status
    const ordersByStatus = orders?.reduce((acc: any, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {}) || {}

    // Revenue by customer
    const revenueByCustomer = orders?.reduce((acc: any, order) => {
      const user = Array.isArray(order.users) ? order.users[0] : order.users
      const customerKey = user?.email || 'Unknown'
      if (!acc[customerKey]) {
        acc[customerKey] = {
          email: user?.email,
          companyName: user?.company_name,
          contactName: user?.contact_name,
          totalRevenue: 0,
          orderCount: 0
        }
      }
      acc[customerKey].totalRevenue += order.total_amount || 0
      acc[customerKey].orderCount += 1
      return acc
    }, {}) || {}

    // Top customers (by revenue)
    const topCustomers = Object.values(revenueByCustomer)
      .sort((a: any, b: any) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10)

    // Product sales analysis
    const productSales = orders?.reduce((acc: any, order) => {
      order.order_items?.forEach((item: any) => {
        const productId = item.products?.id
        const productName = item.products?.name || 'Unknown Product'
        const category = item.products?.category || 'Unknown'
        
        if (!acc[productId]) {
          acc[productId] = {
            id: productId,
            name: productName,
            category: category,
            totalQuantity: 0,
            totalRevenue: 0,
            orderCount: 0
          }
        }
        
        acc[productId].totalQuantity += item.quantity || 0
        acc[productId].totalRevenue += (item.quantity || 0) * (item.unit_price || 0)
        acc[productId].orderCount += 1
      })
      return acc
    }, {}) || {}

    // Top products (by revenue)
    const topProducts = Object.values(productSales)
      .sort((a: any, b: any) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10)

    // Revenue by category
    const revenueByCategory = Object.values(productSales).reduce((acc: any, product: any) => {
      acc[product.category] = (acc[product.category] || 0) + product.totalRevenue
      return acc
    }, {})

    // Daily revenue trend
    const dailyRevenue = orders?.reduce((acc: any, order) => {
      const date = new Date(order.created_at).toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + (order.total_amount || 0)
      return acc
    }, {}) || {}

    // Convert to array and sort by date
    const revenueTrend = Object.entries(dailyRevenue)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Weekly comparison
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

    const thisWeekOrders = orders?.filter(order => 
      new Date(order.created_at) >= oneWeekAgo
    ) || []
    const lastWeekOrders = orders?.filter(order => {
      const orderDate = new Date(order.created_at)
      return orderDate >= twoWeeksAgo && orderDate < oneWeekAgo
    }) || []

    const thisWeekRevenue = thisWeekOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
    const lastWeekRevenue = lastWeekOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
    const revenueGrowth = lastWeekRevenue > 0 
      ? ((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100 
      : thisWeekRevenue > 0 ? 100 : 0

    return NextResponse.json({
      summary: {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        revenueGrowth: Math.round(revenueGrowth * 100) / 100
      },
      ordersByStatus,
      topCustomers,
      topProducts,
      revenueByCategory,
      revenueTrend,
      period: {
        days: parseInt(period),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    })

  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

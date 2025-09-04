import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { supabaseAdmin } from '../../../../lib/supabase-admin'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const orderId = params.id

    // Fetch the order with related data
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        users!inner(id, email, company_name, contact_name, customer_code),
        order_items (
          *,
          products (*)
        )
      `)
      .eq('id', orderId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        )
      }
      throw error
    }

    // Check authorization - customers can only see their own orders, admins can see all
    if (session.user.role !== 'ADMIN' && order.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Convert field names from snake_case to camelCase
    const formattedOrder = {
      id: order.id,
      userId: order.user_id,
      sequenceNumber: order.sequence_number,
      total: order.total_amount, // This is the key fix!
      status: order.status,
      notes: order.notes,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      user: order.users ? {
        id: order.users.id,
        email: order.users.email,
        companyName: order.users.company_name,
        contactName: order.users.contact_name,
        customerCode: order.users.customer_code
      } : null,
      items: order.order_items?.map((item: any) => ({
        id: item.id,
        orderId: item.order_id,
        productId: item.product_id,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        product: item.products ? {
          id: item.products.id,
          name: item.products.name,
          description: item.products.description,
          category: item.products.category,
          unit: item.products.unit,
          price: item.products.price,
          isGlobal: item.products.is_global,
          isActive: item.products.is_active,
          hidePrices: item.products.hide_prices,
          imageUrl: item.products.image_url,
          createdAt: item.products.created_at,
          updatedAt: item.products.updated_at
        } : null
      })) || []
    }

    return NextResponse.json(formattedOrder)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

export async function PATCH(
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

    const orderId = params.id
    const body = await request.json()
    const { status } = body

    // Update the order
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select(`
        *,
        users!inner(id, email, company_name, contact_name, customer_code),
        order_items (
          *,
          products (*)
        )
      `)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        )
      }
      throw error
    }

    // Convert field names from snake_case to camelCase
    const formattedOrder = {
      id: order.id,
      userId: order.user_id,
      sequenceNumber: order.sequence_number,
      total: order.total_amount,
      status: order.status,
      notes: order.notes,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      user: order.users ? {
        id: order.users.id,
        email: order.users.email,
        companyName: order.users.company_name,
        contactName: order.users.contact_name,
        customerCode: order.users.customer_code
      } : null,
      items: order.order_items?.map((item: any) => ({
        id: item.id,
        orderId: item.order_id,
        productId: item.product_id,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        product: item.products ? {
          id: item.products.id,
          name: item.products.name,
          description: item.products.description,
          category: item.products.category,
          unit: item.products.unit,
          price: item.products.price,
          isGlobal: item.products.is_global,
          isActive: item.products.is_active,
          hidePrices: item.products.hide_prices,
          imageUrl: item.products.image_url,
          createdAt: item.products.created_at,
          updatedAt: item.products.updated_at
        } : null
      })) || []
    }

    return NextResponse.json(formattedOrder)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}

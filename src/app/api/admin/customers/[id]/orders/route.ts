import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../../lib/auth'
import { getAllOrders } from '../../../../../../lib/supabase-admin'

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
    const includeArchived = searchParams.get('includeArchived') === 'true'
    const archivedOnly = searchParams.get('archivedOnly') === 'true'

    // Get orders for this specific customer
    const orders = await getAllOrders({
      userId: customerId,
      includeArchived,
      archivedOnly
    })

    return NextResponse.json({
      orders,
      customer: {
        id: customerId
      }
    })
  } catch (error) {
    console.error('Error fetching customer orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer orders' },
      { status: 500 }
    )
  }
}

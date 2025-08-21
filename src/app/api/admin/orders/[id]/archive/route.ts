import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../../lib/auth'
import { archiveOrder, unarchiveOrder } from '../../../../../../lib/supabase-admin'

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
    const { action } = body

    if (action !== 'archive' && action !== 'unarchive') {
      return NextResponse.json(
        { error: 'Invalid action. Must be "archive" or "unarchive"' },
        { status: 400 }
      )
    }

    let result
    if (action === 'archive') {
      result = await archiveOrder(orderId)
    } else {
      result = await unarchiveOrder(orderId)
    }

    return NextResponse.json({
      success: true,
      message: `Order ${action}d successfully`,
      order: result
    })
  } catch (error) {
    console.error(`Error archiving/unarchiving order:`, error)
    return NextResponse.json(
      { error: `Failed to modify order archive status` },
      { status: 500 }
    )
  }
}

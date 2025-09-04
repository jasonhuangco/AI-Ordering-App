import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { bulkUpdateProducts, bulkDeleteProducts } from '../../../../lib/supabase-admin'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, productIds, updates } = body

    // Validate required fields
    if (!action || !productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: action and productIds array' },
        { status: 400 }
      )
    }

    let result

    switch (action) {
      case 'delete':
        result = await bulkDeleteProducts(productIds)
        return NextResponse.json({ 
          success: true, 
          message: `Successfully deleted ${productIds.length} products` 
        })

      case 'updateCategory':
        if (!updates?.category) {
          return NextResponse.json(
            { error: 'Missing category in updates' },
            { status: 400 }
          )
        }
        result = await bulkUpdateProducts(productIds, { category: updates.category })
        return NextResponse.json({ 
          success: true, 
          message: `Successfully updated category for ${productIds.length} products`,
          data: result
        })

      case 'archive':
        // Assuming archive means setting is_active to false
        result = await bulkUpdateProducts(productIds, { is_active: false })
        return NextResponse.json({ 
          success: true, 
          message: `Successfully archived ${productIds.length} products`,
          data: result
        })

      case 'deactivate':
        result = await bulkUpdateProducts(productIds, { is_active: false })
        return NextResponse.json({ 
          success: true, 
          message: `Successfully deactivated ${productIds.length} products`,
          data: result
        })

      case 'activate':
        result = await bulkUpdateProducts(productIds, { is_active: true })
        return NextResponse.json({ 
          success: true, 
          message: `Successfully activated ${productIds.length} products`,
          data: result
        })

      case 'makeGlobal':
        result = await bulkUpdateProducts(productIds, { is_global: true })
        return NextResponse.json({ 
          success: true, 
          message: `Successfully made ${productIds.length} products global`,
          data: result
        })

      case 'makeExclusive':
        result = await bulkUpdateProducts(productIds, { is_global: false })
        return NextResponse.json({ 
          success: true, 
          message: `Successfully made ${productIds.length} products exclusive`,
          data: result
        })

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Error in bulk product operation:', error)
    return NextResponse.json(
      { error: 'Failed to perform bulk operation', details: error },
      { status: 500 }
    )
  }
}

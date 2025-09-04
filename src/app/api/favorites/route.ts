import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { getUserFavorites, addFavorite, getProductById, supabaseAdmin } from '../../../lib/supabase-admin'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const favorites = await getUserFavorites(session.user.id)

    return NextResponse.json(favorites)
  } catch (error) {
    console.error('Failed to fetch favorites:', error)
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
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

    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Check if product exists
    const product = await getProductById(productId)

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if favorite already exists
    try {
      const { data: existingFavorites, error: checkError } = await supabaseAdmin
        .from('favorites')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('product_id', productId)
      
      if (checkError) {
        console.error('Error checking existing favorites:', checkError)
      } else if (existingFavorites && existingFavorites.length > 0) {
        return NextResponse.json(
          { error: 'Product is already in favorites' },
          { status: 409 }
        )
      }
    } catch (error) {
      console.error('Error checking for existing favorite:', error)
      // Continue anyway, let the database constraint handle duplicates
    }

    // Add favorite using Supabase
    const favorite = await addFavorite(session.user.id, productId)

    return NextResponse.json(favorite, { status: 201 })
  } catch (error: any) {
    console.error('Failed to add favorite:', error)
    
    // Handle specific database errors
    if (error?.code === '23505') { // Unique constraint violation
      return NextResponse.json(
        { error: 'Product is already in favorites' },
        { status: 409 }
      )
    }
    
    // Check if it's a Supabase error with more details
    if (error?.message) {
      console.error('Detailed error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
    }
    
    return NextResponse.json(
      { error: 'Failed to add favorite' },
      { status: 500 }
    )
  }
}

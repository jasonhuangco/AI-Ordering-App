import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { getAllProducts, getAllProductsWithCustomers, createProduct, getCustomerVisibleProducts } from '../../../lib/supabase-admin'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // If not authenticated, return empty array
    if (!session?.user?.id) {
      return NextResponse.json([])
    }

    // Get URL search params
    const { searchParams } = new URL(request.url)
    const includeCustomers = searchParams.get('includeCustomers') === 'true'

    let products
    
    // Admin users can see all products
    if (session.user.role === 'ADMIN') {
      if (includeCustomers) {
        products = await getAllProductsWithCustomers()
      } else {
        products = await getAllProducts()
      }
    } else {
      // Customer users can only see global products + assigned products
      products = await getCustomerVisibleProducts(session.user.id)
    }

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
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
    const body = await request.json()
    // Validate required fields
    const { name, description, category, price, unit, isGlobal = true } = body
    if (!name || !description || !category || !price || !unit) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    // Create product in Supabase
    const product = await createProduct({
      name,
      description,
      category,
      price: parseFloat(price),
      unit,
      is_global: isGlobal,
      is_active: true
    })
    return NextResponse.json(product)
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product', details: error },
      { status: 500 }
    )
  }
}

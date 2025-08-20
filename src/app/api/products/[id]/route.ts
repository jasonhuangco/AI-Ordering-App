import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { supabaseAdmin } from '../../../../lib/supabase-admin'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`📦 Getting product ${params.id}...`)
    
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Convert to frontend format
    const formattedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      isGlobal: product.is_global,
      isActive: product.is_active,
      imageUrl: product.image_url,
      createdAt: product.created_at,
      updatedAt: product.updated_at
    }

    return NextResponse.json(formattedProduct)
  } catch (error) {
    console.error('❌ Error fetching product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`📦 Updating product ${params.id}...`)
    
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, price, category, isGlobal, isActive, imageUrl } = body

    // Check if product exists
    const { data: existingProduct, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('id', params.id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Build update data
    const updateData: any = { updated_at: new Date().toISOString() }
    
    if (name !== undefined) updateData.name = name.trim()
    if (description !== undefined) updateData.description = description?.trim() || null
    if (price !== undefined) updateData.price = parseFloat(price)
    if (category !== undefined) updateData.category = category
    if (isGlobal !== undefined) updateData.is_global = Boolean(isGlobal)
    if (isActive !== undefined) updateData.is_active = Boolean(isActive)
    if (imageUrl !== undefined) updateData.image_url = imageUrl?.trim() || null

    const { data: updatedProduct, error: updateError } = await supabaseAdmin
      .from('products')
      .update(updateData)
      .eq('id', params.id)
      .select('*')
      .single()

    if (updateError) {
      console.error('❌ Update error:', updateError)
      return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
    }

    // Convert to frontend format
    const formattedProduct = {
      id: updatedProduct.id,
      name: updatedProduct.name,
      description: updatedProduct.description,
      price: updatedProduct.price,
      category: updatedProduct.category,
      isGlobal: updatedProduct.is_global,
      isActive: updatedProduct.is_active,
      imageUrl: updatedProduct.image_url,
      createdAt: updatedProduct.created_at,
      updatedAt: updatedProduct.updated_at
    }

    console.log('✅ Product updated successfully')
    return NextResponse.json(formattedProduct)
  } catch (error) {
    console.error('❌ Error updating product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`📦 Deleting product ${params.id}...`)
    
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if product exists
    const { data: product, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('id', params.id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if product has orders (optional - could just deactivate instead)
    const { count: orderCount } = await supabaseAdmin
      .from('order_items')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', params.id)

    if (orderCount && orderCount > 0) {
      // Deactivate instead of delete if it has orders
      const { data: deactivatedProduct, error: deactivateError } = await supabaseAdmin
        .from('products')
        .update({ is_active: false })
        .eq('id', params.id)
        .select('id, name, is_active')
        .single()

      if (deactivateError) {
        return NextResponse.json({ error: 'Failed to deactivate product' }, { status: 500 })
      }

      return NextResponse.json({
        message: 'Product has existing orders and was deactivated instead of deleted',
        product: {
          id: deactivatedProduct.id,
          name: deactivatedProduct.name,
          isActive: deactivatedProduct.is_active
        }
      })
    }

    // Delete product
    const { error: deleteError } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      console.error('❌ Delete error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
    }

    console.log('✅ Product deleted successfully')
    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('❌ Error deleting product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

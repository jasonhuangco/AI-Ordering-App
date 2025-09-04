import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { supabaseAdmin } from '../../../../../lib/supabase-admin'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`👤 Getting customer ${params.id}...`)
    
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: customer, error } = await supabaseAdmin
      .from('users')
      .select('id, email, role, is_active, created_at, company_name, contact_name, phone, address, notes, customer_code')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Convert to frontend format
    const formattedCustomer = {
      id: customer.id,
      email: customer.email,
      role: customer.role,
      isActive: customer.is_active,
      createdAt: customer.created_at,
      companyName: customer.company_name,
      contactName: customer.contact_name,
      phone: customer.phone,
      address: customer.address,
      notes: customer.notes,
      customerCode: customer.customer_code
    }

    return NextResponse.json(formattedCustomer)
  } catch (error) {
    console.error('❌ Error fetching customer:', error)
    return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`👤 Updating customer ${params.id}...`)
    
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { email, companyName, contactName, phone, address, notes, isActive, role } = body

    // Check if user exists
    const { data: existingCustomer, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', params.id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check email uniqueness if email is being updated
    if (email !== undefined) {
      const { data: emailExists } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', email.trim().toLowerCase())
        .neq('id', params.id)
        .single()

      if (emailExists) {
        return NextResponse.json({ error: 'Email is already in use' }, { status: 400 })
      }
    }

    // Build update data
    const updateData: any = { updated_at: new Date().toISOString() }
    
    if (email !== undefined) updateData.email = email.trim().toLowerCase()
    if (companyName !== undefined) updateData.company_name = companyName?.trim() || null
    if (contactName !== undefined) updateData.contact_name = contactName?.trim() || null
    if (phone !== undefined) updateData.phone = phone?.trim() || null
    if (address !== undefined) updateData.address = address?.trim() || null
    if (notes !== undefined) updateData.notes = notes?.trim() || null
    if (isActive !== undefined) updateData.is_active = Boolean(isActive)
    
    // Handle role updates
    if (role !== undefined) {
      const validRoles = ['ADMIN', 'MANAGER', 'EMPLOYEE']
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
      }
      updateData.role = role
    }

    const { data: updatedCustomer, error: updateError } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', params.id)
      .select('id, email, role, is_active, created_at, company_name, contact_name, phone, address, notes, customer_code')
      .single()

    if (updateError) {
      console.error('❌ Update error:', updateError)
      return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 })
    }

    // Convert to frontend format
    const formattedCustomer = {
      id: updatedCustomer.id,
      email: updatedCustomer.email,
      role: updatedCustomer.role,
      isActive: updatedCustomer.is_active,
      createdAt: updatedCustomer.created_at,
      companyName: updatedCustomer.company_name,
      contactName: updatedCustomer.contact_name,
      phone: updatedCustomer.phone,
      address: updatedCustomer.address,
      notes: updatedCustomer.notes,
      customerCode: updatedCustomer.customer_code
    }

    console.log('✅ Customer updated successfully')
    return NextResponse.json(formattedCustomer)
  } catch (error) {
    console.error('❌ Error updating customer:', error)
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`👤 Deleting customer ${params.id}...`)
    
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user exists
    const { data: customer, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', params.id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if customer has orders
    const { count: orderCount } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', params.id)

    if (orderCount && orderCount > 0) {
      // Deactivate instead of delete
      const { data: deactivatedCustomer, error: deactivateError } = await supabaseAdmin
        .from('users')
        .update({ is_active: false })
        .eq('id', params.id)
        .select('id, email, is_active')
        .single()

      if (deactivateError) {
        return NextResponse.json({ error: 'Failed to deactivate customer' }, { status: 500 })
      }

      return NextResponse.json({
        message: 'Customer has existing orders and was deactivated instead of deleted',
        customer: {
          id: deactivatedCustomer.id,
          email: deactivatedCustomer.email,
          isActive: deactivatedCustomer.is_active
        }
      })
    }

    // Delete customer
    const { error: deleteError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      console.error('❌ Delete error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 })
    }

    console.log('✅ Customer deleted successfully')
    return NextResponse.json({ message: 'Customer deleted successfully' })
  } catch (error) {
    console.error('❌ Error deleting customer:', error)
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { supabaseAdmin } from '../../../../../lib/supabase-admin'
import bcryptjs from 'bcryptjs'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`👤 Getting user ${params.id}...`)
    
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, role, is_active, company_name, contact_name, created_at, updated_at')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const formattedUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.is_active,
      companyName: user.company_name,
      contactName: user.contact_name,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }

    return NextResponse.json(formattedUser)
  } catch (error) {
    console.error('❌ Error fetching user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`👤 Updating user ${params.id}...`)
    
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, contactName, companyName, isActive, password } = body

    // Prepare update data
    const updateData: any = {}
    
    if (email !== undefined) updateData.email = email
    if (contactName !== undefined) updateData.contact_name = contactName
    if (companyName !== undefined) updateData.company_name = companyName
    if (isActive !== undefined) updateData.is_active = isActive
    if (password) {
      const hashedPassword = await bcryptjs.hash(password, 12)
      updateData.password_hash = hashedPassword
    }

    updateData.updated_at = new Date().toISOString()

    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', params.id)
      .select('id, email, role, is_active, company_name, contact_name, created_at, updated_at')
      .single()

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }

    const formattedUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      isActive: updatedUser.is_active,
      companyName: updatedUser.company_name,
      contactName: updatedUser.contact_name,
      createdAt: updatedUser.created_at,
      updatedAt: updatedUser.updated_at
    }

    console.log('✅ User updated successfully')
    return NextResponse.json(formattedUser)
  } catch (error) {
    console.error('❌ Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`👤 Deleting user ${params.id}...`)
    
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Don't allow deleting the current user
    if (session.user.id === params.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
    }

    console.log('✅ User deleted successfully')
    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('❌ Error deleting user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

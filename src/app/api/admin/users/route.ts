import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { supabaseAdmin } from '../../../../lib/supabase-admin'
import bcrypt from 'bcryptjs'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('👥 Admin users GET request received')
    
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      console.log('❌ Unauthorized admin users access attempt')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🔍 Fetching admin users from database')

    // Get all admin users (excluding passwords)
    const { data: adminUsers, error } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        email,
        role,
        is_active,
        company_name,
        contact_name,
        created_at,
        updated_at
      `)
      .eq('role', 'ADMIN')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Database error fetching admin users:', error)
      throw error
    }

    console.log(`✅ Found ${adminUsers?.length || 0} admin users`)

    // Convert snake_case to camelCase for frontend
    const formattedUsers = adminUsers?.map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.is_active,
      companyName: user.company_name,
      contactName: user.contact_name,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    })) || []

    return NextResponse.json(formattedUsers)
  } catch (error) {
    console.error('❌ Error fetching admin users:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('👥 Admin user creation request received')
    
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      console.log('❌ Unauthorized admin user creation attempt')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { email, password, contactName, companyName } = data

    console.log('📝 Creating admin user:', { email, contactName, companyName })

    // Validate required fields
    if (!email || !password) {
      console.log('❌ Missing required fields')
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking existing user:', checkError)
      throw checkError
    }

    if (existingUser) {
      console.log('❌ User already exists')
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create new admin user
    const { data: newUser, error: createError } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        password_hash: hashedPassword,
        role: 'ADMIN',
        contact_name: contactName || null,
        company_name: companyName || null,
        is_active: true,
      })
      .select(`
        id,
        email,
        role,
        is_active,
        company_name,
        contact_name,
        created_at,
        updated_at
      `)
      .single()

    if (createError) {
      console.error('❌ Error creating admin user:', createError)
      throw createError
    }

    console.log('✅ Admin user created successfully:', newUser.email)

    // Convert snake_case to camelCase for frontend
    const formattedUser = {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      isActive: newUser.is_active,
      companyName: newUser.company_name,
      contactName: newUser.contact_name,
      createdAt: newUser.created_at,
      updatedAt: newUser.updated_at
    }

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      user: formattedUser
    })
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

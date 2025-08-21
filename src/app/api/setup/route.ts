import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabase-admin'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Initial admin setup request received')
    
    // Check if any admin users already exist
    const { data: existingAdmins, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('role', 'ADMIN')

    if (checkError) {
      console.error('❌ Error checking existing admins:', checkError)
      throw checkError
    }

    if (existingAdmins && existingAdmins.length > 0) {
      console.log('❌ Admin users already exist, setup not allowed')
      return NextResponse.json(
        { error: 'Admin users already exist. Use the admin panel to create additional users.' },
        { status: 400 }
      )
    }

    const data = await request.json()
    const { email, password, contactName, companyName } = data

    console.log('📝 Creating initial admin user:', { email, contactName, companyName })

    // Validate required fields
    if (!email || !password) {
      console.log('❌ Missing required fields')
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create initial admin user
    const { data: newUser, error: createError } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        password_hash: hashedPassword,
        role: 'ADMIN',
        contact_name: contactName || null,
        company_name: companyName || 'Roaster Ordering',
        is_active: true,
      })
      .select(`
        id,
        email,
        role,
        is_active,
        company_name,
        contact_name,
        created_at
      `)
      .single()

    if (createError) {
      console.error('❌ Error creating initial admin user:', createError)
      throw createError
    }

    console.log('✅ Initial admin user created successfully:', newUser.email)

    return NextResponse.json({
      success: true,
      message: 'Initial admin user created successfully! You can now login.',
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        companyName: newUser.company_name,
        contactName: newUser.contact_name
      }
    })
  } catch (error) {
    console.error('❌ Error creating initial admin user:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

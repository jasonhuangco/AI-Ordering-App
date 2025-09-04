import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { getUserById, updateUser } from '../../../lib/supabase-admin'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserById(session.user.id)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Convert snake_case to camelCase for frontend consumption
    const formattedUser = {
      id: user.id,
      email: user.email,
      customerCode: user.customer_code,
      companyName: user.company_name,
      contactName: user.contact_name,
      phone: user.phone,
      address: user.address,
      notes: user.notes
    }

    return NextResponse.json(formattedUser)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { companyName, contactName, phone, address, notes } = data

    const updatedUser = await updateUser(session.user.id, {
      company_name: companyName,
      contact_name: contactName,
      phone,
      address,
      notes,
    })

    // Convert snake_case to camelCase for frontend consumption
    const formattedUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      customerCode: updatedUser.customer_code,
      companyName: updatedUser.company_name,
      contactName: updatedUser.contact_name,
      phone: updatedUser.phone,
      address: updatedUser.address,
      notes: updatedUser.notes
    }

    return NextResponse.json(formattedUser)
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

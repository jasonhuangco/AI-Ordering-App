import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../../lib/auth'
import { getUserById, supabaseAdmin } from '../../../../../../lib/supabase-admin'
import bcryptjs from 'bcryptjs'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(
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

    const customerId = params.id

    // Get the customer
    const customer = await getUserById(customerId)

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Generate a temporary password
    const tempPassword = generateTempPassword()

    // Hash the new password
    const hashedPassword = await bcryptjs.hash(tempPassword, 12)

    // Update the customer's password in the database
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ password_hash: hashedPassword })
      .eq('id', customerId)

    if (updateError) {
      console.error('Error updating customer password:', updateError)
      return NextResponse.json(
        { error: 'Failed to reset password' },
        { status: 500 }
      )
    }

    // Log the admin action
    console.log(`Admin ${session.user.email} reset password for customer ${customer.email}`)

    return NextResponse.json({ 
      message: 'Password reset successfully',
      temporaryPassword: tempPassword,
      customerEmail: customer.email
    })
  } catch (error) {
    console.error('Error resetting customer password:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

function generateTempPassword(): string {
  // Generate a random 8-character password with letters and numbers
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let password = ''
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

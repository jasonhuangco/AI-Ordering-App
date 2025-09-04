import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { getUserById, supabaseAdmin } from '../../../../lib/supabase-admin'
import bcryptjs from 'bcryptjs'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Password change request for user:', session.user.id)

    const data = await request.json()
    const { currentPassword, newPassword } = data

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Get the user's current password hash
    const user = await getUserById(session.user.id)

    if (!user) {
      console.error('User not found with ID:', session.user.id)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify current password
    if (!user.password_hash || user.password_hash === '') {
      return NextResponse.json(
        { error: 'No password is set for your account. Please contact administrator.' },
        { status: 400 }
      )
    }

    const isCurrentPasswordValid = await bcryptjs.compare(currentPassword, user.password_hash)
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      )
    }

    // Hash the new password
    const hashedNewPassword = await bcryptjs.hash(newPassword, 12)

    // Update the password in the database
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ password_hash: hashedNewPassword })
      .eq('id', session.user.id)

    if (updateError) {
      console.error('Error updating password:', updateError)
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Password updated successfully' })
  } catch (error) {
    console.error('Error updating password:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

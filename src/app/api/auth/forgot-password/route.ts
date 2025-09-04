import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail, supabaseAdmin } from '../../../../lib/supabase-admin'
import bcryptjs from 'bcryptjs'
import emailService from '../../../../lib/emailService'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const trimmedEmail = email.trim().toLowerCase()

    // Check if user exists
    const user = await getUserByEmail(trimmedEmail)

    // Always return success message to prevent email enumeration attacks
    if (!user || !user.is_active) {
      // For security, we don't reveal if the email exists or not
      return NextResponse.json({ 
        message: 'If an account with that email exists, you will receive a password reset email shortly.' 
      })
    }

    // Check if email service is configured
    if (!emailService.isConfigured()) {
      console.error('Email service not configured')
      return NextResponse.json({
        error: 'Email service is not configured. Please contact administrator.'
      }, { status: 500 })
    }

    // Generate a temporary password
    const tempPassword = generateTempPassword()

    // Hash the new password
    const hashedPassword = await bcryptjs.hash(tempPassword, 12)

    // Update the user's password in the database
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ password_hash: hashedPassword })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating user password:', updateError)
      return NextResponse.json({
        error: 'Failed to reset password'
      }, { status: 500 })
    }

    // Send email with temporary password
    const emailSent = await emailService.sendPasswordReset({
      email: user.email,
      customerName: user.contact_name || user.company_name || 'Customer',
      temporaryPassword: tempPassword,
      companyName: user.company_name || undefined
    })

    if (!emailSent) {
      // Password was reset but email failed - log this
      console.error(`Password reset for ${user.email} but email failed to send. Temp password: ${tempPassword}`)
      
      return NextResponse.json({
        error: 'Password was reset but email could not be sent. Please contact administrator.'
      }, { status: 500 })
    }

    // Log the successful password reset
    console.log(`Password reset email sent to ${user.email}`)

    return NextResponse.json({ 
      message: 'If an account with that email exists, you will receive a password reset email shortly.' 
    })

  } catch (error) {
    console.error('Error in forgot password:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

function generateTempPassword(): string {
  // Generate a random 10-character password with letters, numbers, and some symbols
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%'
  let password = ''
  
  // Ensure at least one uppercase, one lowercase, one number
  password += 'ABCDEFGHJKMNPQRSTUVWXYZ'[Math.floor(Math.random() * 24)]
  password += 'abcdefghijkmnpqrstuvwxyz'[Math.floor(Math.random() * 24)]
  password += '23456789'[Math.floor(Math.random() * 8)]
  
  // Fill the rest randomly
  for (let i = 3; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

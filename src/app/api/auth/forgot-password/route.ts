import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail, supabaseAdmin } from '../../../../lib/supabase-admin'
import bcryptjs from 'bcryptjs'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// EmailJS configuration for server-side use
const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || ''
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || ''
const PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY || ''
const PASSWORD_RESET_TEMPLATE = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_PASSWORD_RESET || ''

// Server-side email sending using EmailJS REST API
async function sendEmailViaREST(templateId: string, params: any): Promise<boolean> {
  if (!SERVICE_ID || !templateId || !PUBLIC_KEY) {
    console.error('EmailJS not configured properly', { 
      SERVICE_ID: !!SERVICE_ID, 
      templateId: !!templateId, 
      PUBLIC_KEY: !!PUBLIC_KEY 
    })
    return false
  }

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: SERVICE_ID,
        template_id: templateId,
        user_id: PUBLIC_KEY,
        accessToken: PRIVATE_KEY || undefined,
        template_params: params
      })
    })

    if (response.ok) {
      console.log('Email sent successfully via REST API')
      return true
    } else {
      const errorText = await response.text()
      console.error('EmailJS REST API error:', response.status, errorText)
      return false
    }
  } catch (error) {
    console.error('Failed to send email via REST API:', error)
    return false
  }
}

function isEmailConfigured(): boolean {
  return !!(SERVICE_ID && PUBLIC_KEY && PASSWORD_RESET_TEMPLATE)
}

export async function POST(request: NextRequest) {
  try {
    console.log('Forgot password request received')
    
    const { email } = await request.json()

    if (!email || !email.trim()) {
      console.log('Missing email in request')
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const trimmedEmail = email.trim().toLowerCase()
    console.log(`Processing forgot password for email: ${trimmedEmail}`)

    // Check if user exists
    const user = await getUserByEmail(trimmedEmail)

    // Always return success message to prevent email enumeration attacks
    if (!user || !user.is_active) {
      console.log(`User not found or inactive for email: ${trimmedEmail}`)
      // For security, we don't reveal if the email exists or not
      return NextResponse.json({ 
        message: 'If an account with that email exists, you will receive a password reset email shortly.' 
      })
    }

    console.log(`User found: ${user.contact_name || user.company_name}`)

    // Check if email service is configured
    console.log('Email service config:', {
      serviceId: !!SERVICE_ID,
      publicKey: !!PUBLIC_KEY,
      privateKey: !!PRIVATE_KEY,
      template: !!PASSWORD_RESET_TEMPLATE
    })
    
    if (!isEmailConfigured()) {
      console.error('Email service not configured properly')
      return NextResponse.json({
        error: 'Email service is not configured. Please contact administrator.'
      }, { status: 500 })
    }

    // Generate a temporary password
    const tempPassword = generateTempPassword()
    console.log('Generated temporary password')

    // Hash the new password
    const hashedPassword = await bcryptjs.hash(tempPassword, 12)
    console.log('Password hashed successfully')

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
    console.log('Attempting to send password reset email...')
    
    const emailParams = {
      to_email: user.email,
      to_name: user.contact_name || user.company_name || 'Customer',
      from_name: user.company_name || 'Coffee Ordering System',
      subject: 'Password Reset - Temporary Password',
      temporary_password: tempPassword,
      customer_name: user.contact_name || user.company_name || 'Customer',
      company_name: user.company_name || 'Coffee Ordering System'
    }
    
    const emailResult = await sendEmailViaREST(PASSWORD_RESET_TEMPLATE, emailParams)
    console.log('Email service result:', emailResult)

    if (!emailResult) {
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
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    // Check for specific error types
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network error - likely EmailJS configuration issue')
    }

    return NextResponse.json(
      { error: 'An error occurred while processing your request. Please try again later.' },
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

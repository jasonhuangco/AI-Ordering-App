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
  console.log('=== EMAIL SERVICE START ===')
  
  if (!SERVICE_ID || !templateId || !PUBLIC_KEY) {
    console.error('EmailJS configuration missing:', { 
      SERVICE_ID: SERVICE_ID ? 'SET' : 'MISSING',
      templateId: templateId ? 'SET' : 'MISSING',
      PUBLIC_KEY: PUBLIC_KEY ? 'SET' : 'MISSING'
    })
    return false
  }

  try {
    console.log('Preparing EmailJS request...')
    
    const requestBody = {
      service_id: SERVICE_ID,
      template_id: templateId,
      user_id: PUBLIC_KEY,
      accessToken: PRIVATE_KEY,
      template_params: params
    }
    
    console.log('Request body prepared:', {
      service_id: SERVICE_ID,
      template_id: templateId,
      user_id: PUBLIC_KEY ? 'SET' : 'MISSING',
      accessToken: PRIVATE_KEY ? 'SET' : 'NOT_SET',
      template_params_keys: Object.keys(params)
    })

    console.log('Making fetch request to EmailJS API...')
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    console.log('EmailJS API response status:', response.status)
    console.log('EmailJS API response ok:', response.ok)

    if (response.ok) {
      console.log('Email sent successfully via REST API')
      console.log('=== EMAIL SERVICE END (SUCCESS) ===')
      return true
    } else {
      const errorText = await response.text()
      console.error('EmailJS REST API error details:')
      console.error('Status:', response.status)
      console.error('Status Text:', response.statusText)
      console.error('Response Body:', errorText)
      
      // Try to parse error response
      try {
        const errorJson = JSON.parse(errorText)
        console.error('Parsed error:', errorJson)
      } catch (parseError) {
        console.error('Could not parse error response as JSON')
      }
      
      console.log('=== EMAIL SERVICE END (API ERROR) ===')
      return false
    }
  } catch (error) {
    console.error('Failed to send email via REST API - Exception thrown:')
    
    if (error instanceof Error) {
      console.error('Error type:', error.constructor.name)
      console.error('Error message:', error.message)
      
      if (error instanceof TypeError) {
        console.error('Network error - check internet connectivity or EmailJS API status')
      }
      
      if (error.stack) {
        console.error('Error stack:', error.stack)
      }
    } else {
      console.error('Unknown error type:', typeof error)
      console.error('Error value:', error)
    }
    
    console.log('=== EMAIL SERVICE END (EXCEPTION) ===')
    return false
  }
}

function isEmailConfigured(): boolean {
  return !!(SERVICE_ID && PUBLIC_KEY && PASSWORD_RESET_TEMPLATE)
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== FORGOT PASSWORD REQUEST START ===')
    console.log('Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      SERVICE_ID_SET: !!SERVICE_ID,
      PUBLIC_KEY_SET: !!PUBLIC_KEY,
      TEMPLATE_SET: !!PASSWORD_RESET_TEMPLATE,
      PRIVATE_KEY_SET: !!PRIVATE_KEY
    })
    
    let requestData
    try {
      requestData = await request.json()
    } catch (parseError) {
      console.error('Failed to parse request JSON:', parseError)
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      )
    }

    const { email } = requestData

    if (!email || !email.trim()) {
      console.log('Missing email in request')
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const trimmedEmail = email.trim().toLowerCase()
    console.log(`Processing forgot password for email: ${trimmedEmail}`)

    // Check if user exists - wrap in try/catch for database errors
    console.log('Checking user in database...')
    let user
    try {
      user = await getUserByEmail(trimmedEmail)
    } catch (dbError) {
      console.error('Database error during user lookup:', dbError)
      return NextResponse.json({
        error: 'Database temporarily unavailable. Please try again later.'
      }, { status: 500 })
    }

    // Always return success message to prevent email enumeration attacks
    if (!user || !user.is_active) {
      console.log(`User not found or inactive for email: ${trimmedEmail}`)
      // Still return success for security
      return NextResponse.json({ 
        message: 'If an account with that email exists, you will receive a password reset email shortly.' 
      })
    }

    console.log(`User found: ${user.contact_name || user.company_name}, Role: ${user.role}`)

    // Generate a temporary password - do this early
    const tempPassword = generateTempPassword()
    console.log('Generated temporary password')

    // Hash the new password
    let hashedPassword
    try {
      hashedPassword = await bcryptjs.hash(tempPassword, 12)
      console.log('Password hashed successfully')
    } catch (hashError) {
      console.error('Password hashing error:', hashError)
      return NextResponse.json({
        error: 'Password processing failed. Please try again.'
      }, { status: 500 })
    }

    // Update the user's password in the database
    console.log('Updating password in database...')
    try {
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ password_hash: hashedPassword })
        .eq('id', user.id)

      if (updateError) {
        console.error('Database update error:', updateError)
        throw new Error('Failed to update password in database')
      }
      console.log('Password updated in database successfully')
    } catch (updateError) {
      console.error('Database update failed:', updateError)
      return NextResponse.json({
        error: 'Failed to update password. Please try again.'
      }, { status: 500 })
    }

    // Try to send email - but don't fail if this doesn't work
    let emailSent = false
    if (isEmailConfigured()) {
      console.log('Email service configured, attempting to send email...')
      try {
        const emailParams = {
          to: user.email,
          to_email: user.email,
          to_name: user.contact_name || user.company_name || 'Customer',
          from_name: user.company_name || 'Coffee Ordering System',
          subject: 'Password Reset - Temporary Password',
          temporary_password: tempPassword,
          customer_name: user.contact_name || user.company_name || 'Customer',
          company_name: user.company_name || 'Coffee Ordering System'
        }
        
        emailSent = await sendEmailViaREST(PASSWORD_RESET_TEMPLATE, emailParams)
        console.log('Email service result:', emailSent)
      } catch (emailError) {
        console.error('Email sending failed with exception:', emailError)
        emailSent = false
      }
    } else {
      console.log('Email service not configured - skipping email send')
    }

    if (emailSent) {
      console.log(`Password reset email sent successfully to ${user.email}`)
    } else {
      // Password was reset but email failed - log for admin
      console.error(`ADMIN NOTICE: Password reset completed for ${user.email}`)
      console.error(`Temporary password: ${tempPassword}`)
      console.error('Please provide this password to the user manually.')
    }

    console.log('=== FORGOT PASSWORD REQUEST END ===')
    
    // Always return success to prevent enumeration attacks
    return NextResponse.json({ 
      message: 'If an account with that email exists, you will receive a password reset email shortly.' 
    })

  } catch (error) {
    console.error('=== FORGOT PASSWORD CRITICAL ERROR ===')
    console.error('Unhandled error in forgot password:', error)
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    } else {
      console.error('Non-Error object thrown:', typeof error, error)
    }

    console.error('=== END CRITICAL ERROR LOG ===')

    // Return generic error to user
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later or contact support.' },
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

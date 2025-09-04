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
      accessToken: PRIVATE_KEY || undefined,
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
    console.log('Checking user in database...')
    const user = await getUserByEmail(trimmedEmail)

    // Always return success message to prevent email enumeration attacks
    if (!user || !user.is_active) {
      console.log(`User not found or inactive for email: ${trimmedEmail}`)
      // Still return success for security
      return NextResponse.json({ 
        message: 'If an account with that email exists, you will receive a password reset email shortly.' 
      })
    }

    console.log(`User found: ${user.contact_name || user.company_name}, Role: ${user.role}`)

    // Check if email service is configured
    if (!isEmailConfigured()) {
      console.error('EmailJS not configured properly:', {
        SERVICE_ID: SERVICE_ID ? 'SET' : 'MISSING',
        PUBLIC_KEY: PUBLIC_KEY ? 'SET' : 'MISSING', 
        PASSWORD_RESET_TEMPLATE: PASSWORD_RESET_TEMPLATE ? 'SET' : 'MISSING'
      })
      
      // For now, let's still reset the password but inform about email issue
      // This prevents the feature from being completely broken
      const tempPassword = generateTempPassword()
      const hashedPassword = await bcryptjs.hash(tempPassword, 12)
      
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ password_hash: hashedPassword })
        .eq('id', user.id)

      if (updateError) {
        console.error('Database update error:', updateError)
        throw new Error('Failed to update password in database')
      }
      
      console.error(`Email service not configured. Password reset to: ${tempPassword} for ${user.email}`)
      
      return NextResponse.json({
        error: 'Email service is temporarily unavailable. Please contact administrator for your temporary password.'
      }, { status: 500 })
    }

    // Generate a temporary password
    const tempPassword = generateTempPassword()
    console.log('Generated temporary password')

    // Hash the new password
    const hashedPassword = await bcryptjs.hash(tempPassword, 12)
    console.log('Password hashed successfully')

    // Update the user's password in the database
    console.log('Updating password in database...')
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ password_hash: hashedPassword })
      .eq('id', user.id)

    if (updateError) {
      console.error('Database update error:', updateError)
      throw new Error('Failed to update password in database')
    }
    console.log('Password updated in database successfully')

    // Send email with temporary password
    console.log('Attempting to send password reset email...')
    console.log('Email parameters:', {
      to_email: user.email,
      to_name: user.contact_name || user.company_name || 'Customer',
      template_id: PASSWORD_RESET_TEMPLATE
    })
    
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
      // Password was reset but email failed - log this for admin
      console.error(`IMPORTANT: Password reset for ${user.email} but email failed to send.`)
      console.error(`Temporary password for user: ${tempPassword}`)
      
      // Don't return an error to user for security, but log it
      // In production, you might want to notify admin via different channel
      console.log('Password reset completed but email notification failed - returning success for security')
    } else {
      console.log(`Password reset email sent successfully to ${user.email}`)
    }

    console.log('=== FORGOT PASSWORD REQUEST END ===')
    return NextResponse.json({ 
      message: 'If an account with that email exists, you will receive a password reset email shortly.' 
    })

  } catch (error) {
    console.error('=== FORGOT PASSWORD ERROR ===')
    console.error('Error in forgot password:', error)
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    // Check for specific error types
    if (error instanceof TypeError) {
      console.error('TypeError detected - likely network or API issue')
      if (error.message.includes('fetch')) {
        console.error('Fetch error - likely EmailJS API connectivity issue')
      }
    }

    // Check for Supabase errors
    if (error instanceof Error && error.message.includes('Supabase')) {
      console.error('Supabase error detected')
    }

    console.error('=== END ERROR LOG ===')

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

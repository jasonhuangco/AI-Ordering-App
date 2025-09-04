import emailjs from '@emailjs/browser'

// EmailJS configuration - these should be set in environment variables
const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || ''
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || ''
const PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY || '' // Server-side private key

// Template IDs for different email types
const TEMPLATES = {
  PASSWORD_RESET: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_PASSWORD_RESET || '',
  ORDER_REMINDER: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ORDER_REMINDER || ''
}

// Initialize EmailJS with public key (client-side only)
if (typeof window !== 'undefined' && PUBLIC_KEY) {
  emailjs.init(PUBLIC_KEY)
}

interface EmailParams {
  to_email: string
  to_name: string
  from_name?: string
  subject?: string
  [key: string]: any
}

// Server-side email sending using EmailJS REST API
async function sendEmailViaREST(templateId: string, params: EmailParams): Promise<boolean> {
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

/**
 * Send password reset email with temporary password
 */
export async function sendPasswordReset(params: {
  email: string
  customerName: string
  temporaryPassword: string
  companyName?: string
}): Promise<boolean> {
  if (!SERVICE_ID || !TEMPLATES.PASSWORD_RESET || !PUBLIC_KEY) {
    console.error('EmailJS not configured for password reset')
    return false
  }

  const emailParams: EmailParams = {
    to_email: params.email,
    to_name: params.customerName,
    from_name: params.companyName || 'Coffee Ordering System',
    subject: 'Password Reset - Temporary Password',
    temporary_password: params.temporaryPassword,
    customer_name: params.customerName,
    company_name: params.companyName || 'Coffee Ordering System'
  }

  // Use REST API for server-side calls, browser API for client-side
  if (typeof window === 'undefined') {
    return await sendEmailViaREST(TEMPLATES.PASSWORD_RESET, emailParams)
  } else {
    try {
      const response = await emailjs.send(
        SERVICE_ID,
        TEMPLATES.PASSWORD_RESET,
        emailParams
      )
      console.log('Password reset email sent:', response.status)
      return response.status === 200
    } catch (error) {
      console.error('Failed to send password reset email:', error)
      return false
    }
  }
}

/**
 * Send order reminder email
 */
export async function sendOrderReminder(params: {
  email: string
  customerName: string
  companyName?: string
  reminderMessage?: string
  orderDeadline?: string
}): Promise<boolean> {
  if (!SERVICE_ID || !TEMPLATES.ORDER_REMINDER || !PUBLIC_KEY) {
    console.error('EmailJS not configured for order reminders')
    return false
  }

  const emailParams: EmailParams = {
    to_email: params.email,
    to_name: params.customerName,
    from_name: params.companyName || 'Coffee Ordering System',
    subject: 'Weekly Order Reminder',
    customer_name: params.customerName,
    company_name: params.companyName || 'Coffee Ordering System',
    reminder_message: params.reminderMessage || 'Don\'t forget to place your weekly coffee order!',
    order_deadline: params.orderDeadline || 'End of this week'
  }

  // Use REST API for server-side calls, browser API for client-side
  if (typeof window === 'undefined') {
    return await sendEmailViaREST(TEMPLATES.ORDER_REMINDER, emailParams)
  } else {
    try {
      const response = await emailjs.send(
        SERVICE_ID,
        TEMPLATES.ORDER_REMINDER,
        emailParams
      )
      console.log('Order reminder email sent:', response.status)
      return response.status === 200
    } catch (error) {
      console.error('Failed to send order reminder email:', error)
      return false
    }
  }
}

/**
 * Check if email service is configured
 */
export function isConfigured(): boolean {
  return !!(SERVICE_ID && PUBLIC_KEY && (
    TEMPLATES.PASSWORD_RESET || 
    TEMPLATES.ORDER_REMINDER
  ))
}

/**
 * Get configuration status for debugging
 */
export function getConfigStatus() {
  return {
    serviceId: !!SERVICE_ID,
    publicKey: !!PUBLIC_KEY,
    privateKey: !!PRIVATE_KEY,
    templates: {
      passwordReset: !!TEMPLATES.PASSWORD_RESET,
      orderReminder: !!TEMPLATES.ORDER_REMINDER
    }
  }
}

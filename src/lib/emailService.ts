import emailjs from '@emailjs/browser'

// EmailJS configuration - these should be set in environment variables
const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || ''
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || ''

// Template IDs for different email types
const TEMPLATES = {
  PASSWORD_RESET: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_PASSWORD_RESET || '',
  ORDER_REMINDER: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ORDER_REMINDER || ''
}

// Initialize EmailJS with public key
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

export const emailService = {
  /**
   * Send password reset email with temporary password
   */
  async sendPasswordReset(params: {
    email: string
    customerName: string
    temporaryPassword: string
    companyName?: string
  }): Promise<boolean> {
    if (!SERVICE_ID || !TEMPLATES.PASSWORD_RESET || !PUBLIC_KEY) {
      console.error('EmailJS not configured for password reset')
      return false
    }

    try {
      const emailParams: EmailParams = {
        to_email: params.email,
        to_name: params.customerName,
        from_name: params.companyName || 'Coffee Ordering System',
        subject: 'Password Reset - Temporary Password',
        temporary_password: params.temporaryPassword,
        customer_name: params.customerName,
        company_name: params.companyName || 'Coffee Ordering System'
      }

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
  },

  /**
   * Send order reminder email
   */
  async sendOrderReminder(params: {
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

    try {
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
  },

  /**
   * Check if email service is configured
   */
  isConfigured(): boolean {
    return !!(SERVICE_ID && PUBLIC_KEY && (
      TEMPLATES.PASSWORD_RESET || 
      TEMPLATES.ORDER_REMINDER
    ))
  },

  /**
   * Get configuration status for debugging
   */
  getConfigStatus() {
    return {
      serviceId: !!SERVICE_ID,
      publicKey: !!PUBLIC_KEY,
      templates: {
        passwordReset: !!TEMPLATES.PASSWORD_RESET,
        orderReminder: !!TEMPLATES.ORDER_REMINDER
      }
    }
  }
}

export default emailService

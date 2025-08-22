# Email Reminder System Implementation Guide

## Cost Comparison for Email Services

For your needs (25-30 customers, 1-2x per week = ~250 emails/month):

### 1. **Resend (Recommended - Cheapest)** ⭐
- **Cost**: 3,000 emails/month FREE, then $20/month for 50k emails
- **Monthly cost**: **FREE** (well under limit)
- **Pros**: Modern API, great deliverability, React email templates, generous free tier
- **Cons**: Newer service (but very reliable)

### 2. **SendGrid**
- **Cost**: 100 emails/day FREE (3,000/month), then $19.95/month
- **Monthly cost**: **FREE** (within free tier)
- **Pros**: Established, reliable, good documentation
- **Cons**: More complex setup, dated interface

### 3. **Amazon SES**
- **Cost**: $0.10 per 1,000 emails + $0.12 per 1,000 emails (outbound)
- **Monthly cost**: ~$0.055 (~250 emails × $0.22/1000)
- **Pros**: Cheapest paid option, integrates with AWS
- **Cons**: More complex setup, reputation management needed

### 4. **Mailgun**
- **Cost**: 5,000 emails FREE for 3 months, then $35/month
- **Monthly cost**: **FREE** initially, then expensive
- **Pros**: Developer-friendly API
- **Cons**: Expensive after trial

### 5. **Nodemailer + Gmail SMTP** (Not Recommended)
- **Cost**: FREE but with daily limits (500 emails/day)
- **Monthly cost**: **FREE**
- **Pros**: Quick setup
- **Cons**: Gmail blocks after limits, poor deliverability for business use

## **Winner: Resend** - FREE for your needs

Resend is perfect for your coffee ordering app because:
- **3,000 emails/month FREE** (you need ~250)
- **Modern React email templates**
- **Excellent deliverability rates**
- **Simple API integration**
- **Built for developers**

## Resend Implementation Guide

### Step 1: Resend Setup
1. Create account at [resend.com](https://resend.com)
2. Verify your domain (optional but recommended for better deliverability)
3. Get your API key from dashboard
4. Add sender email address

### Step 2: Install Dependencies

```bash
npm install resend
npm install react-email @react-email/components
```

### Step 3: Environment Variables
Add to your `.env.local`:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxx
EMAIL_FROM=orders@yourdomain.com
EMAIL_ENABLED=true
```

### Step 4: Email Service Implementation

Create `src/lib/email-service.ts`:

```typescript
import { Resend } from 'resend'
import { WeeklyReminderEmail } from '../emails/WeeklyReminderEmail'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailData {
  to: string
  customerName: string
  companyName?: string
  orderUrl: string
  unsubscribeUrl?: string
}

export const sendReminderEmail = async (emailData: EmailData) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'RoasterCo <orders@yourdomain.com>',
      to: emailData.to,
      subject: '☕ Your Weekly Coffee Order Reminder',
      react: WeeklyReminderEmail(emailData)
    })

    if (error) {
      console.error('Email error:', error)
      return { success: false, error }
    }

    return { success: true, id: data?.id }
  } catch (error) {
    console.error('Email service error:', error)
    return { success: false, error: error.message }
  }
}

export const sendBulkReminderEmails = async (emailList: EmailData[]) => {
  const results = []
  
  for (const emailData of emailList) {
    const result = await sendReminderEmail(emailData)
    results.push({ email: emailData.to, ...result })
    
    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  return results
}

// Test email function for admin
export const sendTestEmail = async (to: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'RoasterCo <orders@yourdomain.com>',
      to,
      subject: '🧪 Test Email from RoasterCo',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>🧪 Test Email</h2>
          <p>This is a test email from your RoasterCo ordering system.</p>
          <p>If you received this, your email configuration is working correctly!</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            This is a test message. You can ignore this email.
          </p>
        </div>
      `
    })

    if (error) {
      return { success: false, error }
    }

    return { success: true, id: data?.id }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

### Step 5: React Email Template

Create `src/emails/WeeklyReminderEmail.tsx`:

```tsx
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Link,
  Button,
  Hr,
  Img
} from '@react-email/components'

interface WeeklyReminderEmailProps {
  customerName: string
  companyName?: string
  orderUrl: string
  unsubscribeUrl?: string
}

export const WeeklyReminderEmail = ({
  customerName,
  companyName,
  orderUrl,
  unsubscribeUrl
}: WeeklyReminderEmailProps) => (
  <Html>
    <Head />
    <Preview>Time for your weekly coffee order! ☕</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={header}>
          <Text style={headerText}>☕ RoasterCo</Text>
        </Section>

        {/* Main Content */}
        <Section style={content}>
          <Text style={greeting}>
            Hi {customerName || (companyName ? `${companyName} team` : 'there')}!
          </Text>
          
          <Text style={mainText}>
            It's time for your weekly coffee order! Don't let your office run out of 
            that perfect brew that keeps everyone productive and happy.
          </Text>

          <Section style={buttonContainer}>
            <Button href={orderUrl} style={button}>
              Place Your Order Now ☕
            </Button>
          </Section>

          <Text style={subText}>
            Or copy and paste this link into your browser:
            <br />
            <Link href={orderUrl} style={link}>
              {orderUrl}
            </Link>
          </Text>

          <Hr style={divider} />

          <Text style={footer}>
            Questions? Reply to this email or contact us directly.
            <br />
            <br />
            Best regards,
            <br />
            The RoasterCo Team
          </Text>

          {unsubscribeUrl && (
            <Text style={unsubscribe}>
              <Link href={unsubscribeUrl} style={unsubscribeLink}>
                Unsubscribe from weekly reminders
              </Link>
            </Text>
          )}
        </Section>
      </Container>
    </Body>
  </Html>
)

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const header = {
  padding: '0 48px',
  textAlign: 'center' as const,
}

const headerText = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#8B4513', // Coffee brown
  margin: '0 0 20px',
}

const content = {
  padding: '0 48px',
}

const greeting = {
  fontSize: '18px',
  lineHeight: '1.4',
  color: '#333',
  fontWeight: '500',
}

const mainText = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#555',
  margin: '16px 0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#8B4513', // Coffee brown
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
}

const subText = {
  fontSize: '14px',
  lineHeight: '1.5',
  color: '#666',
  textAlign: 'center' as const,
  margin: '16px 0',
}

const link = {
  color: '#8B4513',
  textDecoration: 'underline',
}

const divider = {
  borderColor: '#e6ebf1',
  margin: '32px 0',
}

const footer = {
  fontSize: '14px',
  lineHeight: '1.5',
  color: '#666',
}

const unsubscribe = {
  fontSize: '12px',
  color: '#8898aa',
  textAlign: 'center' as const,
  marginTop: '32px',
}

const unsubscribeLink = {
  color: '#8898aa',
  textDecoration: 'underline',
}

export default WeeklyReminderEmail
```

### Step 6: Database Schema Updates

Add email preferences to users table:

```sql
ALTER TABLE users ADD COLUMN email_reminders_enabled BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN unsubscribe_token VARCHAR(255);
```

### Step 7: Weekly Email Reminder Job

Create `src/lib/email-reminder-job.ts`:

```typescript
import { sendBulkReminderEmails, EmailData } from './email-service'
import { supabaseAdmin } from './supabase-admin'
import { v4 as uuidv4 } from 'uuid'

export const sendWeeklyEmailReminders = async () => {
  try {
    // Get customers who want email reminders
    const { data: customers } = await supabaseAdmin
      .from('users')
      .select('id, email, contact_name, company_name, email_reminders_enabled, unsubscribe_token')
      .eq('role', 'CUSTOMER')
      .eq('email_reminders_enabled', true)

    if (!customers?.length) {
      console.log('No customers with email reminders enabled')
      return { success: true, sent: 0 }
    }

    // Prepare email data for each customer
    const emailList: EmailData[] = await Promise.all(
      customers.map(async (customer) => {
        // Generate unsubscribe token if doesn't exist
        let unsubscribeToken = customer.unsubscribe_token
        if (!unsubscribeToken) {
          unsubscribeToken = uuidv4()
          await supabaseAdmin
            .from('users')
            .update({ unsubscribe_token: unsubscribeToken })
            .eq('id', customer.id)
        }

        const baseUrl = process.env.NEXTAUTH_URL || 'https://yourapp.vercel.app'
        
        return {
          to: customer.email,
          customerName: customer.contact_name || '',
          companyName: customer.company_name || '',
          orderUrl: `${baseUrl}/order/new`,
          unsubscribeUrl: `${baseUrl}/unsubscribe?token=${unsubscribeToken}`
        }
      })
    )

    console.log(`Sending email reminders to ${emailList.length} customers`)
    const results = await sendBulkReminderEmails(emailList)
    
    // Log results
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length
    
    console.log(`Email Results: ${successful} sent, ${failed} failed`)
    
    return { 
      success: true, 
      sent: successful, 
      failed: failed,
      details: results 
    }
  } catch (error) {
    console.error('Email reminder job error:', error)
    return { success: false, error: error.message }
  }
}
```

### Step 8: API Endpoints

Create `src/app/api/admin/send-email-reminders/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { sendWeeklyEmailReminders } from '../../../../lib/email-reminder-job'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await sendWeeklyEmailReminders()
    
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send email reminders' },
      { status: 500 }
    )
  }
}
```

Create `src/app/api/admin/test-email/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { sendTestEmail } from '../../../../lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const result = await sendTestEmail(email)
    
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    )
  }
}
```

Create unsubscribe handler `src/app/unsubscribe/page.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function UnsubscribePage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    if (token) {
      handleUnsubscribe(token)
    } else {
      setStatus('error')
    }
  }, [token])

  const handleUnsubscribe = async (unsubscribeToken: string) => {
    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: unsubscribeToken })
      })

      if (response.ok) {
        setStatus('success')
      } else {
        setStatus('error')
      }
    } catch (error) {
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8">
        {status === 'loading' && (
          <div>
            <h1 className="text-2xl font-bold text-coffee-dark mb-4">Processing...</h1>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coffee-brown mx-auto"></div>
          </div>
        )}
        
        {status === 'success' && (
          <div>
            <h1 className="text-2xl font-bold text-coffee-dark mb-4">Unsubscribed Successfully</h1>
            <p className="text-coffee-brown mb-4">
              You've been removed from our weekly email reminders.
            </p>
            <p className="text-sm text-gray-600">
              You can still place orders directly on our website anytime.
            </p>
          </div>
        )}
        
        {status === 'error' && (
          <div>
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-600">
              Unable to process your unsubscribe request. Please contact us directly.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
```

## Cost Breakdown (Resend)

- **Email Cost**: FREE up to 3,000 emails/month
- **Your usage**: ~250 emails/month (well under limit)
- **Total monthly cost**: **$0.00**
- **Annual cost**: **$0.00**

## Key Features You Get

✅ **Professional email templates** with React components
✅ **Excellent deliverability** (better than Gmail SMTP)
✅ **Unsubscribe handling** with one-click links
✅ **Bulk email sending** with rate limiting
✅ **Test email functionality** for admin testing
✅ **Branded emails** with your company colors
✅ **Mobile-responsive** email templates
✅ **Tracking and analytics** (opens, clicks, etc.)

## Next Steps

1. **Set up Resend account** and get API key
2. **Add domain verification** for better deliverability (optional)
3. **Implement the code** using the templates above
4. **Test with admin email** using the test endpoint
5. **Add to your weekly reminder scheduler**

## Alternative: SendGrid (Also FREE)

If you prefer SendGrid, the implementation is similar but uses their API:

```bash
npm install @sendgrid/mail
```

Both Resend and SendGrid are FREE for your needs, but Resend has a more modern developer experience with React email templates.

Would you like me to implement the Resend email solution in your existing codebase?

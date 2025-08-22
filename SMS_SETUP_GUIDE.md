# SMS Reminder System Implementation Guide

## Important: AWS SNS Phone Number Behavior

⚠️ **Key Limitation**: AWS SNS does NOT provide a consistent phone number. Each SMS appears to come from a different random number.

**What customers see**:
- Week 1: SMS from `+15551234567`
- Week 2: SMS from `+15559876543` 
- Week 3: SMS from `+15552468135`

**Solutions**:
1. **Always prefix messages** with your business name: `[RoasterCo]`
2. **Use consistent message format** with emojis and branding
3. **Educate customers** to save your business name in contacts
4. **Consider upgrading** to Twilio if consistent sender is critical

## AWS SNS Setup (Cheapest Option - ~$0.84/month)

### Step 1: AWS Setup
1. Create AWS account (free tier available)
2. Go to AWS SNS Console
3. No phone number purchase needed (unlike Twilio)
4. Get your AWS Access Key ID and Secret Access Key

### Step 2: Install Dependencies

```bash
npm install aws-sdk
```

### Step 3: Environment Variables
Add to your `.env.local`:

```env
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
SMS_ENABLED=true
```

### Step 4: SMS Service Implementation

Create `src/lib/sms-service.ts`:

```typescript
import { SNS } from 'aws-sdk'

const sns = new SNS({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
})

export const sendSMS = async (phoneNumber: string, message: string, businessName: string = 'RoasterCo') => {
  try {
    // Always prefix message with business name for recognition
    const brandedMessage = `[${businessName}] ${message}`
    
    const params = {
      Message: brandedMessage,
      PhoneNumber: phoneNumber, // Format: +1234567890
      MessageAttributes: {
        'AWS.SNS.SMS.SenderID': {
          DataType: 'String',
          StringValue: businessName // Your business name (up to 11 chars)
        },
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: 'Transactional' // Lower cost than promotional
        }
      }
    }

    const result = await sns.publish(params).promise()
    return { success: true, messageId: result.MessageId }
  } catch (error) {
    console.error('SMS Error:', error)
    return { success: false, error: error.message }
  }
}

export const sendBulkSMS = async (phoneNumbers: string[], message: string) => {
  const results = []
  
  for (const phoneNumber of phoneNumbers) {
    const result = await sendSMS(phoneNumber, message)
    results.push({ phoneNumber, ...result })
    
    // Add small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  return results
}
```

### Step 5: Database Schema Updates

Add SMS preferences to users table:

```sql
ALTER TABLE users ADD COLUMN phone_number VARCHAR(20);
ALTER TABLE users ADD COLUMN sms_reminders_enabled BOOLEAN DEFAULT false;
```

### Step 6: Reminder Settings Update

Update `src/app/api/admin/reminder-settings/route.ts`:

```typescript
// Add SMS settings to your reminder configuration
const reminderSettings = {
  email_enabled: true,
  sms_enabled: true,
  reminder_day: 'MONDAY',
  reminder_time: '09:00',
  message_template: 'Hi {customerName}! Time for your weekly coffee order. Place your order at {orderUrl}'
}
```

### Step 7: Weekly Reminder Job

Create `src/lib/reminder-job.ts`:

```typescript
import { sendBulkSMS } from './sms-service'
import { supabaseAdmin } from './supabase-admin'

export const sendWeeklyReminders = async () => {
  try {
    // Get customers who want SMS reminders
    const { data: customers } = await supabaseAdmin
      .from('users')
      .select('phone_number, contact_name, email')
      .eq('role', 'CUSTOMER')
      .eq('sms_reminders_enabled', true)
      .not('phone_number', 'is', null)

    if (!customers?.length) {
      console.log('No customers with SMS reminders enabled')
      return
    }

    const message = `☕ WEEKLY COFFEE REMINDER ☕
Hi! Ready for your weekly coffee order?
Order now: https://yourapp.vercel.app/order/new

Reply STOP to unsubscribe
- Your RoasterCo Team`
    
    const phoneNumbers = customers.map(c => c.phone_number).filter(Boolean)
    
    console.log(`Sending SMS reminders to ${phoneNumbers.length} customers`)
    const results = await sendBulkSMS(phoneNumbers, message)
    
    // Log results
    console.log('SMS Results:', results)
    
    return { success: true, sent: results.filter(r => r.success).length }
  } catch (error) {
    console.error('Reminder job error:', error)
    return { success: false, error: error.message }
  }
}
```

### Step 8: API Endpoint for Manual Testing

Create `src/app/api/admin/send-reminders/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { sendWeeklyReminders } from '../../../../lib/reminder-job'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await sendWeeklyReminders()
    
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send reminders' },
      { status: 500 }
    )
  }
}
```

## Cost Breakdown (AWS SNS)

- **SMS Cost**: $0.00645 per message
- **Monthly usage**: 130 messages (30 customers × 4.3 weeks)
- **Total monthly cost**: $0.84
- **Annual cost**: ~$10

## Alternative: Twilio Setup (More Features)

If you want two-way SMS and branded sender ID:

```bash
npm install twilio
```

```typescript
import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export const sendTwilioSMS = async (to: string, body: string) => {
  try {
    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio number
      to
    })
    return { success: true, sid: message.sid }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

**Twilio Cost**: ~$16/month (includes phone number rental)

## Recommendation

For your use case (1-way reminders, 25-30 customers):
- **Use AWS SNS** - saves you ~$15/month vs Twilio
- **Total cost**: Less than $1/month
- **Simple implementation** with the code above
- **Scales easily** if you add more customers

Would you like me to implement the AWS SNS solution in your existing codebase?

# EmailJS Environment Variables Setup for Vercel

## Required Environment Variables

### 1. EmailJS Configuration
These are the environment variables you need to set in Vercel:

#### Client-side Variables (must have NEXT_PUBLIC_ prefix):
- `NEXT_PUBLIC_EMAILJS_SERVICE_ID` - Your EmailJS Service ID
- `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` - Your EmailJS Public Key
- `NEXT_PUBLIC_EMAILJS_TEMPLATE_PASSWORD_RESET` - Template ID for password reset emails
- `NEXT_PUBLIC_EMAILJS_TEMPLATE_ORDER_REMINDER` - Template ID for order reminder emails

#### Server-side Variable (optional but recommended):
- `EMAILJS_PRIVATE_KEY` - Your EmailJS Private Key (for enhanced security)

### 2. Supabase Configuration (already configured):
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

### 3. NextAuth Configuration (already configured):
- `NEXTAUTH_URL` - Your production URL (e.g., https://yourapp.vercel.app)
- `NEXTAUTH_SECRET` - Random secret key for JWT signing

## How to Set Environment Variables in Vercel

### Option 1: Via Vercel Dashboard
1. Go to your project in Vercel Dashboard
2. Click on "Settings"
3. Click on "Environment Variables"
4. Add each variable:
   - Name: `NEXT_PUBLIC_EMAILJS_SERVICE_ID`
   - Value: `your_service_id_here`
   - Environment: Production, Preview, Development (check all that apply)

### Option 2: Via Vercel CLI
```bash
vercel env add NEXT_PUBLIC_EMAILJS_SERVICE_ID
vercel env add NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
vercel env add NEXT_PUBLIC_EMAILJS_TEMPLATE_PASSWORD_RESET
vercel env add NEXT_PUBLIC_EMAILJS_TEMPLATE_ORDER_REMINDER
vercel env add EMAILJS_PRIVATE_KEY
```

## Getting Your EmailJS Values

### 1. Service ID
- Go to EmailJS Dashboard > Email Services
- Copy the Service ID from your email service

### 2. Public Key
- Go to EmailJS Dashboard > Account > General
- Copy the Public Key (User ID)

### 3. Private Key (Optional)
- Go to EmailJS Dashboard > Account > General
- Copy the Private Key (if available)

### 4. Template IDs
- Go to EmailJS Dashboard > Email Templates
- Copy the Template ID for each template you created

## Email Templates Setup

You need to create 2 templates in EmailJS:

### Template 1: Password Reset
Variables to use in template:
- `{{to_name}}` - Customer name
- `{{temporary_password}}` - The temporary password
- `{{company_name}}` - Company name
- `{{from_name}}` - From name

### Template 2: Order Reminder
Variables to use in template:
- `{{to_name}}` - Customer name
- `{{reminder_message}}` - Custom reminder message
- `{{order_deadline}}` - Order deadline
- `{{company_name}}` - Company name
- `{{from_name}}` - From name

## Testing Configuration

After setting up the environment variables, you can test the configuration by:

1. Deploy your app to Vercel
2. Try the forgot password feature
3. Check Vercel function logs for any configuration errors

## Troubleshooting

### Common Issues:

1. **Missing NEXT_PUBLIC_ prefix**: Client-side variables must start with `NEXT_PUBLIC_`
2. **Template not found**: Make sure template IDs are correct and templates exist
3. **Service not configured**: Verify Service ID and Public Key are correct
4. **Network errors**: Check if EmailJS service is active and billing is up to date

### Debug Information:
The app logs configuration status to help debug issues. Check Vercel function logs for:
- "EmailJS not configured properly" - Missing required environment variables
- "EmailJS REST API error" - Service or template configuration issues
- "Email sent successfully via REST API" - Success confirmation

## Production Checklist

Before going live:
- [ ] All environment variables set in Vercel
- [ ] EmailJS templates created and tested
- [ ] EmailJS service configured with your email provider
- [ ] Test forgot password functionality in production
- [ ] Verify emails are being delivered (check spam folders)
- [ ] Monitor Vercel function logs for any errors

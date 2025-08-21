# Deployment Guide - Roaster Ordering v1 ✅

## Status: READY FOR DEPLOYMENT
- ✅ Build passes successfully (`npm run build`)
- ✅ All ESLint errors resolved
- ✅ TypeScript compilation successful
- ✅ All pages use dynamic branding consistently
- ✅ Database migrations ready

## Overview
This is a Next.js 14 wholesale coffee ordering application with customer and admin portals.

## Tech Stack
- **Framework**: Next.js 14 with App Router and TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js with credentials provider
- **Styling**: Tailwind CSS with custom coffee-themed colors
- **APIs**: Next.js API routes for REST endpoints

## Deployment to Vercel

### Prerequisites
- Supabase project with PostgreSQL database
- Environment variables configured (see below)

### Environment Variables Required

Create these environment variables in your Vercel project settings:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# NextAuth
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secure-random-secret-for-production

# Email Service (SendGrid) - Optional
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@yourdomain.com

# SMS Service (Twilio) - Optional
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# Admin User (for initial setup)
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=secure-admin-password
```

### Getting Supabase Credentials

1. Go to [app.supabase.com](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy:
   - Project URL (NEXT_PUBLIC_SUPABASE_URL)
   - Anon public key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - Service role key (SUPABASE_SERVICE_ROLE_KEY)

### Generating NEXTAUTH_SECRET

Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

### Database Setup

**IMPORTANT**: You must run the database setup script before deployment.

1. **Go to your Supabase Dashboard**:
   - Visit [app.supabase.com](https://app.supabase.com)
   - Select your project
   - Go to "SQL Editor"

2. **Run the Database Setup Script**:
   - Copy the contents of `production-database-setup.sql`
   - Paste and run it in the SQL Editor
   - This creates all necessary tables and columns including `password_hash`

3. **Verify Tables Created**:
   - Go to "Table Editor" in Supabase
   - Confirm you see: `users`, `products`, `orders`, `order_items`, `favorites`, `branding_settings`, `reminder_settings`
   - Verify the `users` table has a `password_hash` column

The application uses Supabase with the following main tables:
- `users` - Customer and admin accounts (with password_hash column)
- `products` - Coffee products and inventory
- `orders` - Customer orders
- `order_items` - Individual items within orders
- `favorites` - Customer saved products
- `branding_settings` - Customizable branding
- `reminder_settings` - Email/SMS reminder configuration

### Post-Deployment Setup

After deployment:

1. **Create Initial Admin Account**: 
   - Visit `https://your-domain.vercel.app/setup` 
   - Fill out the form to create your first admin user
   - This endpoint only works if no admin users exist yet

2. **Configure Branding**: Login as admin and go to Settings to customize branding

3. **Add Products**: Add your coffee products through the admin panel

4. **Test Customer Flow**: Create a test customer account and place an order

### Features

#### Customer Portal
- Browse coffee products by category
- Add items to cart and place orders
- View order history and status
- Save favorite products
- Repeat previous orders

#### Admin Dashboard
- Manage products and inventory
- View and process customer orders
- Manage customer accounts
- Customizable branding and settings
- Order analytics and reporting

### Support

For technical support or questions about this deployment, contact the development team.

## Troubleshooting

### Common Deployment Issues

**1. "Missing Supabase server environment variables"**
- Ensure all environment variables are set in Vercel
- Check that `SUPABASE_SERVICE_ROLE_KEY` is the service role key, not anon key

**2. "Could not find the 'password_hash' column"**
- Run the `production-database-setup.sql` script in Supabase SQL Editor
- Verify the `users` table has a `password_hash` column

**3. "Internal Server Error" when creating admin**
- Use the `/setup` endpoint instead of trying to create admin through regular admin panel
- Ensure database setup script was run successfully

**4. Build failures**
- Check Vercel build logs for specific error messages
- Ensure all environment variables are correctly set
- Verify no TypeScript or ESLint errors

### Verifying Deployment

1. **Test Setup Page**: Visit `/setup` and create admin user
2. **Test Login**: Use admin credentials to login
3. **Test Branding**: Go to Settings and update company info
4. **Test Customer Flow**: Create customer account and place order

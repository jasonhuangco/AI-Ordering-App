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

The application uses Supabase with the following main tables:
- `users` - Customer and admin accounts
- `products` - Coffee products and inventory
- `orders` - Customer orders
- `order_items` - Individual items within orders
- `favorites` - Customer saved products
- `branding_settings` - Customizable branding
- `reminder_settings` - Email/SMS reminder configuration

### Post-Deployment Setup

After deployment:

1. **Create Admin Account**: Visit `/api/admin/setup` to create the initial admin user
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

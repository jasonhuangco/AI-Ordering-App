# Quick Setup Guide for Your Coffee Ordering App

Hello! This guide will help you deploy your coffee ordering application to Vercel.

## What You'll Need

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com) (free tier is fine)
2. **GitHub Repository URL** - Your developer will provide this
3. **Supabase Credentials** - Your developer will provide these

## Step-by-Step Deployment

### 1. Create Vercel Account
- Go to [vercel.com](https://vercel.com)
- Click "Sign Up"
- Use your email or GitHub account

### 2. Import Your Project
- In Vercel dashboard, click "New Project"
- Click "Import Third-Party Git Repository"
- Enter the GitHub URL your developer provided
- Click "Continue"

### 3. Configure Project Settings
- **Project Name**: Choose a name (e.g., "coffee-ordering")
- **Framework Preset**: Next.js (should auto-detect)
- **Root Directory**: Leave as "./"
- **Build Command**: `npm run build`
- **Output Directory**: Leave as ".next"

### 4. Add Environment Variables
Your developer will provide you with environment variables. In the Vercel import screen:

- Click "Environment Variables"
- Add each variable one by one:
  - Name: `NEXT_PUBLIC_SUPABASE_URL`
  - Value: [provided by developer]
  - Environment: All (Production, Preview, Development)

Repeat for all variables in the list your developer provides.

### 5. Deploy
- Click "Deploy"
- Wait for deployment to complete (2-3 minutes)
- You'll get a URL like `https://your-app.vercel.app`

## After Deployment

### 1. Initial Setup
Visit `https://your-app.vercel.app/api/admin/setup` to create your admin account.

### 2. Customize Your App
- Login with your admin account
- Go to Settings to customize branding, colors, and company info
- Add your coffee products
- Test placing an order

### 3. Set Up Your Domain (Optional)
- In Vercel dashboard, go to your project
- Click "Domains" tab
- Add your custom domain (e.g., `orders.yourcoffeecompany.com`)

## Need Help?

If you run into issues:
1. Check the deployment logs in Vercel dashboard
2. Contact your developer with any error messages
3. Make sure all environment variables are correctly set

## Your App Features

**Customer Features:**
- Browse and order coffee products
- View order history
- Save favorite products
- Repeat previous orders

**Admin Features:**
- Manage products and inventory
- Process customer orders
- View customer information
- Customize app branding
- Generate reports

Enjoy your new coffee ordering system! ☕

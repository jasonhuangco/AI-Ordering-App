# 🚀 Supabase Migration Guide

## Step 1: Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `roaster-ordering-v2`
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be ready (2-3 minutes)

## Step 2: Get Project Configuration

Once your project is ready:

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
   - **API Keys**:
     - `anon` `public` key
     - `service_role` `secret` key (keep this secure!)

## Step 3: Configure Environment Variables

1. Create `.env.local` file in your project root:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

2. Replace the placeholder values with your actual Supabase credentials

## Step 4: Apply Database Migrations

Run the migrations to create your database schema:

```bash
# Link your local project to Supabase
npx supabase login
npx supabase link --project-ref your_project_ref

# Push migrations to Supabase
npx supabase db push
```

**Alternative**: If the CLI doesn't work, you can run the migrations manually:

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste each migration file content:
   - `supabase/migrations/20250819000001_initial_schema.sql`
   - `supabase/migrations/20250819000002_sample_data.sql`  
   - `supabase/migrations/20250819000003_rls_policies.sql`
3. Execute each one in order

## Step 5: Import Your Data

### Option A: Using the Import Script

```bash
npm install @supabase/supabase-js
node import-data.mjs
```

### Option B: Manual Import via Supabase Dashboard

1. Go to **Table Editor** in Supabase dashboard
2. For each table, click **Insert** → **Import data from CSV**
3. Convert the JSON data to CSV format for each table

## Step 6: Set Up Authentication

1. Go to **Authentication** → **Settings** in Supabase dashboard
2. Configure these settings:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: Add your production domain when ready
   - **Email Auth**: Enable if you want email confirmation
   - **Disable Signup**: Optionally disable to require admin approval

## Step 7: Create Admin Users

Since user creation goes through Supabase Auth:

1. **Option A**: Sign up through your app, then promote to admin:
   - Use the signup flow in your app
   - Go to **Authentication** → **Users** in Supabase dashboard
   - Find your user and update the `role` in the `users` table to `ADMIN`

2. **Option B**: Create directly in Supabase:
   - Go to **Authentication** → **Users**
   - Click **Add user**
   - Fill in email/password
   - Go to **Table Editor** → `users` table
   - Update the `role` field to `ADMIN`

## Step 8: Update Application Code

You'll need to install Supabase client and update your code:

```bash
npm install @supabase/supabase-js
```

### Key Changes Needed:

1. **Replace Prisma with Supabase client**
2. **Update authentication system**
3. **Replace API routes with Supabase queries**
4. **Update form handling**

## Step 9: Test the Migration

1. Start your development server
2. Test key functionality:
   - ✅ User signup/login
   - ✅ Product catalog loading
   - ✅ Order creation
   - ✅ Admin functions
   - ✅ Branding system
   - ✅ Customer-product assignments

## Step 10: Deploy to Vercel

1. Push your code to GitHub
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. Update Supabase **Site URL** and **Redirect URLs** to your Vercel domain

## 🔧 Troubleshooting

### Common Issues:

**RLS Policies**: If you get permission errors:
- Check that RLS policies are applied correctly
- Verify user roles are set properly
- Test with service role key for admin operations

**CORS Issues**: 
- Update Site URL and Redirect URLs in Supabase settings
- Ensure environment variables are set correctly

**Migration Errors**:
- Run migrations one by one if batch fails
- Check PostgreSQL logs in Supabase dashboard
- Verify data types match between SQLite and PostgreSQL

### Data Verification:

After import, verify your data:

```sql
-- Check user count and roles
SELECT role, COUNT(*) FROM users GROUP BY role;

-- Check product counts by category
SELECT category, COUNT(*) FROM products GROUP BY category;

-- Check order counts by status
SELECT status, COUNT(*) FROM orders GROUP BY status;

-- Verify branding settings exist
SELECT company_name, primary_color FROM branding_settings;
```

## 📋 Migration Checklist

- [ ] Supabase project created
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Data imported successfully
- [ ] Admin users created
- [ ] Authentication working
- [ ] RLS policies active
- [ ] Application functions tested
- [ ] Production deployment ready

## 🎉 Success!

Once completed, you'll have:
- ✅ Modern PostgreSQL database (Supabase)
- ✅ Built-in authentication system
- ✅ Row Level Security for data protection
- ✅ Real-time capabilities
- ✅ Automatic backups
- ✅ Scalable infrastructure
- ✅ Ready for Vercel deployment

Your wholesale coffee ordering application is now ready for the cloud! 🚀☕

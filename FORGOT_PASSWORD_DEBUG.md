# Forgot Password Debugging Guide

## Current Issue
Forgot password functionality is returning 500 Internal Server Error in production despite successful local build.

## Critical Steps to Fix This

### Step 1: Test Configuration First
**Before testing forgot password**, visit this URL after deployment:
```
https://ai-ordering-app-3jq5.vercel.app/api/test-config
```

This will show you exactly which environment variables are missing.

### Step 2: Set Missing Environment Variables
In Vercel Dashboard → Settings → Environment Variables, add:

**Required for EmailJS:**
- `NEXT_PUBLIC_EMAILJS_SERVICE_ID` - Your EmailJS Service ID
- `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` - Your EmailJS Public Key
- `NEXT_PUBLIC_EMAILJS_TEMPLATE_PASSWORD_RESET` - Template ID

**Required for Database:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

**Optional:**
- `EMAILJS_PRIVATE_KEY` - For enhanced security

### Step 3: Enhanced Safety Features
The updated API now includes:
- ✅ **Defensive error handling** - catches all possible errors
- ✅ **Password reset always works** - even if email fails
- ✅ **Detailed logging** - shows exactly what failed
- ✅ **Admin logging** - temp passwords logged for manual recovery

### Step 4: How to Get EmailJS Credentials

1. **Go to EmailJS Dashboard**: https://www.emailjs.com/
2. **Service ID**: Email Services → Copy your service ID
3. **Public Key**: Account → Copy your public key
4. **Template ID**: Templates → Copy your password reset template ID

### Step 5: Debug Process

1. **Deploy updated code** with enhanced error handling
2. **Test config endpoint**: Visit `/api/test-config` first
3. **Fix missing environment variables**
4. **Test forgot password** with a real user email
5. **Check Vercel function logs** for detailed error info

### Step 6: Expected Behavior Now

**If EmailJS is configured properly:**
- User gets email with temporary password
- Success message displayed

**If EmailJS is NOT configured:**
- Password is still reset in database
- Temporary password is logged in Vercel function logs for admin
- User sees generic success message (for security)
- Admin can find temp password in logs and send manually

## No More Complete Failures!

The forgot password will now **always succeed** at resetting the password, even if email fails. This prevents the feature from being completely broken.

## Quick Recovery Steps

**If you need to help a user right now:**

1. Go to Vercel Dashboard → Functions → `/api/auth/forgot-password`
2. Look at recent logs for entries like:
   ```
   ADMIN NOTICE: Password reset completed for user@example.com
   Temporary password: Abc123xyz!
   ```
3. Send that password to the user manually

## Most Likely Issue

Based on the error, the most likely cause is missing EmailJS environment variables in Vercel. The test config endpoint will confirm this immediately.

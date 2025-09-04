# Forgot Password Debugging Guide

## Current Issue
Forgot password functionality is returning 500 Internal Server Error in production despite successful local build.

## Debug Steps

### 1. Check Vercel Function Logs
Go to your Vercel dashboard → Functions → Select `/api/auth/forgot-password` → View logs

The enhanced logging should now show:
- `=== FORGOT PASSWORD REQUEST START ===`
- Environment variable status
- Database lookup results  
- Email service configuration
- `=== EMAIL SERVICE START ===`
- EmailJS API request details
- Detailed error information if it fails

### 2. Environment Variables Check
Ensure these are set in Vercel → Settings → Environment Variables:

**Required:**
- `NEXT_PUBLIC_EMAILJS_SERVICE_ID` - Your EmailJS Service ID
- `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` - Your EmailJS Public Key
- `NEXT_PUBLIC_EMAILJS_TEMPLATE_PASSWORD_RESET` - Template ID

**Optional:**  
- `EMAILJS_PRIVATE_KEY` - For enhanced security

**Database:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### 3. Test EmailJS Configuration
Check if your EmailJS settings are correct:

1. **Service ID**: Go to EmailJS Dashboard → Email Services → Copy Service ID
2. **Public Key**: Go to EmailJS Dashboard → Account → Copy Public Key  
3. **Template ID**: Go to EmailJS Dashboard → Templates → Copy Template ID

### 4. Template Variables Check
Your EmailJS template should include these variables:
- `{{to_email}}` - Recipient email
- `{{to_name}}` - Recipient name
- `{{temporary_password}}` - The temp password
- `{{customer_name}}` - Customer name
- `{{company_name}}` - Company name

### 5. Common Issues & Solutions

#### Issue: EmailJS API Returns 400
**Cause**: Missing or incorrect template variables
**Solution**: Check template variables match exactly

#### Issue: Network/Fetch Error
**Cause**: Vercel function timeout or connectivity issue
**Solution**: Check Vercel function timeout settings

#### Issue: "Email service not configured"  
**Cause**: Missing environment variables
**Solution**: Verify all required env vars are set in Vercel

#### Issue: "User not found"
**Cause**: Email not in database or user inactive
**Solution**: Check user exists and `is_active = true`

### 6. Quick Test Steps

1. **Deploy the updated code** with enhanced logging
2. **Try forgot password** with a known good email address
3. **Check Vercel function logs** immediately after
4. **Look for specific error patterns**:
   - `MISSING` in environment check
   - `EmailJS REST API error` messages
   - Database connection errors
   - Network/fetch errors

### 7. Fallback Solution
If EmailJS continues to fail, you can temporarily switch to:
1. **Admin notification**: Log temp passwords for admin to manually send
2. **Alternative email service**: Switch to SendGrid/Nodemailer
3. **SMS integration**: Use the SMS setup guide as alternative

### 8. Expected Log Output (Success)
```
=== FORGOT PASSWORD REQUEST START ===
Environment check: { SERVICE_ID_SET: true, ... }
Processing forgot password for email: user@example.com
Checking user in database...
User found: John Doe, Role: EMPLOYEE
=== EMAIL SERVICE START ===
Preparing EmailJS request...
Making fetch request to EmailJS API...
EmailJS API response status: 200
Email sent successfully via REST API
=== EMAIL SERVICE END (SUCCESS) ===
Password reset email sent successfully
=== FORGOT PASSWORD REQUEST END ===
```

## Next Steps
1. Deploy this enhanced version
2. Test forgot password and check logs
3. Report back the specific error messages from Vercel logs
4. We can then fix the exact issue based on the detailed logging

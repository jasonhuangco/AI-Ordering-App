-- RLS Fix Script for Supabase Dashboard
-- Run this in your Supabase SQL Editor to fix the RLS warnings

-- Step 1: Enable RLS on the missing tables
ALTER TABLE public.branding_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_settings ENABLE ROW LEVEL SECURITY;

-- Step 2: Create a unique helper function for RLS policies
DROP FUNCTION IF EXISTS public.check_user_is_admin();
CREATE OR REPLACE FUNCTION public.check_user_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'ADMIN'
    FROM public.users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create RLS policies for branding_settings
DROP POLICY IF EXISTS "Only admins can read branding settings" ON public.branding_settings;
CREATE POLICY "Only admins can read branding settings" ON public.branding_settings
  FOR SELECT USING (public.check_user_is_admin());

DROP POLICY IF EXISTS "Only admins can insert branding settings" ON public.branding_settings;
CREATE POLICY "Only admins can insert branding settings" ON public.branding_settings
  FOR INSERT WITH CHECK (public.check_user_is_admin());

DROP POLICY IF EXISTS "Only admins can update branding settings" ON public.branding_settings;
CREATE POLICY "Only admins can update branding settings" ON public.branding_settings
  FOR UPDATE USING (public.check_user_is_admin());

DROP POLICY IF EXISTS "Only admins can delete branding settings" ON public.branding_settings;
CREATE POLICY "Only admins can delete branding settings" ON public.branding_settings
  FOR DELETE USING (public.check_user_is_admin());

-- Step 4: Create RLS policies for reminder_settings
DROP POLICY IF EXISTS "Only admins can read reminder settings" ON public.reminder_settings;
CREATE POLICY "Only admins can read reminder settings" ON public.reminder_settings
  FOR SELECT USING (public.check_user_is_admin());

DROP POLICY IF EXISTS "Only admins can insert reminder settings" ON public.reminder_settings;
CREATE POLICY "Only admins can insert reminder settings" ON public.reminder_settings
  FOR INSERT WITH CHECK (public.check_user_is_admin());

DROP POLICY IF EXISTS "Only admins can update reminder settings" ON public.reminder_settings;
CREATE POLICY "Only admins can update reminder settings" ON public.reminder_settings
  FOR UPDATE USING (public.check_user_is_admin());

DROP POLICY IF EXISTS "Only admins can delete reminder settings" ON public.reminder_settings;
CREATE POLICY "Only admins can delete reminder settings" ON public.reminder_settings
  FOR DELETE USING (public.check_user_is_admin());

-- Step 5: Grant necessary permissions (if needed)
GRANT ALL ON public.branding_settings TO service_role;
GRANT ALL ON public.reminder_settings TO service_role;
GRANT SELECT ON public.branding_settings TO authenticated;
GRANT SELECT ON public.reminder_settings TO authenticated;

-- Verification queries (optional)
-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables pt 
LEFT JOIN pg_class pc ON pc.relname = pt.tablename 
WHERE schemaname = 'public' 
  AND tablename IN ('branding_settings', 'reminder_settings');

-- Check policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('branding_settings', 'reminder_settings')
ORDER BY tablename, policyname;

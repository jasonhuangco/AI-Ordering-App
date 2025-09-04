-- Fix Multiple Permissive Policies on customer_products table
-- Run this in your Supabase SQL Editor to consolidate duplicate policies

-- Drop all existing policies on customer_products table
DROP POLICY IF EXISTS "Admins can read all customer products" ON public.customer_products;
DROP POLICY IF EXISTS "Customers can read their assigned products" ON public.customer_products;
DROP POLICY IF EXISTS "Admins can insert customer products" ON public.customer_products;
DROP POLICY IF EXISTS "Admins can update customer products" ON public.customer_products;
DROP POLICY IF EXISTS "Admins can delete customer products" ON public.customer_products;
DROP POLICY IF EXISTS "Users can read their own customer products" ON public.customer_products;
DROP POLICY IF EXISTS "Users can insert their own customer products" ON public.customer_products;
DROP POLICY IF EXISTS "Users can update their own customer products" ON public.customer_products;
DROP POLICY IF EXISTS "Users can delete their own customer products" ON public.customer_products;

-- Create consolidated, optimized policies
-- Single SELECT policy that covers both admin and user access
CREATE POLICY "customer_products_select_policy" ON public.customer_products
  FOR SELECT USING (
    -- Admins can see all customer products
    (SELECT role = 'ADMIN' FROM public.users WHERE id = auth.uid()) 
    OR 
    -- Users can see their own customer products
    user_id = auth.uid()
  );

-- Single INSERT policy (admin only, as users shouldn't create their own assignments)
CREATE POLICY "customer_products_insert_policy" ON public.customer_products
  FOR INSERT WITH CHECK (
    (SELECT role = 'ADMIN' FROM public.users WHERE id = auth.uid())
  );

-- Single UPDATE policy (admin only)
CREATE POLICY "customer_products_update_policy" ON public.customer_products
  FOR UPDATE USING (
    (SELECT role = 'ADMIN' FROM public.users WHERE id = auth.uid())
  );

-- Single DELETE policy (admin only)
CREATE POLICY "customer_products_delete_policy" ON public.customer_products
  FOR DELETE USING (
    (SELECT role = 'ADMIN' FROM public.users WHERE id = auth.uid())
  );

-- Verification query to check the new policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'customer_products'
ORDER BY policyname;

-- Verify RLS is enabled and policies exist
-- Run this in Supabase SQL Editor to check your setup

-- Check if RLS is enabled
SELECT 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'templates';

-- Check existing policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'templates';

-- If policies are missing, run the add_rls_policies.sql script


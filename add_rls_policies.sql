-- Add RLS Policies to existing templates table
-- This script is safe to run even if policies already exist

-- Step 1: Enable Row Level Security (safe to run multiple times)
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own templates" ON templates;
DROP POLICY IF EXISTS "Users can insert their own templates" ON templates;
DROP POLICY IF EXISTS "Users can update their own templates" ON templates;
DROP POLICY IF EXISTS "Users can delete their own templates" ON templates;

-- Step 3: Create RLS Policies
-- These policies ensure users can only access their own templates

-- RLS Policy: Users can only SELECT their own templates
CREATE POLICY "Users can view their own templates"
  ON templates FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can only INSERT their own templates
-- WITH CHECK ensures the user_id being inserted matches the authenticated user
CREATE POLICY "Users can insert their own templates"
  ON templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only UPDATE their own templates
-- USING checks existing rows, WITH CHECK validates the update
CREATE POLICY "Users can update their own templates"
  ON templates FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only DELETE their own templates
CREATE POLICY "Users can delete their own templates"
  ON templates FOR DELETE
  USING (auth.uid() = user_id);

-- Step 4: Verify policies were created
-- Run this query to confirm:
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'templates';


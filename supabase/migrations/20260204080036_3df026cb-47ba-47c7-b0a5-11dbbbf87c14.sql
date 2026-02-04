-- Step 1: Add new roles to the enum (must be separate transaction)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'branch_staff';
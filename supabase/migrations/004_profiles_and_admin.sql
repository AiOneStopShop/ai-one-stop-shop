-- Migration: Profiles table with role-based access control
-- Purpose: Secure admin authentication with RLS

-- Create profiles table (idempotent for databases that already ran old 001)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  role TEXT DEFAULT 'user',
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add constraints if they don't exist (for migration from old schema)
DO $$ 
BEGIN
  -- Add foreign key constraint if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_id_fkey'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey 
      FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  -- Add role NOT NULL constraint if column allows NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'role' AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE profiles ALTER COLUMN role SET NOT NULL;
  END IF;

  -- Add role check constraint if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_role_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
      CHECK (role IN ('user', 'admin'));
  END IF;

  -- Add stripe_customer_id unique constraint if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_stripe_customer_id_key'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_stripe_customer_id_key 
      UNIQUE (stripe_customer_id);
  END IF;

  -- Add created_at NOT NULL constraint if column allows NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'created_at' AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE profiles ALTER COLUMN created_at SET NOT NULL;
  END IF;

  -- Add updated_at NOT NULL constraint if column allows NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'updated_at' AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE profiles ALTER COLUMN updated_at SET NOT NULL;
  END IF;
END $$;

-- Create index on role for fast admin lookups (idempotent)
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role) WHERE role = 'admin';

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read only their own profile
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy: Nobody can update role from the client (admin grants via SQL only)
DROP POLICY IF EXISTS "No client role updates" ON profiles;
CREATE POLICY "No client role updates"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    -- Allow updates to own profile, but NOT to the role column
    auth.uid() = id AND 
    role = (SELECT role FROM profiles WHERE id = auth.uid())
  );

-- Policy: New users can insert their own profile with default 'user' role
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id AND
    role = 'user'
  );

-- Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO profiles (id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Revoke execute from public
REVOKE EXECUTE ON FUNCTION handle_new_user() FROM PUBLIC, anon, authenticated;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Add comments
COMMENT ON TABLE profiles IS 'User profiles with role-based access. Role can only be changed via direct SQL by service_role.';
COMMENT ON COLUMN profiles.role IS 'User role: user or admin. Cannot be updated from client; use SQL with service_role to grant admin.';

-- IMPORTANT: Disable public signups in Supabase Auth settings
-- Go to Authentication > Settings and set "Disable signups" to ON
-- Admin accounts must be created manually:

-- Instructions for granting admin role:
-- To grant any user admin role:
-- 1. Create user manually in Supabase Dashboard (or use magic link with shouldCreateUser:false in code)
-- 2. Get the user's UUID from auth.users: SELECT id, email FROM auth.users WHERE email = 'admin@example.com';
-- 3. Update their role: UPDATE profiles SET role = 'admin' WHERE id = '<user-uuid>';
-- 4. Verify: SELECT p.role, u.email FROM profiles p JOIN auth.users u ON p.id = u.id WHERE u.email = 'admin@example.com';

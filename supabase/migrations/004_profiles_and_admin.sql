-- Migration: Profiles table with role-based access control
-- Purpose: Secure admin authentication with RLS

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on role for fast admin lookups
CREATE INDEX idx_profiles_role ON profiles(role) WHERE role = 'admin';

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read only their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy: Nobody can update role from the client (admin grants via SQL only)
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

-- Instructions for granting admin role:
-- To grant Kati (or any user) admin role:
-- 1. Get the user's UUID from auth.users: SELECT id, email FROM auth.users WHERE email = 'kati@example.com';
-- 2. Update their role: UPDATE profiles SET role = 'admin' WHERE id = '<user-uuid>';
-- 3. Verify: SELECT p.role, u.email FROM profiles p JOIN auth.users u ON p.id = u.id WHERE u.email = 'kati@example.com';

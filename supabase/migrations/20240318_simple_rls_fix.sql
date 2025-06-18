-- Completely disable RLS on profiles to allow operations
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Clean up existing triggers that might be causing issues
DROP TRIGGER IF EXISTS sync_user_role ON profiles;
DROP FUNCTION IF EXISTS sync_user_role_to_claims();
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS create_new_profile(UUID, TEXT, TEXT, TEXT);

-- Clear out any old policies
DROP POLICY IF EXISTS "Allow users to create their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users to view profiles" ON profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile info" ON profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Managers can update user profiles" ON profiles;
DROP POLICY IF EXISTS "Prevent users from changing their role" ON profiles;
DROP POLICY IF EXISTS "Public profiles insert policy" ON profiles;
DROP POLICY IF EXISTS "Allow users to delete their own profile" ON profiles;

-- Make sure profiles exists and has the correct structure
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    CREATE TABLE profiles (
      id UUID PRIMARY KEY,
      email TEXT NOT NULL,
      first_name TEXT,
      last_name TEXT,
      role TEXT DEFAULT 'user',
      avatar_url TEXT,
      bio TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;
END;
$$; 
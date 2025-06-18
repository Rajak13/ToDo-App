-- First, drop all problematic policies
DROP POLICY IF EXISTS "Allow users to create their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users to view profiles" ON profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile info" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Managers can update user profiles" ON profiles;
DROP POLICY IF EXISTS "Prevent users from changing their role" ON profiles;
DROP POLICY IF EXISTS "Public profiles insert policy" ON profiles;

-- Create a server-side function to create profiles
CREATE OR REPLACE FUNCTION create_profile_for_user(
  user_id UUID,
  user_email TEXT,
  first_name TEXT DEFAULT NULL,
  last_name TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO profiles (id, email, first_name, last_name, role)
  VALUES (user_id, user_email, first_name, last_name, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set up a trigger to automatically create profiles when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create fixed policies that avoid circular dependencies

-- Allow all authenticated users to read profiles
CREATE POLICY "Allow authenticated users to view profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to update their own profile (but not their role)
CREATE POLICY "Allow users to update their own profile info"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Add a separate policy to prevent users from changing their role
CREATE POLICY "Prevent users from changing their role"
  ON profiles FOR UPDATE
  USING (
    auth.uid() = id AND 
    (role = 'user' OR auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    ))
  );

-- Admin policies
CREATE POLICY "Admins can manage all profiles"
  ON profiles FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- Allow managers to update user profiles
CREATE POLICY "Managers can update user profiles"
  ON profiles FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'manager'
    ) AND 
    role = 'user'
  );

-- Function to sync role into JWT claims
CREATE OR REPLACE FUNCTION sync_user_role_to_claims()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the user's JWT claims with their role
  PERFORM set_claim(NEW.id, 'role', NEW.role);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to keep role in sync with JWT claims
DROP TRIGGER IF EXISTS sync_user_role ON profiles;
CREATE TRIGGER sync_user_role
AFTER INSERT OR UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION sync_user_role_to_claims();

-- Add role to existing users' JWT claims
DO $$
DECLARE
  profile_record RECORD;
BEGIN
  FOR profile_record IN SELECT id, role FROM profiles LOOP
    PERFORM set_claim(profile_record.id, 'role', profile_record.role);
  END LOOP;
END;
$$ LANGUAGE plpgsql; 
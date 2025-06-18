-- First, drop any existing policies for the avatars bucket to avoid conflicts
DROP POLICY IF EXISTS "Users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;

-- Create new policies

-- Allow authenticated users to upload any file to the avatars bucket
-- This is a simplified policy for easier testing
CREATE POLICY "Allow uploads to avatars bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Allow authenticated users to update any file in the avatars bucket
CREATE POLICY "Allow updates to avatars bucket"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

-- Allow authenticated users to delete any file in the avatars bucket
CREATE POLICY "Allow deletes from avatars bucket"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');

-- Allow public access to read files from the avatars bucket
CREATE POLICY "Allow public to read from avatars bucket"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Make sure RLS is enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY; 
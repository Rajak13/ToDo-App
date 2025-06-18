-- Create policies for avatar bucket

-- Allow users to upload their own avatars
CREATE POLICY "Users can upload avatars" 
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Object must be in the avatars bucket
    bucket_id = 'avatars' AND 
    -- File name must start with the user's ID
    (storage.foldername(name))[1] = auth.uid()::text OR
    POSITION(auth.uid()::text IN name) = 1
  );

-- Allow users to update their own avatars
CREATE POLICY "Users can update their own avatars" 
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND 
    (storage.foldername(name))[1] = auth.uid()::text OR
    POSITION(auth.uid()::text IN name) = 1
  );

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatars" 
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND 
    (storage.foldername(name))[1] = auth.uid()::text OR
    POSITION(auth.uid()::text IN name) = 1
  );

-- Allow everyone to read/view avatars
CREATE POLICY "Anyone can view avatars" 
  ON storage.objects
  FOR SELECT
  TO public
  USING (
    bucket_id = 'avatars'
  );

-- Make sure RLS is enabled for storage
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY; 
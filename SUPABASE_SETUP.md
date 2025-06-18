# Supabase Setup for Avatar Uploads

## Problem
You're experiencing a 400 error when trying to upload avatars. This is likely due to missing Row Level Security (RLS) policies for your Supabase storage bucket.

## Solution Steps

### 1. Check Environment Variables
Ensure your `.env` file contains these variables (with your actual values):
```
REACT_APP_SUPABASE_URL=https://goztdvuxaobsawwhhnrs.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2. Set Up RLS Policies in Supabase

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the SQL from the `storage_policies.sql` file
5. Run the query

### 3. Verify Bucket Setup

1. In the Supabase dashboard, go to Storage
2. Check that you have an 'avatars' bucket
3. If not, create it and make it public

### 4. Test Again

After applying these changes, try uploading an avatar again. The error should be resolved.

## Explanation

The 400 error was occurring because:

1. Row Level Security (RLS) was enabled on the storage buckets
2. No policies were in place to allow authenticated users to upload files
3. The SQL we provided creates policies that:
   - Allow authenticated users to upload to the 'avatars' bucket
   - Allow authenticated users to update and delete files in the bucket
   - Allow public read access to all files in the bucket

## Troubleshooting

If you're still experiencing issues:

1. Check the browser console for more specific error messages
2. Use the Diagnostics page we added to verify connections
3. Look at the Network tab in your browser's developer tools for the failed request and examine its details
4. Ensure you're properly authenticated when trying to upload 
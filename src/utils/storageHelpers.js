import { supabase } from '../services/supabaseClient';

// Check if a storage bucket exists
export async function checkBucketExists(bucketName) {
  try {
    const { data, error } = await supabase.storage.getBucket(bucketName);
    if (error) {
      console.error(`Error checking bucket ${bucketName}:`, error);
      return { exists: false, error };
    }
    return { exists: true, data };
  } catch (err) {
    console.error(`Exception checking bucket ${bucketName}:`, err);
    return { exists: false, error: err };
  }
}

// Create a bucket if it doesn't exist
export async function createBucketIfNotExists(bucketName, isPublic = false) {
  try {
    // First check if bucket exists
    const { exists, error: checkError } = await checkBucketExists(bucketName);
    if (checkError) {
      // If the error is "not found", we continue to create the bucket
      // Other errors might indicate permission issues
      if (checkError.code !== 'PGRST116') {
        return { success: false, error: checkError };
      }
    }

    // If the bucket already exists, return success
    if (exists) {
      return { success: true, message: `Bucket ${bucketName} already exists` };
    }

    // Create the bucket
    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: isPublic, // Control public access
    });

    if (error) {
      console.error(`Error creating bucket ${bucketName}:`, error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error(`Exception creating bucket ${bucketName}:`, err);
    return { success: false, error: err };
  }
}

// List the files in a bucket
export async function listFiles(bucketName, folderPath = '') {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(folderPath);

    if (error) {
      console.error(`Error listing files in ${bucketName}/${folderPath}:`, error);
      return { success: false, error };
    }

    return { success: true, files: data };
  } catch (err) {
    console.error(`Exception listing files in ${bucketName}/${folderPath}:`, err);
    return { success: false, error: err };
  }
}

// Upload a file with better error handling
export async function uploadFile(bucketName, filePath, file, options = {}) {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        ...options
      });

    if (error) {
      console.error(`Error uploading ${filePath} to ${bucketName}:`, error);
      
      // Check for specific error conditions
      if (error.message?.includes('bucket') && error.message?.includes('not found')) {
        return { 
          success: false, 
          error, 
          details: `The bucket '${bucketName}' does not exist. You need to create it first.`
        };
      }
      
      if (error.message?.includes('permission')) {
        return { 
          success: false, 
          error, 
          details: 'You don\'t have permission to upload to this bucket. Check your RLS policies and API key permissions.'
        };
      }
      
      return { success: false, error };
    }

    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return { 
      success: true, 
      data, 
      publicUrl: urlData?.publicUrl 
    };
  } catch (err) {
    console.error(`Exception uploading ${filePath} to ${bucketName}:`, err);
    return { success: false, error: err };
  }
} 
import React, { useEffect, useRef, useState } from 'react';
import { FaCamera, FaSpinner, FaTimes } from 'react-icons/fa';
import { supabase } from '../../services/supabaseClient';
import { checkBucketExists, createBucketIfNotExists, uploadFile } from '../../utils/storageHelpers';
import './AvatarUpload.css';

export default function AvatarUpload({ currentAvatarUrl, onAvatarUpdate, userId }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [bucketStatus, setBucketStatus] = useState(null);
  const fileInputRef = useRef(null);

  // Check bucket status on component mount
  useEffect(() => {
    async function checkBucket() {
      const bucketName = 'avatars';
      const result = await checkBucketExists(bucketName);
      
      if (!result.exists) {
        console.log(`Bucket '${bucketName}' doesn't exist. Creating it...`);
        const createResult = await createBucketIfNotExists(bucketName, true);
        
        if (createResult.success) {
          console.log(`Successfully created bucket '${bucketName}'`);
          setBucketStatus({ exists: true, message: `Bucket '${bucketName}' created successfully` });
        } else {
          console.error(`Failed to create bucket '${bucketName}':`, createResult.error);
          setBucketStatus({ 
            exists: false, 
            error: createResult.error,
            message: `Failed to create bucket: ${createResult.error?.message || 'Unknown error'}`
          });
        }
      } else {
        setBucketStatus({ exists: true, message: `Bucket 'avatars' exists` });
      }
    }
    
    checkBucket();
  }, []);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    await uploadAvatar(file);
  };

  const uploadAvatar = async (file) => {
    try {
      setUploading(true);
      setError(null);

      if (!bucketStatus?.exists) {
        setError(`Storage bucket issue: ${bucketStatus?.message || 'Bucket does not exist'}`);
        return;
      }

      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;

      console.log('Uploading avatar:', { fileName });

      // Upload the file using our helper
      const uploadResult = await uploadFile('avatars', fileName, file);

      if (!uploadResult.success) {
        if (uploadResult.details) {
          setError(`Upload failed: ${uploadResult.details}`);
        } else {
          setError(`Upload failed: ${uploadResult.error?.message || 'Unknown error'}`);
        }
        return;
      }
      
      const publicUrl = uploadResult.publicUrl;
      console.log('Avatar uploaded successfully, public URL:', publicUrl);

      if (!publicUrl) {
        throw new Error('Failed to get public URL for uploaded avatar');
      }

      // Update the profile with the new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw updateError;
      }

      // Call the callback to update the UI
      if (onAvatarUpdate) {
        onAvatarUpdate(publicUrl);
      }

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Avatar upload error:', error);
      setError(error.message || 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = async () => {
    try {
      setUploading(true);
      setError(null);

      // Update the profile to remove the avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }

      // Call the callback to update the UI
      if (onAvatarUpdate) {
        onAvatarUpdate(null);
      }

    } catch (error) {
      console.error('Avatar removal error:', error);
      setError(error.message || 'Failed to remove avatar');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="avatar-upload">
      <div className="avatar-container">
        {currentAvatarUrl ? (
          <img 
            src={currentAvatarUrl} 
            alt="Profile avatar" 
            className="avatar-image"
          />
        ) : (
          <div className="avatar-placeholder">
            <FaCamera />
          </div>
        )}
        
        {uploading && (
          <div className="avatar-overlay">
            <FaSpinner className="spinner" />
          </div>
        )}
      </div>
      
      {bucketStatus && bucketStatus.error && (
        <div className="avatar-error">
          Storage configuration error: {bucketStatus.message}
        </div>
      )}

      <div className="avatar-actions">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading || !bucketStatus?.exists}
          className="file-input"
        />
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || !bucketStatus?.exists}
          className="avatar-button upload"
        >
          <FaCamera />
          {uploading ? 'Uploading...' : 'Upload Avatar'}
        </button>

        {currentAvatarUrl && (
          <button
            type="button"
            onClick={removeAvatar}
            disabled={uploading}
            className="avatar-button remove"
          >
            <FaTimes />
            Remove
          </button>
        )}
      </div>

      {error && (
        <div className="avatar-error">
          {error}
        </div>
      )}
    </div>
  );
}

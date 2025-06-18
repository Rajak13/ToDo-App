import React, { useState } from 'react';
import { useRole } from '../../context/RoleContext';
import { supabase } from '../../services/supabaseClient';
import ProfileForm from './ProfileForm';

export default function ProfilePage() {
  const { profile } = useRole();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const updateProfile = async (updates) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user found');

      // Validate updates
      if (updates.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)) {
        throw new Error('Invalid email format');
      }

      if (updates.first_name && updates.first_name.length < 2) {
        throw new Error('First name must be at least 2 characters');
      }

      if (updates.last_name && updates.last_name.length < 2) {
        throw new Error('Last name must be at least 2 characters');
      }

      // Don't allow role updates from profile page
      delete updates.role;

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const handleSave = async (updatedProfile) => {
    setError(null);
    setSuccess(false);
    
    const { success, error } = await updateProfile(updatedProfile);
    
    if (error) {
      setError(error);
      return;
    }
    
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000); // Clear success message after 3 seconds
  };

  if (!profile) return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <div className="loading">Loading...</div>
    </div>
  );

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h2>My Profile</h2>
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        {success && (
          <div className="success-message">
            Profile updated successfully!
          </div>
        )}
        <ProfileForm profile={profile} onSave={handleSave} />
      </div>
    </div>
  );
}

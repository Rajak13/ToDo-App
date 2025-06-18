import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

export const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user found');

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // No profile found, create one
          console.log("No profile found, creating one");
          return await createMissingProfile(user);
        }
        throw profileError;
      }
      
      setProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to create a missing profile
  const createMissingProfile = async (user) => {
    try {
      // Simple direct insert with disabled RLS
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          role: 'user'
        })
        .select()
        .single();

      if (error) {
        console.warn('Failed to create profile, trying update:', error);
        // If the profile might already exist, try an update
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        if (existingProfile) {
          setProfile(existingProfile);
          return existingProfile;
        }
        
        throw error;
      }
      
      setProfile(data);
      return data;
    } catch (err) {
      setError(`Failed to create profile: ${err.message}`);
      return null;
    }
  };

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

      // Check if user is trying to change role
      if (updates.role && profile && updates.role !== profile.role) {
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (currentProfile.role !== 'admin') {
          throw new Error('Only admins can change roles');
        }
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setProfile(data);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateAvatar = async (avatarFile) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user found');

      // Validate file
      if (!avatarFile.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }

      if (avatarFile.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      // Upload avatar
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setProfile(data);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const removeAvatar = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const isProfileComplete = () => {
    if (!profile) return false;
    return !!(
      profile.first_name &&
      profile.last_name &&
      profile.email
    );
  };

  useEffect(() => {
    fetchProfile();

    // Subscribe to profile changes
    const subscription = supabase
      .channel('public:profiles')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${profile?.id}`
        }, 
        (payload) => {
          setProfile(payload.new);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    profile,
    loading,
    error,
    updateProfile,
    updateAvatar,
    removeAvatar,
    isProfileComplete,
    refetch: fetchProfile
  };
}; 
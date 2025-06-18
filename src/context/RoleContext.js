import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from './AuthContext';

const RoleContext = createContext({
  profile: null,
  loading: true,
  error: null,
});

export function RoleProvider({ children }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        setLoading(true);
        setError(null);

        if (!user) {
          setProfile(null);
          return;
        }

        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          if (profileError.code === 'PGRST116') {
            // No profile found, try to create one
            console.log("No profile found in RoleProvider, attempting to create");
            try {
              const { data: newProfile, error: insertError } = await supabase
                .from('profiles')
                .insert({
                  id: user.id,
                  email: user.email,
                  role: 'user'
                })
                .select()
                .single();
                
              if (!insertError && newProfile) {
                if (mounted) setProfile(newProfile);
                return;
              }
            } catch (createErr) {
              console.warn("Failed to create profile:", createErr);
            }
          }
          throw profileError;
        }
        
        if (mounted) {
          setProfile(data);
        }
      } catch (err) {
        if (mounted) {
          console.error("Error loading profile:", err);
          setError(err.message);
          setProfile(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    // Clean up previous subscription if it exists
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    // Only set up subscription if user exists
    if (user?.id) {
      try {
        subscriptionRef.current = supabase
          .channel(`profile-${user.id}`)  // Use unique channel name with user ID
          .on('postgres_changes', 
            { 
              event: '*', 
              schema: 'public',
              table: 'profiles',
              filter: `id=eq.${user.id}`
            }, 
            (payload) => {
              if (mounted) {
                setProfile(payload.new);
              }
            }
          )
          .subscribe();
      } catch (err) {
        console.error("Error setting up profile subscription:", err);
      }
    }

    return () => {
      mounted = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [user]);

  const value = {
    profile,
    loading,
    error,
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
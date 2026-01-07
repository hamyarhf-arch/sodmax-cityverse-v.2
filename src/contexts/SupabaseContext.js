import React, { createContext, useContext, useEffect, useState } from 'react';
import supabase from '../lib/supabase';
import { useDispatch } from 'react-redux';
import { setUser } from '../store';

const SupabaseContext = createContext({});

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within SupabaseProvider');
  }
  return context;
};

export const SupabaseProvider = ({ children }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          dispatch(setUser(null));
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [dispatch]);

  const fetchUserProfile = async (userId) => {
    try {
      const { data: profile } = await supabase
        .from('users')
        .select(`
          *,
          user_wallets (*),
          mining_stats (*)
        `)
        .eq('id', userId)
        .single();

      if (profile) {
        dispatch(setUser(profile));
        
        // Update other slices
        if (profile.user_wallets?.[0]) {
          // dispatch(setWalletBalance(profile.user_wallets[0]));
        }
        
        if (profile.mining_stats?.[0]) {
          // dispatch(setMiningStats(profile.mining_stats[0]));
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const signUp = async (email, password, userData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });
    
    if (error) throw error;
    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) throw error;
  };

  const updateProfile = async (updates) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id);
    
    if (error) throw error;
    
    await fetchUserProfile(user.id);
  };

  const value = {
    supabase,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    loading,
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};

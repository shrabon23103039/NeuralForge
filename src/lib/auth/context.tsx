'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import type { Profile, UserRole, Department } from '@/types/database';
import type { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, role: UserRole, department?: Department) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabaseBrowser
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setProfile(data as Profile);
    } else {
      setProfile(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  }, [user?.id, fetchProfile]);

  useEffect(() => {
    // Get initial session
    supabaseBrowser.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        fetchProfile(s.user.id);
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          fetchProfile(newSession.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signUp = async (
    email: string,
    password: string,
    role: UserRole,
    department?: Department
  ): Promise<{ error: string | null }> => {
    const { data, error } = await supabaseBrowser.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    // Create the profile row
    if (data.user) {
      const profileData: Partial<Profile> & { id: string } = {
        id: data.user.id,
        role,
        department: role === 'authority' ? (department ?? null) : null,
        trust_score: 100,
      };

      const { error: profileError } = await supabaseBrowser
        .from('profiles')
        .upsert(profileData);

      if (profileError) {
        return { error: profileError.message };
      }

      setProfile({
        id: data.user.id,
        full_name: null,
        phone: null,
        role,
        department: role === 'authority' ? (department ?? null) : null,
        trust_score: 100,
        created_at: new Date().toISOString(),
      });
    }

    return { error: null };
  };

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: string | null }> => {
    const { error } = await supabaseBrowser.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabaseBrowser.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

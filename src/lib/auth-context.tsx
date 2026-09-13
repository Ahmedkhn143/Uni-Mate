'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Profile, UserRole } from '@/types/database';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

interface AuthContextType {
  user: Profile | null;
  role: UserRole | null;
  isAdmin: boolean;
  isStudent: boolean;
  isLoading: boolean;
  isConfigured: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  signup: (data: {
    email: string;
    password?: string;
    fullName: string;
    departmentId: string;
    program: string;
    semester: number;
    studentId?: string;
    avatarUrl?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchUser?: (role: UserRole) => void;
  updateCurrentUserProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConfigured, setIsConfigured] = useState<boolean>(false);

  const loadProfile = async (userId: string, email: string) => {
    const supabase = createClient();
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (data) {
        setUser(data as Profile);
      } else {
        // Fallback create profile if trigger was delayed
        const fallback: Profile = {
          id: userId,
          email: email.toLowerCase(),
          full_name: email.split('@')[0],
          role: email.toLowerCase().includes('admin') ? 'admin' : 'student',
          is_suspended: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        await supabase.from('profiles').upsert(fallback);
        setUser(fallback);
      }
    } catch (err) {
      console.error('Failed loading profile from Supabase:', err);
    }
  };

  useEffect(() => {
    const configured = isSupabaseConfigured();
    setIsConfigured(configured);

    const supabase = createClient();
    if (!supabase) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      if (session?.user) {
        loadProfile(session.user.id, session.user.email || '').finally(() => {
          if (isMounted) setIsLoading(false);
        });
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    // Listen to Supabase Auth state changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        loadProfile(session.user.id, session.user.email || '');
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (
    email: string, 
    password?: string
  ): Promise<{ success: boolean; error?: string; role?: UserRole }> => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    const supabase = createClient();
    if (!supabase) {
      setIsLoading(false);
      return { 
        success: false, 
        error: 'Supabase credentials are not configured in .env.local. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.' 
      };
    }

    if (!password) {
      setIsLoading(false);
      return { success: false, error: 'Please provide your account password.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profile?.is_suspended) {
          await supabase.auth.signOut();
          setUser(null);
          setIsLoading(false);
          return { success: false, error: 'This university account has been suspended by campus moderators.' };
        }

        if (profile) {
          setUser(profile as Profile);
          setIsLoading(false);
          return { success: true, role: profile.role };
        }
      }

      setIsLoading(false);
      return { success: true, role: 'student' };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err?.message || 'Authentication failed. Please try again.' };
    }
  };

  const signup = async (data: {
    email: string;
    password?: string;
    fullName: string;
    departmentId: string;
    program: string;
    semester: number;
    studentId?: string;
    avatarUrl?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const cleanEmail = data.email.trim().toLowerCase();

    const supabase = createClient();
    if (!supabase) {
      setIsLoading(false);
      return { 
        success: false, 
        error: 'Supabase is not configured in .env.local. Please add your Supabase credentials.' 
      };
    }

    try {
      const { data: authResult, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: data.password || 'KFUEITStudent2026!',
        options: {
          data: {
            full_name: data.fullName,
            role: 'student',
            department_id: data.departmentId,
            program: data.program,
            semester: data.semester,
            student_id: data.studentId,
            avatar_url: data.avatarUrl
          }
        }
      });

      if (authError) {
        setIsLoading(false);
        return { success: false, error: authError.message };
      }

      const newUserId = authResult.user?.id;
      if (newUserId) {
        const profileRecord: Partial<Profile> = {
          id: newUserId,
          email: cleanEmail,
          full_name: data.fullName,
          role: 'student',
          department_id: data.departmentId || undefined,
          program: data.program,
          semester: data.semester,
          student_id: data.studentId || undefined,
          avatar_url: data.avatarUrl || undefined,
          bio: `Enrolled student in ${data.program}.`,
          is_suspended: false,
          updated_at: new Date().toISOString()
        };

        await supabase.from('profiles').upsert(profileRecord);

        const fullProfile = {
          ...profileRecord,
          created_at: new Date().toISOString()
        } as Profile;

        setUser(fullProfile);
      }

      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err?.message || 'Failed to complete registration.' };
    }
  };

  const logout = async () => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  const updateCurrentUserProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    const updated = { ...user, ...updates, updated_at: new Date().toISOString() };
    setUser(updated);

    const supabase = createClient();
    if (supabase) {
      try {
        await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id);
      } catch (err) {
        console.error('Failed to sync profile update with Supabase:', err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAdmin: user?.role === 'admin',
        isStudent: user?.role === 'student',
        isLoading,
        isConfigured,
        login,
        signup,
        logout,
        updateCurrentUserProfile
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

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
  }) => Promise<{ success: boolean; error?: string; requiresVerification?: boolean }>;
  verifyOtp: (
    email: string,
    token: string,
    profileData?: {
      fullName: string;
      departmentId?: string;
      program?: string;
      semester?: number;
      studentId?: string;
      avatarUrl?: string;
    }
  ) => Promise<{ success: boolean; error?: string }>;
  resendOtp: (email: string) => Promise<{ success: boolean; error?: string }>;
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

    // 1. Check local storage for active student session
    const saved = typeof window !== 'undefined' ? localStorage.getItem('unimate_active_user') : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) {
          setUser(parsed);
          setIsLoading(false);
        }
      } catch (e) {
        console.warn('Could not restore local user session:', e);
      }
    }

    // 2. Check active Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      if (session?.user) {
        loadProfile(session.user.id, session.user.email || '').finally(() => {
          if (isMounted) setIsLoading(false);
        });
      } else {
        if (!saved) {
          setUser(null);
        }
        setIsLoading(false);
      }
    });

    // Listen to Supabase Auth state changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        loadProfile(session.user.id, session.user.email || '');
      } else {
        const localSaved = typeof window !== 'undefined' ? localStorage.getItem('unimate_active_user') : null;
        if (!localSaved) {
          setUser(null);
        }
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
        // If email confirmation is pending, reject login strictly
        if (error.message?.toLowerCase().includes('email not confirmed')) {
          setIsLoading(false);
          return { 
            success: false, 
            error: 'Your university email has not been verified yet. Please register or verify the OTP code sent to your @kfueit.edu.pk inbox.' 
          };
        }

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
          if (typeof window !== 'undefined') {
            localStorage.setItem('unimate_active_user', JSON.stringify(profile));
          }
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
  }): Promise<{ success: boolean; error?: string; requiresVerification?: boolean }> => {
    setIsLoading(true);
    const cleanEmail = data.email.trim().toLowerCase();

    try {
      // 1. Send real verification email code via API
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          fullName: data.fullName
        })
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        setIsLoading(false);
        return { success: false, error: resData.error || 'Failed to send verification code.' };
      }

      // Also trigger Supabase signup in background
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signUp({
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
        }).catch(() => {});
      }

      setIsLoading(false);
      return { success: true, requiresVerification: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err?.message || 'Failed to dispatch verification code.' };
    }
  };

  const verifyOtp = async (
    email: string,
    token: string,
    profileData?: {
      fullName: string;
      departmentId?: string;
      program?: string;
      semester?: number;
      studentId?: string;
      avatarUrl?: string;
    }
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const cleanToken = token.trim();

    try {
      // Strict verification - verify against actual dispatched code
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          code: cleanToken,
          profileData
        })
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        setIsLoading(false);
        return { 
          success: false, 
          error: resData.error || 'Invalid or expired confirmation code. Please check your email.' 
        };
      }

      const verifiedProfile = resData.profile as Profile;
      if (typeof window !== 'undefined') {
        localStorage.setItem('unimate_active_user', JSON.stringify(verifiedProfile));
      }

      setUser(verifiedProfile);
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err?.message || 'Verification failed. Please try again.' };
    }
  };

  const resendOtp = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail })
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        return { success: false, error: resData.error || 'Failed to resend confirmation code.' };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to resend confirmation code.' };
    }
  };

  const logout = async () => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut().catch(() => {});
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('unimate_active_user');
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
        verifyOtp,
        resendOtp,
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

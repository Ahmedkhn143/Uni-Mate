'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Profile, UserRole } from '@/types/database';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { UniMateStore } from '@/lib/store';

interface AuthContextType {
  user: Profile | null;
  role: UserRole | null;
  isAdmin: boolean;
  isModerator: boolean;
  isModeratorOrAdmin: boolean;
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
    regNo?: string;
    isAnonymous?: boolean;
    studentId?: string;
    avatarUrl?: string;
  }) => Promise<{ success: boolean; error?: string; requiresVerification?: boolean }>;
  verifyOtp: (
    email: string,
    token: string,
    profileData?: {
      fullName: string;
      password?: string;
      departmentId?: string;
      program?: string;
      semester?: number;
      regNo?: string;
      isAnonymous?: boolean;
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
      let localUser: Profile | null = null;
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('unimate_active_user');
        if (saved) {
          try {
            localUser = JSON.parse(saved);
          } catch (e) {}
        }
      }

      // Check by UUID or by email
      let data: any = null;
      const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
      if (isValidUUID) {
        const res = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
        data = res.data;
      }
      if (!data && email) {
        const res = await supabase.from('profiles').select('*').eq('email', email.trim().toLowerCase()).maybeSingle();
        data = res.data;
      }

      if (data) {
        const mapped: Profile = {
          id: data.id || userId,
          email: data.email || email,
          full_name: data.full_name || localUser?.full_name || email.split('@')[0],
          role: data.role || localUser?.role || 'student',
          department_id: data.department_id || localUser?.department_id,
          department_name: localUser?.department_name,
          program: data.program || localUser?.program || 'BS Computer Science',
          semester: data.semester ? Number(data.semester) : (localUser?.semester || 1),
          student_id: data.student_id || localUser?.student_id,
          reg_no: data.student_id || localUser?.reg_no,
          avatar_url: data.avatar_url || localUser?.avatar_url,
          bio: data.bio || localUser?.bio || '',
          is_anonymous: localUser?.is_anonymous ?? false,
          is_suspended: data.is_suspended || false,
          created_at: data.created_at || new Date().toISOString(),
          updated_at: data.updated_at || new Date().toISOString()
        };

        if (typeof window !== 'undefined') {
          localStorage.setItem('unimate_active_user', JSON.stringify(mapped));
        }
        UniMateStore.saveProfile(mapped);
        setUser(mapped);
      } else if (localUser) {
        setUser(localUser);
      } else {
        const fallback: Profile = {
          id: userId,
          email: email.toLowerCase(),
          full_name: email.split('@')[0],
          role: email.toLowerCase().includes('admin') ? 'admin' : 'student',
          is_suspended: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
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

    // 1. Official Super Administrator Authentication for Ahmad Khan
    const isAdminEmailMatch = 
      cleanEmail === 'ahmad.admin@kfueit.edu.pk' ||
      cleanEmail === 'ahmadkhan.admin@kfueit.edu.pk' ||
      cleanEmail === 'ahmad.khan@kfueit.edu.pk' ||
      cleanEmail === 'ahmadkha8143@gmail.com';

    if (isAdminEmailMatch) {
      if (password === 'AhmadKhan@KFUEIT2026!#Admin') {
        const adminProfile: Profile = {
          id: 'admin-ahmad-khan-2026',
          email: cleanEmail,
          full_name: 'Ahmad Khan',
          role: 'admin',
          department_id: 'd1111111-1111-1111-1111-111111111111',
          department_name: 'Department of Computer Science & IT',
          program: 'BS Computer Science (Super Admin)',
          semester: 8,
          reg_no: 'ADMIN-2022-001',
          is_anonymous: false,
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          is_suspended: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        if (typeof window !== 'undefined') {
          localStorage.setItem('unimate_active_user', JSON.stringify(adminProfile));
        }
        UniMateStore.saveProfile(adminProfile);
        setUser(adminProfile);
        setIsLoading(false);
        return { success: true, role: 'admin' };
      } else {
        setIsLoading(false);
        return { success: false, error: 'Incorrect administrator password for Ahmad Khan.' };
      }
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
    regNo?: string;
    isAnonymous?: boolean;
    studentId?: string;
    avatarUrl?: string;
  }): Promise<{ success: boolean; error?: string; requiresVerification?: boolean }> => {
    setIsLoading(true);
    const cleanEmail = data.email.trim().toLowerCase();

    try {
      // Send 6-digit OTP code directly to university email via Nodemailer
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
      password?: string;
      departmentId?: string;
      program?: string;
      semester?: number;
      regNo?: string;
      isAnonymous?: boolean;
      studentId?: string;
      avatarUrl?: string;
    }
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const cleanToken = token.trim();

    try {
      // Step 1: Verify the 6-digit OTP and create the Supabase auth user server-side
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
          error: resData.error || 'Invalid or expired confirmation code. Please check your university email.'
        };
      }

      const verifiedProfile = resData.profile;
      const studentPassword = profileData?.password || 'KFUEITStudent2026!';

      // Step 2: Sign in with Supabase to establish a real authenticated session.
      // The API route has already created the user in auth.users (email_confirm=true),
      // so signInWithPassword works immediately — no confirmation email needed.
      const supabase = createClient();
      if (supabase) {
        const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: studentPassword,
        });

        if (signInErr) {
          console.warn('[UniMate Auth] Sign-in after registration warning:', signInErr.message);
          // Non-fatal — user was created, they can sign in manually later
        } else if (signInData?.user) {
          // Reload the profile from Supabase to get the authoritative version
          const { data: freshProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', signInData.user.id)
            .maybeSingle();

          if (freshProfile) {
            const fullProfile = { ...verifiedProfile, ...freshProfile } as Profile;
            if (typeof window !== 'undefined') {
              localStorage.setItem('unimate_active_user', JSON.stringify(fullProfile));
            }
            UniMateStore.saveProfile(fullProfile);
            setUser(fullProfile);
            setIsLoading(false);
            return { success: true };
          }
        }
      }

      // Fallback: use the profile returned from the API if Supabase sign-in
      // was unavailable (e.g., no service role key in dev)
      const fallbackProfile = verifiedProfile as Profile;
      if (typeof window !== 'undefined') {
        localStorage.setItem('unimate_active_user', JSON.stringify(fallbackProfile));
      }
      UniMateStore.saveProfile(fallbackProfile);
      setUser(fallbackProfile);
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
    const updated: Profile = { 
      ...user, 
      ...updates, 
      student_id: updates.reg_no || updates.student_id || user.student_id,
      reg_no: updates.reg_no || updates.student_id || user.reg_no,
      updated_at: new Date().toISOString() 
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('unimate_active_user', JSON.stringify(updated));
    }
    UniMateStore.saveProfile(updated);
    setUser(updated);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          email: user.email,
          updates: {
            full_name: updated.full_name,
            program: updated.program,
            semester: updated.semester,
            reg_no: updated.reg_no,
            student_id: updated.student_id,
            bio: updated.bio,
            avatar_url: updated.avatar_url,
            is_anonymous: updated.is_anonymous,
            department_id: updated.department_id
          }
        })
      });
      const data = await res.json();
      if (data.success && data.profile) {
        const synced = { ...updated, ...data.profile };
        if (typeof window !== 'undefined') {
          localStorage.setItem('unimate_active_user', JSON.stringify(synced));
        }
        setUser(synced);
      }
    } catch (err) {
      console.warn('Failed to sync profile update with server:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAdmin: user?.role === 'admin',
        isModerator: user?.role === 'moderator',
        isModeratorOrAdmin: user?.role === 'admin' || user?.role === 'moderator',
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

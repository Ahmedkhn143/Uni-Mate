'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Profile, UserRole } from '@/types/database';
import { UniMateStore } from '@/lib/store';
import { INITIAL_PROFILES } from '@/lib/mock-data';

// Permanent Credentials Store
export const PERMANENT_ACCOUNTS = {
  ADMIN: {
    email: 'admin@student.edu',
    password: 'AdminPassword123!',
    role: 'admin' as UserRole,
    name: 'Dr. Sarah Hayes',
    title: 'University Dean of Students & Campus Administrator'
  },
  STUDENT: {
    email: 'alex.rivera@student.edu',
    password: 'StudentPassword123!',
    role: 'student' as UserRole,
    name: 'Alex Rivera',
    title: 'BS Computer Science • Semester 4'
  }
};

interface AuthContextType {
  user: Profile | null;
  role: UserRole | null;
  isAdmin: boolean;
  isStudent: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  signup: (data: {
    email: string;
    password?: string;
    fullName: string;
    departmentId: string;
    program: string;
    semester: number;
    studentId?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchUser: (role: UserRole) => void;
  updateCurrentUserProfile: (updates: Partial<Profile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Load persisted user or default to Alex Rivera (Student)
    const storedUserId = typeof window !== 'undefined' ? localStorage.getItem('unimate_active_user_id') : null;
    const profiles = UniMateStore.getProfiles();
    
    if (storedUserId) {
      const found = profiles.find((p) => p.id === storedUserId);
      if (found) {
        setUser(found);
        setIsLoading(false);
        return;
      }
    }

    // Default to student demo profile
    const defaultStudent = profiles.find((p) => p.email === PERMANENT_ACCOUNTS.STUDENT.email) || profiles[1] || INITIAL_PROFILES[1];
    setUser(defaultStudent);
    if (typeof window !== 'undefined') {
      localStorage.setItem('unimate_active_user_id', defaultStudent.id);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string; role?: UserRole }> => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 350));

    const cleanEmail = email.trim().toLowerCase();
    const profiles = UniMateStore.getProfiles();
    const found = profiles.find((p) => p.email.toLowerCase() === cleanEmail);

    if (!found) {
      setIsLoading(false);
      return { success: false, error: 'No university account found with this email address.' };
    }

    if (found.is_suspended) {
      setIsLoading(false);
      return { success: false, error: 'This account has been suspended by campus moderators.' };
    }

    // Password Validation
    if (password) {
      let expectedPassword = '';
      if (cleanEmail === PERMANENT_ACCOUNTS.ADMIN.email) {
        expectedPassword = PERMANENT_ACCOUNTS.ADMIN.password;
      } else if (cleanEmail === PERMANENT_ACCOUNTS.STUDENT.email) {
        expectedPassword = PERMANENT_ACCOUNTS.STUDENT.password;
      } else {
        // Check registered passwords in localStorage
        try {
          const registeredPasswords = JSON.parse(localStorage.getItem('unimate_passwords') || '{}');
          expectedPassword = registeredPasswords[cleanEmail] || 'StudentPassword123!';
        } catch {
          expectedPassword = 'StudentPassword123!';
        }
      }

      if (password !== expectedPassword) {
        setIsLoading(false);
        return { success: false, error: 'Incorrect password. Please verify your credentials.' };
      }
    }

    setUser(found);
    if (typeof window !== 'undefined') {
      localStorage.setItem('unimate_active_user_id', found.id);
    }
    setIsLoading(false);
    return { success: true, role: found.role };
  };

  const signup = async (data: {
    email: string;
    password?: string;
    fullName: string;
    departmentId: string;
    program: string;
    semester: number;
    studentId?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 400));

    // Validate university domain
    const settings = UniMateStore.getSettings();
    const allowedDomains = settings.allowed_email_domains || ['student.edu', 'university.edu'];
    const emailDomain = data.email.split('@')[1]?.toLowerCase();

    const isDomainAllowed = allowedDomains.some((d) => emailDomain === d.toLowerCase() || emailDomain?.endsWith('.' + d.toLowerCase()));
    if (!isDomainAllowed) {
      setIsLoading(false);
      return {
        success: false,
        error: `Email domain must be an approved university domain (${allowedDomains.join(', ')}).`
      };
    }

    const profiles = UniMateStore.getProfiles();
    const existing = profiles.find((p) => p.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      setIsLoading(false);
      return { success: false, error: 'An account with this university email already exists.' };
    }

    const departments = UniMateStore.getDepartments();
    const dept = departments.find((d) => d.id === data.departmentId);

    const newProfile: Profile = {
      id: 'usr_' + Date.now(),
      email: data.email.toLowerCase(),
      full_name: data.fullName,
      role: 'student',
      department_id: data.departmentId,
      department_name: dept?.name || 'General Studies',
      program: data.program,
      semester: data.semester,
      student_id: data.studentId || 'S-' + Math.floor(1000 + Math.random() * 9000),
      avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      bio: `Enrolled student in ${data.program} (${dept?.name || 'University'}).`,
      is_suspended: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Save registered password
    if (data.password && typeof window !== 'undefined') {
      try {
        const passwords = JSON.parse(localStorage.getItem('unimate_passwords') || '{}');
        passwords[newProfile.email] = data.password;
        localStorage.setItem('unimate_passwords', JSON.stringify(passwords));
      } catch (err) {
        console.error('Failed saving password:', err);
      }
    }

    UniMateStore.saveProfile(newProfile);
    setUser(newProfile);
    if (typeof window !== 'undefined') {
      localStorage.setItem('unimate_active_user_id', newProfile.id);
    }
    setIsLoading(false);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('unimate_active_user_id');
    }
  };

  const switchUser = (targetRole: UserRole) => {
    const profiles = UniMateStore.getProfiles();
    if (targetRole === 'admin') {
      const admin = profiles.find((p) => p.role === 'admin') || INITIAL_PROFILES[0];
      setUser(admin);
      if (typeof window !== 'undefined') {
        localStorage.setItem('unimate_active_user_id', admin.id);
      }
    } else {
      const student = profiles.find((p) => p.role === 'student' && p.email.includes('alex')) || profiles.find((p) => p.role === 'student') || INITIAL_PROFILES[1];
      setUser(student);
      if (typeof window !== 'undefined') {
        localStorage.setItem('unimate_active_user_id', student.id);
      }
    }
  };

  const updateCurrentUserProfile = (updates: Partial<Profile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    UniMateStore.saveProfile(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAdmin: user?.role === 'admin',
        isStudent: user?.role === 'student',
        isLoading,
        login,
        signup,
        logout,
        switchUser,
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

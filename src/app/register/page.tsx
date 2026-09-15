'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  GraduationCap, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Mail, 
  Lock, 
  User, 
  BookOpen,
  Camera,
  Upload,
  X,
  KeyRound,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { UniMateStore } from '@/lib/store';
import { Department } from '@/types/database';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { KFUEIT_PROGRAMS } from '@/lib/constants';

export default function RegisterPage() {
  const router = useRouter();
  const { signup, verifyOtp, resendOtp } = useAuth();

  // Registration step: 'form' | 'otp'
  const [step, setStep] = useState<'form' | 'otp'>('form');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [customDepartment, setCustomDepartment] = useState('');
  const [program, setProgram] = useState('');
  const [semester, setSemester] = useState(1);
  const [regNo, setRegNo] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Optional Profile Picture
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // OTP Verification State
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState<number>(60);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Metadata & Feedback
  const [departments, setDepartments] = useState<Department[]>([]);
  const [allowedDomains, setAllowedDomains] = useState<string[]>(['kfueit.edu.pk']);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const depts = UniMateStore.getDepartments();
    setDepartments(depts);
    if (depts.length > 0) {
      setDepartmentId(depts[0].id);
    }
    const settings = UniMateStore.getSettings();
    if (settings.allowed_email_domains) {
      setAllowedDomains(settings.allowed_email_domains);
    }
  }, []);

  // Resend Timer countdown
  useEffect(() => {
    let interval: any;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // Handle Image File Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Profile image must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result as string);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Step 1: Validate Form & Send Real Email Verification Code
  const handleInitiateVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid university email address.');
      return;
    }

    // Check university domain (@kfueit.edu.pk or *.edu.pk) OR common personal providers
    const cleanEmail = email.trim().toLowerCase();
    const domain = cleanEmail.split('@')[1]?.toLowerCase() || '';
    const personalProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com'];
    const isAllowed = 
      allowedDomains.some((d) => domain === d || domain.endsWith('.' + d)) ||
      domain.endsWith('.edu.pk') ||
      domain === 'kfueit.edu.pk' ||
      personalProviders.includes(domain);

    if (!isAllowed) {
      setError(`Please use a university email (@kfueit.edu.pk) or a personal email (@gmail.com, @yahoo.com, @outlook.com).`);
      return;
    }


    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    const finalDept = departmentId === 'other' ? (customDepartment.trim() || 'Other Department') : (departmentId || 'cs');
    const finalProgram = program.trim() || 'BS Computer Science';

    // Call Supabase signup - this triggers a real verification email with OTP to the user's university inbox
    const res = await signup({
      fullName: fullName.trim(),
      email: cleanEmail,
      password,
      departmentId: finalDept,
      program: finalProgram,
      semester: Number(semester),
      regNo: regNo.trim() || undefined,
      isAnonymous,
      avatarUrl: avatarPreview || undefined
    });

    setLoading(false);

    if (res.success) {
      if (res.requiresVerification === false) {
        router.push('/dashboard');
        return;
      }
      setOtpDigits(['', '', '', '', '', '']);
      setResendTimer(60);
      setStep('otp');
    } else {
      const errMsg = res.error?.toLowerCase() || '';
      if (errMsg.includes('already registered')) {
        setError('An account with this university email already exists. Please sign in instead.');
      } else if (errMsg.includes('rate limit') || errMsg.includes('over_email_send_rate_limit')) {
        setError('A confirmation email was recently sent to this address. Please check your inbox (or spam folder) or wait a minute before resending.');
        setStep('otp');
      } else {
        setError(res.error || 'Failed to send confirmation email. Please try again.');
      }
    }
  };

  // Handle OTP Digit Input
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, '').slice(0, 6).split('');
      if (pasted.length > 0) {
        const newDigits = [...otpDigits];
        pasted.forEach((char, i) => {
          if (index + i < 6) newDigits[index + i] = char;
        });
        setOtpDigits(newDigits);
        const nextIndex = Math.min(index + pasted.length, 5);
        otpInputRefs.current[nextIndex]?.focus();
      }
      return;
    }

    const cleanChar = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = cleanChar;
    setOtpDigits(newDigits);

    if (cleanChar && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    setError('');
    setSuccessMsg('');
    setLoading(true);

    const res = await resendOtp(email.trim().toLowerCase());
    setLoading(false);

    if (res.success) {
      setResendTimer(60);
      setSuccessMsg(`A new confirmation code has been sent to ${email.trim().toLowerCase()}.`);
    } else {
      setError(res.error || 'Failed to resend confirmation code. Please wait a moment before trying again.');
    }
  };

  // Step 2: Complete Registration upon OTP Verification
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otpDigits.join('');

    if (entered.length < 6) {
      setError('Please enter all 6 digits of the confirmation code sent to your university email.');
      return;
    }

    setError('');
    setSuccessMsg('');
    setLoading(true);

    const finalDept = departmentId === 'other' ? (customDepartment.trim() || 'Other Department') : (departmentId || 'cs');
    const finalProgram = program.trim() || 'BS Computer Science';

    const res = await verifyOtp(
      email.trim().toLowerCase(),
      entered,
      {
        fullName: fullName.trim(),
        password,
        departmentId: finalDept,
        program: finalProgram,
        semester: Number(semester),
        regNo: regNo.trim() || undefined,
        isAnonymous,
        avatarUrl: avatarPreview || undefined
      }
    );
    setLoading(false);

    if (res.success) {
      router.push('/dashboard');
    } else {
      setError(res.error || 'Failed to activate student account. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-3 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative overflow-hidden transition-colors">
      
      {/* Top Header Bar with Home link & Theme Toggle */}
      <div className="fixed top-4 left-4 right-4 max-w-5xl mx-auto flex items-center justify-between z-20 pointer-events-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm backdrop-blur-md transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </Link>

        <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm backdrop-blur-md">
          <ThemeToggle />
        </div>
      </div>

      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-indigo-600/10 via-purple-600/10 to-emerald-500/10 blur-3xl pointer-events-none -z-10 rounded-full" />

      {/* Main Registration Card */}
      <div className="max-w-xl w-full bg-white/95 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-8 rounded-3xl shadow-xl dark:shadow-2xl backdrop-blur-xl space-y-6 transition-colors">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center justify-center gap-2 group mb-1">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-indigo-600/25 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {step === 'form' ? 'Create Student Account' : 'Confirm University Email'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {step === 'form' 
              ? `Join UniMate using your university domain (@kfueit.edu.pk).`
              : `Enter the 6-digit confirmation code sent to your inbox: ${email}`}
          </p>
        </div>

        {/* Success Alert */}
        {step === 'form' && successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2.5 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span className="leading-snug">{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-200 text-xs flex items-center gap-2.5 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500 dark:text-red-400" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* STEP 1: REGISTRATION FORM */}
        {step === 'form' ? (
          <form onSubmit={handleInitiateVerification} className="space-y-4">
            
            {/* Optional Profile Picture Selector */}
            <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-white">Profile Picture</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">OPTIONAL</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Upload your student photo or leave default</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {avatarPreview ? (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="p-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition"
                    title="Remove Photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition border border-indigo-200 dark:border-indigo-800/60 flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose</span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Name & University Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ahmad Khan"
                    required
                    className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  University Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@kfueit.edu.pk"
                    required
                    className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Department & Degree Program */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Department
                </label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      {d.name} ({d.code})
                    </option>
                  ))}
                  <option value="other" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold">
                    Other Department / Faculty...
                  </option>
                </select>

                {departmentId === 'other' && (
                  <input
                    type="text"
                    value={customDepartment}
                    onChange={(e) => setCustomDepartment(e.target.value)}
                    placeholder="Type your department name"
                    className="w-full mt-1.5 px-3 py-2 text-xs rounded-xl border border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-950/40 text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
                  />
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Degree Program <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  placeholder="e.g. Computer Science, Cyber Security, etc."
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
                />
              </div>
            </div>

            {/* Current Semester */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Current Semester <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <option key={num} value={num} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    Semester {num}
                  </option>
                ))}
              </select>
            </div>

            {/* Registration Number */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Registration Number <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono select-none">#</span>
                <input
                  type="text"
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  placeholder="e.g. BSCS-2022-45 or 2022-CS-0045"
                  className="w-full pl-7 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition font-mono"
                />
              </div>
              <p className="text-[10px] text-slate-400">Your university-issued student ID / registration number</p>
            </div>

            {/* Anonymous Mode Toggle */}
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 flex items-start gap-3">
              <button
                type="button"
                id="anonymous-toggle"
                onClick={() => setIsAnonymous((v) => !v)}
                className={`relative shrink-0 mt-0.5 w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isAnonymous ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                    isAnonymous ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
              <div>
                <label htmlFor="anonymous-toggle" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Post Anonymously by Default
                </label>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                  When enabled, your posts will show as <strong>"Anonymous Student"</strong> to other users. Admins can always see your real identity for safety purposes.
                </p>
              </div>
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    required
                    className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    required
                    className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition disabled:opacity-50 hover:scale-[1.01]"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Checking Credentials...
                  </span>
                ) : (
                  <>
                    <span>Verify University Email & Register</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* STEP 2: EMAIL OTP CONFIRMATION MODAL */
          <form onSubmit={handleCompleteRegistration} className="space-y-5">
            
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Verification Code Sent to Email</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                We sent a 6-digit confirmation code to <strong className="text-slate-900 dark:text-white font-mono">{email}</strong> to verify your university identity.
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Please check your university inbox (and <strong>Spam / Junk</strong> folder if not found in primary inbox) and enter the 6-digit code below.
              </p>
            </div>

            {/* 6 Digit Inputs */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 text-center">
                Enter 6-Digit Code
              </label>
              <div className="flex items-center justify-center gap-1.5 sm:gap-3">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { otpInputRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-9 sm:w-11 h-11 sm:h-12 text-center text-base sm:text-lg font-bold font-mono rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 focus:outline-none transition"
                  />
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="submit"
                disabled={loading || otpDigits.join('').length < 6}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-[1.01]"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Verifying 6-Digit Code...
                  </span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Activate Account</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-2 text-xs text-slate-500 dark:text-slate-400">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-slate-200 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>

                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendTimer > 0}
                  className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:underline disabled:text-slate-400 dark:disabled:text-slate-600 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}</span>
                </button>
              </div>

              {/* Troubleshooting Note for University Email Filters */}
              <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Not seeing the email in your inbox?</span>
                </div>
                <p className="leading-relaxed">
                  University Google Workspace emails often filter automated system messages into the <strong>Spam / Junk</strong> folder. Please open your Spam folder or wait a moment for the mail server to synchronize.
                </p>
              </div>
            </div>
          </form>
        )}

        {/* Footer Link to Login & Theme Switch */}
        <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div>
            Already have a student account?{' '}
            <Link href="/login" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline transition">
              Sign In here
            </Link>
          </div>

          <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
            <span>Appearance:</span>
            <ThemeToggle showLabel className="py-1 px-2.5 bg-slate-100/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60" />
          </div>
        </div>

      </div>
    </div>
  );
}

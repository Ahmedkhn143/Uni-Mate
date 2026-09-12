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

export default function RegisterPage() {
  const router = useRouter();
  const { signup } = useAuth();

  // Registration step: 'form' | 'otp'
  const [step, setStep] = useState<'form' | 'otp'>('form');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [program, setProgram] = useState('BS Computer Science');
  const [semester, setSemester] = useState(1);
  const [studentId, setStudentId] = useState('');

  // Optional Profile Picture
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // OTP Verification State
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState<number>(60);
  const [showSimulatedEmailToast, setShowSimulatedEmailToast] = useState<boolean>(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Metadata & Feedback
  const [departments, setDepartments] = useState<Department[]>([]);
  const [allowedDomains, setAllowedDomains] = useState<string[]>(['kfueit.edu.pk']);
  const [error, setError] = useState('');
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

  // Step 1: Validate Form & Send Email Verification Code
  const handleInitiateVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid university email address.');
      return;
    }

    // Check @kfueit.edu.pk domain
    const cleanEmail = email.trim().toLowerCase();
    const domain = cleanEmail.split('@')[1]?.toLowerCase();
    const isAllowed = allowedDomains.some((d) => domain === d || domain?.endsWith('.' + d));
    if (!isAllowed) {
      setError(`Your email must end with an approved university domain (${allowedDomains.map(d => '@' + d).join(', ')}).`);
      return;
    }

    // Check if account already exists
    const profiles = UniMateStore.getProfiles();
    const existing = profiles.find((p) => p.email.toLowerCase() === cleanEmail);
    if (existing) {
      setError('An account with this university email already exists. Please sign in instead.');
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

    // Generate 6-digit confirmation code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpDigits(['', '', '', '', '', '']);
    setResendTimer(60);

    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      setShowSimulatedEmailToast(true);
    }, 400);
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

  const handleAutoFillCode = () => {
    if (generatedOtp) {
      setOtpDigits(generatedOtp.split(''));
      setError('');
    }
  };

  const handleResendCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpDigits(['', '', '', '', '', '']);
    setResendTimer(60);
    setShowSimulatedEmailToast(true);
    setError('');
  };

  // Step 2: Complete Registration upon OTP Verification
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otpDigits.join('');

    if (entered.length < 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    if (entered !== generatedOtp) {
      setError('Invalid confirmation code. Please check the code sent to your email.');
      return;
    }

    setError('');
    setLoading(true);

    const res = await signup({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
      departmentId,
      program,
      semester: Number(semester),
      studentId: studentId.trim() || undefined,
      avatarUrl: avatarPreview || undefined
    });
    setLoading(false);

    if (res.success) {
      router.push('/dashboard');
    } else {
      setError(res.error || 'Failed to create student account. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950 text-slate-100 relative overflow-hidden">
      
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-indigo-600/15 via-purple-600/15 to-emerald-500/15 blur-3xl pointer-events-none -z-10 rounded-full" />

      {/* Simulated Incoming University Email Notification */}
      {showSimulatedEmailToast && (
        <div className="fixed top-5 right-5 z-50 max-w-md w-full bg-slate-900 border-2 border-indigo-500/60 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-top-4 duration-300 text-slate-100">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">KFUEIT University Mail</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">New Message</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Your Student Registration Code is: <strong className="font-mono text-indigo-300 text-sm tracking-widest">{generatedOtp}</strong>
                </p>
                <p className="text-[10px] text-slate-400">
                  Sent to: <span className="font-mono">{email}</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSimulatedEmailToast(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handleAutoFillCode}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Click here to Auto-fill Code ({generatedOtp})
            </button>
            <span className="text-[10px] text-slate-500">Exp: 10 mins</span>
          </div>
        </div>
      )}

      <div className="max-w-xl w-full bg-slate-900/90 border border-slate-800 p-7 sm:p-9 rounded-3xl shadow-2xl backdrop-blur-xl space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center justify-center gap-2 group mb-1">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
          </Link>
          <h1 className="text-2xl font-extrabold text-white">
            {step === 'form' ? 'Create Student Account' : 'Confirm University Email'}
          </h1>
          <p className="text-xs text-slate-400">
            {step === 'form' 
              ? `Join UniMate using your university domain (@kfueit.edu.pk).`
              : `Enter the 6-digit confirmation code sent to ${email}`}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-900/60 text-red-200 text-xs flex items-center gap-2.5 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* STEP 1: REGISTRATION FORM */}
        {step === 'form' ? (
          <form onSubmit={handleInitiateVerification} className="space-y-4">
            
            {/* Optional Profile Picture Selector */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Profile Picture</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">OPTIONAL</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Upload your student photo or leave default</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {avatarPreview ? (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="p-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition"
                    title="Remove Photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/40 rounded-lg transition border border-indigo-800/40 flex items-center gap-1.5"
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
                <label className="block text-xs font-bold text-slate-300">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ahmad Khan"
                    required
                    className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border border-slate-800 bg-slate-950/60 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300">
                  University Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@kfueit.edu.pk"
                    required
                    className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border border-slate-800 bg-slate-950/60 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Department & Program */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300">
                  Department
                </label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-800 bg-slate-950/60 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300">
                  Degree Program
                </label>
                <input
                  type="text"
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  placeholder="e.g. BS Computer Science"
                  required
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-800 bg-slate-950/60 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
                />
              </div>
            </div>

            {/* Semester & Student ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300">
                  Current Semester
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value))}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-800 bg-slate-950/60 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <option key={num} value={num} className="bg-slate-900 text-white">
                      Semester {num}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300">
                  Student Roll / ID Number (Optional)
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. CS24-102"
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-800 bg-slate-950/60 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
                />
              </div>
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    required
                    className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border border-slate-800 bg-slate-950/60 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    required
                    className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border border-slate-800 bg-slate-950/60 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
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
            
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-900/60 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>Verification Code Sent</span>
              </div>
              <p className="text-xs text-slate-300">
                We sent a 6-digit confirmation code to <strong className="text-white font-mono">{email}</strong> to verify your university identity.
              </p>
              {generatedOtp && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleAutoFillCode}
                    className="text-[11px] text-amber-400 hover:text-amber-300 underline font-medium"
                  >
                    Quick Auto-fill demo code: {generatedOtp}
                  </button>
                </div>
              )}
            </div>

            {/* 6 Digit Inputs */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 text-center">
                Enter 6-Digit Code
              </label>
              <div className="flex items-center justify-center gap-2 sm:gap-3">
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
                    className="w-11 h-12 text-center text-lg font-bold font-mono rounded-xl border border-slate-800 bg-slate-950/80 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 focus:outline-none transition"
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
                    Creating Your Student Account...
                  </span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Activate Account</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="flex items-center gap-1.5 hover:text-slate-200 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>

                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendTimer > 0}
                  className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 disabled:text-slate-600 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Footer Link to Login */}
        <div className="text-center text-xs text-slate-400 pt-3 border-t border-slate-800">
          Already have a student account?{' '}
          <Link href="/login" className="font-bold text-indigo-400 hover:text-indigo-300 transition">
            Sign In here
          </Link>
        </div>

      </div>
    </div>
  );
}

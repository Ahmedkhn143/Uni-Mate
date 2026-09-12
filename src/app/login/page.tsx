'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  GraduationCap, 
  ArrowRight, 
  AlertCircle, 
  Lock, 
  Mail, 
  ArrowLeft,
  Eye,
  EyeOff,
  ShieldCheck,
  Camera,
  Upload,
  CheckCircle2,
  X,
  KeyRound,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useAuth, PERMANENT_ACCOUNTS } from '@/lib/auth-context';
import { UniMateStore } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const { login, updateCurrentUserProfile } = useAuth();
  
  // Form State
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Optional Image State
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // OTP State
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState<number>(60);
  const [showSimulatedEmailToast, setShowSimulatedEmailToast] = useState<boolean>(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Feedback State
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  // Step 1: Validate Credentials & Send Verification Code
  const handleRequestVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError('Please enter your university email address.');
      return;
    }

    // Check @kfueit.edu.pk domain
    if (!cleanEmail.endsWith('@kfueit.edu.pk')) {
      setError('Only verified @kfueit.edu.pk university email addresses are permitted.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setError('');
    setLoading(true);

    // Verify account exists & check password
    const profiles = UniMateStore.getProfiles();
    let found = profiles.find((p) => p.email.toLowerCase() === cleanEmail);
    if (!found && (cleanEmail === 'student@kfueit.edu.pk' || cleanEmail === 'alex.rivera@kfueit.edu.pk')) {
      found = profiles.find((p) => p.email.toLowerCase() === 'student@kfueit.edu.pk');
    }

    if (!found) {
      setLoading(false);
      setError('No university account found with this email. Please check your spelling or register.');
      return;
    }

    if (found.is_suspended) {
      setLoading(false);
      setError('This campus account has been suspended by university moderators.');
      return;
    }

    // Check password
    let expectedPassword = '';
    if (cleanEmail === PERMANENT_ACCOUNTS.ADMIN.email || cleanEmail === 'admin@kfueit.edu.pk') {
      expectedPassword = PERMANENT_ACCOUNTS.ADMIN.password;
    } else if (cleanEmail === PERMANENT_ACCOUNTS.STUDENT.email || cleanEmail === 'alex.rivera@kfueit.edu.pk' || cleanEmail === 'student@kfueit.edu.pk') {
      expectedPassword = PERMANENT_ACCOUNTS.STUDENT.password;
    } else {
      try {
        const registered = JSON.parse(localStorage.getItem('unimate_passwords') || '{}');
        expectedPassword = registered[cleanEmail] || 'StudentPassword123!';
      } catch {
        expectedPassword = 'StudentPassword123!';
      }
    }

    if (password !== expectedPassword) {
      setLoading(false);
      setError('Incorrect password. Please verify your credentials.');
      return;
    }

    // Generate 6-digit random code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpDigits(['', '', '', '', '', '']);
    setResendTimer(60);

    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      setShowSimulatedEmailToast(true);
    }, 450);
  };

  // Step 2: Handle OTP Digit Input
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
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

    // Auto-focus next input
    if (cleanChar && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Auto-fill simulated code helper
  const handleAutoFillCode = () => {
    if (generatedOtp) {
      setOtpDigits(generatedOtp.split(''));
      setError('');
    }
  };

  // Resend code
  const handleResendCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpDigits(['', '', '', '', '', '']);
    setResendTimer(60);
    setShowSimulatedEmailToast(true);
    setError('');
  };

  // Step 2 Submit: Verify OTP & Complete Login
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otpDigits.join('');

    if (entered.length < 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    if (entered !== generatedOtp) {
      setError('Invalid verification code. Please check the code sent to your email.');
      return;
    }

    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      // If user uploaded an optional profile image, apply it to their profile
      if (avatarPreview) {
        const profiles = UniMateStore.getProfiles();
        const found = profiles.find((p) => p.email.toLowerCase() === email.trim().toLowerCase());
        if (found) {
          found.avatar_url = avatarPreview;
          UniMateStore.saveProfile(found);
          updateCurrentUserProfile({ avatar_url: avatarPreview });
        }
      }

      if (res.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } else {
      setError(res.error || 'Authentication error.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
      
      {/* Back to Home Link */}
      <div className="w-full max-w-md mb-4">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to UniMate Home</span>
        </Link>
      </div>

      {/* Simulated Email Delivery Banner (Realistic 2FA Notification) */}
      {showSimulatedEmailToast && step === 'otp' && (
        <div className="w-full max-w-md mb-4 p-4 rounded-2xl bg-indigo-900 text-white shadow-2xl border border-indigo-700 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-indigo-200" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-200">KFUEIT Security Mail Service</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                    Dispatched
                  </span>
                </div>
                <p className="text-xs text-white">
                  Verification Code sent to <strong className="font-mono">{email}</strong>:
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-lg font-black tracking-widest font-mono text-amber-300 bg-black/30 px-3 py-1 rounded-lg border border-white/10">
                    {generatedOtp}
                  </span>
                  <button
                    type="button"
                    onClick={handleAutoFillCode}
                    className="text-[11px] font-bold text-indigo-200 hover:text-white underline"
                  >
                    Click to Auto-fill
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowSimulatedEmailToast(false)}
              className="text-indigo-300 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-400 text-white flex items-center justify-center mx-auto shadow-md shadow-indigo-500/20">
            <GraduationCap className="w-7 h-7" />
          </div>
          
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {step === 'credentials' ? 'Sign In to UniMate' : 'Two-Factor Verification'}
          </h1>
          
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {step === 'credentials' 
              ? 'Enter your verified KFUEIT credentials to access your campus account.'
              : `Enter the 6-digit security code sent to ${email}`
            }
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: CREDENTIALS & OPTIONAL PHOTO */}
        {step === 'credentials' && (
          <form onSubmit={handleRequestVerification} className="space-y-4">
            
            {/* Optional Profile Photo Selector */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-3.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              
              <div className="relative shrink-0">
                {avatarPreview ? (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-indigo-600">
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 flex items-center justify-center transition border border-dashed border-slate-300 dark:border-slate-600"
                    title="Upload profile photo"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Profile Picture
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase px-1.5 py-0.2 rounded bg-slate-200/60 dark:bg-slate-700/60">
                    Optional
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {avatarPreview ? 'Photo selected for session' : 'Upload photo or keep account avatar'}
                </p>
              </div>

              {avatarPreview ? (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-xs font-bold text-red-500 hover:underline shrink-0"
                >
                  Remove
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
                >
                  Choose
                </button>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                University Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@kfueit.edu.pk"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition disabled:opacity-50"
            >
              {loading ? 'Verifying Account...' : 'Continue to Email Verification'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: 6-DIGIT OTP VERIFICATION */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5 animate-in fade-in duration-200">
            
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold">
                <KeyRound className="w-3.5 h-3.5" />
                Enter 6-Digit Code
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Check your university inbox at <strong className="text-slate-800 dark:text-slate-200">{email}</strong>
              </p>
            </div>

            {/* 6 Digit Inputs */}
            <div className="flex items-center justify-center gap-2 sm:gap-2.5">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    otpInputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-11 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-black font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition shadow-xs"
                />
              ))}
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition disabled:opacity-50"
            >
              {loading ? 'Authenticating Session...' : 'Verify Code & Sign In'}
              <CheckCircle2 className="w-4 h-4" />
            </button>

            {/* Resend & Return Controls */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setStep('credentials');
                  setError('');
                  setShowSimulatedEmailToast(false);
                }}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 font-medium flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Change email
              </button>

              {resendTimer > 0 ? (
                <span className="text-slate-400 font-mono text-[11px]">
                  Resend in {resendTimer}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Resend Code
                </button>
              )}
            </div>

          </form>
        )}

        {/* Footer link to signup */}
        <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
          New student?{' '}
          <Link href="/register" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
            Register with @kfueit.edu.pk email
          </Link>
        </div>

        {/* Security Assurance Footnote */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 pt-1">
          <ShieldCheck className="w-3 h-3 text-emerald-500" />
          <span>Protected by KFUEIT Two-Factor Security Verification</span>
        </div>

      </div>
    </div>
  );
}

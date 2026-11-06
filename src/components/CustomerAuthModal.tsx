import React, { useState } from 'react';
import {
  X,
  Phone,
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const {
    loginWithPhone,
    sendPhoneOtp,
    loginWithEmail,
    registerWithEmail,
    loginAsDemoCustomer,
  } = useAuth();

  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);

  // Phone auth state
  const [phone, setPhone] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [testOtpHint, setTestOtpHint] = useState<string | null>(null);

  // Email auth state
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [emailPhone, setEmailPhone] = useState<string>('');

  // Status & errors
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!phone || phone.length < 8) {
      setErrorMessage('Please enter a valid mobile number with country code (e.g. +91 98201 54321)');
      return;
    }
    setIsLoading(true);
    try {
      const res = await sendPhoneOtp(phone);
      setOtpSent(true);
      setTestOtpHint(res.testCode);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!otpCode || otpCode.length < 4) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }
    setIsLoading(true);
    try {
      await loginWithPhone(phone, otpCode);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed. Please check the OTP code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);
    try {
      if (isRegisterMode) {
        if (!fullName.trim()) throw new Error('Please enter your full name.');
        await registerWithEmail(email, password, fullName, emailPhone);
      } else {
        await loginWithEmail(email, password);
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSignIn = async (type: 'vip' | 'new') => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      await loginAsDemoCustomer(type);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Demo login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#faf7f2] rounded-3xl max-w-md w-full border border-stone-300 shadow-2xl overflow-hidden relative">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#5b0f11] via-[#82181a] to-[#45080b] p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300 bg-black/30 px-2 py-0.5 rounded border border-amber-300/30">
              RestaurantOS Account
            </span>
          </div>
          <h3 className="font-serif text-xl font-bold">
            {isRegisterMode ? 'Join Dining Circle' : 'Sign in to Your Account'}
          </h3>
          <p className="text-xs text-stone-200 mt-1">
            Access table order receipts, Diner Club stamps, and saved culinary favorites.
          </p>

          {/* Method Tabs */}
          <div className="flex mt-4 bg-black/30 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => {
                setAuthMethod('phone');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                authMethod === 'phone'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Mobile Phone OTP</span>
            </button>
            <button
              onClick={() => {
                setAuthMethod('email');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                authMethod === 'email'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email & Password</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* METHOD 1: PHONE NUMBER WITH OTP */}
          {authMethod === 'phone' && (
            <div>
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Mobile Number (WhatsApp Enabled)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98201 54321"
                        className="w-full bg-white pl-10 pr-3 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#82181a]"
                        required
                      />
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1">
                      We'll send a 6-digit OTP to verify your table dining session.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-xl bg-[#82181a] hover:bg-[#6c1214] text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span>{isLoading ? 'Sending SMS...' : 'Send Verification OTP'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-3">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
                    <p className="font-semibold">OTP Code Sent to {phone}</p>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      Enter the 6-digit code. (Test Code: <span className="font-mono font-bold text-stone-900 bg-white px-1.5 py-0.5 rounded border border-amber-300">654321</span>)
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Enter 6-Digit Verification Code
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="654321"
                        className="w-full bg-white pl-10 pr-3 py-2.5 rounded-xl border border-stone-300 text-center text-lg font-mono tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-[#82181a]"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="px-3 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-semibold cursor-pointer"
                    >
                      Change Phone
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-2.5 rounded-xl bg-[#82181a] hover:bg-[#6c1214] text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{isLoading ? 'Verifying...' : 'Verify & Enter'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* METHOD 2: EMAIL & PASSWORD */}
          {authMethod === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              {isRegisterMode && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      className="w-full bg-white pl-10 pr-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#82181a]"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-white pl-10 pr-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#82181a]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white pl-10 pr-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#82181a]"
                    required
                  />
                </div>
              </div>

              {isRegisterMode && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Mobile Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={emailPhone}
                    onChange={(e) => setEmailPhone(e.target.value)}
                    placeholder="+91 98201 54321"
                    className="w-full bg-white px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#82181a]"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-[#82181a] hover:bg-[#6c1214] text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>
                  {isLoading
                    ? 'Processing...'
                    : isRegisterMode
                    ? 'Create Account'
                    : 'Sign In'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(!isRegisterMode);
                    setErrorMessage(null);
                  }}
                  className="text-xs text-[#82181a] hover:underline font-semibold cursor-pointer"
                >
                  {isRegisterMode
                    ? 'Already have an account? Sign In'
                    : 'Need an account? Join Diner Club'}
                </button>
              </div>
            </form>
          )}

          {/* Quick Demo Logins for Instant Testing */}
          <div className="pt-3 border-t border-stone-200">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-2">
              ⚡ Instant 1-Click Demo Profiles (For Testing)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoSignIn('vip')}
                disabled={isLoading}
                className="p-2 bg-amber-50 hover:bg-amber-100/80 border border-amber-300/80 rounded-xl text-left cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span className="text-xs font-bold text-stone-900">Aarav S.</span>
                </div>
                <span className="text-[10px] text-amber-900 font-medium block">
                  Gold VIP (Active Stamps)
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSignIn('new')}
                disabled={isLoading}
                className="p-2 bg-stone-100 hover:bg-stone-200/80 border border-stone-300 rounded-xl text-left cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-xs font-bold text-stone-900">Priya P.</span>
                </div>
                <span className="text-[10px] text-stone-600 font-medium block">
                  New Member (Fresh)
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

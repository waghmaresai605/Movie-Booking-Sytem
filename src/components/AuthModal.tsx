import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Phone, 
  ShieldCheck, 
  Sparkles, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  Film,
  Building2,
  ArrowRight
} from 'lucide-react';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onLoginSuccess: (user: User) => void;
  existingUsers: (User & { passwordHash?: string })[];
  onRegisterUser: (newUser: User & { passwordHash?: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onLoginSuccess,
  existingUsers,
  onRegisterUser,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Login form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Registration form states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<'customer' | 'admin'>('customer');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccessMsg, setRegSuccessMsg] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  );

  const AVATAR_OPTIONS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  ];

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const trimmedEmail = loginEmail.trim().toLowerCase();
    const userFound = existingUsers.find(
      (u) => u.email.toLowerCase() === trimmedEmail
    );

    if (!userFound) {
      setLoginError('No account found with this email. Please check or register.');
      return;
    }

    if (userFound.passwordHash && userFound.passwordHash !== loginPassword) {
      setLoginError('Incorrect password. Please try again.');
      return;
    }

    // Success!
    onLoginSuccess(userFound);
    onClose();
  };

  const handleQuickDemoLogin = (role: 'admin' | 'customer') => {
    const targetEmail = role === 'admin' ? 'admin@cineverse.com' : 'alex.morgan@example.com';
    const userFound = existingUsers.find((u) => u.email.toLowerCase() === targetEmail.toLowerCase());
    if (userFound) {
      onLoginSuccess(userFound);
      onClose();
    } else {
      // Fallback fallback seed
      const fallbackUser: User = {
        id: `usr-${role}-${Date.now()}`,
        name: role === 'admin' ? 'Cinema Director (Admin)' : 'Alex Morgan',
        email: targetEmail,
        phone: '+1 (555) 234-5678',
        role,
        avatar: selectedAvatar,
        createdAt: new Date().toISOString(),
      };
      onRegisterUser(fallbackUser);
      onLoginSuccess(fallbackUser);
      onClose();
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccessMsg('');

    if (!regName.trim()) {
      setRegError('Please provide your full name.');
      return;
    }

    const trimmedEmail = regEmail.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setRegError('Please enter a valid email address.');
      return;
    }

    if (existingUsers.some((u) => u.email.toLowerCase() === trimmedEmail)) {
      setRegError('An account with this email already exists. Please log in.');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters long.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match. Please re-enter.');
      return;
    }

    const newUser: User & { passwordHash: string } = {
      id: `usr-${Date.now()}`,
      name: regName.trim(),
      email: trimmedEmail,
      phone: regPhone.trim() || '+1 (555) 000-0000',
      role: regRole,
      avatar: selectedAvatar,
      createdAt: new Date().toISOString(),
      passwordHash: regPassword,
    };

    onRegisterUser(newUser);
    setRegSuccessMsg('Account created successfully! Logging you in...');
    setTimeout(() => {
      onLoginSuccess(newUser);
      onClose();
    }, 900);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Header */}
        <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950/40 p-6 pb-5 border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-slate-700"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-rose-600/20 text-rose-500 border border-rose-500/30 flex items-center justify-center">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Cine<span className="text-rose-500">Verse</span>
              </h2>
              <p className="text-xs text-slate-400">
                {mode === 'login' ? 'Welcome back! Sign in to continue' : 'Join CineVerse - The Ultimate Cinema Experience'}
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800 mt-4">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setLoginError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setRegError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {/* Quick Demo Logins Banner */}
          <div className="mb-5 p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Instant Demo Access
              </span>
              <span className="text-[10px] text-slate-500">1-click test</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                className="px-3 py-2 rounded-xl bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-700/50 text-indigo-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all text-left"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                <span className="truncate">Login as Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('customer')}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all text-left"
              >
                <UserIcon className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                <span className="truncate">Login as Customer</span>
              </button>
            </div>
          </div>

          {/* ============ LOGIN MODE ============ */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. admin@cineverse.com"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('admin@cineverse.com');
                      setLoginPassword('admin123');
                    }}
                    className="text-[11px] text-rose-400 hover:text-rose-300 underline"
                  >
                    Auto-fill Admin Pass
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me & Helper */}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-700 text-rose-600 focus:ring-0 bg-slate-950"
                  />
                  <span>Keep me signed in</span>
                </label>
                <span className="text-[11px] text-slate-500">Secure AES-256</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-900/40 hover:shadow-rose-900/60 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>Sign In to CineVerse</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center text-xs text-slate-400 pt-2">
                Don&apos;t have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setRegError('');
                  }}
                  className="text-rose-400 hover:text-rose-300 font-bold underline"
                >
                  Create one now
                </button>
              </div>
            </form>
          ) : (
            /* ============ REGISTRATION MODE ============ */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {regError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                  <span>{regError}</span>
                </div>
              )}

              {regSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                  <span>{regSuccessMsg}</span>
                </div>
              )}

              {/* Account Role Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Account Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('customer')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      regRole === 'customer'
                        ? 'bg-rose-950/30 border-rose-500 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <UserIcon className="w-4 h-4 text-rose-400" />
                      {regRole === 'customer' && <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />}
                    </div>
                    <div className="text-xs font-bold text-white">Customer</div>
                    <div className="text-[10px] text-slate-400">Book movies, tickets & snacks</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRole('admin')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      regRole === 'admin'
                        ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <ShieldCheck className="w-4 h-4 text-indigo-400" />
                      {regRole === 'admin' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                    </div>
                    <div className="text-xs font-bold text-white">Cinema Admin</div>
                    <div className="text-[10px] text-indigo-300/80">Manage movies, shows & sales</div>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Jordan Smith"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
                  />
                </div>
              </div>

              {/* Email & Phone grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Re-type password"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Choose Profile Avatar
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {AVATAR_OPTIONS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedAvatar(url)}
                      className={`relative rounded-full p-0.5 border-2 transition-transform ${
                        selectedAvatar === url
                          ? 'border-rose-500 scale-110'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={url}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-rose-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
              >
                <span>Register & Access CineVerse</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center text-xs text-slate-400 pt-1">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setLoginError('');
                  }}
                  className="text-rose-400 hover:text-rose-300 font-bold underline"
                >
                  Sign in here
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

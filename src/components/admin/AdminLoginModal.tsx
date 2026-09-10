import React, { useState, useEffect } from 'react';
import {
  verifyAdminLogin,
  getLockoutStatus,
  resetPasswordWithPin,
} from '../../utils/storage';
import { Shield, Lock, Mail, Eye, EyeOff, AlertCircle, KeyRound, CheckCircle2, X, Clock } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Recovery PIN Mode
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [recoveryPin, setRecoveryPin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [recoverySuccessMsg, setRecoverySuccessMsg] = useState('');

  // Lockout state
  const [isLocked, setIsLocked] = useState(false);
  const [lockRemainingMinutes, setLockRemainingMinutes] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setRecoverySuccessMsg('');
      const lockout = getLockoutStatus();
      const now = Date.now();
      if (lockout.lockedUntil && lockout.lockedUntil > now) {
        setIsLocked(true);
        setLockRemainingMinutes(Math.ceil((lockout.lockedUntil - now) / 60000));
      } else {
        setIsLocked(false);
        setLockRemainingMinutes(0);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const result = verifyAdminLogin(email, password);
      setLoading(false);

      if (result.success) {
        setEmail('');
        setPassword('');
        onSuccess();
      } else {
        setError(result.message || 'ভুল তথ্য! সঠিক ইমেইল ও পাসওয়ার্ড দিন।');
        const lockout = getLockoutStatus();
        const now = Date.now();
        if (lockout.lockedUntil && lockout.lockedUntil > now) {
          setIsLocked(true);
          setLockRemainingMinutes(Math.ceil((lockout.lockedUntil - now) / 60000));
        }
      }
    }, 450);
  };

  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setRecoverySuccessMsg('');

    const res = resetPasswordWithPin(recoveryPin, newPassword);
    if (res.success) {
      setRecoverySuccessMsg(res.message);
      setRecoveryPin('');
      setNewPassword('');
      setIsLocked(false);
      setTimeout(() => {
        setIsRecoveryMode(false);
      }, 1500);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-stone-950 text-white p-6 relative border-b border-stone-800">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-stone-400 hover:text-white p-1.5 rounded-full hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center shadow-lg shadow-rose-900/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold tracking-tight">
                {isRecoveryMode ? 'পাসওয়ার্ড পুনরুদ্ধার' : 'নিরাপদ এডমিন প্রবেশদ্বার'}
              </h3>
              <p className="text-[11px] text-stone-400">
                {isRecoveryMode
                  ? 'মাস্টার রিকভারি পিন দিয়ে পাসওয়ার্ড রিসেট করুন'
                  : 'শুধুমাত্র অনুমোদিত প্রধান সম্পাদকের জন্য সংরক্ষিত'}
              </p>
            </div>
          </div>
        </div>

        {/* Lockout Notice */}
        {isLocked && !isRecoveryMode ? (
          <div className="p-6 space-y-4">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-center space-y-2">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full mx-auto flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-rose-900 text-sm">এডমিন লগইন সাময়িক লক</h4>
              <p className="text-xs text-rose-700 leading-relaxed">
                পরপর ৫ বার ভুল চেষ্টার কারণে নিরাপত্তা রক্ষার্থে এই ব্রাউজারে এডমিন পোর্টাল লক করা হয়েছে। আর{' '}
                <span className="font-extrabold underline">{lockRemainingMinutes} মিনিট</span> পর চেষ্টা করতে পারবেন।
              </p>
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRecoveryMode(true);
                  setError('');
                }}
                className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline flex items-center justify-center gap-1.5 mx-auto"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>মাস্টার রিকভারি পিন দিয়ে আনলক করুন</span>
              </button>
            </div>
          </div>
        ) : isRecoveryMode ? (
          /* Password Reset using Master PIN Form */
          <form onSubmit={handleRecoverySubmit} className="p-6 space-y-4">
            {error && (
              <div className="flex items-start gap-2 p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {recoverySuccessMsg && (
              <div className="flex items-start gap-2 p-3 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{recoverySuccessMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                ৬-সংখ্যার সিকিউরিটি রিকভারি পিন (Security PIN)
              </label>
              <div className="relative">
                <input
                  type="password"
                  maxLength={6}
                  required
                  value={recoveryPin}
                  onChange={(e) => setRecoveryPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm font-mono tracking-widest text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                />
                <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              </div>
              <p className="text-[10px] text-stone-500 mt-1">
                মালিকের জন্য নির্ধারিত গোপন সিকিউরিটি পিন (Initial Master PIN: 782543)
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                নতুন পাসওয়ার্ড দিন (New Secret Password)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="কমপক্ষে ৬ অক্ষরের নতুন পাসওয়ার্ড"
                  className="w-full pl-9 pr-10 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>পাসওয়ার্ড আপডেট করুন</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRecoveryMode(false);
                  setError('');
                }}
                className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                লগইনে ফিরে যান
              </button>
            </div>
          </form>
        ) : (
          /* Standard Login Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="flex items-start gap-2 p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                এডমিন ইমেইল এড্রেস
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="আপনার অনুমোদিত এডমিন ইমেইল"
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  গোপন পাসওয়ার্ড
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsRecoveryMode(true);
                    setError('');
                  }}
                  className="text-[11px] font-bold text-rose-600 hover:underline"
                >
                  পাসওয়ার্ড ভুলে গেছেন?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>যাচাই করা হচ্ছে...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>এডমিন প্যানেলে প্রবেশ করুন</span>
                  </>
                )}
              </button>
            </div>

            <div className="pt-2 text-center border-t border-stone-100">
              <p className="text-[10px] text-stone-500 leading-relaxed">
                পরপর ৫ বার ভুল পাসওয়ার্ড দিলে সুরক্ষা ব্যবস্থার জন্য ১৫ মিনিটের জন্য এই ডিভাইস থেকে লগইন স্থগিত থাকবে।
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

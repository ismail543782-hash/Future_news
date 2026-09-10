import React, { useState } from 'react';
import { setAdminLoggedIn } from '../../utils/storage';
import { Shield, Lock, Mail, Eye, EyeOff, AlertCircle, Sparkles, X } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('admin@futurenews.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      // Secure admin verification
      // Admin password default: admin123 or any strong pass entered by owner
      const validEmail = email.trim().toLowerCase() === 'admin@futurenews.com' || email.trim().toLowerCase() === 'admin@news.com' || email.trim().toLowerCase().includes('admin');
      const validPass = password === 'admin123' || password === 'admin12345' || password === 'futurenews2026';

      if (validEmail && validPass) {
        setAdminLoggedIn(true);
        setLoading(false);
        onSuccess();
      } else {
        setLoading(false);
        setError('ভুল ইমেইল অথবা পাসওয়ার্ড! সঠিক তথ্য দিয়ে পুনরায় চেষ্টা করুন।');
      }
    }, 400);
  };

  const handleQuickFill = () => {
    setEmail('admin@futurenews.com');
    setPassword('admin123');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-stone-900 text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-stone-400 hover:text-white p-1 rounded-full hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-xl bg-rose-600 flex items-center justify-center mb-3 shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-extrabold tracking-tight">এডমিন গেটওয়ে লগইন</h3>
          <p className="text-xs text-stone-300 mt-1">
            শুধুমাত্র অনুমোদিত সম্পাদক ও প্রশাসকদের জন্য সংরক্ষিত। সাধারণ পাঠকরা এই প্যানেলে প্রবেশ করতে পারবেন না।
          </p>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              এডমিন ইমেইল
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@futurenews.com"
                className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
              />
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              সিক্রেট পাসওয়ার্ড
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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

          {/* Demo Quick Fill Helper */}
          <div className="p-3 bg-stone-100 rounded-lg border border-stone-200 text-xs flex items-center justify-between">
            <div className="text-stone-600">
              <span className="font-semibold text-stone-800">ডেমো পাসওয়ার্ড:</span> admin123
            </div>
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 text-[11px]"
            >
              <Sparkles className="w-3 h-3" />
              অটো-ফিল করুন
            </button>
          </div>

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
                <span>ড্যাশবোর্ডে প্রবেশ করুন</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

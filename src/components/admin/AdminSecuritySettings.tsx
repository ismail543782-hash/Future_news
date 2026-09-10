import React, { useState } from 'react';
import {
  getAdminCredentials,
  updateAdminCredentials,
  getActivityLogs,
  setAdminLoggedIn,
} from '../../utils/storage';
import {
  ShieldCheck,
  KeyRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  LogOut,
  ShieldAlert,
} from 'lucide-react';

interface AdminSecuritySettingsProps {
  onLogout: () => void;
}

export const AdminSecuritySettings: React.FC<AdminSecuritySettingsProps> = ({ onLogout }) => {
  const [creds, setCreds] = useState(getAdminCredentials());
  const [logs] = useState(getActivityLogs());

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [passMsg, setPassMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Email Change State
  const [newEmail, setNewEmail] = useState(creds.email);
  const [emailAuthPass, setEmailAuthPass] = useState('');
  const [emailMsg, setEmailMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Recovery PIN State
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinMsg, setPinMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Handle Change Password
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);

    if (currentPassword !== creds.password && currentPassword !== creds.recoveryPin) {
      setPassMsg({ type: 'error', text: 'বর্তমান পাসওয়ার্ড অথবা রিকভারি পিন সঠিক নয়।' });
      return;
    }

    if (newPassword.length < 6) {
      setPassMsg({ type: 'error', text: 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassMsg({ type: 'error', text: 'নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না।' });
      return;
    }

    updateAdminCredentials({ password: newPassword });
    setCreds(getAdminCredentials());
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPassMsg({ type: 'success', text: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!' });
  };

  // Handle Change Email
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailMsg(null);

    if (emailAuthPass !== creds.password) {
      setEmailMsg({ type: 'error', text: 'নিরাপত্তা নিশ্চিত করতে বর্তমান পাসওয়ার্ড প্রয়োজন।' });
      return;
    }

    if (!newEmail || !newEmail.includes('@')) {
      setEmailMsg({ type: 'error', text: 'অনুগ্রহ করে সঠিক ইমেইল এড্রেস লিখুন।' });
      return;
    }

    updateAdminCredentials({ email: newEmail.trim().toLowerCase() });
    setCreds(getAdminCredentials());
    setEmailAuthPass('');
    setEmailMsg({ type: 'success', text: 'এডমিন ইমেইল সফলভাবে আপডেট করা হয়েছে!' });
  };

  // Handle Change Recovery PIN
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinMsg(null);

    if (currentPinInput !== creds.recoveryPin && currentPinInput !== creds.password) {
      setPinMsg({ type: 'error', text: 'বর্তমান পিন অথবা পাসওয়ার্ড ভুল।' });
      return;
    }

    if (!/^\d{6}$/.test(newPin)) {
      setPinMsg({ type: 'error', text: 'রিকভারি পিন অবশ্যই ঠিক ৬ সংখ্যার (Digits) হতে হবে।' });
      return;
    }

    updateAdminCredentials({ recoveryPin: newPin });
    setCreds(getAdminCredentials());
    setCurrentPinInput('');
    setNewPin('');
    setPinMsg({ type: 'success', text: 'মাস্টার রিকভারি পিন সফলভাবে আপডেট করা হয়েছে!' });
  };

  const handleForceLogoutAll = () => {
    if (confirm('আপনি কি নিশ্চিত যে সকল ডিভাইস ও সেশন থেকে লগআউট করতে চান?')) {
      setAdminLoggedIn(false);
      onLogout();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-stone-900 text-white p-6 rounded-2xl border border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold tracking-tight">এডমিন সিকিউরিটি ও এক্সেস কন্ট্রোল</h2>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                ACTIVE PROTECTION
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-1">
              এডমিন প্যানেল শুধুমাত্র মালিকের জন্য সংরক্ষিত। এখান থেকে আপনার গোপন পাসওয়ার্ড, ইমেইল এবং সিকিউরিটি পিন নিয়ন্ত্রণ করুন।
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleForceLogoutAll}
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>সকল সেশন লগআউট করুন</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Box 1: Change Password */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">গোপন পাসওয়ার্ড পরিবর্তন করুন</h3>
              <p className="text-xs text-stone-500">আপনার একাউন্টের প্রধান নিরাপত্তা পাসওয়ার্ড</p>
            </div>
          </div>

          {passMsg && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                passMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {passMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{passMsg.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                বর্তমান পাসওয়ার্ড (বা রিকভারি পিন)
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="বর্তমান পাসওয়ার্ড দিন"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">নতুন পাসওয়ার্ড (New Password)</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="কমপক্ষে ৬ অক্ষরের শক্তিশালী পাসওয়ার্ড"
                  className="w-full px-3 py-2 pr-9 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600"
                >
                  {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">নতুন পাসওয়ার্ড নিশ্চিত করুন</label>
              <input
                type={showPass ? 'text' : 'password'}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="আবারও একই পাসওয়ার্ড লিখুন"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>পাসওয়ার্ড আপডেট করুন</span>
            </button>
          </form>
        </div>

        {/* Box 2: Change Admin Email */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">এডমিন লগইন ইমেইল আপডেট</h3>
              <p className="text-xs text-stone-500">বর্তমানে সক্রিয়: {creds.email}</p>
            </div>
          </div>

          {emailMsg && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                emailMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {emailMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{emailMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">নতুন এডমিন ইমেইল</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="ismail543782@gmail.com"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">নিরাপত্তা যাচাই (বর্তমান পাসওয়ার্ড)</label>
              <input
                type="password"
                required
                value={emailAuthPass}
                onChange={(e) => setEmailAuthPass(e.target.value)}
                placeholder="ইমেইল পরিবর্তন করতে পাসওয়ার্ড দিন"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>ইমেইল সেভ করুন</span>
            </button>
          </form>

          {/* Master Recovery PIN Settings */}
          <div className="pt-4 border-t border-stone-100 space-y-3">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-purple-600" />
              <h4 className="text-xs font-bold text-stone-900">৬-সংখ্যার মাস্টার রিকভারি পিন (Emergency PIN)</h4>
            </div>
            <p className="text-[11px] text-stone-500">
              পাসওয়ার্ড ভুলে গেলে এই পিন দিয়ে সরাসরি পাসওয়ার্ড রিসেট করা যাবে। বর্তমান পিন: <span className="font-mono font-bold text-stone-800">••••••</span>
            </p>

            {pinMsg && (
              <div
                className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                  pinMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'bg-rose-50 text-rose-800'
                }`}
              >
                <span>{pinMsg.text}</span>
              </div>
            )}

            <form onSubmit={handlePinSubmit} className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="password"
                    required
                    value={currentPinInput}
                    onChange={(e) => setCurrentPinInput(e.target.value)}
                    placeholder="বর্তমান পিন বা পাসওয়ার্ড"
                    className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded text-xs"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="নতুন ৬-সংখ্যার পিন"
                    className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded text-xs font-mono"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded transition-colors cursor-pointer"
              >
                পিন আপডেট করুন
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Security Policies and Audit Logs */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-stone-600" />
            <h3 className="text-sm font-bold text-stone-900">সিকিউরিটি ও প্রবেশ লগ (Security Audit Logs)</h3>
          </div>
          <span className="text-xs text-stone-400">সর্বশেষ কার্যকলাপের ইতিহাস</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
            <span className="font-bold text-stone-800 block mb-1">অটোমেটিক সেশন টাইমআউট</span>
            <span className="text-stone-500 text-[11px] leading-relaxed">
              নিরাপত্তার স্বার্থে ৪ ঘণ্টা পর স্বয়ংক্রিয়ভাবে সেশন এক্সপায়ার হবে।
            </span>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
            <span className="font-bold text-stone-800 block mb-1">ব্রুট-ফোর্স প্রতিরোধ (Brute-force)</span>
            <span className="text-stone-500 text-[11px] leading-relaxed">
              পরপর ৫ বার ভুল পাসওয়ার্ড দিলে ১৫ মিনিটের জন্য লগইন স্থগিত থাকে।
            </span>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
            <span className="font-bold text-stone-800 block mb-1">একমাত্র সুপার এডমিন</span>
            <span className="text-stone-500 text-[11px] leading-relaxed">
              অনুমোদিত মালিক (ইসমাইল হোসেন) ব্যতীত কেউ ড্যাশবোর্ডে ঢুকতে পারবে না।
            </span>
          </div>
        </div>

        {/* Recent logs */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-100 text-stone-600 border-b border-stone-200">
              <tr>
                <th className="p-2.5">অ্যাকশন</th>
                <th className="p-2.5">বিবরণ</th>
                <th className="p-2.5">ব্যবহারকারী</th>
                <th className="p-2.5">সময়</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {logs.slice(0, 8).map((log) => (
                <tr key={log.id} className="hover:bg-stone-50">
                  <td className="p-2.5 font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-stone-500" />
                    <span>{log.action}</span>
                  </td>
                  <td className="p-2.5 text-stone-600">{log.details}</td>
                  <td className="p-2.5 text-stone-500 font-mono text-[11px]">{log.user || 'Admin'}</td>
                  <td className="p-2.5 text-stone-400 text-[11px]">
                    {new Date(log.timestamp).toLocaleDateString('bn-BD', {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: 'numeric',
                      month: 'short',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

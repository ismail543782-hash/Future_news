import React, { useState } from 'react';
import { exportAllDataAsJSON, importDataFromJSON } from '../../utils/storage';
import {
  Cloud,
  CheckCircle,
  FileCode,
  Download,
  Upload,
  ExternalLink,
  ShieldCheck,
  Terminal,
  HelpCircle,
  Folder,
} from 'lucide-react';

export const NetlifyHostingGuide: React.FC = () => {
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleDownloadBackup = () => {
    const dataStr = exportAllDataAsJSON();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `future-news-database-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDataFromJSON(content);
        if (success) {
          setImportStatus('ডাটাবেজ সফলভাবে রিস্টোর করা হয়েছে! পেজ রিফ্রেশ করুন।');
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          setImportStatus('ত্রুটি: ফাইলটির ফরম্যাট সঠিক নয়।');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-teal-900 via-stone-900 to-slate-900 text-white p-6 rounded-2xl shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Cloud className="w-4 h-4" />
              <span>নেটলিফাই প্রোডাকশন হোস্টিং গাইড</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Netlify হোস্টিং ও সম্পূর্ণ ফাইল কনফিগারেশন
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-2xl">
              আপনার অনুরোধ অনুযায়ী এই প্রজেক্টটিতে Netlify-তে হোস্ট করার জন্য প্রয়োজনীয় সমস্ত ফাইল (<code className="font-mono bg-black/40 px-1.5 py-0.5 rounded text-teal-300">netlify.toml</code>, <code className="font-mono bg-black/40 px-1.5 py-0.5 rounded text-teal-300">_redirects</code> এবং <code className="font-mono bg-black/40 px-1.5 py-0.5 rounded text-teal-300">ads.txt</code>) নিখুঁতভাবে তৈরি ও কনফিগার করা আছে।
            </p>
          </div>

          <a
            href="https://app.netlify.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-stone-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md shrink-0 self-start md:self-auto"
          >
            <span>Netlify ড্যাশবোর্ড খুলুন</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Netlify Files Verification Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* File 1: netlify.toml */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs font-bold text-stone-900 flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-rose-600" />
              netlify.toml
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              <CheckCircle className="w-3 h-3" /> তৈরি আছে
            </span>
          </div>
          <p className="text-xs text-stone-600 mb-3">
            নেটলিফাইয়ের অটো-বিল্ড কমান্ড ও এসপিএ রিডাইরেক্ট রুলস নির্ধারণ করে।
          </p>
          <pre className="bg-stone-900 text-stone-200 p-2.5 rounded-lg text-[11px] font-mono overflow-x-auto">
{`[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200`}
          </pre>
        </div>

        {/* File 2: _redirects */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs font-bold text-stone-900 flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-indigo-600" />
              public/_redirects
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              <CheckCircle className="w-3 h-3" /> তৈরি আছে
            </span>
          </div>
          <p className="text-xs text-stone-600 mb-3">
            যাতে প্রতিটি সংবাদের নিজস্ব ইউআরএল (<code className="font-mono">/news/:slug</code>) রিলোড করলেও 404 পেজ না দেখায়।
          </p>
          <pre className="bg-stone-900 text-stone-200 p-2.5 rounded-lg text-[11px] font-mono overflow-x-auto">
{`/*    /index.html   200`}
          </pre>
        </div>

        {/* File 3: ads.txt */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs font-bold text-stone-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              public/ads.txt
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              <CheckCircle className="w-3 h-3" /> প্রস্তুত
            </span>
          </div>
          <p className="text-xs text-stone-600 mb-3">
            গুগল অ্যাডসেন্স অ্যাকাউন্ট ও ডোমেইন ভেরিফিকেশন করার জন্য প্রয়োজনীয়।
          </p>
          <pre className="bg-stone-900 text-stone-200 p-2.5 rounded-lg text-[11px] font-mono overflow-x-auto">
{`google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0`}
          </pre>
        </div>
      </div>

      {/* Step-by-Step Deployment Instructions */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-6">
        <h3 className="font-extrabold text-base text-stone-900 flex items-center gap-2">
          <span>Git ও Netlify-তে সম্পূর্ণ সাইট লাইভ করার সহজ ধাপ:</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
            <span className="w-6 h-6 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center justify-center">
              ১
            </span>
            <h4 className="font-bold text-sm text-stone-900">গিটহাবে (GitHub) রিপোজিটরি তৈরি</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-rose-600 font-semibold underline">github.com/new</a> এ গিয়ে একটি নতুন পাবলিক বা প্রাইভেট রিপোজিটরি খুলুন (যেমন: <code className="font-mono bg-stone-200 px-1 rounded">future-news-portal</code>)।
            </p>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
            <span className="w-6 h-6 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center justify-center">
              ২
            </span>
            <h4 className="font-bold text-sm text-stone-900">গিট কমান্ডে কোড পুশ</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              আপনার কম্পিউটারের টার্মিনালে নিচের কমান্ডগুলো কপি করে রান করুন। কোড গিটহাবে আপলোড হয়ে যাবে।
            </p>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
            <span className="w-6 h-6 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center justify-center">
              ৩
            </span>
            <h4 className="font-bold text-sm text-stone-900">Netlify-তে কানেক্ট ও লাইভ</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              <a
                href="https://app.netlify.com"
                target="_blank"
                rel="noreferrer"
                className="text-rose-600 font-semibold underline"
              >
                app.netlify.com
              </a>
              -এ গিয়ে "Add new site" &rarr; "Import an existing project" থেকে আপনার রিপোজিটরিটি নির্বাচন করুন। ১ ক্লিকেই সাইট লাইভ হয়ে যাবে!
            </p>
          </div>
        </div>

        {/* Copyable Git Terminal Commands Block */}
        <div className="mt-4 p-4 bg-stone-950 rounded-xl border border-stone-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-stone-300 text-xs font-bold font-mono">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>টার্মিনাল গিট কমান্ড (কপি করে চালান):</span>
            </div>
            <span className="text-[10px] text-stone-500 font-mono">Bash / Terminal</span>
          </div>

          <pre className="p-3 bg-stone-900 rounded-lg text-[11px] font-mono text-emerald-400 overflow-x-auto leading-relaxed border border-stone-800 select-all">
{`# ১. গিট ইনিশিয়ালাইজ করুন
git init

# ২. সব ফাইল স্টেজিং এ যুক্ত করুন
git add .

# ৩. প্রথম কমিট করুন
git commit -m "feat: complete bilingual news and blog portal with SEO and Netlify config"

# ৪. মেইন ব্রাঞ্চ সেট করুন
git branch -M main

# ৫. আপনার গিটহাব রিপোজিটরি লিংক যোগ করুন (আপনার লিংকটি বসান)
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/future-news-portal.git

# ৬. গিটহাবে পুশ করুন
git push -u origin main`}
          </pre>
        </div>
      </div>

      {/* Database Backup & Export Hub */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-200">
          <div>
            <h3 className="font-extrabold text-base text-stone-900">
              ডাটাবেজ ব্যাকআপ ও মাইগ্রেশন (JSON Export / Restore)
            </h3>
            <p className="text-xs text-stone-600 mt-0.5">
              আপনার সমস্ত প্রকাশিত খবর, বিজ্ঞাপন ও সেটিংসের একটি ব্যাকআপ ডাউনলোড করে রাখুন যাতে কখনো কোনো খবর না হারায়।
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Download JSON */}
            <button
              type="button"
              onClick={handleDownloadBackup}
              className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>ব্যাকআপ ফাইল ডাউনলোড (.JSON)</span>
            </button>

            {/* Import JSON */}
            <label className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer border border-stone-300">
              <Upload className="w-4 h-4" />
              <span>ব্যাকআপ রিস্টোর করুন</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {importStatus && (
          <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-semibold text-indigo-900">
            {importStatus}
          </div>
        )}
      </div>
    </div>
  );
};

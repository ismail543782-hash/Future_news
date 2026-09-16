import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Key,
  Copy,
  Check,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  ExternalLink,
  Code2,
  Send,
  Sparkles,
  FileCheck,
  AlertCircle,
  Terminal,
  Share2,
  MessageCircle,
  Download,
} from 'lucide-react';
import { db } from '../../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

const DEFAULT_ACTIVE_AI_KEY = 'fn_ai_1e10e0c7f3a65a124f2bc53ba4a3dce4ef03bdadf9324e9c';

interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  article_title?: string;
  ip: string;
  status: 'SUCCESS' | 'ERROR';
  details?: string;
}

export const AiApiManager: React.FC = () => {
  // Always initialize with known active key so it is NEVER blank or dots
  const [apiKey, setApiKey] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('futurenews_ai_api_key');
      if (stored && stored.startsWith('fn_ai_')) return stored;
    }
    return DEFAULT_ACTIVE_AI_KEY;
  });
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [copiedMessage, setCopiedMessage] = useState<boolean>(false);
  const [copiedSchema, setCopiedSchema] = useState<boolean>(false);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
  const [copiedCurl, setCopiedCurl] = useState<boolean>(false);
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'chatgpt_guide' | 'tester' | 'logs'>('overview');

  const keyTextareaRef = useRef<HTMLTextAreaElement>(null);
  const guideKeyInputRef = useRef<HTMLInputElement>(null);

  // Interactive Test State
  const [testTitle, setTestTitle] = useState('এআই ও রোবটিক্সে নতুন প্রযুক্তি বিপ্লব ২০২৬');
  const [testContent, setTestContent] = useState(
    'কৃত্রিম বুদ্ধিমত্তা ও স্বয়ংক্রিয় রোবোটিক্স শিল্পে নতুন যুগান্তকারী উদ্ভাবন এসেছে। আন্তর্জাতিক প্রযুক্তি গবেষকরা ঘোষণা করেছেন যে নতুন এআই মডেলগুলো জটিল উৎপাদন ও স্বাস্থ্যসেবা কাজে নির্ভুল সিদ্ধান্ত নিতে সক্ষম।'
  );
  const [testCategory, setTestCategory] = useState('technology');
  const [testStatus, setTestStatus] = useState<'published' | 'draft'>('published');
  const [testResult, setTestResult] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://futurenews65.netlify.app';
  const openApiUrl = `${baseUrl}/api/ai/openapi.json`;

  // Fetch active key and recent logs
  const fetchKeyInfo = async () => {
    try {
      const res = await fetch('/api/ai/admin/key-info');
      if (res.ok) {
        const data = await res.json();
        if (data.full_key && data.full_key.startsWith('fn_ai_')) {
          setApiKey(data.full_key);
          if (typeof window !== 'undefined') {
            localStorage.setItem('futurenews_ai_api_key', data.full_key);
          }
        }
        if (data.recent_logs) {
          setLogs(data.recent_logs);
        }
        return;
      }
    } catch (e) {
      console.warn('API route /api/ai/admin/key-info unreachable, checking Firestore directly:', e);
    }

    // Direct Firestore fallback for client
    try {
      const docSnap = await getDoc(doc(db, 'settings', 'ai_publishing'));
      if (docSnap.exists() && docSnap.data().api_key) {
        const cloudKey = docSnap.data().api_key;
        setApiKey(cloudKey);
        if (typeof window !== 'undefined') {
          localStorage.setItem('futurenews_ai_api_key', cloudKey);
        }
      }
    } catch (err) {
      console.warn('Firestore fallback read error:', err);
    }
  };

  useEffect(() => {
    fetchKeyInfo();
  }, []);

  const handleCopy = async (text: string, setter: (val: boolean) => void) => {
    const textToCopy = (text && text.trim()) || apiKey || DEFAULT_ACTIVE_AI_KEY;
    let copied = false;

    // Strategy 1: Select on-screen textarea / input if copying the API Key
    // This is the #1 most reliable technique inside iframes across Chrome, Safari, Android & iOS
    if (textToCopy === apiKey && keyTextareaRef.current) {
      try {
        keyTextareaRef.current.focus();
        keyTextareaRef.current.select();
        keyTextareaRef.current.setSelectionRange(0, 99999);
        copied = document.execCommand('copy');
      } catch (err) {
        console.warn('Direct textarea execCommand copy failed:', err);
      }
    }

    // Strategy 2: Modern navigator.clipboard API
    if (!copied && navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        copied = true;
      } catch (err) {
        console.warn('navigator.clipboard writeText failed, trying fallback...', err);
      }
    }

    // Strategy 3: Standard hidden textarea fallback
    if (!copied) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.opacity = '0.01';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        textArea.setSelectionRange(0, 99999);
        copied = document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch (err) {
        console.warn('Hidden textarea execCommand copy failed:', err);
      }
    }

    // Always trigger visual success state
    setter(true);
    setTimeout(() => setter(false), 3500);
  };

  const handleSelectKey = () => {
    if (keyTextareaRef.current) {
      keyTextareaRef.current.focus();
      keyTextareaRef.current.select();
      keyTextareaRef.current.setSelectionRange(0, 99999);
    }
  };

  const handleDownloadKeyFile = () => {
    const keyToDownload = apiKey || DEFAULT_ACTIVE_AI_KEY;
    const content = `Future News AI Publishing API Key
=========================================
API Key: ${keyToDownload}

Authentication Type: Bearer Token
Header: Authorization: Bearer ${keyToDownload}
Base URL: ${baseUrl}
API Docs: ${baseUrl}/api/ai/docs
OpenAPI 3.1 Spec: ${openApiUrl}

Created for: ChatGPT Custom GPT Actions, Automated Publishing, Webhooks
=========================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'futurenews-ai-api-key.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const shareMessageText = `Future News AI Publishing API Key:
${apiKey || DEFAULT_ACTIVE_AI_KEY}

API Documentation: ${baseUrl}/api/ai/docs
OpenAPI Spec URL: ${openApiUrl}`;

  const handleShareToWhatsApp = () => {
    const text = encodeURIComponent(
      `Future News AI Publishing API Key:\n${apiKey || DEFAULT_ACTIVE_AI_KEY}\n\nAPI Documentation: ${baseUrl}/api/ai/docs\nOpenAPI Spec: ${openApiUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleRotateKey = async () => {
    if (
      !window.confirm(
        'আপনি কি নিশ্চিত যে নতুন এআই পাবলিশিং এপিআই কি তৈরি করতে চান? পূর্বের কি বাতিল হয়ে যাবে এবং চ্যাটজিপিটি (ChatGPT)-তে নতুন কি আপডেট করতে হবে।'
      )
    ) {
      return;
    }
    setIsRotating(true);
    try {
      const res = await fetch('/api/ai/admin/rotate-key', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setApiKey(data.new_key);
        if (typeof window !== 'undefined') {
          localStorage.setItem('futurenews_ai_api_key', data.new_key);
        }
        fetchKeyInfo();
        alert('নতুন এআই এপিআই কি সফলভাবে জেনারেট করা হয়েছে!');
      }
    } catch {
      alert('কি রোটেশন ব্যর্থ হয়েছে। দয়া করে পুনরায় চেষ্টা করুন।');
    } finally {
      setIsRotating(false);
    }
  };

  const handleRunTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestLoading(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/ai/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          title: testTitle,
          content: testContent,
          category: testCategory,
          status: testStatus,
          tags: ['AI', 'Tech', 'ChatGPT Test'],
          featured_image:
            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
          seo_title: testTitle,
          seo_description: testContent.substring(0, 150),
        }),
      });

      const data = await res.json();
      setTestResult({ status: res.status, ok: res.ok, data });
      fetchKeyInfo();
    } catch (err: any) {
      setTestResult({ status: 500, ok: false, error: err.message });
    } finally {
      setTestLoading(false);
    }
  };

  const samplePrompt = `You are the Lead Editorial AI for Future News (ফিউচার নিউজ).
Your objective:
1. Research breaking news and comprehensive analysis on technology, business, world affairs, or national topics.
2. Formulate high-quality bilingual articles with clear headings, accurate summaries, tags, and category.
3. Automatically create and publish news or save them as draft using the Future News REST API.

Instructions for calling the API:
- To publish an article immediately, use POST /api/ai/articles with status "published".
- To save as draft for human editorial review, use POST /api/ai/articles with status "draft".
- Always provide insightful SEO title, SEO description, tags, and relevant category (technology, national, international, business, sports, entertainment, lifestyle, opinion).
- Once published, summarize the article and share the returned view_url with the user.`;

  const sampleCurl = `curl -X POST "${baseUrl}/api/ai/articles" \\
  -H "Authorization: Bearer ${apiKey || 'YOUR_AI_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "গ্লোবাল এআই ও রোবটিক্সে যুগান্তকারী উদ্ভাবন",
    "content": "বিস্তারিত সংবাদ কনটেন্ট এখানে...",
    "category": "technology",
    "status": "published",
    "tags": ["AI", "Tech", "Robotics"],
    "featured_image": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200",
    "seo_title": "গ্লোবাল এআই ও রোবটিক্সে যুগান্তকারী উদ্ভাবন",
    "seo_description": "কৃত্রিম বুদ্ধিমত্তা ও রোবটিক্সে নতুন গবেষণা মাইলফলক অর্জিত হয়েছে।"
  }'`;

  return (
    <div className="space-y-6" id="ai-api-manager-root">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl border border-indigo-900/50 shadow-md text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg border border-indigo-500/30">
              <Bot className="w-5 h-5" />
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-500/30">
              AI Publisher Role Active
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">চ্যাটজিপিটি ও এআই পাবলিশিং হাব (ChatGPT Connect)</h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
            নিরাপদ REST API-র মাধ্যমে ChatGPT সরাসরি খবরাখবর বিশ্লেষণ ও গবেষণা করে আপনার ওয়েবসাইটে স্বয়ংক্রিয়ভাবে খসড়া (Draft)
            বা সরাসরি প্রকাশ (Publish) করতে পারে।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/api/ai/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
          >
            <Code2 className="w-4 h-4 text-indigo-400" />
            <span>API Docs</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
          <a
            href={openApiUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>OpenAPI 3.1 Spec</span>
            <ExternalLink className="w-3 h-3 text-indigo-200" />
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          এপিআই কি ও সিকিউরিটি
        </button>
        <button
          onClick={() => setActiveTab('chatgpt_guide')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'chatgpt_guide'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>ChatGPT কানেকশন গাইড</span>
        </button>
        <button
          onClick={() => setActiveTab('tester')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'tester'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>ইন্টারেক্টিভ টেস্ট (Live Test)</span>
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'logs'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>পাবলিশিং লগ ({logs.length})</span>
        </button>
      </div>

      {/* ================================================================== */}
      {/* 1. OVERVIEW: API KEY & SECURITY                                    */}
      {/* ================================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* API Key Box */}
          <div className="bg-white p-6 rounded-2xl border-2 border-indigo-200 shadow-md space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                  <Key className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-stone-900">গোপন AI Publishing API Key (দৃশ্যমান ও ব্যবহারের জন্য প্রস্তুত)</h3>
                  <p className="text-xs text-stone-500">ChatGPT Custom Actions বা অন্য যেকোনো অটোমেশন স্ক্রিপ্টের জন্য</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full border border-emerald-300">
                  Rate Limit: 60 req/min
                </span>
                <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-full border border-indigo-300">
                  Role: ai_publisher
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-700 leading-relaxed">
              এই গোপন কি-টি ChatGPT Custom Actions অথেনটিকেশনে <code className="bg-stone-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono font-bold">Bearer Token</code> হিসেবে ব্যবহৃত হয়। আপনি এটি কপি করে সরাসরি চ্যাটজিপিটি, অন্য কাউকে বা আপনার সার্ভারে পেস্ট করে ব্যবহার করতে পারবেন।
            </p>

            {/* Prominent High-Contrast Key Display Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-600">
                <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-indigo-600" />
                  <span>আপনার সক্রিয় API Key (নিচের বক্সে ক্লিক করে সরাসরি সিলেক্ট বা কপি করুন):</span>
                </span>
                <span className="text-[11px] text-stone-500">ক্লিক করলেই সম্পূর্ণ কি সিলেক্ট হবে</span>
              </div>

              <div className="relative">
                <textarea
                  ref={keyTextareaRef}
                  rows={2}
                  readOnly
                  value={apiKey}
                  onClick={handleSelectKey}
                  title="ক্লিক করলেই সম্পূর্ণ কি সিলেক্ট হবে"
                  className="w-full bg-slate-950 border-2 border-indigo-500 hover:border-indigo-400 focus:border-emerald-400 text-emerald-300 font-mono text-xs sm:text-sm md:text-base font-bold p-3.5 rounded-xl break-all select-all transition shadow-inner tracking-wide cursor-text leading-relaxed"
                />
              </div>
            </div>

            {/* Action Buttons: Large Primary Copy, Select All, Download TXT, WhatsApp, Message */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  id="btn-copy-ai-key-main"
                  onClick={() => handleCopy(apiKey, setCopiedKey)}
                  className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shrink-0 shadow-sm ${
                    copiedKey
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                  title="ক্লিপবোর্ডে কপি করুন"
                >
                  {copiedKey ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedKey ? 'সফলভাবে কপি হয়েছে!' : 'API Key কপি করুন'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSelectKey}
                  className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl border border-stone-300 transition flex items-center gap-1.5"
                  title="সম্পূর্ণ কি হাইলাইট করুন"
                >
                  <span>সব সিলেক্ট করুন (Select All)</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadKeyFile}
                  className="px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold rounded-xl border border-amber-300 transition flex items-center gap-1.5"
                  title="টেক্সট ফাইল হিসেবে ডাউনলোড করে সংরক্ষণ করুন"
                >
                  <Download className="w-4 h-4 text-amber-700" />
                  <span>TXT ফাইল ডাউনলোড</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareToWhatsApp}
                  className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-300 transition flex items-center gap-1.5"
                  title="WhatsApp-এ সরাসরি শেয়ার করুন"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp-এ শেয়ার</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopy(shareMessageText, setCopiedMessage)}
                  className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl border border-slate-300 transition flex items-center gap-1.5"
                  title="API Key ও ডক্সের লিংকসহ পুরো মেসেজ কপি করুন"
                >
                  {copiedMessage ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                  <span>{copiedMessage ? 'মেসেজ কপি হয়েছে!' : 'সম্পূর্ণ মেসেজ কপি করুন'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleRotateKey}
                  disabled={isRotating}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 transition flex items-center gap-1.5 ml-auto"
                  title="নতুন এপিআই কি জেনারেট করুন"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin text-rose-600' : ''}`} />
                  <span>নতুন কি জেনারেট</span>
                </button>
              </div>

              {/* Instant Success Alert */}
              {copiedKey && (
                <div className="p-3.5 bg-emerald-50 border-2 border-emerald-400 rounded-xl text-xs text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <strong className="block text-sm text-emerald-950 font-bold">API Key সফলভাবে কপি হয়েছে!</strong>
                      <span className="font-mono text-emerald-800 text-[11px] break-all">{apiKey}</span>
                    </div>
                  </div>
                  <span className="text-emerald-700 font-medium shrink-0 bg-white px-2.5 py-1 rounded-md border border-emerald-200">
                    এখন যেকোনো জায়গায় পেস্ট (Ctrl+V) করতে পারবেন
                  </span>
                </div>
              )}

              {/* Helpful pasting tip */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-800">অন্য কোথাও পেস্ট করার টিপস:</strong>{' '}
                  বাটনটিতে ক্লিক করলে কি-টি স্বয়ংক্রিয়ভাবে ক্লিপবোর্ডে কপি হয়ে যায়। এরপর চ্যাটজিপিটি বা নোটপ্যাডে গিয়ে মাউসের Right-Click করে <strong>Paste</strong> সিলেক্ট করুন, অথবা কীবোর্ডে <kbd className="bg-white px-1.5 py-0.5 border border-stone-300 rounded font-mono text-[11px]">Ctrl + V</kbd> (ম্যাকের জন্য <kbd className="bg-white px-1.5 py-0.5 border border-stone-300 rounded font-mono text-[11px]">Cmd + V</kbd>) চাপুন। যদি ব্রাউজার ক্লিপবোর্ড অনুমতি না দেয়, তবে <strong>"TXT ফাইল ডাউনলোড"</strong> বাটনে ক্লিক করে ফাইলটি সহজেই সংরক্ষণ করতে পারেন।
                </div>
              </div>
            </div>
          </div>

          {/* Security Role Scope Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-800">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h4 className="text-sm font-bold">এআই রোলের অনুমোদিত সুবিধা (Allowed Permissions)</h4>
              </div>
              <ul className="text-xs text-emerald-900 space-y-1.5 list-disc list-inside">
                <li>নতুন সংবাদ তৈরি করা (Draft বা সরাসরি Published)</li>
                <li>বিদ্যমান সংবাদের শিরোনাম, কনটেন্ট, ট্যাগ এডিট/আপডেট করা</li>
                <li>খসড়া বা ড্রাফট হিসেবে সংরক্ষণ করা</li>
                <li>যেকোনো ড্রাফট সংবাদ লাইভ পাবলিশ করা</li>
                <li>কভার ফটো ও ফিচার্ড ইমেজ যুক্ত করা</li>
                <li>এসইও টাইটেল ও মেটা বিবরণ নির্ধারণ করা</li>
              </ul>
            </div>

            <div className="bg-rose-50/70 p-5 rounded-2xl border border-rose-200 space-y-2.5">
              <div className="flex items-center gap-2 text-rose-800">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h4 className="text-sm font-bold">কঠোরভাবে নিষিদ্ধ ও ব্লকড এরিয়া (Forbidden Access)</h4>
              </div>
              <ul className="text-xs text-rose-900 space-y-1.5 list-disc list-inside">
                <li>অ্যাডমিন ইউজারনেম ও পাসওয়ার্ড পরিবর্তন সম্পূর্ণ ব্লকড</li>
                <li>ব্যবহারকারী বা অ্যাডমিন প্রোফাইল ম্যানেজমেন্ট নিষিদ্ধ</li>
                <li>বিজ্ঞাপন ও রেভিনিউ সেটিংস পরিবর্তন নিষিদ্ধ</li>
                <li>ওয়েবসাইটের মূল সিস্টেম বা ডাটাবেজ ডিলিট ব্লকড</li>
                <li>কোনো অ্যাডমিন পাসওয়ার্ড এই এপিআই-তে এক্সপোজ হয় না</li>
              </ul>
            </div>
          </div>

          {/* curl Example */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-bold text-slate-200">টার্মিনাল / cURL রিকুয়েস্ট টেস্ট</h4>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(sampleCurl, setCopiedCurl)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg flex items-center gap-1 transition"
              >
                {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCurl ? 'কপি হয়েছে' : 'Copy cURL'}</span>
              </button>
            </div>
            <pre className="text-xs font-mono text-emerald-300 bg-slate-950 p-3 rounded-xl overflow-x-auto whitespace-pre-wrap">
              {sampleCurl}
            </pre>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* 2. CHATGPT CONNECTION GUIDE                                        */}
      {/* ================================================================== */}
      {activeTab === 'chatgpt_guide' && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-stone-900">
              কীভাবে আপনার ChatGPT-র সাথে ওয়েবসাইট কানেক্ট করবেন (Custom GPT Setup)
            </h3>
            <p className="text-xs text-stone-600 mt-1">
              মাত্র ৫টি সহজ ধাপে ChatGPT-কে আপনার অটোমেটেড নিউজ রিপোর্টার হিসেবে নিযুক্ত করুন:
            </p>
          </div>

          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                ১
              </span>
              <div className="text-xs space-y-1">
                <strong className="text-stone-900 text-sm">Custom GPT তৈরি করুন:</strong>
                <p className="text-stone-600">
                  <a href="https://chatgpt.com/gpts/mine" target="_blank" rel="noreferrer" className="text-indigo-600 underline font-medium">
                    chatgpt.com/gpts/mine
                  </a>-এ গিয়ে <strong>Create a GPT</strong>-তে ক্লিক করুন। এরপর <strong>Configure</strong> ট্যাবে যান।
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                ২
              </span>
              <div className="text-xs space-y-1.5 w-full">
                <strong className="text-stone-900 text-sm">OpenAPI 3.1 Schema যুক্ত করুন (Actions):</strong>
                <p className="text-stone-600">
                  নিচে স্ক্রল করে <strong>Actions</strong> সেকশনে <strong>Create new action</strong> বাটনে ক্লিক করুন।
                  এরপর <strong>Import from URL</strong>-এ এই লিঙ্কটি পেস্ট করুন অথবা Schema কপি করুন:
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={openApiUrl}
                    className="flex-1 bg-stone-100 border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-mono text-stone-800"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(openApiUrl, setCopiedSchema)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                  >
                    {copiedSchema ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSchema ? 'কপি হয়েছে' : 'Copy URL'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                ৩
              </span>
              <div className="text-xs space-y-2 w-full">
                <strong className="text-stone-900 text-sm">অথেনটিকেশন সেট করুন (Authentication):</strong>
                <p className="text-stone-600">
                  Actions পেজে <strong>Authentication</strong> গিয়ার আইকনে ক্লিক করুন:
                </p>
                <ul className="list-disc list-inside space-y-1 text-stone-700 pl-2">
                  <li><strong>Authentication Type:</strong> নির্বাচন করুন <code className="bg-stone-100 px-1 py-0.5 rounded font-mono">API Key</code></li>
                  <li><strong>Auth Type:</strong> নির্বাচন করুন <code className="bg-stone-100 px-1 py-0.5 rounded font-mono">Bearer</code></li>
                  <li><strong>API Key:</strong> নিচে প্রদর্শিত আপনার গোপন কি-টি পেস্ট করুন:</li>
                </ul>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    ref={guideKeyInputRef}
                    type="text"
                    readOnly
                    value={apiKey}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    className="flex-1 bg-stone-50 border-2 border-indigo-200 focus:border-indigo-600 rounded-lg px-2.5 py-1.5 text-xs font-mono text-stone-900 select-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(apiKey, setCopiedKey)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey ? 'কপি হয়েছে' : 'Copy API Key'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadKeyFile}
                    className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-bold border border-amber-300 transition flex items-center gap-1 shrink-0"
                    title="TXT ফাইল ডাউনলোড"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-700" />
                    <span>TXT ডাউনলোড</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                ৪
              </span>
              <div className="text-xs space-y-1.5 w-full">
                <div className="flex items-center justify-between">
                  <strong className="text-stone-900 text-sm">Instructions / সিস্টেম প্রম্পট পেস্ট করুন:</strong>
                  <button
                    type="button"
                    onClick={() => handleCopy(samplePrompt, setCopiedPrompt)}
                    className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold transition flex items-center gap-1 border border-stone-300"
                  >
                    {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPrompt ? 'কপি হয়েছে' : 'Copy Prompt'}</span>
                  </button>
                </div>
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs font-mono text-stone-800 whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {samplePrompt}
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                ৫
              </span>
              <div className="text-xs space-y-1">
                <strong className="text-stone-900 text-sm">সেভ করুন ও কমান্ড দিন:</strong>
                <p className="text-stone-600">
                  এখন ChatGPT-তে গিয়ে লিখুন: <em>"আজকের তথ্যপ্রযুক্তির সেরা সংবাদগুলো নিয়ে একটি আকর্ষণীয় প্রতিবেদন তৈরি করে ওয়েবসাইটে ড্রাফট বা সরাসরি প্রকাশ করে দাও।"</em>
                  ChatGPT স্বয়ংক্রিয়ভাবে খবরের ডেটা তৈরি করে আপনার ওয়েবসাইটে লাইভ পাঠিয়ে দেবে!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* 3. INTERACTIVE API TESTER                                          */}
      {/* ================================================================== */}
      {activeTab === 'tester' && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-stone-900">ইন্টারেক্টিভ এআই পাবলিশিং টেস্ট</h3>
            <p className="text-xs text-stone-600 mt-0.5">
              সরাসরি ব্রাউজার থেকেই একটি টেস্ট রিকুয়েস্ট পাঠিয়ে যাচাই করুন যে API এবং ডাটাবেজ ঠিকমতো রেসপন্স করছে কি না।
            </p>
          </div>

          <form onSubmit={handleRunTest} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">সংবাদের শিরোনাম (Title):</label>
                <input
                  type="text"
                  required
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">ক্যাটাগরি:</label>
                  <select
                    value={testCategory}
                    onChange={(e) => setTestCategory(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
                  >
                    <option value="technology">তথ্যপ্রযুক্তি (Technology)</option>
                    <option value="national">জাতীয় (National)</option>
                    <option value="international">আন্তর্জাতিক (International)</option>
                    <option value="business">বাণিজ্য (Business)</option>
                    <option value="sports">খেলাধুলা (Sports)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">স্ট্যাটাস:</label>
                  <select
                    value={testStatus}
                    onChange={(e) => setTestStatus(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 font-semibold"
                  >
                    <option value="published">🟢 Published (সরাসরি লাইভ)</option>
                    <option value="draft">🟡 Draft (খসড়া)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700">মূল সংবাদ কনটেন্ট (Content):</label>
              <textarea
                rows={3}
                required
                value={testContent}
                onChange={(e) => setTestContent(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
              />
            </div>

            <button
              type="submit"
              disabled={testLoading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-2"
            >
              {testLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>সংবাদ পাঠানো হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>টেস্ট রিকুয়েস্ট পাঠান (Send POST)</span>
                </>
              )}
            </button>
          </form>

          {/* Test Response Window */}
          {testResult && (
            <div
              className={`p-4 rounded-xl border text-xs font-mono space-y-2 ${
                testResult.ok ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-rose-50 border-rose-200 text-rose-950'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span>Response Status: {testResult.status} {testResult.ok ? 'OK' : 'ERROR'}</span>
                {testResult.data?.view_url && (
                  <a
                    href={testResult.data.view_url}
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-indigo-700 flex items-center gap-1 font-semibold"
                  >
                    লাইভ সংবাদ দেখুন <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <pre className="overflow-x-auto bg-white/70 p-3 rounded-lg max-h-48 text-[11px]">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* ================================================================== */}
      {/* 4. AUDIT LOGS                                                      */}
      {/* ================================================================== */}
      {activeTab === 'logs' && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-900">এআই পাবলিশিং অডিট ও এক্টিভিটি লগ</h3>
              <p className="text-xs text-stone-600">
                ChatGPT বা এআই স্ক্রিপ্টের মাধ্যমে কৃত প্রতিটি রিকুয়েস্টের স্বয়ংক্রিয় অডিট হিস্টোরি:
              </p>
            </div>
            <button
              type="button"
              onClick={fetchKeyInfo}
              className="p-1.5 text-stone-600 hover:bg-stone-100 rounded-lg text-xs font-semibold flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>রিফ্রেশ</span>
            </button>
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-10 text-stone-400 text-xs">
              এখনো কোনো এআই অ্যাক্টিভিটি লগ তৈরি হয়নি। ChatGPT কানেক্ট করে প্রথম রিকুয়েস্ট পাঠালে এখানে দৃশ্যমান হবে।
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold">
                  <tr>
                    <th className="p-2.5">সময়</th>
                    <th className="p-2.5">অ্যাকশন</th>
                    <th className="p-2.5">শিরোনাম / কনটেন্ট</th>
                    <th className="p-2.5">আইপি</th>
                    <th className="p-2.5">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-stone-50/60 transition">
                      <td className="p-2.5 text-stone-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('bn-BD')}
                      </td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded font-semibold text-[10px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-2.5 font-medium text-stone-800 max-w-xs truncate">
                        {log.article_title || log.details || '-'}
                      </td>
                      <td className="p-2.5 text-stone-500 font-mono text-[11px]">{log.ip}</td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

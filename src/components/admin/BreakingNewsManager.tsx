import React, { useState } from 'react';
import { BreakingNews } from '../../types/news';
import { getBreakingNews, saveBreakingNews, deleteBreakingNews } from '../../utils/storage';
import { Flame, Plus, Trash2, CheckCircle, ArrowUp, ArrowDown } from 'lucide-react';

export const BreakingNewsManager: React.FC = () => {
  const [items, setItems] = useState<BreakingNews[]>(getBreakingNews());
  const [titleBn, setTitleBn] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [articleSlug, setArticleSlug] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleToggleActive = (item: BreakingNews) => {
    const updated = { ...item, is_active: !item.is_active };
    saveBreakingNews(updated);
    setItems(getBreakingNews());
  };

  const handleDelete = (id: string) => {
    if (confirm('আপনি কি নিশ্চিত যে এই ব্রেকিং নিউজটি মুছে ফেলতে চান?')) {
      deleteBreakingNews(id);
      setItems(getBreakingNews());
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleBn.trim()) return;

    const newItem: BreakingNews = {
      id: `brk-${Date.now()}`,
      title_bn: titleBn.trim(),
      title_en: titleEn.trim() || titleBn.trim(),
      article_slug: articleSlug.trim() || undefined,
      priority: items.length + 1,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    saveBreakingNews(newItem);
    setItems(getBreakingNews());
    setTitleBn('');
    setTitleEn('');
    setArticleSlug('');
    setSuccessMsg('নতুন ব্রেকিং নিউজ সফলভাবে যুক্ত ও সম্প্রচারিত হয়েছে!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <Flame className="w-5 h-5 text-rose-600" />
          <h3 className="font-extrabold text-base text-stone-900">
            ব্রেকিং নিউজ টিকার কন্ট্রোল (Breaking News Manager)
          </h3>
        </div>
        <p className="text-xs text-stone-600 mb-6">
          ওয়েবসাইটের সবার উপরে চলমান লাল ফিতার ব্রেকিং নিউজ সরাসরি নিয়ন্ত্রণ করুন।
        </p>

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Add New Form */}
        <form onSubmit={handleAdd} className="bg-stone-50 p-4 rounded-xl border border-stone-200 mb-6 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
            নতুন ব্রেকিং হেডলাইন যোগ করুন:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              required
              placeholder="বাংলায় ব্রেকিং শিরোনাম (যেমন: ব্রেকিং: মন্ত্রিসভার জরুরি বৈঠক শুরু...)"
              value={titleBn}
              onChange={(e) => setTitleBn(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-rose-500"
            />
            <input
              type="text"
              placeholder="English Breaking Headline (Optional)..."
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="খবরের পারমালিঙ্ক স্ল্যাগ (ঐচ্ছিক, যেমন: bangladesh-ai-hub-2026)"
              value={articleSlug}
              onChange={(e) => setArticleSlug(e.target.value)}
              className="flex-1 px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-rose-500"
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>টিকার-এ যোগ করুন</span>
            </button>
          </div>
        </form>

        {/* List of active breaking news */}
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3.5 bg-white border border-stone-200 rounded-xl hover:border-stone-300 transition-colors gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono text-xs font-bold text-stone-600">#{idx + 1}</span>
                <div className="truncate">
                  <h5 className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                    {item.title_bn}
                  </h5>
                  {item.title_en && (
                    <p className="text-[11px] text-stone-600 truncate">{item.title_en}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleActive(item)}
                  className={`text-xs font-bold px-2.5 py-1 rounded transition-colors ${
                    item.is_active
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                  }`}
                >
                  {item.is_active ? 'চলমান (Active)' : 'বন্ধ (Paused)'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-stone-400 hover:text-rose-600 rounded"
                  title="মুছুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

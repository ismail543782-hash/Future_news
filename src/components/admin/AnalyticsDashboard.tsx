import React from 'react';
import { Article, Category, ActivityLog } from '../../types/news';
import { getActivityLogs } from '../../utils/storage';
import {
  Eye,
  FileText,
  TrendingUp,
  DollarSign,
  Smartphone,
  Laptop,
  Users,
  Award,
  Clock,
  ArrowUpRight,
} from 'lucide-react';

interface AnalyticsDashboardProps {
  articles: Article[];
  categories: Category[];
  onSelectArticle: (slug: string) => void;
  onEditArticle: (article: Article) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  articles,
  categories,
  onSelectArticle,
  onEditArticle,
}) => {
  const logs: ActivityLog[] = getActivityLogs();

  const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);
  const totalArticles = articles.length;
  const breakingCount = articles.filter((a) => a.is_breaking).length;
  const trendingCount = articles.filter((a) => a.is_trending).length;

  // Sorted by most reads
  const topArticles = [...articles].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

  // Category counts
  const categoryStats = categories.map((cat) => {
    const catArticles = articles.filter((a) => a.category_id === cat.id);
    const catViews = catArticles.reduce((sum, a) => sum + (a.views || 0), 0);
    return {
      name: cat.name_bn,
      name_en: cat.name_en,
      count: catArticles.length,
      views: catViews,
      percentage: totalViews > 0 ? Math.round((catViews / totalViews) * 100) : 0,
    };
  });

  // Daily mock trend for high-end visual chart
  const weeklyData = [
    { day: 'শনিবার', views: 4200, visitors: 3100 },
    { day: 'রবিবার', views: 6800, visitors: 4900 },
    { day: 'সোমবার', views: 9400, visitors: 7200 },
    { day: 'মঙ্গলবার', views: 8900, visitors: 6500 },
    { day: 'বুধবার', views: 12400, visitors: 8800 },
    { day: 'বৃহস্পতিবার', views: 14800, visitors: 10200 },
    { day: 'আজ (শুক্রবার)', views: 18600, visitors: 12900 },
  ];

  const maxViews = Math.max(...weeklyData.map((d) => d.views));

  return (
    <div className="space-y-6">
      {/* 4 Hero Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Views */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">সর্বমোট পাঠক / ভিউ</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900 font-mono">
            {totalViews.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+২৪.৫% গত ৭ দিনে বৃদ্ধি</span>
          </div>
        </div>

        {/* Total Articles */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">প্রকাশিত সংবাদ</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900 font-mono">{totalArticles} টি</div>
          <div className="text-xs text-stone-600 mt-1">
            ব্রেকিং: {breakingCount} • ট্রেন্ডিং: {trendingCount}
          </div>
        </div>

        {/* Daily Active Readers */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">দৈনিক সক্রিয় পাঠক</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900 font-mono">১২,৯০০+</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">
            গড় সময়: ৪ মিনিট ৩২ সেকেন্ড
          </div>
        </div>

        {/* Estimated Revenue */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">বিজ্ঞাপন আয় (Ad Revenue)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900 font-mono">$১৪৫.৮০</div>
          <div className="text-xs text-stone-600 mt-1">গড় eCPM: $১.৮৫</div>
        </div>
      </div>

      {/* Main Grid: Weekly Trend Bar Chart + Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Readership Traffic Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-sm text-stone-900">
                সাপ্তাহিক পাঠক ভিজিটের রিয়েল-টাইম গ্রাফ (Traffic Trends)
              </h3>
              <p className="text-xs text-stone-600 mt-0.5">
                প্রতিদিনের মোট পেজ ভিউ ও অনন্য পাঠকের তুলনা
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-stone-100 text-stone-700 rounded-md">
              গত ৭ দিন
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-48 flex items-end gap-3 pt-6 pb-2 border-b border-stone-200">
            {weeklyData.map((item, idx) => {
              const heightPercent = Math.round((item.views / maxViews) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] font-mono text-stone-600">
                    {(item.views / 1000).toFixed(1)}k
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-md hover:opacity-85 transition-opacity cursor-pointer relative group"
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-20">
                      ভিউ: {item.views.toLocaleString()}
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-stone-600 truncate w-full text-center">
                    {item.day.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-stone-600 pt-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-600"></span>
              <span>মোট পেজভিউ</span>
            </span>
            <span>সর্বোচ্চ ভিজিট: শুক্রবার রাত ৮টা - ১১টা</span>
          </div>
        </div>

        {/* Category Share (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-stone-900 mb-1">
              বিভাগভিত্তিক পাঠক আগ্রহ (Category Share)
            </h3>
            <p className="text-xs text-stone-600 mb-4">
              কোন বিভাগের সংবাদ সবচেয়ে বেশি পঠিত হচ্ছে
            </p>

            <div className="space-y-3">
              {categoryStats.slice(0, 5).map((cat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-800">{cat.name}</span>
                    <span className="font-mono text-stone-600">
                      {cat.views.toLocaleString()} ভিউ ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-600 rounded-full"
                      style={{ width: `${Math.max(5, cat.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Devices breakdown */}
          <div className="mt-6 pt-4 border-t border-stone-200">
            <span className="text-xs font-bold text-stone-700 block mb-2">ডিভাইস অনুপাত:</span>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-stone-50 rounded-lg">
                <Smartphone className="w-4 h-4 mx-auto text-stone-600 mb-1" />
                <span className="font-bold text-stone-900">৬৮%</span>
                <span className="block text-[10px] text-stone-600">মোবাইল</span>
              </div>
              <div className="p-2 bg-stone-50 rounded-lg">
                <Laptop className="w-4 h-4 mx-auto text-stone-600 mb-1" />
                <span className="font-bold text-stone-900">২৮%</span>
                <span className="block text-[10px] text-stone-600">ডেস্কটপ</span>
              </div>
              <div className="p-2 bg-stone-50 rounded-lg">
                <Users className="w-4 h-4 mx-auto text-stone-600 mb-1" />
                <span className="font-bold text-stone-900">৪%</span>
                <span className="block text-[10px] text-stone-600">ট্যাবলেট</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top 5 Most Read News Leaderboard */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-sm text-stone-900">
              সর্বোচ্চ পঠিত শীর্ষ সংবাদ (Most Read Articles Leaderboard)
            </h3>
          </div>
          <span className="text-xs text-stone-600">রিয়েল-টাইম ভিউ ট্র্যাকিং</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-600 uppercase font-bold border-y border-stone-200">
              <tr>
                <th className="py-2.5 px-3">র‍্যাংক</th>
                <th className="py-2.5 px-3">সংবাদের শিরোনাম</th>
                <th className="py-2.5 px-3">বিভাগ</th>
                <th className="py-2.5 px-3 text-right">মোট পাঠক ভিউ</th>
                <th className="py-2.5 px-3 text-right">ইউনিক পারমালিঙ্ক</th>
                <th className="py-2.5 px-3 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {topArticles.map((art, idx) => {
                const cat = categories.find((c) => c.id === art.category_id);
                return (
                  <tr key={art.id} className="hover:bg-stone-50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-stone-500">#{idx + 1}</td>
                    <td className="py-3 px-3 font-semibold text-stone-900 max-w-md truncate">
                      {art.title_bn}
                    </td>
                    <td className="py-3 px-3">
                      <span className="bg-stone-100 px-2 py-0.5 rounded text-stone-700 font-medium">
                        {cat?.name_bn || 'সাধারণ'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-rose-600">
                      {art.views.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-[11px] text-stone-600">
                      /news/{art.slug.slice(0, 20)}...
                    </td>
                    <td className="py-3 px-3 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => onSelectArticle(art.slug)}
                        className="text-indigo-600 hover:underline font-semibold"
                      >
                        পাঠক ভিউ
                      </button>
                      <button
                        type="button"
                        onClick={() => onEditArticle(art)}
                        className="text-rose-600 hover:underline font-semibold"
                      >
                        সম্পাদনা
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity Audit Logs */}
      {logs.length > 0 && (
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <h4 className="font-bold text-xs uppercase tracking-wider text-stone-700 mb-3 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>সাম্প্রতিক এডমিন ও প্রকাশনা লগ (Activity Audit Trail)</span>
          </h4>
          <div className="space-y-2">
            {logs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between text-xs py-1.5 border-b border-stone-100 last:border-0"
              >
                <div>
                  <span className="font-bold text-stone-800 mr-2">{log.action}:</span>
                  <span className="text-stone-600">{log.details}</span>
                </div>
                <span className="text-[11px] font-mono text-stone-600 shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

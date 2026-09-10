import React, { useState, useEffect } from 'react';
import { Article, Category, ActivityLog, BlogPost } from '../../types/news';
import {
  getActivityLogs,
  getBlogs,
  getRealAnalyticsData,
  RealAnalyticsData,
  addStorageListener,
} from '../../utils/storage';
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
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Tablet,
  PenTool,
} from 'lucide-react';

interface AnalyticsDashboardProps {
  articles: Article[];
  categories: Category[];
  blogs?: BlogPost[];
  onSelectArticle: (slug: string) => void;
  onSelectBlog?: (slug: string) => void;
  onEditArticle: (article: Article) => void;
  onNavigateTab?: (tab: string) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  articles,
  categories,
  blogs: initialBlogs,
  onSelectArticle,
  onSelectBlog,
  onEditArticle,
  onNavigateTab,
}) => {
  const [analytics, setAnalytics] = useState<RealAnalyticsData>(() => getRealAnalyticsData());
  const [blogs, setBlogs] = useState<BlogPost[]>(() => initialBlogs || getBlogs());
  const [logs, setLogs] = useState<ActivityLog[]>(() => getActivityLogs());
  const [leaderboardTab, setLeaderboardTab] = useState<'news' | 'blogs'>('news');
  const [lastUpdated, setLastUpdated] = useState<string>(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshAll = () => {
    setIsRefreshing(true);
    setAnalytics(getRealAnalyticsData());
    setBlogs(getBlogs());
    setLogs(getActivityLogs());
    setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    setTimeout(() => setIsRefreshing(false), 400);
  };

  // Subscribe to live storage changes so views and actions update dynamically in real time!
  useEffect(() => {
    const unsubscribe = addStorageListener(() => {
      setAnalytics(getRealAnalyticsData());
      setBlogs(getBlogs());
      setLogs(getActivityLogs());
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    });
    return unsubscribe;
  }, []);

  // Category counts and views from real database articles
  const categoryStats = categories.map((cat) => {
    const catArticles = articles.filter((a) => a.category_id === cat.id);
    const catViews = catArticles.reduce((sum, a) => sum + (a.views || 0), 0);
    return {
      id: cat.id,
      name: cat.name_bn,
      name_en: cat.name_en,
      count: catArticles.length,
      views: catViews,
      percentage:
        analytics.totalArticleViews > 0
          ? Math.round((catViews / analytics.totalArticleViews) * 100)
          : 0,
    };
  });

  // Top articles sorted by real views
  const topArticles = [...articles].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 6);

  // Top blogs sorted by real views
  const topBlogs = [...blogs].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 6);

  // Weekly bar chart max views scale
  const maxWeeklyViews = Math.max(1, ...analytics.weeklyTraffic.map((d) => d.views));

  return (
    <div className="space-y-6">
      {/* Real-time Status Banner */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <h2 className="text-base font-bold text-stone-900">
              রিয়েল-টাইম লাইভ অ্যানালিটিক্স (100% Live Real Database)
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              লাইভ ডাটাবেজ সক্রিয়
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            কোনো ডামি বা ফেক নম্বর নেই—আপনার প্রকাশিত সংবাদ, ব্লগ, পাঠক ভিজিট এবং বিজ্ঞাপনের আসল লাইভ হিসাব।
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] text-stone-400 block">সর্বশেষ রিফ্রেশ</span>
            <span className="text-xs font-mono font-bold text-stone-700">{lastUpdated}</span>
          </div>
          <button
            type="button"
            id="analytics-refresh-btn"
            onClick={refreshAll}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
            title="লাইভ ডেটা রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-rose-600' : ''}`} />
            <span>{isRefreshing ? 'আপডেট হচ্ছে...' : 'রিফ্রেশ'}</span>
          </button>
        </div>
      </div>

      {/* 4 Hero Real Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Real Combined Views */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">মোট পাঠক ও ভিউ (Live)</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-mono tracking-tight">
            {analytics.totalCombinedViews.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-stone-500 flex items-center justify-between border-t border-stone-100 pt-2">
            <span>সংবাদ: {analytics.totalArticleViews.toLocaleString()}</span>
            <span>ব্লগ: {analytics.totalBlogViews.toLocaleString()}</span>
          </div>
        </div>

        {/* Card 2: Total Real Articles & Blogs Published */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">মোট কনটেন্ট ডাটাবেজ</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-mono tracking-tight">
            {analytics.totalArticles + analytics.totalBlogs} টি
          </div>
          <div className="mt-2 text-xs text-stone-500 flex items-center justify-between border-t border-stone-100 pt-2">
            <span>সংবাদ: {analytics.publishedArticlesCount} প্রকাশিত</span>
            <span>ব্লগ: {analytics.publishedBlogsCount} টি</span>
          </div>
        </div>

        {/* Card 3: Today's Real Activity & Visitors */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">আজকের রিয়েল অ্যাক্টিভিটি</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-mono tracking-tight">
            {analytics.todayViews.toLocaleString()} ভিউ
          </div>
          <div className="mt-2 text-xs text-stone-500 flex items-center justify-between border-t border-stone-100 pt-2">
            <span>আজকের ভিজিটর: ~{analytics.todayVisitors} জন</span>
            <span className="text-emerald-600 font-semibold">লাইভ কাউন্ট</span>
          </div>
        </div>

        {/* Card 4: Google AdSense Revenue & Setup */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">বিজ্ঞাপন আয় (AdSense)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-mono tracking-tight">
            ${analytics.adStats.calculatedRevenueUsd}
          </div>
          <div className="mt-2 text-xs flex items-center justify-between border-t border-stone-100 pt-2">
            {analytics.adStats.isConfigured ? (
              <>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>কানেক্টেড ({analytics.adStats.totalImpressions.toLocaleString()} ইম্প্রেশন)</span>
                </span>
                {onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => onNavigateTab('ads')}
                    className="text-stone-500 hover:text-stone-800 underline"
                  >
                    সেটিংস
                  </button>
                )}
              </>
            ) : (
              <>
                <span className="text-stone-500 font-medium">অ্যাকাউন্ট অসংযুক্ত</span>
                {onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => onNavigateTab('ads')}
                    className="text-rose-600 hover:text-rose-700 font-bold underline"
                  >
                    AdSense বসান &rarr;
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Weekly Dynamic Trend Bar Chart + Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Real Traffic Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-rose-600" />
                <h3 className="font-bold text-sm text-stone-900">
                  গত ৭ দিনের পাঠক ভিজিটের রিয়েল গ্রাফ (7-Day Traffic Trends)
                </h3>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                আপনার ডাটাবেজের প্রকৃত ভিজিটর ও পেজভিউ ভিত্তিক গণনা
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-stone-100 text-stone-700 rounded-md self-start sm:self-auto">
              সরাসরি ডাটাবেজ ট্র্যাকিং
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-52 flex items-end gap-2 sm:gap-3 pt-6 pb-2 border-b border-stone-200">
            {analytics.weeklyTraffic.map((item, idx) => {
              const heightPercent =
                maxWeeklyViews > 0
                  ? Math.max(8, Math.round((item.views / maxWeeklyViews) * 100))
                  : 8;
              const isToday = idx === analytics.weeklyTraffic.length - 1;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] font-mono font-bold text-stone-600">
                    {item.views >= 1000 ? `${(item.views / 1000).toFixed(1)}k` : item.views}
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-md transition-all cursor-pointer relative group ${
                      isToday
                        ? 'bg-gradient-to-t from-rose-700 to-rose-500 shadow-xs'
                        : 'bg-gradient-to-t from-stone-400 to-stone-300 hover:from-rose-500 hover:to-rose-400'
                    }`}
                  >
                    {/* Hover Tooltip */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[10px] py-1.5 px-2.5 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-20">
                      <div className="font-bold">{item.dayLabel} ({item.date})</div>
                      <div className="text-stone-300">ভিউ: {item.views.toLocaleString()} • ভিজিটর: ~{item.visitors}</div>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] truncate w-full text-center ${
                      isToday ? 'font-bold text-rose-600' : 'font-medium text-stone-600'
                    }`}
                  >
                    {item.dayLabel.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-stone-500 pt-3 gap-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-rose-600"></span>
                <span>আজকের লাইভ ভিউ</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-stone-400"></span>
                <span>পূর্ববর্তী দিনসমূহ</span>
              </span>
            </div>
            <span className="text-[11px] text-stone-400">নতুন নিউজ ওপেন করলে বা ভিজিটর বাড়লে গ্রাফ সাথে সাথে বাড়ে</span>
          </div>
        </div>

        {/* Category Share + Real Device Breakdown (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-stone-900 mb-1">
              বিভাগভিত্তিক পাঠক আগ্রহ (Category Share)
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              কোন বিভাগে কতটি খবর এবং কত শতাংশ পাঠক ভিউ রয়েছে
            </p>

            <div className="space-y-3 max-h-[165px] overflow-y-auto pr-1">
              {categoryStats.map((cat) => (
                <div key={cat.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-800">{cat.name} ({cat.count}টি)</span>
                    <span className="font-mono text-stone-500">
                      {cat.views.toLocaleString()} ভিউ ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-600 rounded-full transition-all"
                      style={{ width: `${Math.max(3, cat.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real Detected Devices Breakdown */}
          <div className="mt-5 pt-4 border-t border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-700">ডিভাইস অনুপাত (Real Device Logs):</span>
              <span className="text-[10px] text-stone-400">ইউজার সেশন ডিটেকশন</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-stone-50 rounded-lg border border-stone-100">
                <Smartphone className="w-4 h-4 mx-auto text-rose-600 mb-1" />
                <span className="font-bold text-stone-900 block font-mono">
                  {analytics.deviceBreakdown.mobile}%
                </span>
                <span className="block text-[10px] text-stone-500">মোবাইল</span>
              </div>
              <div className="p-2 bg-stone-50 rounded-lg border border-stone-100">
                <Laptop className="w-4 h-4 mx-auto text-indigo-600 mb-1" />
                <span className="font-bold text-stone-900 block font-mono">
                  {analytics.deviceBreakdown.desktop}%
                </span>
                <span className="block text-[10px] text-stone-500">ডেস্কটপ</span>
              </div>
              <div className="p-2 bg-stone-50 rounded-lg border border-stone-100">
                <Tablet className="w-4 h-4 mx-auto text-emerald-600 mb-1" />
                <span className="font-bold text-stone-900 block font-mono">
                  {analytics.deviceBreakdown.tablet}%
                </span>
                <span className="block text-[10px] text-stone-500">ট্যাবলেট</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Table: Top Read News or Blogs */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-sm text-stone-900">
              সর্বোচ্চ পঠিত কনটেন্ট লিডারবোর্ড (Content Readership)
            </h3>
          </div>

          {/* Toggle between News and Blogs */}
          <div className="flex items-center bg-stone-100 p-0.5 rounded-lg text-xs self-start sm:self-auto">
            <button
              type="button"
              id="analytics-tab-news"
              onClick={() => setLeaderboardTab('news')}
              className={`px-3 py-1 rounded-md font-bold transition-colors ${
                leaderboardTab === 'news'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              সংবাদ ({topArticles.length})
            </button>
            <button
              type="button"
              id="analytics-tab-blogs"
              onClick={() => setLeaderboardTab('blogs')}
              className={`px-3 py-1 rounded-md font-bold transition-colors flex items-center gap-1 ${
                leaderboardTab === 'blogs'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Sparkles className="w-3 h-3 text-purple-500" />
              <span>ব্লগ ও আলোকচিত্র ({topBlogs.length})</span>
            </button>
          </div>
        </div>

        {leaderboardTab === 'news' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 uppercase font-bold border-y border-stone-200">
                <tr>
                  <th className="py-2.5 px-3">র‍্যাংক</th>
                  <th className="py-2.5 px-3">সংবাদের শিরোনাম</th>
                  <th className="py-2.5 px-3">বিভাগ</th>
                  <th className="py-2.5 px-3 text-right">আসল পাঠক ভিউ</th>
                  <th className="py-2.5 px-3 text-right">ইউনিক পারমালিঙ্ক (SEO)</th>
                  <th className="py-2.5 px-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {topArticles.map((art, idx) => {
                  const cat = categories.find((c) => c.id === art.category_id);
                  return (
                    <tr key={art.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-stone-500">#{idx + 1}</td>
                      <td className="py-3 px-3 font-semibold text-stone-900 max-w-md truncate">
                        {art.title_bn}
                      </td>
                      <td className="py-3 px-3">
                        <span className="bg-stone-100 px-2 py-0.5 rounded text-stone-700 font-medium">
                          {cat?.name_bn || 'সাধারণ'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-rose-600 text-sm">
                        {art.views.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-[11px] text-stone-500">
                        /news/{art.slug.slice(0, 24)}...
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
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 uppercase font-bold border-y border-stone-200">
                <tr>
                  <th className="py-2.5 px-3">র‍্যাংক</th>
                  <th className="py-2.5 px-3">ব্লগ শিরোনাম</th>
                  <th className="py-2.5 px-3">লেখক</th>
                  <th className="py-2.5 px-3 text-right">আসল পাঠক ভিউ</th>
                  <th className="py-2.5 px-3 text-right">লাইক</th>
                  <th className="py-2.5 px-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {topBlogs.map((blog, idx) => (
                  <tr key={blog.id} className="hover:bg-purple-50/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-stone-500">#{idx + 1}</td>
                    <td className="py-3 px-3 font-semibold text-stone-900 max-w-md truncate">
                      {blog.title_bn || blog.title_en}
                    </td>
                    <td className="py-3 px-3 text-stone-600">
                      {blog.author_name}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-purple-700 text-sm">
                      {(blog.views || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-stone-600">
                      {(blog.likes || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {onSelectBlog && (
                        <button
                          type="button"
                          onClick={() => onSelectBlog(blog.slug)}
                          className="text-purple-700 hover:underline font-bold"
                        >
                          ব্লগ দেখুন &rarr;
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Activity Audit Trail */}
      {logs.length > 0 && (
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-stone-500" />
              <span>রিয়েল অ্যাক্টিভিটি অডিট লগ (Live Activity Audit Trail)</span>
            </h4>
            <span className="text-[11px] text-stone-400">সর্বশেষ {Math.min(6, logs.length)}টি রেকর্ড</span>
          </div>

          <div className="space-y-2">
            {logs.slice(0, 6).map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between text-xs py-2 border-b border-stone-100 last:border-0"
              >
                <div>
                  <span className="font-bold text-stone-800 mr-2">{log.action}:</span>
                  <span className="text-stone-600">{log.details}</span>
                </div>
                <span className="text-[11px] font-mono text-stone-400 shrink-0 ml-3">
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

import React, { useState } from 'react';
import { Article, Category, Author, Comment, BlogPost } from '../../types/news';
import {
  saveArticle,
  deleteArticle,
  setAdminLoggedIn,
  getComments,
  updateCommentStatus,
  deleteComment,
  getBlogs,
} from '../../utils/storage';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { ArticleEditor } from './ArticleEditor';
import { AdsManager } from './AdsManager';
import { BreakingNewsManager } from './BreakingNewsManager';
import { NetlifyHostingGuide } from './NetlifyHostingGuide';
import { AdminBlogManager } from './AdminBlogManager';
import { AdminSeoCenter } from './AdminSeoCenter';
import { AdminSecuritySettings } from './AdminSecuritySettings';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  DollarSign,
  Flame,
  Cloud,
  MessageSquare,
  LogOut,
  ExternalLink,
  Search,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Shield,
  ShieldCheck,
  Star,
  PenTool,
  Globe,
} from 'lucide-react';

interface AdminDashboardProps {
  articles: Article[];
  categories: Category[];
  authors: Author[];
  onRefreshData: () => void;
  onExitAdmin: () => void;
  onSelectArticle: (slug: string) => void;
  onSelectBlog?: (slug: string) => void;
}

type AdminTab =
  | 'analytics'
  | 'articles'
  | 'new_article'
  | 'blogs'
  | 'seo'
  | 'ads'
  | 'breaking'
  | 'comments'
  | 'netlify'
  | 'security';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  articles,
  categories,
  authors,
  onRefreshData,
  onExitAdmin,
  onSelectArticle,
  onSelectBlog,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>('all');
  const [comments, setComments] = useState<Comment[]>(getComments());

  const handleLogout = () => {
    setAdminLoggedIn(false);
    onExitAdmin();
  };

  const handleSaveArticle = (savedArticle: Article) => {
    saveArticle(savedArticle);
    onRefreshData();
    setEditingArticle(null);
    setActiveTab('articles');
  };

  const handleDeleteArticle = (id: string, title: string) => {
    if (confirm(`আপনি কি নিশ্চিত যে "${title}" সংবাদটি সম্পূর্ণ মুছে ফেলতে চান?`)) {
      deleteArticle(id);
      onRefreshData();
    }
  };

  const handleCommentStatus = (id: string, status: 'approved' | 'rejected') => {
    updateCommentStatus(id, status);
    setComments(getComments());
  };

  const handleDeleteComment = (id: string) => {
    deleteComment(id);
    setComments(getComments());
  };

  // Filtered articles
  const filteredArticles = (articles || []).filter((a) => {
    if (!a) return false;
    const query = searchFilter.toLowerCase();
    const titleBn = (a.title_bn || '').toLowerCase();
    const titleEn = (a.title_en || '').toLowerCase();
    const slug = (a.slug || '').toLowerCase();
    const matchesSearch =
      !query ||
      titleBn.includes(query) ||
      titleEn.includes(query) ||
      slug.includes(query);
    const matchesCat = selectedCatFilter === 'all' || a.category_id === selectedCatFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      {/* Top Admin Navigation Header */}
      <header className="bg-stone-900 text-white border-b border-stone-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-600 flex items-center justify-center font-black text-white shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  FUTURE<span className="text-rose-500 font-serif">NEWS</span>
                </span>
                <span className="bg-rose-500/20 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded border border-rose-500/30">
                  ADMIN CONSOLE
                </span>
              </div>
              <p className="text-[11px] text-stone-400 hidden sm:block">
                প্রধান সম্পাদকীয় ড্যাশবোর্ড ও কন্টেন্ট ম্যানেজমেন্ট
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Public Portal */}
            <button
              type="button"
              id="admin-view-public-btn"
              onClick={onExitAdmin}
              className="flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold px-3 py-2 rounded-lg transition-colors border border-stone-700"
              title="View Public Site"
            >
              <span>পাবলিক সাইট দেখুন</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            {/* Admin Profile Pill */}
            <div className="hidden md:flex items-center gap-2 bg-stone-800/80 px-3 py-1.5 rounded-lg border border-stone-700 text-xs">
              <div className="w-6 h-6 rounded-full bg-rose-600 flex items-center justify-center font-bold text-white text-[10px]">
                IH
              </div>
              <span className="font-semibold text-stone-200">ইসমাইল হোসেন (Super Admin)</span>
            </div>

            {/* Logout Button */}
            <button
              type="button"
              id="admin-logout-btn"
              onClick={handleLogout}
              className="flex items-center gap-1 text-xs text-stone-400 hover:text-rose-400 p-2 rounded-lg hover:bg-stone-800 transition-colors"
              title="লগআউট"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">লগআউট</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6">
        {/* Left Sidebar Menu */}
        <aside className="w-full md:w-64 shrink-0 space-y-1">
          <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-xs space-y-1">
            <button
              type="button"
              id="tab-btn-analytics"
              onClick={() => {
                setActiveTab('analytics');
                setEditingArticle(null);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'analytics' && !editingArticle
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>অ্যানালিটিক্স (Analytics)</span>
            </button>

            <button
              type="button"
              id="tab-btn-articles"
              onClick={() => {
                setActiveTab('articles');
                setEditingArticle(null);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'articles' && !editingArticle
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4" />
                <span>সকল প্রকাশিত খবর ({articles.length})</span>
              </div>
            </button>

            <button
              type="button"
              id="tab-btn-new-article"
              onClick={() => {
                setEditingArticle(null);
                setActiveTab('new_article');
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'new_article'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-600 hover:bg-rose-50'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>নতুন খবর প্রকাশ করুন</span>
            </button>

            <button
              type="button"
              id="tab-btn-blogs"
              onClick={() => {
                setActiveTab('blogs');
                setEditingArticle(null);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'blogs'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <PenTool className="w-4 h-4 text-purple-600" />
              <span>ব্লগ ও আলোকচিত্র হাব</span>
            </button>

            <button
              type="button"
              id="tab-btn-seo"
              onClick={() => {
                setActiveTab('seo');
                setEditingArticle(null);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'seo'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Globe className="w-4 h-4 text-blue-600" />
              <span>গুগল এসইও ও সাইটম্যাপ</span>
            </button>

            <button
              type="button"
              id="tab-btn-ads"
              onClick={() => {
                setActiveTab('ads');
                setEditingArticle(null);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'ads'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>গুগল অ্যাডসেন্স ও বিজ্ঞাপন</span>
            </button>

            <button
              type="button"
              id="tab-btn-breaking"
              onClick={() => {
                setActiveTab('breaking');
                setEditingArticle(null);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'breaking'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Flame className="w-4 h-4 text-rose-600" />
              <span>ব্রেকিং নিউজ টিকার</span>
            </button>

            <button
              type="button"
              id="tab-btn-comments"
              onClick={() => {
                setActiveTab('comments');
                setEditingArticle(null);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'comments'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4" />
                <span>পাঠক মন্তব্য ({comments.length})</span>
              </div>
            </button>

            <button
              type="button"
              id="tab-btn-netlify"
              onClick={() => {
                setActiveTab('netlify');
                setEditingArticle(null);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'netlify'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Cloud className="w-4 h-4 text-teal-600" />
              <span>Netlify হোস্টিং ও ব্যাকআপ</span>
            </button>

            <button
              type="button"
              id="tab-btn-security"
              onClick={() => {
                setActiveTab('security');
                setEditingArticle(null);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'security'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>সিকিউরিটি ও পাসওয়ার্ড</span>
            </button>
          </div>
        </aside>

        {/* Right Main Content Area */}
        <main className="flex-1 min-w-0">
          {/* Article Editor Mode (New or Edit) */}
          {(activeTab === 'new_article' || editingArticle) && (
            <ArticleEditor
              initialArticle={editingArticle || undefined}
              categories={categories}
              authors={authors}
              onSave={handleSaveArticle}
              onCancel={() => {
                setEditingArticle(null);
                setActiveTab('articles');
              }}
            />
          )}

          {/* Analytics Dashboard */}
          {activeTab === 'analytics' && !editingArticle && (
            <AnalyticsDashboard
              articles={articles}
              categories={categories}
              blogs={getBlogs()}
              onSelectArticle={onSelectArticle}
              onSelectBlog={onSelectBlog}
              onEditArticle={(art) => {
                setEditingArticle(art);
                setActiveTab('new_article');
              }}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
            />
          )}

          {/* All Articles List */}
          {activeTab === 'articles' && !editingArticle && (
            <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-200">
                <div>
                  <h3 className="text-base font-extrabold text-stone-900">
                    সকল প্রকাশিত সংবাদ ({filteredArticles.length})
                  </h3>
                  <p className="text-xs text-stone-600">
                    প্রতিটি সংবাদের অনন্য পারমালিঙ্ক, ভিউ এবং সম্পাদনা নিয়ন্ত্রণ
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingArticle(null);
                    setActiveTab('new_article');
                  }}
                  className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors shadow-xs shrink-0"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>নতুন সংবাদ লিখুন</span>
                </button>
              </div>

              {/* Filters Bar */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="শিরোনাম বা ইউআরএল স্ল্যাগ দিয়ে খুঁজুন..."
                    className="w-full pl-8 pr-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500"
                  />
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                </div>

                <select
                  value={selectedCatFilter}
                  onChange={(e) => setSelectedCatFilter(e.target.value)}
                  className="px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white text-stone-700"
                >
                  <option value="all">সকল বিভাগ</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name_bn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Table of Articles */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-600 uppercase font-bold border-y border-stone-200">
                    <tr>
                      <th className="py-3 px-3">ছবি ও শিরোনাম</th>
                      <th className="py-3 px-3">বিভাগ</th>
                      <th className="py-3 px-3">পাঠক ভিউ</th>
                      <th className="py-3 px-3">স্ট্যাটাস ও ফ্ল্যাগ</th>
                      <th className="py-3 px-3">প্রকাশের তারিখ</th>
                      <th className="py-3 px-3 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredArticles.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-stone-600">
                          কোনো সংবাদ পাওয়া যায়নি।
                        </td>
                      </tr>
                    ) : (
                      filteredArticles.map((art) => {
                        const cat = categories.find((c) => c.id === art.category_id);
                        return (
                          <tr key={art.id} className="hover:bg-stone-50 transition-colors">
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-3 max-w-sm sm:max-w-md">
                                <img
                                  src={art.featured_image}
                                  alt={art.title_bn}
                                  className="w-14 h-10 object-cover rounded shrink-0 bg-stone-100"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="truncate">
                                  <h4 className="font-bold text-stone-900 truncate">
                                    {art.title_bn}
                                  </h4>
                                  <span className="font-mono text-[10px] text-stone-600 truncate block">
                                    /news/{art.slug}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-3">
                              <span className="bg-stone-100 px-2 py-0.5 rounded text-stone-700 font-semibold">
                                {cat?.name_bn || 'সাধারণ'}
                              </span>
                            </td>

                            <td className="py-3 px-3 font-mono font-bold text-rose-600">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5" />
                                {art.views.toLocaleString()}
                              </span>
                            </td>

                            <td className="py-3 px-3">
                              <div className="flex flex-wrap gap-1">
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                                  {art.status}
                                </span>
                                {art.is_featured && (
                                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                    লিড
                                  </span>
                                )}
                                {art.is_breaking && (
                                  <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                    ব্রেকিং
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="py-3 px-3 text-stone-600 font-mono text-[11px]">
                              {new Date(art.published_at).toLocaleDateString()}
                            </td>

                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => onSelectArticle(art.slug)}
                                  className="p-1 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded"
                                  title="ভিউ দেখুন"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingArticle(art);
                                    setActiveTab('new_article');
                                  }}
                                  className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
                                  title="সম্পাদনা করুন"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteArticle(art.id, art.title_bn)}
                                  className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                                  title="মুছে ফেলুন"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Ads Monetization Hub */}
          {activeTab === 'ads' && !editingArticle && <AdsManager />}

          {/* Breaking News Manager */}
          {activeTab === 'breaking' && !editingArticle && <BreakingNewsManager />}

          {/* Comments Moderation */}
          {activeTab === 'comments' && !editingArticle && (
            <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-6 space-y-4">
              <h3 className="text-base font-extrabold text-stone-900">
                পাঠকদের মন্তব্য মডারেশন ({comments.length})
              </h3>
              <p className="text-xs text-stone-600">
                ওয়েবসাইটে পাঠকদের করা মন্তব্য অনুমোদন বা অপসারণ করুন।
              </p>

              <div className="space-y-3 pt-2">
                {comments.length === 0 ? (
                  <p className="text-stone-600 text-xs italic">কোনো মন্তব্য নেই।</p>
                ) : (
                  comments.map((comm) => (
                    <div
                      key={comm.id}
                      className="p-4 border border-stone-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-stone-900">{comm.author_name}</span>
                          <span className="text-[11px] text-stone-600 font-mono">({comm.author_email})</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              comm.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {comm.status}
                          </span>
                        </div>
                        <p className="text-xs text-stone-700">{comm.content}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {comm.status !== 'approved' && (
                          <button
                            type="button"
                            onClick={() => handleCommentStatus(comm.id, 'approved')}
                            className="px-3 py-1 bg-emerald-600 text-white rounded text-xs font-semibold"
                          >
                            অনুমোদন দিন
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(comm.id)}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                          title="মুছুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Blogs & Photo Journals Manager */}
          {activeTab === 'blogs' && !editingArticle && (
            <AdminBlogManager
              onRefreshData={onRefreshData}
              onViewPublicBlog={onSelectBlog}
            />
          )}

          {/* Google Search & SEO Center */}
          {activeTab === 'seo' && !editingArticle && (
            <AdminSeoCenter
              articles={articles}
              blogs={getBlogs()}
            />
          )}

          {/* Netlify Guide & Backup */}
          {activeTab === 'netlify' && !editingArticle && <NetlifyHostingGuide />}

          {/* Security & Access Protection */}
          {activeTab === 'security' && !editingArticle && (
            <AdminSecuritySettings onLogout={handleLogout} />
          )}
        </main>
      </div>
    </div>
  );
};

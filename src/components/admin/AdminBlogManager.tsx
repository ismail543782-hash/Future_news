import React, { useState } from 'react';
import { BlogPost } from '../../types/news';
import { getBlogs, deleteBlog, saveBlog } from '../../utils/storage';
import {
  PenTool,
  Search,
  Trash2,
  Eye,
  Heart,
  Calendar,
  ExternalLink,
  Plus,
  CheckCircle,
  Image as ImageIcon,
  Tag,
} from 'lucide-react';
import { BlogWriteModal } from '../BlogWriteModal';

interface AdminBlogManagerProps {
  onRefreshData?: () => void;
  onViewPublicBlog?: (slug: string) => void;
}

export const AdminBlogManager: React.FC<AdminBlogManagerProps> = ({
  onRefreshData,
  onViewPublicBlog,
}) => {
  const [blogs, setBlogs] = useState<BlogPost[]>(getBlogs());
  const [search, setSearch] = useState('');
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);

  const refreshList = () => {
    setBlogs(getBlogs());
    if (onRefreshData) onRefreshData();
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`আপনি কি নিশ্চিত যে "${title}" ব্লগ পোস্টটি মুছে ফেলতে চান?`)) {
      deleteBlog(id);
      refreshList();
    }
  };

  const filtered = blogs.filter((b) =>
    b.title_bn.toLowerCase().includes(search.toLowerCase()) ||
    b.title_en.toLowerCase().includes(search.toLowerCase()) ||
    b.author_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-6 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <PenTool className="w-5 h-5 text-rose-600" />
            <span>ব্লগ ও আলোকচিত্র কন্টেন্ট ম্যানেজমেন্ট ({blogs.length})</span>
          </h2>
          <p className="text-xs text-stone-500">
            পাঠক ও লেখকদের প্রকাশিত ব্লগ পর্যালোচনা, অনুমোদন, নতুন ব্লগ তৈরি এবং আলোকচিত্র পরিচালনা
          </p>
        </div>

        <button
          type="button"
          id="admin-write-new-blog-btn"
          onClick={() => setIsWriteModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন ব্লগ লিখুন</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ব্লগের শিরোনাম বা লেখকের নাম দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
        </div>
      </div>

      {/* Blog Cards Table / List */}
      <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden">
        {filtered.map((blog) => (
          <div key={blog.id} className="p-4 hover:bg-stone-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <img
                src={blog.featured_image}
                alt={blog.title_bn}
                className="w-20 h-16 object-cover rounded-lg border border-stone-200 shrink-0"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    {blog.category_name_bn}
                  </span>
                  {blog.additional_images && blog.additional_images.length > 0 && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-600 flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      +{blog.additional_images.length} Photos
                    </span>
                  )}
                  <span className="text-stone-400 text-[10px]">
                    {new Date(blog.published_at).toLocaleDateString('bn-BD')}
                  </span>
                </div>

                <h3 className="text-xs sm:text-sm font-bold text-stone-900 line-clamp-1">
                  {blog.title_bn}
                </h3>
                <p className="text-[11px] text-stone-500 line-clamp-1">
                  লেখক: <span className="font-semibold text-stone-700">{blog.author_name}</span> ({blog.author_role_bn})
                </p>

                <div className="flex items-center gap-4 text-[11px] text-stone-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {blog.views} ভিউ
                  </span>
                  <span className="flex items-center gap-1 text-rose-600">
                    <Heart className="w-3 h-3 fill-rose-600" />
                    {blog.likes} লাইক
                  </span>
                  <span className="font-mono text-stone-400">/{blog.slug}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              {onViewPublicBlog && (
                <button
                  type="button"
                  onClick={() => onViewPublicBlog(blog.slug)}
                  className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg text-xs font-semibold flex items-center gap-1"
                  title="পাবলিক পেজে দেখুন"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">দেখুন</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleDelete(blog.id, blog.title_bn)}
                className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="মুছে ফেলুন"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Write Blog Modal */}
      <BlogWriteModal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        onSuccess={() => {
          refreshList();
        }}
        language="bn"
      />
    </div>
  );
};

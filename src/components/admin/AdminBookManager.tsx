import React, { useState } from 'react';
import { Book, Language } from '../../types/news';
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  FileText,
  CheckCircle,
  XCircle,
  ExternalLink,
  Download,
  Sparkles,
} from 'lucide-react';
import { BookEditor } from './BookEditor';

interface AdminBookManagerProps {
  books: Book[];
  language: Language;
  onSaveBook: (book: Book) => void;
  onDeleteBook: (id: string) => void;
  onPreviewBook: (slug: string) => void;
}

export const AdminBookManager: React.FC<AdminBookManagerProps> = ({
  books,
  language,
  onSaveBook,
  onDeleteBook,
  onPreviewBook,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingBook, setEditingBook] = useState<Book | null | undefined>(undefined);

  const filteredBooks = books.filter((b) => {
    if (selectedCategory !== 'all' && b.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.category_bn.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPagesCount = books.reduce((sum, b) => sum + (b.total_pages || 0), 0);
  const totalViewsCount = books.reduce((sum, b) => sum + (b.views_count || 0), 0);

  return (
    <div className="space-y-6">
      {/* Overview Metric Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-stone-900">{books.length}</div>
            <div className="text-xs text-stone-500 font-medium">
              {language === 'bn' ? 'মোট প্রকাশিত বই' : 'Total Published Books'}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-stone-900">{totalPagesCount}</div>
            <div className="text-xs text-stone-500 font-medium">
              {language === 'bn' ? 'মোট অধ্যায় ও পৃষ্ঠা' : 'Total Pages & Chapters'}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-stone-900">{totalViewsCount}</div>
            <div className="text-xs text-stone-500 font-medium">
              {language === 'bn' ? 'মোট বইয়ের পাঠক সংখ্যা' : 'Total Book Readers'}
            </div>
          </div>
        </div>
      </div>

      {/* Action and Filter Header */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'bn'
                  ? 'বইয়ের নাম বা লেখক লিখে খুঁজুন...'
                  : 'Search by book title or author...'
              }
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-700 focus:outline-none"
          >
            <option value="all">{language === 'bn' ? 'সব বিভাগ' : 'All Categories'}</option>
            <option value="career">ক্যারিয়ার ও প্রযুক্তি</option>
            <option value="lifestyle">মোটিভেশন ও আত্মউন্নয়ন</option>
            <option value="history">ইতিহাস ও মুক্তিযুদ্ধ</option>
            <option value="literature">সাহিত্য ও গল্প</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => setEditingBook(null)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'bn' ? '+ নতুন বই প্রকাশ করুন' : '+ Publish New Book'}</span>
        </button>
      </div>

      {/* Books Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">{language === 'bn' ? 'বই ও প্রচ্ছদ' : 'Book & Cover'}</th>
                <th className="py-3 px-4">{language === 'bn' ? 'লেখক' : 'Author'}</th>
                <th className="py-3 px-4">{language === 'bn' ? 'বিভাগ' : 'Category'}</th>
                <th className="py-3 px-4 text-center">{language === 'bn' ? 'পৃষ্ঠা' : 'Pages'}</th>
                <th className="py-3 px-4 text-center">{language === 'bn' ? 'পাঠক' : 'Views'}</th>
                <th className="py-3 px-4 text-center">{language === 'bn' ? 'অবস্থা' : 'Status'}</th>
                <th className="py-3 px-4 text-right">{language === 'bn' ? 'একশন' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-stone-500">
                    {language === 'bn' ? 'কোনো বই পাওয়া যায়নি।' : 'No books found.'}
                  </td>
                </tr>
              ) : (
                filteredBooks.map((b) => (
                  <tr key={b.id} className="hover:bg-stone-50/70 transition-colors">
                    {/* Title & Cover */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={b.cover_image}
                          alt={b.title}
                          className="w-9 h-12 rounded object-cover border border-stone-200 shrink-0 shadow-2xs"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="font-bold text-stone-900 hover:text-rose-600 line-clamp-1 max-w-xs">
                            {b.title}
                          </div>
                          <div className="text-[10px] text-stone-400 mt-0.5 flex items-center gap-2">
                            <span>{b.published_year}</span>
                            {b.pdf_url && (
                              <span className="text-rose-600 font-semibold flex items-center gap-0.5">
                                <Download className="w-2.5 h-2.5" /> PDF
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Author */}
                    <td className="py-3 px-4 text-stone-700 font-medium">
                      {b.author}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[10px] font-bold">
                        {b.category_bn}
                      </span>
                    </td>

                    {/* Pages */}
                    <td className="py-3 px-4 text-center font-semibold text-stone-800">
                      {b.total_pages}
                    </td>

                    {/* Views */}
                    <td className="py-3 px-4 text-center text-stone-600">
                      {b.views_count}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      {b.is_published ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle className="w-2.5 h-2.5" />
                          {language === 'bn' ? 'লাইভ' : 'Live'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                          <XCircle className="w-2.5 h-2.5" />
                          {language === 'bn' ? 'ড্রাফট' : 'Draft'}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onPreviewBook(b.slug)}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                          title={language === 'bn' ? 'রিডারে দেখুন' : 'Open in Reader'}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingBook(b)}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title={language === 'bn' ? 'সম্পাদনা করুন' : 'Edit Book'}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              window.confirm(
                                language === 'bn'
                                  ? `আপনি কি নিশ্চিতভাবে "${b.title}" বইটি মুছে ফেলতে চান?`
                                  : `Are you sure you want to delete "${b.title}"?`
                              )
                            ) {
                              onDeleteBook(b.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title={language === 'bn' ? 'মুছে ফেলুন' : 'Delete Book'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Modal */}
      {editingBook !== undefined && (
        <BookEditor
          book={editingBook}
          language={language}
          onSave={(saved) => {
            onSaveBook(saved);
            setEditingBook(undefined);
          }}
          onCancel={() => setEditingBook(undefined)}
        />
      )}
    </div>
  );
};

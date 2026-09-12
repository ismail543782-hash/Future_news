import React, { useState, useEffect, useRef } from 'react';
import { Book, BookPage, Language } from '../../types/news';
import {
  Save,
  X,
  BookOpen,
  FileText,
  Image as ImageIcon,
  Search,
  Plus,
  Trash2,
  Globe,
  Sparkles,
  Download,
  Eye,
  CheckCircle,
  HelpCircle,
  Upload,
  FileUp,
  RefreshCw,
  Check,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  ShieldCheck,
  Bookmark,
  Layers,
} from 'lucide-react';
import {
  savePdfBlob,
  getPdfBlob,
  compressImageFile,
  normalizePdfViewerUrl,
} from '../../utils/fileStorage';

function formatBytes(bytes: number, decimals = 1): string {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

interface BookEditorProps {
  book?: Book | null;
  language: Language;
  onSave: (book: Book) => void;
  onCancel: () => void;
}

const CATEGORY_PRESETS = [
  { key: 'career', bn: 'ক্যারিয়ার ও প্রযুক্তি', en: 'Career & Tech' },
  { key: 'lifestyle', bn: 'মোটিভেশন ও আত্মউন্নয়ন', en: 'Self-Development' },
  { key: 'history', bn: 'ইতিহাস ও মুক্তিযুদ্ধ', en: 'History & War' },
  { key: 'literature', bn: 'সাহিত্য ও গল্প', en: 'Literature & Fiction' },
  { key: 'islamic', bn: 'ইসলামিক ও ধর্মীয়', en: 'Islamic & Religion' },
  { key: 'general', bn: 'সাধারণ জ্ঞান ও বিজ্ঞান', en: 'General & Science' },
];

const SAMPLE_COVERS = [
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1532012164546-f432f2e37b29?w=800&auto=format&fit=crop&q=80',
];

export const BookEditor: React.FC<BookEditorProps> = ({
  book,
  language,
  onSave,
  onCancel,
}) => {
  // Amazon KDP Publishing Stepper State: 1 = Details, 2 = Manuscript & Cover, 3 = Rights & Publish
  const [kdpStep, setKdpStep] = useState<1 | 2 | 3>(1);
  const [showPagesSubEditor, setShowPagesSubEditor] = useState<boolean>(
    Boolean(book?.pages && book.pages.length > 1)
  );

  const [title, setTitle] = useState(book?.title || '');
  const [author, setAuthor] = useState(book?.author || '');
  const [category, setCategory] = useState(book?.category || 'career');
  const [categoryBn, setCategoryBn] = useState(book?.category_bn || 'ক্যারিয়ার ও প্রযুক্তি');
  const [coverImage, setCoverImage] = useState(
    book?.cover_image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80'
  );
  const [description, setDescription] = useState(book?.description || '');
  const [pdfUrl, setPdfUrl] = useState(book?.pdf_url || '');
  const [allowDownload, setAllowDownload] = useState(book?.allow_download ?? true);
  const [readingTime, setReadingTime] = useState(book?.reading_time_minutes || 10);
  const [publishedYear, setPublishedYear] = useState(book?.published_year || '২০২৬');
  const [isPublished, setIsPublished] = useState(book?.is_published ?? true);
  const [isFeatured, setIsFeatured] = useState(book?.is_featured ?? false);

  // PDF Upload & File State
  const [pdfSourceMode, setPdfSourceMode] = useState<'upload' | 'url'>(
    book?.has_uploaded_pdf || !book?.pdf_url ? 'upload' : 'url'
  );
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string>(book?.pdf_filename || '');
  const [pdfFileSize, setPdfFileSize] = useState<string>(book?.pdf_filesize || '');
  const [hasExistingUploadedPdf, setHasExistingUploadedPdf] = useState<boolean>(Boolean(book?.has_uploaded_pdf));
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [showPdfPreviewModal, setShowPdfPreviewModal] = useState<boolean>(false);
  const [isDraggingPdf, setIsDraggingPdf] = useState<boolean>(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Cover Image Upload & File State
  const [coverSourceMode, setCoverSourceMode] = useState<'upload' | 'url' | 'preset'>('upload');
  const [isCompressingImage, setIsCompressingImage] = useState<boolean>(false);
  const [isDraggingCover, setIsDraggingCover] = useState<boolean>(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Form Saving State
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Load existing PDF preview if present
  useEffect(() => {
    if (book?.id && book?.has_uploaded_pdf) {
      getPdfBlob(book.id).then((stored) => {
        if (stored) {
          setPdfFileName(stored.filename);
          setPdfFileSize(formatBytes(stored.size));
          setHasExistingUploadedPdf(true);
          const url = URL.createObjectURL(stored.blob);
          setPreviewPdfUrl(url);
        }
      });
    } else if (book?.pdf_url) {
      const norm = normalizePdfViewerUrl(book.pdf_url);
      setPreviewPdfUrl(norm.embedUrl);
    }
  }, [book?.id, book?.has_uploaded_pdf, book?.pdf_url]);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (previewPdfUrl && previewPdfUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewPdfUrl);
      }
    };
  }, [previewPdfUrl]);

  // Handle PDF file selection
  const handlePdfFileSelect = (file: File) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert(language === 'bn' ? 'শুধুমাত্র পিডিএফ (.pdf) ফাইল গ্রহণযোগ্য।' : 'Only PDF files are allowed.');
      return;
    }
    setPdfFile(file);
    setPdfFileName(file.name);
    setPdfFileSize(formatBytes(file.size));
    setHasExistingUploadedPdf(false);

    if (previewPdfUrl && previewPdfUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewPdfUrl);
    }
    const url = URL.createObjectURL(file);
    setPreviewPdfUrl(url);
  };

  const handleClearPdfFile = () => {
    setPdfFile(null);
    setPdfFileName('');
    setPdfFileSize('');
    setHasExistingUploadedPdf(false);
    if (previewPdfUrl && previewPdfUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewPdfUrl);
    }
    setPreviewPdfUrl(null);
    if (pdfInputRef.current) {
      pdfInputRef.current.value = '';
    }
  };

  // Handle Cover image file selection
  const handleCoverFileSelect = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert(language === 'bn' ? 'শুধুমাত্র ছবি (JPEG/PNG/WebP) ফাইল গ্রহণযোগ্য।' : 'Only image files are allowed.');
      return;
    }
    try {
      setIsCompressingImage(true);
      const dataUrl = await compressImageFile(file, 1000, 1500, 0.85);
      setCoverImage(dataUrl);
    } catch (err) {
      console.error(err);
      alert(language === 'bn' ? 'ছবি প্রসেসিংয়ে সমস্যা হয়েছে।' : 'Failed to process image.');
    } finally {
      setIsCompressingImage(false);
    }
  };

  // Pages
  const [pages, setPages] = useState<BookPage[]>(
    book?.pages && book.pages.length > 0
      ? book.pages
      : [
          {
            id: `p-${Date.now()}-1`,
            page_number: 1,
            chapter_title: 'অধ্যায় ১: ভূমিকা ও সূচনা',
            content: 'এখানে আপনার বইয়ের প্রথম অধ্যায় বা সূচনার মূল লেখাটি লিখুন...',
          },
        ]
  );
  const [activeEditingPageIdx, setActiveEditingPageIdx] = useState(0);

  // SEO
  const [metaTitle, setMetaTitle] = useState(book?.meta_title || '');
  const [metaDescription, setMetaDescription] = useState(book?.meta_description || '');
  const [keywordsText, setKeywordsText] = useState(book?.keywords?.join(', ') || '');

  // Auto-generate slug from title
  const generateSlug = (rawTitle: string) => {
    return rawTitle
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') || `book-${Date.now()}`;
  };

  const handleCategoryChange = (catKey: string) => {
    setCategory(catKey);
    const found = CATEGORY_PRESETS.find((c) => c.key === catKey);
    if (found) {
      setCategoryBn(found.bn);
    }
  };

  // Add new page
  const handleAddPage = () => {
    const nextNum = pages.length + 1;
    const newPg: BookPage = {
      id: `p-${Date.now()}-${nextNum}`,
      page_number: nextNum,
      chapter_title: `অধ্যায় ${nextNum}`,
      content: '',
    };
    setPages([...pages, newPg]);
    setActiveEditingPageIdx(pages.length);
  };

  // Remove page
  const handleRemovePage = (index: number) => {
    if (pages.length <= 1) {
      alert(language === 'bn' ? 'বইয়ে কমপক্ষে একটি পৃষ্ঠা থাকতে হবে।' : 'At least one page is required.');
      return;
    }
    const updated = pages
      .filter((_, idx) => idx !== index)
      .map((p, idx) => ({ ...p, page_number: idx + 1 }));
    setPages(updated);
    setActiveEditingPageIdx(Math.max(0, index - 1));
  };

  // Update specific page content
  const handlePageChange = (field: 'chapter_title' | 'content', value: string) => {
    const updated = [...pages];
    if (updated[activeEditingPageIdx]) {
      updated[activeEditingPageIdx] = {
        ...updated[activeEditingPageIdx],
        [field]: value,
      };
      setPages(updated);
    }
  };

  // Auto-fill SEO metadata if empty
  const handleAutoGenerateSEO = () => {
    if (!title.trim()) {
      alert(language === 'bn' ? 'দয়া করে প্রথমে বইয়ের নাম লিখুন।' : 'Please enter book title first.');
      return;
    }
    setMetaTitle(`${title} - সম্পূর্ণ ই-বুক ও পিডিএফ`);
    setMetaDescription(
      description.slice(0, 155) ||
        `${title} বইটির সম্পূর্ণ অনলাইন সংস্করণ। অনলাইনে পেজ-বাই-পেজ বিনামূল্যে পড়ুন ও ডাউনলোড করুন।`
    );
    if (!keywordsText.trim()) {
      setKeywordsText(`${title}, বাংলা বই, ই-বুক, PDF ডাউনলোড, ${categoryBn}`);
    }
  };

  const handleNextStep = () => {
    if (kdpStep === 1) {
      if (!title.trim()) {
        alert(language === 'bn' ? 'অনুগ্রহ করে বইয়ের শিরোনাম বা নাম লিখুন।' : 'Please enter book title.');
        return;
      }
      if (!author.trim()) {
        alert(language === 'bn' ? 'অনুগ্রহ করে লেখক বা প্রকাশকের নাম লিখুন।' : 'Please enter author name.');
        return;
      }
      setKdpStep(2);
    } else if (kdpStep === 2) {
      setKdpStep(3);
    }
  };

  const handlePrevStep = () => {
    if (kdpStep > 1) {
      setKdpStep((prev) => (prev - 1) as 1 | 2 | 3);
    }
  };

  // Save Book Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert(language === 'bn' ? 'বইয়ের নাম আবশ্যক।' : 'Book title is required.');
      return;
    }
    if (!author.trim()) {
      alert(language === 'bn' ? 'লেখকের নাম আবশ্যক।' : 'Author name is required.');
      return;
    }

    try {
      setIsSaving(true);
      const bookId = book?.id || `book-${Date.now()}`;
      const slug = book?.slug || generateSlug(title);

      let finalPdfUrl = pdfUrl.trim();
      let hasUploadedPdf = hasExistingUploadedPdf;
      let finalFileName = pdfFileName;
      let finalFileSize = pdfFileSize;

      if (pdfFile) {
        // Save PDF to IndexedDB
        await savePdfBlob(bookId, pdfFile, pdfFile.name);
        hasUploadedPdf = true;
        finalFileName = pdfFile.name;
        finalFileSize = formatBytes(pdfFile.size);
        // Create an active blob URL for immediate viewing in this session
        finalPdfUrl = URL.createObjectURL(pdfFile);
      }

      const keywords = keywordsText
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);

      const savedBook: Book = {
        id: bookId,
        title: title.trim(),
        author: author.trim(),
        slug,
        category,
        category_bn: categoryBn,
        cover_image: coverImage.trim(),
        description: description.trim(),
        pdf_url: finalPdfUrl || undefined,
        pdf_filename: finalFileName || undefined,
        pdf_filesize: finalFileSize || undefined,
        has_uploaded_pdf: hasUploadedPdf,
        allow_download: allowDownload,
        total_pages: pages.length,
        reading_time_minutes: Number(readingTime) || 10,
        published_year: publishedYear.trim() || '২০২৬',
        language: 'bn',
        is_published: isPublished,
        is_featured: isFeatured,
        views_count: book?.views_count || 0,
        created_at: book?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        pages,
        meta_title: metaTitle.trim() || undefined,
        meta_description: metaDescription.trim() || undefined,
        keywords: keywords.length > 0 ? keywords : undefined,
      };

      onSave(savedBook);
    } catch (err) {
      console.error('Failed to save book:', err);
      alert(language === 'bn' ? 'বই সংরক্ষণ করতে সমস্যা হয়েছে।' : 'Failed to save book.');
    } finally {
      setIsSaving(false);
    }
  };

  const activePage = pages[activeEditingPageIdx] || pages[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">
                  {book
                    ? language === 'bn'
                      ? 'বই সম্পাদনা করুন (Amazon KDP স্টাইল)'
                      : 'Edit Book (Amazon KDP Style)'
                    : language === 'bn'
                    ? 'Amazon KDP স্টাইলে বই প্রকাশনা (PDF ও পেজ রিডার)'
                    : 'Publish Book (Amazon KDP Style)'}
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold">
                  KDP WIZARD
                </span>
              </div>
              <p className="text-xs text-stone-400">
                {language === 'bn'
                  ? '৩টি সহজ ধাপে বইয়ের বিবরণ, প্রচ্ছদ ও পান্ডুলিপি আপলোড করে প্রকাশ করুন'
                  : '3-step sequential workflow: Details, Manuscript & Cover, Rights & Publish'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {title.trim() && author.trim() && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSaving}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                title={language === 'bn' ? 'যেকোনো ধাপ থেকেই সরাসরি সেভ করুন' : 'Quick Save from any step'}
              >
                <Save className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'bn' ? 'তাত্ক্ষণিক প্রকাশ' : 'Quick Publish'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onCancel}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AMAZON KDP LIVE BOOK SHOWCASE CARD (UP FRONT) */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white p-4 sm:p-5 border-b border-stone-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Left: 3D Book perspective cover & live metadata */}
            <div className="flex items-center gap-4 min-w-0">
              {/* 3D Realistic Book Mockup with spine & depth */}
              <div className="relative shrink-0 w-16 sm:w-20 h-24 sm:h-28 rounded-r-md rounded-l-xs overflow-hidden shadow-2xl border-r-2 border-y border-stone-700 bg-stone-950">
                <img
                  src={coverImage}
                  alt={title || 'Book Cover'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80';
                  }}
                />
                {/* Book spine shadow reflection */}
                <div className="absolute inset-y-0 left-0 w-2 sm:w-2.5 bg-gradient-to-r from-black/70 via-white/20 to-transparent pointer-events-none" />
                {/* Book page rim edge */}
                <div className="absolute inset-y-0 right-0 w-1 bg-stone-200 border-l border-stone-400 pointer-events-none" />
              </div>

              {/* Live Info */}
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    KDP লাইভ প্রিভিউ শোকেস
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
                    {categoryBn}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-md">
                  {title.trim() || (language === 'bn' ? 'আপনার বইয়ের নাম / শিরোনাম' : 'Your Book Title')}
                </h3>

                <p className="text-xs text-stone-400 truncate">
                  {language === 'bn' ? 'লেখক / প্রকাশক:' : 'Author:'}{' '}
                  <span className="text-stone-200 font-medium">
                    {author.trim() || (language === 'bn' ? 'লেখকের নাম...' : 'Author Name...')}
                  </span>
                </p>

                {/* Status Badges */}
                <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px]">
                  {pdfFile || hasExistingUploadedPdf ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-medium bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                      <Check className="w-3 h-3" />
                      <span>পিডিএফ পান্ডুলিপি সংযুক্ত ({pdfFileName || 'ফাইল'} - {pdfFileSize || 'সংরক্ষিত'})</span>
                    </span>
                  ) : pdfUrl.trim() ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-medium bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                      <Check className="w-3 h-3" />
                      <span>ওয়েব পিডিএফ লিংক প্রস্তুত</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-400 font-medium bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
                      <AlertCircle className="w-3 h-3" />
                      <span>পান্ডুলিপি অপেক্ষমান (ধাপ ২ এ আপলোড করুন)</span>
                    </span>
                  )}

                  <span className="text-stone-400">
                    {publishedYear} • ~{readingTime} মিনিট পাঠ
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Progress Indicator */}
            <div className="hidden md:flex flex-col items-end gap-1 shrink-0">
              <div className="text-right">
                <span className="text-[11px] text-stone-400">ধাপ অগ্রগতি:</span>
                <span className="text-xs font-bold text-rose-400 ml-1.5">
                  {kdpStep === 1
                    ? '১. বইয়ের বিবরণ'
                    : kdpStep === 2
                    ? '২. পান্ডুলিপি ও প্রচ্ছদ'
                    : '৩. অধিকার ও প্রকাশনা'}
                </span>
              </div>
              <div className="w-36 h-2 bg-stone-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-600 transition-all duration-300"
                  style={{ width: kdpStep === 1 ? '33%' : kdpStep === 2 ? '66%' : '100%' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Amazon KDP 3-Step Navigation Stepper */}
        <div className="flex border-b border-stone-200 px-4 sm:px-6 bg-stone-50 overflow-x-auto">
          <button
            type="button"
            onClick={() => setKdpStep(1)}
            className={`py-3 px-3 sm:px-5 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              kdpStep === 1
                ? 'border-rose-600 text-rose-600 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                title && author
                  ? 'bg-emerald-600 text-white'
                  : kdpStep === 1
                  ? 'bg-rose-600 text-white'
                  : 'bg-stone-200 text-stone-700'
              }`}
            >
              {title && author ? '✓' : '১'}
            </div>
            <span>{language === 'bn' ? '১. বইয়ের বিবরণ (Details)' : '1. Book Details'}</span>
          </button>

          <button
            type="button"
            onClick={() => setKdpStep(2)}
            className={`py-3 px-3 sm:px-5 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              kdpStep === 2
                ? 'border-rose-600 text-rose-600 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                (pdfFile || hasExistingUploadedPdf || pdfUrl) && coverImage
                  ? 'bg-emerald-600 text-white'
                  : kdpStep === 2
                  ? 'bg-rose-600 text-white'
                  : 'bg-stone-200 text-stone-700'
              }`}
            >
              {(pdfFile || hasExistingUploadedPdf || pdfUrl) && coverImage ? '✓' : '২'}
            </div>
            <span>{language === 'bn' ? '২. পান্ডুলিপি ও প্রচ্ছদ (Manuscript & Cover)' : '2. Manuscript & Cover'}</span>
          </button>

          <button
            type="button"
            onClick={() => setKdpStep(3)}
            className={`py-3 px-3 sm:px-5 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              kdpStep === 3
                ? 'border-rose-600 text-rose-600 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                kdpStep === 3 ? 'bg-rose-600 text-white' : 'bg-stone-200 text-stone-700'
              }`}
            >
              ৩
            </div>
            <span>{language === 'bn' ? '৩. অধিকার ও প্রকাশনা (Rights & Publish)' : '3. Rights & Publish'}</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* STEP 1: BOOK DETAILS & METADATA */}
          {kdpStep === 1 && (
            <div className="space-y-6">
              <div className="bg-rose-50/70 rounded-xl p-4 border border-rose-200/80 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs text-rose-950 leading-relaxed">
                  <p className="font-bold">
                    {language === 'bn'
                      ? 'ধাপ ১: বইয়ের বিবরণ ও প্রাথমিক তথ্য (Amazon KDP Style)'
                      : 'Step 1: Book Details & Metadata'}
                  </p>
                  <p className="text-rose-800 text-[11px] mt-0.5">
                    {language === 'bn'
                      ? 'বইয়ের শিরোনাম, লেখক, ক্যাটাগরি ও সংক্ষিপ্ত পরিচিতি প্রদান করুন।'
                      : 'Provide book title, author, category and synopsis.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Title */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">
                    {language === 'bn' ? 'বইয়ের নাম / শিরোনাম *' : 'Book Title *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={language === 'bn' ? 'যেমন: স্মার্ট ক্যারিয়ার গাইড ২০২৬' : 'e.g. Smart Career Guide 2026'}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                {/* Author */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">
                    {language === 'bn' ? 'লেখক বা প্রকাশকের নাম *' : 'Author or Publisher *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder={language === 'bn' ? 'যেমন: ড. আহমেদ জামান' : 'e.g. John Doe'}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">
                    {language === 'bn' ? 'বইয়ের বিভাগ (Category)' : 'Category'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  >
                    {CATEGORY_PRESETS.map((cat) => (
                      <option key={cat.key} value={cat.key}>
                        {cat.bn} ({cat.en})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Published Year */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">
                    {language === 'bn' ? 'প্রকাশনার সাল' : 'Published Year'}
                  </label>
                  <input
                    type="text"
                    value={publishedYear}
                    onChange={(e) => setPublishedYear(e.target.value)}
                    placeholder="২০২৬"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 focus:bg-white focus:ring-1 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                {/* Reading Time */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">
                    {language === 'bn' ? 'পড়ার আনুমানিক সময় (মিনিট)' : 'Estimated Reading Time (min)'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={readingTime}
                    onChange={(e) => setReadingTime(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 focus:bg-white focus:ring-1 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">
                    {language === 'bn' ? 'বইয়ের সংক্ষিপ্ত বিবরণ ও ভূমিকা *' : 'Book Description & Synopsis *'}
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={
                      language === 'bn'
                        ? 'বইটিতে কী কী বিষয় রয়েছে এবং পাঠকরা কেন পড়বে তার সংক্ষিপ্ত বিবরণ...'
                        : 'Write a compelling book overview...'
                    }
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs sm:text-sm text-stone-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Step 1 Navigation */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 border border-stone-300 rounded-lg text-xs font-bold text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
                >
                  <span>{language === 'bn' ? 'পরবর্তী ধাপ: প্রচ্ছদ ও পান্ডুলিপি' : 'Next: Cover & Manuscript'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: MANUSCRIPT & COVER (Amazon KDP Step 2) */}
          {kdpStep === 2 && (
            <div className="space-y-6">
              <div className="bg-amber-50/70 rounded-xl p-4 border border-amber-200/80 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-950 leading-relaxed">
                  <p className="font-bold">
                    {language === 'bn'
                      ? 'ধাপ ২: পান্ডুলিপি ও বইয়ের প্রচ্ছদ (Manuscript & Cover)'
                      : 'Step 2: Manuscript & Cover'}
                  </p>
                  <p className="text-amber-800 text-[11px] mt-0.5">
                    {language === 'bn'
                      ? 'মোবাইল বা কম্পিউটার থেকে সরাসরি প্রচ্ছদের ছবি এবং পিডিএফ বই আপলোড করুন।'
                      : 'Upload cover art and PDF manuscript directly from your mobile or PC.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cover Image Section */}
                <div className="space-y-3 md:col-span-2 bg-stone-50/80 p-4 rounded-xl border border-stone-200">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-rose-600" />
                      <span>{language === 'bn' ? 'বইয়ের প্রচ্ছদ ছবি (Cover Image)' : 'Book Cover Image'}</span>
                    </label>

                    {/* Mode Selector */}
                    <div className="flex bg-stone-200/80 p-0.5 rounded-lg text-[11px] font-semibold">
                      <button
                        type="button"
                        onClick={() => setCoverSourceMode('upload')}
                        className={`px-2.5 py-1 rounded-md transition-all ${
                          coverSourceMode === 'upload'
                            ? 'bg-white text-stone-900 shadow-xs font-bold'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        {language === 'bn' ? '📁 ফাইল আপলোড' : '📁 Upload File'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setCoverSourceMode('url')}
                        className={`px-2.5 py-1 rounded-md transition-all ${
                          coverSourceMode === 'url'
                            ? 'bg-white text-stone-900 shadow-xs font-bold'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        {language === 'bn' ? '🔗 ছবির লিংক' : '🔗 Image Link'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setCoverSourceMode('preset')}
                        className={`px-2.5 py-1 rounded-md transition-all ${
                          coverSourceMode === 'preset'
                            ? 'bg-white text-stone-900 shadow-xs font-bold'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        {language === 'bn' ? '🖼️ রেডিমেড' : '🖼️ Presets'}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    {/* Thumbnail Preview */}
                    <div className="w-24 h-36 rounded-lg overflow-hidden bg-white border border-stone-300 shrink-0 shadow-xs relative group">
                      {coverImage ? (
                        <>
                          <img
                            src={coverImage}
                            alt="Cover Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-[10px] text-white font-bold bg-black/60 px-1.5 py-0.5 rounded">
                              {language === 'bn' ? 'প্রিভিউ' : 'Preview'}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 p-2 text-center">
                          <ImageIcon className="w-6 h-6 mb-1" />
                          <span className="text-[10px] leading-tight">
                            {language === 'bn' ? 'কোনো ছবি নেই' : 'No Cover'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Mode Specific Controls */}
                    <div className="flex-1 w-full space-y-2.5">
                      {coverSourceMode === 'upload' && (
                        <div className="space-y-2">
                          <input
                            id="book-cover-file-input"
                            type="file"
                            ref={coverInputRef}
                            accept="image/jpeg,image/png,image/webp,image/jpg"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleCoverFileSelect(f);
                            }}
                            className="hidden"
                          />

                          <div
                            onDragOver={(e) => {
                              e.preventDefault();
                              setIsDraggingCover(true);
                            }}
                            onDragLeave={() => setIsDraggingCover(false)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setIsDraggingCover(false);
                              const f = e.dataTransfer.files?.[0];
                              if (f) handleCoverFileSelect(f);
                            }}
                            onClick={() => coverInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                              isDraggingCover
                                ? 'border-rose-500 bg-rose-50'
                                : 'border-stone-300 hover:border-rose-400 hover:bg-white bg-stone-100/50'
                            }`}
                          >
                            <div className="flex flex-col items-center justify-center gap-1.5">
                              <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                                <FileUp className="w-4 h-4" />
                              </div>
                              <span className="text-xs font-bold text-stone-800">
                                {isCompressingImage
                                  ? (language === 'bn' ? 'ছবি প্রসেসিং ও কম্প্রেস হচ্ছে...' : 'Compressing image...')
                                  : (language === 'bn' ? 'কম্পিউটার বা মোবাইল থেকে প্রচ্ছদ ছবি সিলেক্ট করুন' : 'Click to select cover image')}
                              </span>
                              <span className="text-[11px] text-stone-500">
                                {language === 'bn'
                                  ? 'বা এখানে টেনে এনে ছেড়ে দিন (JPEG, PNG, WebP)'
                                  : 'or drag & drop here (JPEG, PNG, WebP)'}
                              </span>
                              <label
                                htmlFor="book-cover-file-input"
                                onClick={(e) => e.stopPropagation()}
                                className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-lg text-xs font-bold cursor-pointer transition-all shadow-2xs"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>{language === 'bn' ? 'মোবাইল বা পিসি থেকে ছবি বাছুন' : 'Choose Cover Image'}</span>
                              </label>
                            </div>
                          </div>

                          {coverImage && (
                            <div className="flex items-center justify-between text-[11px] text-stone-500 bg-white px-3 py-1.5 rounded-lg border border-stone-200">
                              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                                <Check className="w-3.5 h-3.5" />
                                {language === 'bn' ? 'প্রচ্ছদ প্রস্তুত' : 'Cover image ready'}
                              </span>
                              <button
                                type="button"
                                onClick={() => coverInputRef.current?.click()}
                                className="text-rose-600 hover:underline font-bold"
                              >
                                {language === 'bn' ? 'ছবি পরিবর্তন' : 'Change Image'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {coverSourceMode === 'url' && (
                        <div className="space-y-1.5">
                          <input
                            type="url"
                            value={coverImage}
                            onChange={(e) => setCoverImage(e.target.value)}
                            placeholder="https://images.unsplash.com/photo-..."
                            className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                          />
                          <span className="text-[11px] text-stone-400 block">
                            {language === 'bn'
                              ? 'অনলাইনে হোস্ট করা যেকোনো হাই-রেজোলিউশন প্রচ্ছদের লিংক দিন।'
                              : 'Enter any public image URL for the book cover.'}
                          </span>
                        </div>
                      )}

                      {coverSourceMode === 'preset' && (
                        <div className="space-y-2">
                          <span className="text-[11px] text-stone-600 font-semibold block">
                            {language === 'bn' ? 'নিচের যেকোনো একটি প্রচ্ছদ বেছে নিন:' : 'Choose from sample covers:'}
                          </span>
                          <div className="flex flex-wrap gap-2.5">
                            {SAMPLE_COVERS.map((url, i) => (
                              <img
                                key={i}
                                src={url}
                                alt={`Preset ${i}`}
                                onClick={() => setCoverImage(url)}
                                className={`w-12 h-16 object-cover rounded-md cursor-pointer border-2 transition-all hover:scale-105 ${
                                  coverImage === url ? 'border-rose-600 shadow-md ring-2 ring-rose-200' : 'border-stone-200 opacity-70 hover:opacity-100'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* PDF Document Upload & Embed Section */}
                <div className="space-y-3 md:col-span-2 bg-rose-50/40 p-4 rounded-xl border border-rose-200/70">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <Download className="w-4 h-4 text-rose-600" />
                      <span>{language === 'bn' ? 'পিডিএফ ডকুমেন্ট (PDF Book File)' : 'PDF Book File'}</span>
                      {(pdfFile || hasExistingUploadedPdf) && (
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          {language === 'bn' ? 'ফাইল সংযুক্ত' : 'Attached'}
                        </span>
                      )}
                    </label>

                    {/* Mode Selector */}
                    <div className="flex bg-rose-100/70 p-0.5 rounded-lg text-[11px] font-semibold">
                      <button
                        type="button"
                        onClick={() => setPdfSourceMode('upload')}
                        className={`px-3 py-1 rounded-md transition-all ${
                          pdfSourceMode === 'upload'
                            ? 'bg-white text-rose-900 shadow-xs font-bold'
                            : 'text-rose-700 hover:text-rose-900'
                        }`}
                      >
                        {language === 'bn' ? '📁 ফাইল আপলোড (<input type="file">)' : '📁 File Upload'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPdfSourceMode('url')}
                        className={`px-3 py-1 rounded-md transition-all ${
                          pdfSourceMode === 'url'
                            ? 'bg-white text-rose-900 shadow-xs font-bold'
                            : 'text-rose-700 hover:text-rose-900'
                        }`}
                      >
                        {language === 'bn' ? '🔗 ড্রাইভ / অনলাইন লিংক' : '🔗 Web Link'}
                      </button>
                    </div>
                  </div>

                  {pdfSourceMode === 'upload' ? (
                    <div className="space-y-3">
                      {/* Hidden native input */}
                      <input
                        id="book-pdf-file-input"
                        type="file"
                        ref={pdfInputRef}
                        accept=".pdf,application/pdf"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handlePdfFileSelect(f);
                        }}
                        className="hidden"
                      />

                      {/* If file is already selected or saved */}
                      {pdfFile || hasExistingUploadedPdf ? (
                        <div className="bg-white p-3.5 rounded-xl border border-rose-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-stone-900 truncate">
                                {pdfFileName || (language === 'bn' ? 'পিডিএফ ডকুমেন্ট' : 'PDF Document')}
                              </h4>
                              <div className="flex items-center gap-2 text-[11px] text-stone-500">
                                <span>{pdfFileSize || 'পিডিএফ ফাইল'}</span>
                                <span>•</span>
                                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  {language === 'bn' ? 'সরাসরি ব্রাউজারে পড়ার জন্য প্রস্তুত' : 'Ready for in-browser reading'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {previewPdfUrl && (
                              <button
                                type="button"
                                onClick={() => setShowPdfPreviewModal(true)}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5 border border-rose-200"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>{language === 'bn' ? 'প্রিভিউ দেখুন' : 'Preview'}</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => pdfInputRef.current?.click()}
                              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold transition-colors"
                            >
                              {language === 'bn' ? 'ফাইল বদলান' : 'Replace'}
                            </button>

                            <button
                              type="button"
                              onClick={handleClearPdfFile}
                              className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title={language === 'bn' ? 'ফাইল মুছুন' : 'Remove file'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Empty Dropzone */
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDraggingPdf(true);
                          }}
                          onDragLeave={() => setIsDraggingPdf(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDraggingPdf(false);
                            const f = e.dataTransfer.files?.[0];
                            if (f) handlePdfFileSelect(f);
                          }}
                          onClick={() => pdfInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                            isDraggingPdf
                              ? 'border-rose-500 bg-rose-100/50 scale-[1.01]'
                              : 'border-rose-300 hover:border-rose-500 hover:bg-white bg-white/70'
                          }`}
                        >
                          <div className="flex flex-col items-center justify-center gap-2">
                            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md">
                              <FileUp className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-stone-800">
                                {language === 'bn'
                                  ? 'সরাসরি কম্পিউটার বা মোবাইল থেকে PDF ফাইল সিলেক্ট করুন'
                                  : 'Select PDF file from computer or mobile'}
                              </p>
                              <p className="text-xs text-stone-500 mt-0.5">
                                {language === 'bn'
                                  ? 'বা এখানে ফাইলটি টেনে এনে ছেড়ে দিন (সর্বোচ্চ ৫০ মেগাবাইট)'
                                  : 'or drag & drop the .pdf file here (up to 50MB)'}
                              </p>
                            </div>
                            <label
                              htmlFor="book-pdf-file-input"
                              onClick={(e) => e.stopPropagation()}
                              className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
                            >
                              <FileUp className="w-3.5 h-3.5" />
                              <span>{language === 'bn' ? 'ফাইল ব্রাউজ করুন (.pdf)' : 'Browse File (.pdf)'}</span>
                            </label>
                          </div>
                        </div>
                      )}

                      <p className="text-[11px] text-stone-500 leading-relaxed">
                        {language === 'bn'
                          ? '💡 সুবিধা: ফাইল আপলোড করলে পাঠকরা কোনো গুগল ড্রাইভ বা আলাদা ট্যাবে না গিয়ে আপনার ওয়েবসাইটের ভেতরেই বিল্ট-ইন রিডারে পেজ বাই পেজ পড়তে পারবেন।'
                          : '💡 Benefit: Uploaded PDFs render natively in your site\'s built-in reader without redirecting readers outside.'}
                      </p>
                    </div>
                  ) : (
                    /* External URL input */
                    <div className="space-y-2">
                      <input
                        type="url"
                        value={pdfUrl}
                        onChange={(e) => {
                          setPdfUrl(e.target.value);
                          if (e.target.value.trim()) {
                            const norm = normalizePdfViewerUrl(e.target.value.trim());
                            setPreviewPdfUrl(norm.embedUrl);
                          }
                        }}
                        placeholder="https://example.com/books/my-book.pdf অথবা Google Drive শেয়ার লিংক"
                        className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      />
                      <div className="flex items-center justify-between text-[11px] text-stone-500">
                        <span>
                          {language === 'bn'
                            ? 'গুগল ড্রাইভ বা সরাসরি পিডিএফ লিংক দিলে তা স্বয়ংক্রিয়ভাবে রিডারে সংযুক্ত হবে।'
                            : 'Google Drive and direct PDF links will be automatically formatted for the reader.'}
                        </span>
                        {pdfUrl.trim() && (
                          <button
                            type="button"
                            onClick={() => setShowPdfPreviewModal(true)}
                            className="text-rose-600 hover:underline font-bold inline-flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            {language === 'bn' ? 'লিংক প্রিভিউ দেখুন' : 'Preview URL'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Optional Interactive Page-by-Page Content Section */}
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-rose-600" />
                      <span>{language === 'bn' ? 'ডিজিটাল পেজ-বাই-পেজ রিডার (ঐচ্ছিক)' : 'Digital Page-by-Page Reader (Optional)'}</span>
                      <span className="text-[10px] bg-stone-200 text-stone-700 px-2 py-0.5 rounded-full font-bold">
                        {pages.length} {language === 'bn' ? 'পৃষ্ঠা' : 'pages'}
                      </span>
                    </h4>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      {language === 'bn'
                        ? 'পিডিএফ ফাইলের পাশাপাশি যদি ডিজিটাল অধ্যায় ও পৃষ্ঠা যুক্ত করতে চান, তবে পেজ এডিটর ব্যবহার করুন।'
                        : 'Optionally compose digital chapters for in-browser interactive page-flipping.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPagesSubEditor(!showPagesSubEditor)}
                    className="self-start sm:self-auto px-3.5 py-1.5 bg-white hover:bg-stone-100 text-stone-800 text-xs font-bold rounded-lg border border-stone-300 shadow-2xs transition-colors"
                  >
                    {showPagesSubEditor
                      ? (language === 'bn' ? '▲ পেজ এডিটর সঙ্কুচিত করুন' : '▲ Collapse Pages')
                      : (language === 'bn' ? '▼ পেজ এডিটর খুলুন' : '▼ Expand Pages')}
                  </button>
                </div>

                {showPagesSubEditor && (
                  <div className="mt-4 pt-4 border-t border-stone-200 space-y-4">
            <div className="space-y-6">
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200/80 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 leading-relaxed">
                  <p className="font-bold">
                    {language === 'bn'
                      ? 'ইন্টারেক্টিভ পেজ-বাই-পেজ কনটেন্ট সুবিধা'
                      : 'Interactive Page-by-Page Content'}
                  </p>
                  <p className="text-amber-800 mt-0.5">
                    {language === 'bn'
                      ? 'এখানে অধ্যায়ভিত্তিক প্রতিটি পৃষ্ঠার লেখা আলাদাভাবে লিখুন বা পেস্ট করুন। পাঠকরা আসল বইয়ের মতো পৃষ্ঠা উল্টিয়ে আরাম করে পড়তে পারবেন।'
                      : 'Add individual pages and chapters. Readers will turn pages naturally in the digital reader.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Pages Sidebar (4 cols) */}
                <div className="md:col-span-4 bg-stone-50 rounded-xl p-3 border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                    <span className="text-xs font-bold text-stone-700">
                      {language === 'bn' ? `পৃষ্ঠাসমূহ (${pages.length})` : `Pages (${pages.length})`}
                    </span>
                    <button
                      type="button"
                      onClick={handleAddPage}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold shadow-2xs transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'পৃষ্ঠা যোগ' : 'Add Page'}</span>
                    </button>
                  </div>

                  <div className="space-y-1 max-h-96 overflow-y-auto pr-1">
                    {pages.map((pg, idx) => (
                      <div
                        key={pg.id}
                        onClick={() => setActiveEditingPageIdx(idx)}
                        className={`p-2.5 rounded-lg text-xs cursor-pointer flex items-center justify-between transition-colors ${
                          activeEditingPageIdx === idx
                            ? 'bg-white text-rose-700 font-bold border border-rose-200 shadow-xs'
                            : 'text-stone-700 hover:bg-stone-200/60'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-5 h-5 rounded bg-stone-200/80 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {pg.page_number}
                          </span>
                          <span className="truncate">
                            {pg.chapter_title || `পৃষ্ঠা ${pg.page_number}`}
                          </span>
                        </div>

                        {pages.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemovePage(idx);
                            }}
                            className="p-1 text-stone-400 hover:text-red-600 rounded hover:bg-red-50"
                            title="পৃষ্ঠা মুছুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Page Content Editor Canvas (8 cols) */}
                <div className="md:col-span-8 bg-white rounded-xl border border-stone-200 p-4 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                    <span className="text-xs font-bold text-stone-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center">
                        {activePage.page_number}
                      </span>
                      <span>
                        {language === 'bn'
                          ? `পৃষ্ঠা ${activePage.page_number} এর তথ্য ও কনটেন্ট`
                          : `Editing Page ${activePage.page_number}`}
                      </span>
                    </span>
                    <span className="text-[11px] text-stone-400">
                      {activePage.content.length} {language === 'bn' ? 'অক্ষর' : 'chars'}
                    </span>
                  </div>

                  {/* Chapter Title */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-600">
                      {language === 'bn' ? 'অধ্যায়ের নাম বা অনুচ্ছেদ শিরোনাম' : 'Chapter / Section Title'}
                    </label>
                    <input
                      type="text"
                      value={activePage.chapter_title || ''}
                      onChange={(e) => handlePageChange('chapter_title', e.target.value)}
                      placeholder={language === 'bn' ? 'যেমন: অধ্যায় ১: নতুন শুরু' : 'e.g. Chapter 1: The Beginning'}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold text-stone-900 focus:bg-white focus:ring-1 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>

                  {/* Page Text Content */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-600 flex items-center justify-between">
                      <span>{language === 'bn' ? 'পৃষ্ঠার মূল বক্তব্য / গল্প / পাঠ্য *' : 'Page Text Content *'}</span>
                      <span className="text-[10px] text-stone-400 font-normal">
                        {language === 'bn' ? 'প্যারাগ্রাফ তৈরি করতে এন্টার দিন' : 'Press Enter for paragraphs'}
                      </span>
                    </label>
                    <textarea
                      rows={10}
                      value={activePage.content}
                      onChange={(e) => handlePageChange('content', e.target.value)}
                      placeholder={
                        language === 'bn'
                          ? 'এখানে এই পৃষ্ঠার সম্পূর্ণ লেখাটি লিখুন বা পেস্ট করুন...'
                          : 'Write or paste the page text here...'
                      }
                      className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-lg text-xs sm:text-sm text-stone-900 font-serif leading-relaxed focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

              {/* Step 2 Navigation */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-stone-300 rounded-lg text-xs font-bold text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{language === 'bn' ? 'পূর্ববর্তী ধাপ: বইয়ের বিবরণ' : 'Back: Book Details'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
                >
                  <span>{language === 'bn' ? 'পরবর্তী ধাপ: অধিকার ও প্রকাশনা' : 'Next: Rights & Publish'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: RIGHTS, SEO & FINAL PUBLISH (Amazon KDP Step 3) */}
          {kdpStep === 3 && (
            <div className="space-y-6">
              <div className="bg-emerald-50/70 rounded-xl p-4 border border-emerald-200/80 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950 leading-relaxed">
                  <p className="font-bold">
                    {language === 'bn'
                      ? 'ধাপ ৩: অধিকার, এসইও ও প্রকাশনা (Rights, SEO & Publishing)'
                      : 'Step 3: Rights, SEO & Publishing'}
                  </p>
                  <p className="text-emerald-800 text-[11px] mt-0.5">
                    {language === 'bn'
                      ? 'বইটির প্রকাশনার স্থিতি, ডাউনলোড অনুমোদন এবং গুগল সার্চ রেজাল্টে সহজে খুঁজে পাওয়ার জন্য এসইও কনফিগার করুন।'
                      : 'Configure publication status, free download rights, and SEO metadata for Google search ranking.'}
                  </p>
                </div>
              </div>

              {/* Rights & Distribution Toggles */}
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-stone-200 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-rose-600" />
                  <span>{language === 'bn' ? 'প্রকাশনা অধিকার ও প্রদর্শন সেটিংস' : 'Rights & Distribution'}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <label className="flex items-start gap-2.5 p-3 rounded-lg border border-stone-200 bg-stone-50/50 hover:bg-stone-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-rose-600 rounded border-stone-300 focus:ring-rose-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-stone-900 block">
                        {language === 'bn' ? 'সরাসরি লাইভ প্রকাশ' : 'Publish Live'}
                      </span>
                      <span className="text-[11px] text-stone-500">
                        {language === 'bn' ? 'পাঠকরা তাৎক্ষণিক অনলাইনে পড়তে পারবে' : 'Visible to public readers'}
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-lg border border-stone-200 bg-stone-50/50 hover:bg-stone-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-amber-600 rounded border-stone-300 focus:ring-amber-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-stone-900 block">
                        {language === 'bn' ? 'নির্বাচিত বই (Featured)' : 'Feature on Top'}
                      </span>
                      <span className="text-[11px] text-stone-500">
                        {language === 'bn' ? 'বই কর্নারের শীর্ষে হাইলাইট করা হবে' : 'Highlight in showcase'}
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-lg border border-stone-200 bg-stone-50/50 hover:bg-stone-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={allowDownload}
                      onChange={(e) => setAllowDownload(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-stone-900 block">
                        {language === 'bn' ? 'ফ্রি ডাউনলোড অনুমোদন' : 'Allow Free Download'}
                      </span>
                      <span className="text-[11px] text-stone-500">
                        {language === 'bn' ? 'পাঠকরা অফলাইনে পড়ার জন্য পিডিএফ নামাতে পারবে' : 'Readers can save PDF offline'}
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* SMART SEO & GOOGLE SERP PREVIEW */}
              <div className="flex items-center justify-between bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                <div>
                  <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>{language === 'bn' ? 'স্মার্ট এসইও অপটিমাইজেশন (SEO)' : 'Smart SEO Optimization'}</span>
                  </h4>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    {language === 'bn'
                      ? 'বইটির মেটাডাটা গুগল সার্চ রেজাল্টে শীর্ষ স্থানে আসার জন্য অপটিমাইজ করুন।'
                      : 'Optimize metadata to rank high on Google and social shares.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAutoGenerateSEO}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                >
                  {language === 'bn' ? 'অটো-জেনারেট এসইও' : 'Auto Generate SEO'}
                </button>
              </div>

              {/* Google Search Live Card Preview */}
              <div className="bg-white rounded-xl border border-stone-300 p-4 sm:p-5 shadow-xs space-y-2">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  {language === 'bn' ? 'গুগল সার্চ প্রিভিউ (Google Search Preview)' : 'Google Search Snippet Preview'}
                </span>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-stone-600">
                    <span className="text-emerald-700 font-medium">https://futurenews.bd/book/{book?.slug || generateSlug(title)}</span>
                  </div>
                  <h3 className="text-blue-700 hover:underline text-base sm:text-lg font-medium cursor-pointer leading-snug">
                    {metaTitle || `${title || 'বইয়ের শিরোনাম'} - ফিউচার নিউজ ই-বুক`}
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed max-w-2xl">
                    {metaDescription ||
                      description ||
                      'অনলাইনে সম্পূর্ণ বইটি পেজ-বাই-পেজ পড়ুন অথবা ডাউনলোড করুন।'}
                  </p>
                </div>
              </div>

              {/* SEO Inputs */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-xs font-bold text-stone-700">
                      {language === 'bn' ? 'এসইও মেটা টাইটেল (Meta Title)' : 'SEO Meta Title'}
                    </label>
                    <span className="text-[10px] text-stone-400">{metaTitle.length}/60</span>
                  </div>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="স্মার্ট ক্যারিয়ার ও ফ্রিল্যান্সিং গাইড ২০২৬ - সম্পূর্ণ ই-বুক"
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:bg-white focus:ring-1 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-xs font-bold text-stone-700">
                      {language === 'bn' ? 'এসইও মেটা বিবরণ (Meta Description)' : 'SEO Meta Description'}
                    </label>
                    <span className="text-[10px] text-stone-400">{metaDescription.length}/160</span>
                  </div>
                  <textarea
                    rows={3}
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="বইটি সম্পর্কে ১৫০ অক্ষরের ভেতর আকর্ষণীয় বিবরণ লিখুন..."
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:bg-white focus:ring-1 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">
                    {language === 'bn' ? 'ফোকাস কিওয়ার্ড ও ট্যাগ (কমা দিয়ে লিখুন)' : 'Focus Keywords & Tags (Comma separated)'}
                  </label>
                  <input
                    type="text"
                    value={keywordsText}
                    onChange={(e) => setKeywordsText(e.target.value)}
                    placeholder="বাংলা বই, ফ্রিল্যান্সিং, ই-বুক, ক্যারিয়ার, PDF"
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:bg-white focus:ring-1 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                {/* Amazon KDP Style Pre-Flight Quality Checklist */}
                <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-3">
                  <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>
                      {language === 'bn'
                        ? 'অ্যামাজন কেডিপি স্টাইল প্রি-ফ্লাইট কোয়ালিটি চেকলিস্ট'
                        : 'Amazon KDP Pre-Flight Quality Checklist'}
                    </span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-stone-200">
                      <CheckCircle
                        className={`w-4 h-4 shrink-0 ${
                          title.trim() && author.trim() ? 'text-emerald-600' : 'text-stone-300'
                        }`}
                      />
                      <span className={title.trim() && author.trim() ? 'text-stone-800 font-medium' : 'text-stone-400'}>
                        {language === 'bn' ? 'বইয়ের শিরোনাম ও লেখক তথ্য সম্পূর্ণ' : 'Title & author provided'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-stone-200">
                      <CheckCircle
                        className={`w-4 h-4 shrink-0 ${coverImage ? 'text-emerald-600' : 'text-amber-500'}`}
                      />
                      <span className={coverImage ? 'text-stone-800 font-medium' : 'text-amber-700'}>
                        {language === 'bn' ? 'বইয়ের প্রচ্ছদ ছবি সংযুক্ত' : 'Cover image attached'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-stone-200">
                      <CheckCircle
                        className={`w-4 h-4 shrink-0 ${
                          pdfFile || hasExistingUploadedPdf || pdfUrl || pages.length > 0
                            ? 'text-emerald-600'
                            : 'text-amber-500'
                        }`}
                      />
                      <span
                        className={
                          pdfFile || hasExistingUploadedPdf || pdfUrl || pages.length > 0
                            ? 'text-stone-800 font-medium'
                            : 'text-amber-700'
                        }
                      >
                        {language === 'bn' ? 'পিডিএফ পান্ডুলিপি বা পেজ প্রস্তুত' : 'PDF manuscript or pages ready'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-stone-200">
                      <CheckCircle
                        className={`w-4 h-4 shrink-0 ${
                          metaTitle && metaDescription ? 'text-emerald-600' : 'text-stone-400'
                        }`}
                      />
                      <span className={metaTitle && metaDescription ? 'text-stone-800 font-medium' : 'text-stone-400'}>
                        {language === 'bn' ? 'গুগল সার্চ ও সোশ্যাল মেটাডাটা অপটিমাইজড' : 'SEO metadata optimized'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 Navigation & Final Publish */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="px-3.5 py-2 border border-stone-300 rounded-lg text-xs font-bold text-stone-700 hover:bg-stone-100 transition-colors"
                  >
                    {language === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="inline-flex items-center gap-1.5 px-4 py-2 border border-stone-300 rounded-lg text-xs font-bold text-stone-700 hover:bg-stone-100 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>{language === 'bn' ? 'পূর্ববর্তী ধাপ' : 'Back'}</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{language === 'bn' ? 'সংরক্ষণ ও আপলোড হচ্ছে...' : 'Saving & Publishing...'}</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{language === 'bn' ? 'বই সংরক্ষণ ও প্রকাশ করুন' : 'Save & Publish Book'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Embedded PDF Preview Modal inside Book Editor */}
      {showPdfPreviewModal && previewPdfUrl && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="bg-white w-full max-w-4xl h-[90vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl border border-stone-300">
            <div className="px-5 py-3.5 bg-stone-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="text-xs font-bold truncate">
                  {language === 'bn' ? 'পিডিএফ প্রিভিউ রিডার:' : 'PDF Reader Preview:'} {pdfFileName || title}
                </span>
                {pdfFileSize && (
                  <span className="text-[10px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded-full">
                    {pdfFileSize}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 text-[11px] bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-md font-semibold inline-flex items-center gap-1 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'নতুন ট্যাবে খুলুন' : 'Open Tab'}</span>
                </a>
                <button
                  type="button"
                  onClick={() => setShowPdfPreviewModal(false)}
                  className="p-1 hover:bg-stone-800 text-stone-400 hover:text-white rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 w-full bg-stone-100 relative">
              <iframe
                src={`${previewPdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                title="PDF Preview"
                className="w-full h-full border-0"
              />
            </div>

            <div className="px-5 py-2.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600">
              <span>
                {language === 'bn'
                  ? '✓ পাঠকরা ঠিক এভাবেই ওয়েবসাইটের ভেতরে পেজ-বাই-পেজ পড়তে পারবেন।'
                  : '✓ Readers will experience this built-in page-by-page viewing.'}
              </span>
              <button
                type="button"
                onClick={() => setShowPdfPreviewModal(false)}
                className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold transition-colors"
              >
                {language === 'bn' ? 'প্রিভিউ বন্ধ করুন' : 'Close Preview'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

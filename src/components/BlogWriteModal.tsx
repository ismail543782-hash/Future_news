import React, { useState, useRef } from 'react';
import { BlogPost, Language } from '../types/news';
import { saveBlog } from '../utils/storage';
import { autoGenerateSeoFromTitle } from '../utils/seo';
import { compressImageFile } from '../utils/fileStorage';
import {
  X,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Camera,
  PenTool,
  Tag,
  User,
  RefreshCw,
} from 'lucide-react';

interface BlogWriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newBlog: BlogPost) => void;
  language: Language;
}

const DEFAULT_BLOG_CATEGORIES = [
  { bn: 'ফটোগ্রাফি ও জীবনধারা', en: 'Photography & Lifestyle' },
  { bn: 'প্রযুক্তি ও উদ্ভাবন', en: 'Tech & Innovation' },
  { bn: 'মতামত ও বিশ্লেষণ', en: 'Opinion & Editorial' },
  { bn: 'ভ্রমণ ও রোমাঞ্চ', en: 'Travel & Nature' },
  { bn: 'বিজ্ঞান ও পরিবেশ', en: 'Science & Climate' },
  { bn: 'সংস্কৃতি ও সাহিত্য', en: 'Culture & Arts' },
];

export const BlogWriteModal: React.FC<BlogWriteModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  language,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const additionalFilesRef = useRef<HTMLInputElement>(null);

  const [titleBn, setTitleBn] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [summaryBn, setSummaryBn] = useState('');
  const [summaryEn, setSummaryEn] = useState('');
  const [contentBn, setContentBn] = useState('');
  const [contentEn, setContentEn] = useState('');

  const [featuredImage, setFeaturedImage] = useState<string>('');
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [imageCaptionBn, setImageCaptionBn] = useState('');
  const [imageCaptionEn, setImageCaptionEn] = useState('');

  const [categoryBn, setCategoryBn] = useState(DEFAULT_BLOG_CATEGORIES[0].bn);
  const [categoryEn, setCategoryEn] = useState(DEFAULT_BLOG_CATEGORIES[0].en);

  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [authorRoleBn, setAuthorRoleBn] = useState('');
  const [authorRoleEn, setAuthorRoleEn] = useState('');
  const [tagInput, setTagInput] = useState('Blog, Story, PhotoJournal');

  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [customSlug, setCustomSlug] = useState('');

  const [imageSourceMode, setImageSourceMode] = useState<'upload' | 'url'>('upload');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Handle single file upload for Featured Image
  const handleFeaturedFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg(language === 'bn' ? 'অনুগ্রহ করে একটি ছবি ফাইল আপলোড করুন (JPG, PNG, WebP)' : 'Please select an image file (JPG, PNG, WebP)');
      return;
    }
    try {
      setErrorMsg('');
      const compressedDataUrl = await compressImageFile(file, 1200, 800, 0.84);
      setFeaturedImage(compressedDataUrl);
    } catch {
      setErrorMsg(language === 'bn' ? 'ছবি প্রসেস করতে সমস্যা হয়েছে।' : 'Failed to process image.');
    }
  };

  // Handle additional photos for gallery
  const handleAdditionalPhotosUpload = async (files: FileList) => {
    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        try {
          const compressed = await compressImageFile(file, 1000, 750, 0.82);
          setAdditionalImages((prev) => [...prev, compressed]);
        } catch {
          // ignore individual failure
        }
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFeaturedFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = DEFAULT_BLOG_CATEGORIES.find((c) => c.bn === e.target.value);
    if (selected) {
      setCategoryBn(selected.bn);
      setCategoryEn(selected.en);
    }
  };

  // Auto-SEO Generator
  const handleAutoSeo = () => {
    const activeTitle = titleBn.trim() || titleEn.trim();
    const activeSummary = summaryBn.trim() || summaryEn.trim();
    if (!activeTitle) {
      setErrorMsg(language === 'bn' ? 'প্রথমে ব্লগের শিরোনাম লিখুন।' : 'Please enter a title first.');
      return;
    }
    const seoResult = autoGenerateSeoFromTitle(activeTitle, activeSummary, categoryBn, 'bn');
    setSeoTitle(seoResult.seo_title);
    setSeoDesc(seoResult.seo_description);
    setCustomSlug(seoResult.slug);
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!titleBn.trim() && !titleEn.trim()) {
      setErrorMsg(language === 'bn' ? 'ব্লগের শিরোনাম আবশ্যক।' : 'Blog title is required.');
      return;
    }
    if (!contentBn.trim() && !contentEn.trim()) {
      setErrorMsg(language === 'bn' ? 'ব্লগের বিস্তারিত বক্তব্য বা কন্টেন্ট লিখুন।' : 'Blog content is required.');
      return;
    }
    if (!featuredImage.trim()) {
      setErrorMsg(language === 'bn' ? 'অনুগ্রহ করে ব্লগের জন্য অন্তত একটি ছবি আপলোড করুন।' : 'Please upload or add a featured photo.');
      return;
    }

    setIsSubmitting(true);

    const effectiveTitleBn = titleBn.trim() || titleEn.trim();
    const effectiveTitleEn = titleEn.trim() || titleBn.trim();
    const effectiveSummaryBn = summaryBn.trim() || contentBn.slice(0, 140) + '...';
    const effectiveSummaryEn = summaryEn.trim() || contentEn.slice(0, 140) + '...';
    const effectiveAuthor = authorName.trim() || (language === 'bn' ? 'সম্মানিত পাঠক ও ব্লগার' : 'Guest Contributor');

    const generatedSlug = customSlug.trim()
      ? customSlug.trim().toLowerCase().replace(/[\s_]+/g, '-')
      : autoGenerateSeoFromTitle(effectiveTitleBn, effectiveSummaryBn, categoryBn, 'bn').slug;

    const tags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const readingTime = Math.max(2, Math.ceil((contentBn.length + contentEn.length) / 800));

    const newBlog: BlogPost = {
      id: `blog-${Date.now()}`,
      slug: generatedSlug,
      title_bn: effectiveTitleBn,
      title_en: effectiveTitleEn,
      summary_bn: effectiveSummaryBn,
      summary_en: effectiveSummaryEn,
      content_bn: contentBn.trim() || contentEn.trim(),
      content_en: contentEn.trim() || contentBn.trim(),
      featured_image: featuredImage,
      additional_images: additionalImages,
      image_caption_bn: imageCaptionBn || 'ছবি: ব্লগারের ক্যামেরায় সংগৃহীত',
      image_caption_en: imageCaptionEn || 'Photo courtesy of the author',
      author_name: effectiveAuthor,
      author_role_bn: authorRoleBn.trim() || 'স্বতন্ত্র কন্টেন্ট লেখক ও আলোকচিত্রী',
      author_role_en: authorRoleEn.trim() || 'Independent Writer & Visual Creator',
      author_photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      category_name_bn: categoryBn,
      category_name_en: categoryEn,
      tags: tags.length > 0 ? tags : ['Blog', 'Opinion', 'PhotoStory'],
      reading_time_minutes: readingTime,
      views: 1,
      likes: 0,
      status: 'published',
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      is_user_submitted: true,
      seo_title_bn: seoTitle || `${effectiveTitleBn} | ফিউচার নিউজ ব্লগ`,
      seo_title_en: seoTitle || `${effectiveTitleEn} | Future News Blog`,
      seo_description_bn: seoDesc || effectiveSummaryBn,
      seo_description_en: seoDesc || effectiveSummaryEn,
    };

    saveBlog(newBlog);
    setIsSubmitting(false);
    onSuccess(newBlog);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200 my-auto">
        {/* Modal Header */}
        <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center shadow-xs">
              <PenTool className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {language === 'bn' ? 'নতুন ব্লগ ও আলোকচিত্র প্রকাশ করুন' : 'Write Blog & Publish Photo Story'}
              </h2>
              <p className="text-xs text-stone-400">
                {language === 'bn'
                  ? 'আপনার নিজের মতামত, নিবন্ধ বা ছবি আপলোড করে সরাসরি পাঠকদের সাথে শেয়ার করুন।'
                  : 'Share your perspective, investigative report, or photojournalism piece.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Photo Upload (Primary Requirement) */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-rose-600" />
                <span>{language === 'bn' ? 'প্রধান ছবি / ফিচার্ড ফটো আপলোড (Featured Photo)' : 'Featured Photo (Upload from Device)'}</span>
                <span className="text-rose-500">*</span>
              </label>

              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setImageSourceMode('upload')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    imageSourceMode === 'upload'
                      ? 'bg-rose-600 text-white'
                      : 'bg-white text-stone-600 border border-stone-300'
                  }`}
                >
                  {language === 'bn' ? 'ফাইল আপলোড' : 'Upload File'}
                </button>
                <button
                  type="button"
                  onClick={() => setImageSourceMode('url')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    imageSourceMode === 'url'
                      ? 'bg-rose-600 text-white'
                      : 'bg-white text-stone-600 border border-stone-300'
                  }`}
                >
                  {language === 'bn' ? 'ছবির লিংক (URL)' : 'Image URL'}
                </button>
              </div>
            </div>

            {/* Upload Area */}
            {imageSourceMode === 'upload' ? (
              <div>
                <input
                  id="blog-featured-image-file"
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFeaturedFileUpload(e.target.files[0])}
                  className="hidden"
                />
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    dragActive
                      ? 'border-rose-500 bg-rose-50/50'
                      : featuredImage
                      ? 'border-emerald-300 bg-emerald-50/30'
                      : 'border-stone-300 hover:border-rose-400 bg-white'
                  }`}
                >
                  {featuredImage ? (
                    <div className="relative group max-w-sm mx-auto">
                      <img
                        src={featuredImage}
                        alt="Preview"
                        className="w-full h-44 object-cover rounded-lg shadow-sm border border-stone-200"
                      />
                      <div className="mt-2 flex items-center justify-center gap-2 text-xs">
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          {language === 'bn' ? 'ছবি সফলভাবে লোড হয়েছে' : 'Image ready'}
                        </span>
                        <label
                          htmlFor="blog-featured-image-file"
                          onClick={(e) => e.stopPropagation()}
                          className="text-rose-600 underline hover:text-rose-700 font-bold cursor-pointer"
                        >
                          {language === 'bn' ? 'পরিবর্তন করুন' : 'Change photo'}
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-stone-700">
                        {language === 'bn'
                          ? 'ক্লিক করে আপনার ডিভাইস থেকে ছবি নির্বাচন করুন অথবা ড্র্যাগ করুন'
                          : 'Click to browse files or drag and drop your photo here'}
                      </p>
                      <p className="text-[11px] text-stone-500">
                        JPG, PNG, WebP (হাই-রেজোলিউশন ছবি অনুমোদিত)
                      </p>
                      <label
                        htmlFor="blog-featured-image-file"
                        onClick={(e) => e.stopPropagation()}
                        className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-lg text-xs font-bold cursor-pointer transition-all shadow-xs"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{language === 'bn' ? 'মোবাইল বা পিসি থেকে ছবি বাছুন' : 'Select Photo from Device'}</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <button
                    type="button"
                    onClick={() => setFeaturedImage(imageUrlInput)}
                    className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800"
                  >
                    {language === 'bn' ? 'ছবি লোড করুন' : 'Load Photo'}
                  </button>
                </div>
                {featuredImage && (
                  <img
                    src={featuredImage}
                    alt="Preview"
                    className="w-full max-w-sm h-36 object-cover rounded-lg border border-stone-200"
                  />
                )}
              </div>
            )}

            {/* Photo Caption & Credits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  {language === 'bn' ? 'ছবির ক্যাপশন (বাংলা)' : 'Photo Caption (Bangla)'}
                </label>
                <input
                  type="text"
                  value={imageCaptionBn}
                  onChange={(e) => setImageCaptionBn(e.target.value)}
                  placeholder="যেমন: সাজেকের কংলাক চূড়া থেকে মেঘের দৃশ্য..."
                  className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  {language === 'bn' ? 'ছবির ক্যাপশন (ইংরেজি)' : 'Photo Caption (English)'}
                </label>
                <input
                  type="text"
                  value={imageCaptionEn}
                  onChange={(e) => setImageCaptionEn(e.target.value)}
                  placeholder="e.g. Misty horizon over the mountain ridge..."
                  className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>

            {/* Additional Photos Attachment (Photo Gallery / Multi-photo) */}
            <div className="pt-2 border-t border-stone-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-stone-700 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-stone-500" />
                  {language === 'bn' ? 'আরও ছবি যুক্ত করুন (ফটো স্টোরি / অ্যালবাম)' : 'Add More Photos (Multi-Photo Story)'}
                </span>
                <button
                  type="button"
                  onClick={() => additionalFilesRef.current?.click()}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? '+ ছবি যোগ করুন' : '+ Add Photo'}</span>
                </button>
                <input
                  type="file"
                  ref={additionalFilesRef}
                  accept="image/*"
                  multiple
                  onChange={(e) => e.target.files && handleAdditionalPhotosUpload(e.target.files)}
                  className="hidden"
                />
              </div>

              {additionalImages.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {additionalImages.map((img, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden border border-stone-200 h-20">
                      <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setAdditionalImages(additionalImages.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full opacity-90 hover:opacity-100 shadow-xs"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Blog Titles & Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  {language === 'bn' ? 'ব্লগের শিরোনাম (বাংলা)' : 'Blog Title (Bangla)'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={titleBn}
                  onChange={(e) => setTitleBn(e.target.value)}
                  placeholder="যেমন: পাহাড়ে মেঘের খেলা: আমার সাজেক ভ্রমণের অভিজ্ঞতা..."
                  className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  {language === 'bn' ? 'ব্লগের শিরোনাম (ইংরেজি)' : 'Blog Title (English)'}
                </label>
                <input
                  type="text"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="e.g. Journey to Sajek Valley: Walking Above the Clouds..."
                  className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                />
              </div>
            </div>

            {/* Category & Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  {language === 'bn' ? 'ক্যাটাগরি / বিষয়' : 'Category / Topic'}
                </label>
                <select
                  value={categoryBn}
                  onChange={handleCategoryChange}
                  className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                >
                  {DEFAULT_BLOG_CATEGORIES.map((cat, i) => (
                    <option key={i} value={cat.bn}>
                      {language === 'bn' ? cat.bn : `${cat.en} (${cat.bn})`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-stone-500" />
                  <span>{language === 'bn' ? 'ট্যাগ সমূহ (কমা দিয়ে আলাদা করুন)' : 'Tags (comma-separated)'}</span>
                </label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Travel, PhotoJournal, Adventure, Nature"
                  className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            {/* Author Information */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-stone-500" />
                    <span>{language === 'bn' ? 'লেখকের নাম' : 'Author Name'}</span>
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. ইসমাইল হোসেন / Ismail"
                    className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    {language === 'bn' ? 'ইমেইল (গোপন রাখা হবে)' : 'Author Email'}
                  </label>
                  <input
                    type="email"
                    value={authorEmail}
                    onChange={(e) => setAuthorEmail(e.target.value)}
                    placeholder="ismail543782@gmail.com"
                    className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    {language === 'bn' ? 'লেখকের পদবি / ভূমিকা' : 'Author Role'}
                  </label>
                  <input
                    type="text"
                    value={authorRoleBn}
                    onChange={(e) => setAuthorRoleBn(e.target.value)}
                    placeholder="e.g. আলোকচিত্রী ও পর্যটক"
                    className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Summaries */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  {language === 'bn' ? 'সংক্ষিপ্ত সারসংক্ষেপ (বাংলা)' : 'Summary (Bangla)'}
                </label>
                <textarea
                  rows={2}
                  value={summaryBn}
                  onChange={(e) => setSummaryBn(e.target.value)}
                  placeholder="ব্লগের মূল বক্তব্য ১-২ লাইনে তুলে ধরুন..."
                  className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  {language === 'bn' ? 'সংক্ষিপ্ত সারসংক্ষেপ (ইংরেজি)' : 'Summary (English)'}
                </label>
                <textarea
                  rows={2}
                  value={summaryEn}
                  onChange={(e) => setSummaryEn(e.target.value)}
                  placeholder="Key takeaway in 1-2 sentences..."
                  className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            {/* Full Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  {language === 'bn' ? 'মূল ব্লগ বক্তব্য (বাংলা)' : 'Blog Content (Bangla)'} <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={8}
                  value={contentBn}
                  onChange={(e) => setContentBn(e.target.value)}
                  placeholder="আপনার সম্পূর্ণ ব্লগ, মতামত, ভ্রমণের গল্প বা বিশ্লেষণ বিস্তারিতভাবে লিখুন..."
                  className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 leading-relaxed font-sans"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  {language === 'bn' ? 'মূল বক্তব্য (ইংরেজি - ঐচ্ছিক)' : 'Blog Content (English - Optional)'}
                </label>
                <textarea
                  rows={8}
                  value={contentEn}
                  onChange={(e) => setContentEn(e.target.value)}
                  placeholder="Write the English translated version of your blog..."
                  className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 leading-relaxed font-sans"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Google SEO Auto-Generator for Blog */}
          <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-rose-600" />
                {language === 'bn' ? 'গুগল সার্চ এসইও (Google SEO & Meta Setup)' : 'Google SEO & URL Slug'}
              </span>
              <button
                type="button"
                onClick={handleAutoSeo}
                className="flex items-center gap-1 px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'অটো এসইও তৈরি করুন' : 'Auto-Generate SEO'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  {language === 'bn' ? 'এসইও টাইটেল' : 'SEO Meta Title'}
                </label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Google search results title..."
                  className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  {language === 'bn' ? 'কাস্টম URL স্লাগ' : 'Custom URL Slug'}
                </label>
                <input
                  type="text"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value)}
                  placeholder="e.g. my-sajek-travel-story"
                  className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg bg-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 border border-stone-300 rounded-lg hover:bg-stone-100"
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{language === 'bn' ? 'সরাসরি ব্লগ প্রকাশ করুন' : 'Publish Blog Post'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import { Article, BreakingNews, Advertisement, Comment, Category, Author, ActivityLog, BlogPost, CountryEdition } from '../types/news';
import { INITIAL_ARTICLES, INITIAL_BREAKING_NEWS, INITIAL_ADS, INITIAL_CATEGORIES, INITIAL_AUTHORS, INITIAL_BLOGS, INITIAL_EDITIONS } from '../data/initialData';

const ARTICLES_KEY = 'fn_articles_v1';
const BREAKING_KEY = 'fn_breaking_v1';
const ADS_KEY = 'fn_ads_v1';
const CATEGORIES_KEY = 'fn_categories_v1';
const AUTHORS_KEY = 'fn_authors_v1';
const COMMENTS_KEY = 'fn_comments_v1';
const LOGS_KEY = 'fn_logs_v1';
const ADMIN_AUTH_KEY = 'fn_admin_session_v1';
const ADMIN_CREDS_KEY = 'fn_admin_creds_v1';
const ADMIN_LOCKOUT_KEY = 'fn_admin_lockout_v1';
const BLOGS_KEY = 'fn_blogs_v1';
const EDITION_KEY = 'fn_current_edition_v1';

export interface AdminCredentials {
  email: string;
  password: string;
  recoveryPin: string;
  updatedAt: string;
}

export interface LockoutStatus {
  attempts: number;
  lockedUntil: number;
}

const DEFAULT_ADMIN_CREDS: AdminCredentials = {
  email: 'ismail543782@gmail.com',
  password: 'Admin#Ismail2026',
  recoveryPin: '782543',
  updatedAt: new Date().toISOString(),
};

const SESSION_DURATION_MS = 4 * 60 * 60 * 1000; // 4 Hours Session Expiry

// Initial Comments
const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'comm-1',
    article_id: 'art-1',
    author_name: 'আব্দুল করিম',
    author_email: 'karim@gmail.com',
    content: 'দেশের প্রযুক্তির উন্নয়নে এই ধরনের মেগা পরিকল্পনা সত্যিই প্রশংসনীয়। দ্রুত বাস্তবায়ন দেখতে চাই।',
    status: 'approved',
    created_at: '2026-09-09T19:00:00Z',
  },
  {
    id: 'comm-2',
    article_id: 'art-3',
    author_name: 'Shakil Ahmed',
    author_email: 'shakil@yahoo.com',
    content: 'What an extraordinary match! Pure goosebumps in that final over boundary!',
    status: 'approved',
    created_at: '2026-09-09T17:30:00Z',
  }
];

export function notifyDataChange(type: string = 'general') {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('futurenews_data_updated', { detail: { type } }));
  }
}

export function getArticles(): Article[] {
  try {
    const raw = localStorage.getItem(ARTICLES_KEY);
    if (!raw) {
      localStorage.setItem(ARTICLES_KEY, JSON.stringify(INITIAL_ARTICLES));
      return INITIAL_ARTICLES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_ARTICLES;
  } catch (e) {
    console.error('Failed to read articles from localStorage', e);
    return INITIAL_ARTICLES;
  }
}

export function saveArticle(article: Article): void {
  const articles = getArticles();
  const index = articles.findIndex((a) => a.id === article.id);
  let updated: Article[];
  if (index >= 0) {
    updated = [...articles];
    updated[index] = { ...article, updated_at: new Date().toISOString() };
    logActivity('Article Updated', `Updated article: ${article.title_bn || article.title_en}`);
  } else {
    updated = [article, ...articles];
    logActivity('Article Created', `Published new article: ${article.title_bn || article.title_en}`);
  }
  localStorage.setItem(ARTICLES_KEY, JSON.stringify(updated));

  // If marked as breaking, ensure it is in breaking list
  if (article.is_breaking) {
    syncBreakingNewsWithArticle(article);
  }
  notifyDataChange('articles');
}

export function deleteArticle(id: string): void {
  const articles = getArticles();
  const target = articles.find((a) => a.id === id);
  const filtered = articles.filter((a) => a.id !== id);
  localStorage.setItem(ARTICLES_KEY, JSON.stringify(filtered));
  if (target) {
    logActivity('Article Deleted', `Deleted article: ${target.title_bn || target.title_en}`);
  }
  notifyDataChange('articles');
}

export function getArticleBySlug(slug: string): Article | undefined {
  if (!slug) return undefined;
  const articles = getArticles();
  const decodedSlug = decodeURIComponent(slug).toLowerCase().trim().replace(/^\/+|\/+$/g, '');
  return articles.find(
    (a) =>
      a.slug.toLowerCase().trim().replace(/^\/+|\/+$/g, '') === decodedSlug ||
      (a.slug_bn && a.slug_bn.toLowerCase().trim().replace(/^\/+|\/+$/g, '') === decodedSlug) ||
      (a.slug_en && a.slug_en.toLowerCase().trim().replace(/^\/+|\/+$/g, '') === decodedSlug) ||
      a.id === decodedSlug
  );
}

export function incrementArticleViews(id: string): void {
  try {
    const articles = getArticles();
    const index = articles.findIndex((a) => a.id === id);
    if (index >= 0) {
      articles[index].views = (articles[index].views || 0) + 1;
      localStorage.setItem(ARTICLES_KEY, JSON.stringify(articles));
    }
  } catch (e) {
    console.error(e);
  }
}

// Breaking News
export function getBreakingNews(): BreakingNews[] {
  try {
    const raw = localStorage.getItem(BREAKING_KEY);
    if (!raw) {
      localStorage.setItem(BREAKING_KEY, JSON.stringify(INITIAL_BREAKING_NEWS));
      return INITIAL_BREAKING_NEWS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_BREAKING_NEWS;
  }
}

export function saveBreakingNews(item: BreakingNews): void {
  const list = getBreakingNews();
  const index = list.findIndex((i) => i.id === item.id);
  let updated: BreakingNews[];
  if (index >= 0) {
    updated = [...list];
    updated[index] = item;
  } else {
    updated = [item, ...list];
  }
  localStorage.setItem(BREAKING_KEY, JSON.stringify(updated));
}

export function deleteBreakingNews(id: string): void {
  const list = getBreakingNews();
  const filtered = list.filter((i) => i.id !== id);
  localStorage.setItem(BREAKING_KEY, JSON.stringify(filtered));
}

function syncBreakingNewsWithArticle(article: Article) {
  const breakingList = getBreakingNews();
  const existing = breakingList.find((b) => b.article_slug === article.slug);
  if (!existing) {
    const newBreaking: BreakingNews = {
      id: `brk-${Date.now()}`,
      title_bn: `ব্রেকিং: ${article.title_bn}`,
      title_en: `BREAKING: ${article.title_en}`,
      article_slug: article.slug,
      priority: 1,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    saveBreakingNews(newBreaking);
  }
}

// Advertisements (Google AdSense & Custom Banners)
export function getAdvertisements(): Advertisement[] {
  try {
    const raw = localStorage.getItem(ADS_KEY);
    if (!raw) {
      localStorage.setItem(ADS_KEY, JSON.stringify(INITIAL_ADS));
      return INITIAL_ADS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ADS;
  }
}

export function getAdBySlot(slot: string): Advertisement | undefined {
  const ads = getAdvertisements();
  return ads.find((ad) => ad.slot === slot && ad.is_enabled);
}

export function saveAdvertisement(ad: Advertisement): void {
  const ads = getAdvertisements();
  const index = ads.findIndex((a) => a.id === ad.id);
  let updated: Advertisement[];
  if (index >= 0) {
    updated = [...ads];
    updated[index] = ad;
  } else {
    updated = [...ads, ad];
  }
  localStorage.setItem(ADS_KEY, JSON.stringify(updated));
  logActivity('Advertisement Updated', `Configured ad slot: ${ad.title}`);
}

export function recordAdImpression(id: string): void {
  try {
    const ads = getAdvertisements();
    const idx = ads.findIndex((a) => a.id === id);
    if (idx >= 0) {
      ads[idx].impressions = (ads[idx].impressions || 0) + 1;
      localStorage.setItem(ADS_KEY, JSON.stringify(ads));
    }
  } catch {}
}

export function recordAdClick(id: string): void {
  try {
    const ads = getAdvertisements();
    const idx = ads.findIndex((a) => a.id === id);
    if (idx >= 0) {
      ads[idx].clicks = (ads[idx].clicks || 0) + 1;
      localStorage.setItem(ADS_KEY, JSON.stringify(ads));
    }
  } catch {}
}

// Categories & Authors
export function getCategories(): Category[] {
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY);
    if (!raw) {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(INITIAL_CATEGORIES));
      return INITIAL_CATEGORIES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CATEGORIES;
  }
}

export function getAuthors(): Author[] {
  try {
    const raw = localStorage.getItem(AUTHORS_KEY);
    if (!raw) {
      localStorage.setItem(AUTHORS_KEY, JSON.stringify(INITIAL_AUTHORS));
      return INITIAL_AUTHORS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_AUTHORS;
  }
}

// Comments
export function getComments(articleId?: string): Comment[] {
  try {
    const raw = localStorage.getItem(COMMENTS_KEY);
    const all: Comment[] = raw ? JSON.parse(raw) : INITIAL_COMMENTS;
    if (articleId) {
      return all.filter((c) => c.article_id === articleId && c.status === 'approved');
    }
    return all;
  } catch {
    return INITIAL_COMMENTS;
  }
}

export function addComment(comment: Omit<Comment, 'id' | 'created_at'>): Comment {
  const all = getComments();
  const newComment: Comment = {
    ...comment,
    id: `comm-${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  const updated = [newComment, ...all];
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(updated));
  return newComment;
}

export function updateCommentStatus(id: string, status: 'approved' | 'rejected' | 'pending'): void {
  const all = getComments();
  const updated = all.map((c) => (c.id === id ? { ...c, status } : c));
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(updated));
}

export function deleteComment(id: string): void {
  const all = getComments();
  const updated = all.filter((c) => c.id !== id);
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(updated));
}

// Activity Logs
export function getActivityLogs(): ActivityLog[] {
  try {
    const raw = localStorage.getItem(LOGS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function logActivity(action: string, details: string): void {
  try {
    const logs = getActivityLogs();
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      action,
      details,
      timestamp: new Date().toISOString(),
      user: 'Admin (Ismail)',
    };
    const updated = [newLog, ...logs.slice(0, 49)];
    localStorage.setItem(LOGS_KEY, JSON.stringify(updated));
  } catch {}
}

// Admin Authentication & Credentials Management
export function getAdminCredentials(): AdminCredentials {
  try {
    const raw = localStorage.getItem(ADMIN_CREDS_KEY);
    if (!raw) {
      localStorage.setItem(ADMIN_CREDS_KEY, JSON.stringify(DEFAULT_ADMIN_CREDS));
      return DEFAULT_ADMIN_CREDS;
    }
    const parsed: AdminCredentials = JSON.parse(raw);
    return parsed.password ? parsed : DEFAULT_ADMIN_CREDS;
  } catch {
    return DEFAULT_ADMIN_CREDS;
  }
}

export function updateAdminCredentials(newCreds: Partial<AdminCredentials>): void {
  const current = getAdminCredentials();
  const updated: AdminCredentials = {
    ...current,
    ...newCreds,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(ADMIN_CREDS_KEY, JSON.stringify(updated));
  logActivity('Security Updated', `Admin credentials updated (Email: ${updated.email})`);
}

export function getLockoutStatus(): LockoutStatus {
  try {
    const raw = localStorage.getItem(ADMIN_LOCKOUT_KEY);
    if (!raw) return { attempts: 0, lockedUntil: 0 };
    return JSON.parse(raw);
  } catch {
    return { attempts: 0, lockedUntil: 0 };
  }
}

export function recordFailedLoginAttempt(): { isLocked: boolean; attemptsLeft: number; lockedUntil: number } {
  const current = getLockoutStatus();
  const now = Date.now();

  if (current.lockedUntil && current.lockedUntil <= now) {
    current.attempts = 0;
    current.lockedUntil = 0;
  }

  current.attempts = (current.attempts || 0) + 1;
  const attemptsLeft = Math.max(0, 5 - current.attempts);

  if (current.attempts >= 5) {
    current.lockedUntil = now + 15 * 60 * 1000; // 15 mins
    localStorage.setItem(ADMIN_LOCKOUT_KEY, JSON.stringify(current));
    logActivity('Security Alert', '5 failed login attempts detected. Portal locked for 15 minutes.');
    return { isLocked: true, attemptsLeft: 0, lockedUntil: current.lockedUntil };
  }

  localStorage.setItem(ADMIN_LOCKOUT_KEY, JSON.stringify(current));
  return { isLocked: false, attemptsLeft, lockedUntil: 0 };
}

export function resetFailedLoginAttempts(): void {
  localStorage.removeItem(ADMIN_LOCKOUT_KEY);
}

export function verifyAdminLogin(emailInput: string, passwordInput: string): { success: boolean; message?: string } {
  const now = Date.now();
  const lockout = getLockoutStatus();

  if (lockout.lockedUntil && lockout.lockedUntil > now) {
    const minutesLeft = Math.ceil((lockout.lockedUntil - now) / 60000);
    return {
      success: false,
      message: `অতিরিক্ত ভুল চেষ্টার কারণে প্রবেশপথ সাময়িক লক রয়েছে। আর ${minutesLeft} মিনিট পর চেষ্টা করুন।`,
    };
  }

  const creds = getAdminCredentials();
  const cleanEmail = emailInput.trim().toLowerCase();
  const targetEmail = creds.email.toLowerCase();

  // Primary owner email or alias check
  const isEmailMatch =
    cleanEmail === targetEmail ||
    (targetEmail === 'ismail543782@gmail.com' && (cleanEmail === 'admin@futurenews.com' || cleanEmail === 'ismail@futurenews.com'));
  const isPasswordMatch = passwordInput === creds.password;

  if (isEmailMatch && isPasswordMatch) {
    resetFailedLoginAttempts();
    setAdminLoggedIn(true);
    return { success: true };
  }

  const failure = recordFailedLoginAttempt();
  if (failure.isLocked) {
    return {
      success: false,
      message: 'ভুল তথ্য! পরপর ৫ বার ভুল চেষ্টার কারণে ১৫ মিনিটের জন্য এডমিন পোর্টাল লক করা হয়েছে।',
    };
  }

  return {
    success: false,
    message: `ভুল ইমেইল অথবা পাসওয়ার্ড! আপনার আর মাত্র ${failure.attemptsLeft} বার সুযোগ রয়েছে।`,
  };
}

export function resetPasswordWithPin(pin: string, newPassword: string): { success: boolean; message: string } {
  const creds = getAdminCredentials();
  if (pin.trim() !== creds.recoveryPin) {
    return { success: false, message: 'ভুল রিকভারি পিন! সঠিক ৬-সংখ্যার পিন প্রদান করুন।' };
  }
  if (!newPassword || newPassword.length < 6) {
    return { success: false, message: 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' };
  }

  updateAdminCredentials({ password: newPassword });
  resetFailedLoginAttempts();
  logActivity('Password Reset', 'Admin password was successfully reset using 6-digit master recovery PIN');
  return { success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে! নতুন পাসওয়ার্ড দিয়ে লগইন করুন।' };
}

export function isAdminLoggedIn(): boolean {
  try {
    const raw = localStorage.getItem(ADMIN_AUTH_KEY);
    if (!raw) return false;
    if (raw === 'true') {
      const newSession = { loggedIn: true, expiresAt: Date.now() + SESSION_DURATION_MS };
      localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(newSession));
      return true;
    }
    const session = JSON.parse(raw);
    if (!session || !session.loggedIn) return false;
    if (session.expiresAt && session.expiresAt < Date.now()) {
      localStorage.removeItem(ADMIN_AUTH_KEY);
      logActivity('Session Expired', 'Admin session expired automatically for security');
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function setAdminLoggedIn(status: boolean): void {
  if (status) {
    const session = {
      loggedIn: true,
      loginTime: new Date().toISOString(),
      expiresAt: Date.now() + SESSION_DURATION_MS,
      user: 'Ismail Hossain (Super Admin)',
    };
    localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(session));
    logActivity('Admin Login', 'Authorized admin successfully authenticated');
  } else {
    localStorage.removeItem(ADMIN_AUTH_KEY);
    logActivity('Admin Logout', 'Admin logged out of the console');
  }
}

// Blog Posts Management
export function getBlogs(): BlogPost[] {
  try {
    const raw = localStorage.getItem(BLOGS_KEY);
    if (!raw) {
      localStorage.setItem(BLOGS_KEY, JSON.stringify(INITIAL_BLOGS));
      return INITIAL_BLOGS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_BLOGS;
  } catch (e) {
    console.error('Failed to read blogs', e);
    return INITIAL_BLOGS;
  }
}

export function saveBlog(blog: BlogPost): void {
  const blogs = getBlogs();
  const index = blogs.findIndex((b) => b.id === blog.id);
  let updated: BlogPost[];
  if (index >= 0) {
    updated = [...blogs];
    updated[index] = { ...blog, updated_at: new Date().toISOString() };
    logActivity('Blog Updated', `Updated blog: ${blog.title_bn || blog.title_en}`);
  } else {
    updated = [blog, ...blogs];
    logActivity('Blog Created', `Published blog post: ${blog.title_bn || blog.title_en}`);
  }
  localStorage.setItem(BLOGS_KEY, JSON.stringify(updated));
  notifyDataChange('blogs');
}

export function deleteBlog(id: string): void {
  const blogs = getBlogs();
  const target = blogs.find((b) => b.id === id);
  const filtered = blogs.filter((b) => b.id !== id);
  localStorage.setItem(BLOGS_KEY, JSON.stringify(filtered));
  if (target) {
    logActivity('Blog Deleted', `Deleted blog: ${target.title_bn || target.title_en}`);
  }
  notifyDataChange('blogs');
}

export function getBlogBySlug(slug: string): BlogPost | undefined {
  if (!slug) return undefined;
  const blogs = getBlogs();
  const decoded = decodeURIComponent(slug).toLowerCase().trim().replace(/^\/+|\/+$/g, '');
  return blogs.find(
    (b) =>
      b.slug.toLowerCase().trim().replace(/^\/+|\/+$/g, '') === decoded ||
      b.id === decoded
  );
}

export function incrementBlogViews(id: string): void {
  try {
    const blogs = getBlogs();
    const idx = blogs.findIndex((b) => b.id === id);
    if (idx >= 0) {
      blogs[idx].views = (blogs[idx].views || 0) + 1;
      localStorage.setItem(BLOGS_KEY, JSON.stringify(blogs));
    }
  } catch {}
}

export function toggleBlogLike(id: string): number {
  try {
    const blogs = getBlogs();
    const idx = blogs.findIndex((b) => b.id === id);
    if (idx >= 0) {
      const likedKey = `blog_liked_${id}`;
      const isLiked = localStorage.getItem(likedKey) === 'true';
      if (isLiked) {
        blogs[idx].likes = Math.max(0, (blogs[idx].likes || 1) - 1);
        localStorage.removeItem(likedKey);
      } else {
        blogs[idx].likes = (blogs[idx].likes || 0) + 1;
        localStorage.setItem(likedKey, 'true');
      }
      localStorage.setItem(BLOGS_KEY, JSON.stringify(blogs));
      return blogs[idx].likes;
    }
  } catch {}
  return 0;
}

// Country & Edition Management
export function getCountryEditions(): CountryEdition[] {
  return INITIAL_EDITIONS;
}

export function getCurrentEdition(): CountryEdition {
  try {
    const saved = localStorage.getItem(EDITION_KEY);
    if (saved) {
      const found = INITIAL_EDITIONS.find((e) => e.id === saved);
      if (found) return found;
    }
  } catch {}
  return INITIAL_EDITIONS[0]; // Default Bangladesh
}

export function setCurrentEdition(id: string): void {
  localStorage.setItem(EDITION_KEY, id);
}

// Full JSON Backup Export and Import
export function exportAllDataAsJSON(): string {
  const payload = {
    exportDate: new Date().toISOString(),
    version: '1.2.0',
    portalName: 'Future News',
    articles: getArticles(),
    blogs: getBlogs(),
    breakingNews: getBreakingNews(),
    advertisements: getAdvertisements(),
    categories: getCategories(),
    authors: getAuthors(),
    comments: getComments(),
  };
  return JSON.stringify(payload, null, 2);
}

export function importDataFromJSON(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.articles) localStorage.setItem(ARTICLES_KEY, JSON.stringify(data.articles));
    if (data.blogs) localStorage.setItem(BLOGS_KEY, JSON.stringify(data.blogs));
    if (data.breakingNews) localStorage.setItem(BREAKING_KEY, JSON.stringify(data.breakingNews));
    if (data.advertisements) localStorage.setItem(ADS_KEY, JSON.stringify(data.advertisements));
    if (data.categories) localStorage.setItem(CATEGORIES_KEY, JSON.stringify(data.categories));
    if (data.authors) localStorage.setItem(AUTHORS_KEY, JSON.stringify(data.authors));
    logActivity('Data Restored', 'Successfully restored database from JSON backup');
    return true;
  } catch (e) {
    console.error('Import failed', e);
    return false;
  }
}

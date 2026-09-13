import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  limit,
  orderBy,
  updateDoc,
  increment,
} from 'firebase/firestore';
import { db } from './firebase';
import { Article, Book, BlogPost, BreakingNews, Advertisement } from '../types/news';
import { INITIAL_ARTICLES, INITIAL_BREAKING_NEWS, INITIAL_BLOGS, INITIAL_ADS } from '../data/initialData';
import { INITIAL_BOOKS } from '../data/initialBooks';
import { getArticles, getBooks, getBlogs, getBreakingNews, getAdvertisements } from '../utils/storage';

// Collection References
const ARTICLES_COLLECTION = 'articles';
const BOOKS_COLLECTION = 'books';
const BLOGS_COLLECTION = 'blogs';
const BREAKING_COLLECTION = 'breaking_news';
const ADS_COLLECTION = 'ads';
const ANALYTICS_COLLECTION = 'analytics';

/**
 * Deep clean data to strictly remove `undefined` fields.
 * Firestore strictly forbids `undefined` values in documents.
 */
export function cleanDataForFirestore<T>(data: T): Record<string, any> {
  if (!data || typeof data !== 'object') {
    return (data as any) ?? {};
  }
  // JSON.stringify automatically drops any property whose value is `undefined`
  return JSON.parse(JSON.stringify(data));
}

/**
 * Seed initial content to Firestore if Firestore collections are empty
 */
export async function seedInitialDataIfEmpty(): Promise<void> {
  try {
    const articlesSnap = await getDocs(query(collection(db, ARTICLES_COLLECTION), limit(1)));
    if (articlesSnap.empty) {
      console.log('Seeding initial articles to Cloud Firestore...');
      const localArticles = getArticles();
      const articlesToSeed = localArticles.length > 0 ? localArticles : INITIAL_ARTICLES;
      for (const article of articlesToSeed) {
        await setDoc(doc(db, ARTICLES_COLLECTION, article.id), cleanDataForFirestore(article), { merge: true });
      }
    }

    const booksSnap = await getDocs(query(collection(db, BOOKS_COLLECTION), limit(1)));
    if (booksSnap.empty) {
      console.log('Seeding initial books to Cloud Firestore...');
      const localBooks = getBooks();
      const booksToSeed = localBooks.length > 0 ? localBooks : INITIAL_BOOKS;
      for (const book of booksToSeed) {
        await setDoc(doc(db, BOOKS_COLLECTION, book.id), cleanDataForFirestore(book), { merge: true });
      }
    }

    const blogsSnap = await getDocs(query(collection(db, BLOGS_COLLECTION), limit(1)));
    if (blogsSnap.empty) {
      console.log('Seeding initial blogs to Cloud Firestore...');
      const localBlogs = getBlogs();
      const blogsToSeed = localBlogs.length > 0 ? localBlogs : INITIAL_BLOGS;
      for (const blog of blogsToSeed) {
        await setDoc(doc(db, BLOGS_COLLECTION, blog.id), cleanDataForFirestore(blog), { merge: true });
      }
    }

    const breakingSnap = await getDocs(query(collection(db, BREAKING_COLLECTION), limit(1)));
    if (breakingSnap.empty) {
      console.log('Seeding breaking news to Cloud Firestore...');
      const localBreaking = getBreakingNews();
      const breakingToSeed = localBreaking.length > 0 ? localBreaking : INITIAL_BREAKING_NEWS;
      for (const item of breakingToSeed) {
        await setDoc(doc(db, BREAKING_COLLECTION, item.id), cleanDataForFirestore(item), { merge: true });
      }
    }

    const adsSnap = await getDocs(query(collection(db, ADS_COLLECTION), limit(1)));
    if (adsSnap.empty) {
      console.log('Seeding initial ads to Cloud Firestore...');
      const localAds = getAdvertisements();
      const adsToSeed = localAds.length > 0 ? localAds : INITIAL_ADS;
      for (const ad of adsToSeed) {
        await setDoc(doc(db, ADS_COLLECTION, ad.slot), cleanDataForFirestore(ad), { merge: true });
      }
    }
  } catch (error) {
    console.warn('Firestore initial seeding note:', error);
  }
}

// -------------------------------------------------------------
// 📰 ARTICLES / খবরাখবর
// -------------------------------------------------------------

export async function fetchArticlesFromCloud(): Promise<Article[]> {
  try {
    const q = query(collection(db, ARTICLES_COLLECTION), limit(100));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const list = snap.docs.map((d) => d.data() as Article);
      return list.sort(
        (a, b) => new Date(b.published_at || '').getTime() - new Date(a.published_at || '').getTime()
      );
    }
  } catch (e) {
    console.warn('Could not fetch articles from Firestore:', e);
  }
  return [];
}

export async function fetchArticleBySlugFromCloud(slug: string): Promise<Article | null> {
  try {
    const snap = await getDocs(collection(db, ARTICLES_COLLECTION));
    const found = snap.docs.find((d) => {
      const data = d.data() as Article;
      return data.slug === slug || data.slug_bn === slug || data.slug_en === slug || data.id === slug;
    });
    return found ? (found.data() as Article) : null;
  } catch {
    return null;
  }
}

export async function saveArticleToCloud(article: Article): Promise<boolean> {
  try {
    const cleaned = cleanDataForFirestore(article);
    await setDoc(doc(db, ARTICLES_COLLECTION, article.id), cleaned, { merge: true });
    return true;
  } catch (e) {
    console.error('Failed to save article to Cloud Firestore:', e);
    return false;
  }
}

export async function deleteArticleFromCloud(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, ARTICLES_COLLECTION, id));
    return true;
  } catch (e) {
    console.error('Failed to delete article from Cloud Firestore:', e);
    return false;
  }
}

export function subscribeToArticles(callback: (articles: Article[]) => void): () => void {
  try {
    // Limit to latest 100 articles for high-speed performance and zero memory lag
    const q = query(collection(db, ARTICLES_COLLECTION), limit(100));
    return onSnapshot(
      q,
      (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map((d) => d.data() as Article);
          callback(
            list.sort(
              (a, b) => new Date(b.published_at || '').getTime() - new Date(a.published_at || '').getTime()
            )
          );
        }
      },
      (err) => console.warn('Articles snapshot error:', err)
    );
  } catch {
    return () => {};
  }
}

export async function incrementArticleViewInCloud(articleId: string): Promise<void> {
  try {
    const articleRef = doc(db, ARTICLES_COLLECTION, articleId);
    await updateDoc(articleRef, {
      views: increment(1),
    });
  } catch (err) {
    // If updateDoc fails (e.g. doc created with setDoc), fallback gracefully
    console.warn('Increment article view cloud warning:', err);
  }
}

export async function incrementBookViewInCloud(bookId: string): Promise<void> {
  try {
    const bookRef = doc(db, BOOKS_COLLECTION, bookId);
    await updateDoc(bookRef, {
      views_count: increment(1),
    });
  } catch (err) {
    console.warn('Increment book view cloud warning:', err);
  }
}

// -------------------------------------------------------------
// 📢 ADVERTISEMENTS / বিজ্ঞাপন সিস্টেম (সবার জন্য সেন্ট্রাল সিংক)
// -------------------------------------------------------------

export async function fetchAdsFromCloud(): Promise<Advertisement[]> {
  try {
    const snap = await getDocs(collection(db, ADS_COLLECTION));
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as Advertisement);
    }
  } catch (e) {
    console.warn('Could not fetch ads from Firestore:', e);
  }
  return [];
}

export async function saveAdToCloud(ad: Advertisement): Promise<boolean> {
  try {
    const cleaned = cleanDataForFirestore(ad);
    const key = ad.slot || ad.id;
    await setDoc(doc(db, ADS_COLLECTION, key), cleaned, { merge: true });
    return true;
  } catch (e) {
    console.error('Failed to save ad to Cloud Firestore:', e);
    return false;
  }
}

export async function deleteAdFromCloud(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, ADS_COLLECTION, id));
    return true;
  } catch (e) {
    console.error('Failed to delete ad from Cloud Firestore:', e);
    return false;
  }
}

export function subscribeToAds(callback: (ads: Advertisement[]) => void): () => void {
  try {
    const q = query(collection(db, ADS_COLLECTION));
    return onSnapshot(
      q,
      (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map((d) => d.data() as Advertisement);
          callback(list);
        }
      },
      (err) => console.warn('Ads snapshot error:', err)
    );
  } catch {
    return () => {};
  }
}

// -------------------------------------------------------------
// 📊 REAL-TIME GLOBAL ANALYTICS & TRAFFIC ENGINE
// -------------------------------------------------------------

export interface CloudAnalyticsSummary {
  totalVisitors: number;
  totalViews: number;
  totalArticleViews: number;
  totalBookViews: number;
  mobileViews: number;
  desktopViews: number;
  tabletViews: number;
  lastActive: string;
}

export async function recordGlobalPageViewToCloud(
  type: 'article' | 'blog' | 'book' | 'home',
  contentId?: string,
  title?: string,
  device: 'mobile' | 'desktop' | 'tablet' = 'desktop'
): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const summaryRef = doc(db, ANALYTICS_COLLECTION, 'summary');
    const todayRef = doc(db, ANALYTICS_COLLECTION, `day_${today}`);

    // Update global aggregate summary
    const updatePayload: Record<string, any> = {
      totalViews: increment(1),
      totalVisitors: increment(1),
      lastActive: new Date().toISOString(),
    };

    if (device === 'mobile') updatePayload.mobileViews = increment(1);
    else if (device === 'tablet') updatePayload.tabletViews = increment(1);
    else updatePayload.desktopViews = increment(1);

    if (type === 'article') updatePayload.totalArticleViews = increment(1);
    if (type === 'book') updatePayload.totalBookViews = increment(1);

    await setDoc(summaryRef, updatePayload, { merge: true });

    // Update day-specific aggregate
    await setDoc(
      todayRef,
      {
        date: today,
        views: increment(1),
        visitors: increment(1),
        lastUpdated: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Cloud analytics record warning:', err);
  }
}

export async function fetchGlobalAnalyticsFromCloud(): Promise<CloudAnalyticsSummary | null> {
  try {
    const summarySnap = await getDoc(doc(db, ANALYTICS_COLLECTION, 'summary'));
    if (summarySnap.exists()) {
      return summarySnap.data() as CloudAnalyticsSummary;
    }
  } catch (err) {
    console.warn('Fetch global analytics error:', err);
  }
  return null;
}

export function subscribeToGlobalAnalytics(
  callback: (summary: CloudAnalyticsSummary) => void
): () => void {
  try {
    const summaryRef = doc(db, ANALYTICS_COLLECTION, 'summary');
    return onSnapshot(
      summaryRef,
      (snap) => {
        if (snap.exists()) {
          callback(snap.data() as CloudAnalyticsSummary);
        }
      },
      (err) => console.warn('Analytics snapshot error:', err)
    );
  } catch {
    return () => {};
  }
}

// -------------------------------------------------------------
// 📚 BOOKS / ডিজিটাল বই
// -------------------------------------------------------------

export async function fetchBooksFromCloud(): Promise<Book[]> {
  try {
    const snap = await getDocs(collection(db, BOOKS_COLLECTION));
    if (!snap.empty) {
      const list = snap.docs.map((d) => d.data() as Book);
      return list.sort(
        (a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
      );
    }
  } catch (e) {
    console.warn('Could not fetch books from Firestore:', e);
  }
  return [];
}

export async function saveBookToCloud(book: Book): Promise<boolean> {
  try {
    const cleaned = cleanDataForFirestore(book);
    await setDoc(doc(db, BOOKS_COLLECTION, book.id), cleaned, { merge: true });
    return true;
  } catch (e) {
    console.error('Failed to save book to Cloud Firestore:', e);
    return false;
  }
}

export async function deleteBookFromCloud(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, BOOKS_COLLECTION, id));
    return true;
  } catch (e) {
    console.error('Failed to delete book from Cloud Firestore:', e);
    return false;
  }
}

export function subscribeToBooks(callback: (books: Book[]) => void): () => void {
  try {
    const q = query(collection(db, BOOKS_COLLECTION));
    return onSnapshot(
      q,
      (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map((d) => d.data() as Book);
          callback(
            list.sort(
              (a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
            )
          );
        }
      },
      (err) => console.warn('Books snapshot error:', err)
    );
  } catch {
    return () => {};
  }
}

// -------------------------------------------------------------
// ✍️ BLOGS / মতামত ও সম্পাদকীয়
// -------------------------------------------------------------

export async function fetchBlogsFromCloud(): Promise<BlogPost[]> {
  try {
    const snap = await getDocs(collection(db, BLOGS_COLLECTION));
    if (!snap.empty) {
      const list = snap.docs.map((d) => d.data() as BlogPost);
      return list.sort(
        (a, b) => new Date(b.published_at || '').getTime() - new Date(a.published_at || '').getTime()
      );
    }
  } catch (e) {
    console.warn('Could not fetch blogs from Firestore:', e);
  }
  return [];
}

export async function saveBlogToCloud(blog: BlogPost): Promise<boolean> {
  try {
    const cleaned = cleanDataForFirestore(blog);
    await setDoc(doc(db, BLOGS_COLLECTION, blog.id), cleaned, { merge: true });
    return true;
  } catch (e) {
    console.error('Failed to save blog to Cloud Firestore:', e);
    return false;
  }
}

export async function deleteBlogFromCloud(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, BLOGS_COLLECTION, id));
    return true;
  } catch (e) {
    console.error('Failed to delete blog from Cloud Firestore:', e);
    return false;
  }
}

export function subscribeToBlogs(callback: (blogs: BlogPost[]) => void): () => void {
  try {
    const q = query(collection(db, BLOGS_COLLECTION));
    return onSnapshot(
      q,
      (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map((d) => d.data() as BlogPost);
          callback(
            list.sort(
              (a, b) => new Date(b.published_at || '').getTime() - new Date(a.published_at || '').getTime()
            )
          );
        }
      },
      (err) => console.warn('Blogs snapshot error:', err)
    );
  } catch {
    return () => {};
  }
}

// -------------------------------------------------------------
// ⚡ BREAKING NEWS TICKER
// -------------------------------------------------------------

export async function fetchBreakingFromCloud(): Promise<BreakingNews[]> {
  try {
    const snap = await getDocs(collection(db, BREAKING_COLLECTION));
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as BreakingNews);
    }
  } catch (e) {
    console.warn('Could not fetch breaking news from Firestore:', e);
  }
  return [];
}

export async function saveBreakingToCloud(item: BreakingNews): Promise<boolean> {
  try {
    const cleaned = cleanDataForFirestore(item);
    await setDoc(doc(db, BREAKING_COLLECTION, item.id), cleaned, { merge: true });
    return true;
  } catch (e) {
    console.error('Failed to save breaking news to Cloud Firestore:', e);
    return false;
  }
}

export async function deleteBreakingFromCloud(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, BREAKING_COLLECTION, id));
    return true;
  } catch (e) {
    console.error('Failed to delete breaking news from Cloud Firestore:', e);
    return false;
  }
}

export function subscribeToBreaking(callback: (items: BreakingNews[]) => void): () => void {
  try {
    const q = query(collection(db, BREAKING_COLLECTION));
    return onSnapshot(
      q,
      (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map((d) => d.data() as BreakingNews);
          callback(list);
        }
      },
      (err) => console.warn('Breaking snapshot error:', err)
    );
  } catch {
    return () => {};
  }
}

// -------------------------------------------------------------
// 🚀 FORCE UPLOAD ALL LOCAL DATA TO CLOUD
// -------------------------------------------------------------

export async function uploadAllLocalDataToCloud(): Promise<{
  articlesCount: number;
  booksCount: number;
  blogsCount: number;
  breakingCount: number;
  success: boolean;
}> {
  const localArticles = getArticles();
  const localBooks = getBooks();
  const localBlogs = getBlogs();
  const localBreaking = getBreakingNews();

  let articlesUploaded = 0;
  let booksUploaded = 0;
  let blogsUploaded = 0;
  let breakingUploaded = 0;

  for (const a of localArticles) {
    const ok = await saveArticleToCloud(a);
    if (ok) articlesUploaded++;
  }

  for (const b of localBooks) {
    const ok = await saveBookToCloud(b);
    if (ok) booksUploaded++;
  }

  for (const bl of localBlogs) {
    const ok = await saveBlogToCloud(bl);
    if (ok) blogsUploaded++;
  }

  for (const br of localBreaking) {
    const ok = await saveBreakingToCloud(br);
    if (ok) breakingUploaded++;
  }

  return {
    articlesCount: articlesUploaded,
    booksCount: booksUploaded,
    blogsCount: blogsUploaded,
    breakingCount: breakingUploaded,
    success: true,
  };
}

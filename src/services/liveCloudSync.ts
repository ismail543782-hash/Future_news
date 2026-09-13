import {
  seedInitialDataIfEmpty,
  fetchArticlesFromCloud,
  fetchBooksFromCloud,
  fetchBlogsFromCloud,
  fetchBreakingFromCloud,
  fetchAdsFromCloud,
  subscribeToArticles,
  subscribeToBooks,
  subscribeToBlogs,
  subscribeToBreaking,
  subscribeToAds,
  saveArticleToCloud,
  saveBookToCloud,
  saveBlogToCloud,
  saveBreakingToCloud,
  saveAdToCloud,
} from './firestoreSync';
import { testFirestoreConnection } from './firebase';
import { notifyDataChange } from '../utils/storage';
import { Article, Book, BlogPost, BreakingNews, Advertisement } from '../types/news';

const ARTICLES_KEY = 'fn_articles_v1';
const BREAKING_KEY = 'fn_breaking_v1';
const BLOGS_KEY = 'fn_blogs_v1';
const BOOKS_KEY = 'fn_books_v1';
const ADS_KEY = 'fn_ads_v1';

/**
 * Initialize Cloud Firestore Sync:
 * 1. Test connection to Cloud Firestore
 * 2. Seed initial data if Firestore is fresh
 * 3. Pull latest live content from Firestore and merge into local view
 * 4. Two-way upload: ensure any locally created articles or books are pushed to cloud
 * 5. Subscribe to real-time live updates so any device sees new articles, books, ads instantly
 */
export async function initializeGlobalSync(): Promise<() => void> {
  // Test connection
  testFirestoreConnection().catch(console.warn);

  // First, check and seed initial data if remote is empty
  seedInitialDataIfEmpty().catch(console.warn);

  // Fetch remote articles and update local store if remote has content
  try {
    const remoteArticles = await fetchArticlesFromCloud();
    if (remoteArticles.length > 0) {
      mergeArticles(remoteArticles);
    }

    const remoteBooks = await fetchBooksFromCloud();
    if (remoteBooks.length > 0) {
      mergeBooks(remoteBooks);
    }

    const remoteBlogs = await fetchBlogsFromCloud();
    if (remoteBlogs.length > 0) {
      mergeBlogs(remoteBlogs);
    }

    const remoteBreaking = await fetchBreakingFromCloud();
    if (remoteBreaking.length > 0) {
      mergeBreaking(remoteBreaking);
    }

    const remoteAds = await fetchAdsFromCloud();
    if (remoteAds.length > 0) {
      mergeAds(remoteAds);
    }
  } catch (err) {
    console.warn('Initial cloud sync notice:', err);
  }

  // Set up real-time live listeners across all devices
  const unsubArticles = subscribeToArticles((articles) => {
    if (articles.length > 0) {
      mergeArticles(articles);
    }
  });

  const unsubBooks = subscribeToBooks((books) => {
    if (books.length > 0) {
      mergeBooks(books);
    }
  });

  const unsubBlogs = subscribeToBlogs((blogs) => {
    if (blogs.length > 0) {
      mergeBlogs(blogs);
    }
  });

  const unsubBreaking = subscribeToBreaking((items) => {
    if (items.length > 0) {
      mergeBreaking(items);
    }
  });

  const unsubAds = subscribeToAds((ads) => {
    if (ads.length > 0) {
      mergeAds(ads);
    }
  });

  return () => {
    unsubArticles();
    unsubBooks();
    unsubBlogs();
    unsubBreaking();
    unsubAds();
  };
}

function mergeArticles(remoteArticles: Article[]) {
  try {
    const localRaw = localStorage.getItem(ARTICLES_KEY);
    const local: Article[] = localRaw ? JSON.parse(localRaw) : [];
    
    // Ensure any locally published article is uploaded to cloud if missing
    const remoteIds = new Set(remoteArticles.map((a) => a.id));
    for (const a of local) {
      if (!remoteIds.has(a.id)) {
        saveArticleToCloud(a).catch(console.warn);
      }
    }

    // Map with ID as key, preferring remote/cloud items
    const map = new Map<string, Article>();
    for (const a of local) {
      map.set(a.id, a);
    }
    for (const a of remoteArticles) {
      map.set(a.id, a);
    }
    
    const combined = Array.from(map.values()).sort(
      (a, b) => new Date(b.published_at || '').getTime() - new Date(a.published_at || '').getTime()
    );
    
    localStorage.setItem(ARTICLES_KEY, JSON.stringify(combined));
    notifyDataChange('articles');
  } catch (e) {
    console.error('Merge articles error:', e);
  }
}

function mergeBooks(remoteBooks: Book[]) {
  try {
    const localRaw = localStorage.getItem(BOOKS_KEY);
    const local: Book[] = localRaw ? JSON.parse(localRaw) : [];
    
    // Ensure any locally published book is uploaded to cloud if missing
    const remoteIds = new Set(remoteBooks.map((b) => b.id));
    for (const b of local) {
      if (!remoteIds.has(b.id)) {
        saveBookToCloud(b).catch(console.warn);
      }
    }

    const map = new Map<string, Book>();
    for (const b of local) {
      map.set(b.id, b);
    }
    for (const b of remoteBooks) {
      map.set(b.id, b);
    }
    
    const combined = Array.from(map.values()).sort(
      (a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
    );
    
    localStorage.setItem(BOOKS_KEY, JSON.stringify(combined));
    notifyDataChange('books');
  } catch (e) {
    console.error('Merge books error:', e);
  }
}

function mergeBlogs(remoteBlogs: BlogPost[]) {
  try {
    const localRaw = localStorage.getItem(BLOGS_KEY);
    const local: BlogPost[] = localRaw ? JSON.parse(localRaw) : [];
    
    // Ensure any locally published blog is uploaded to cloud if missing
    const remoteIds = new Set(remoteBlogs.map((b) => b.id));
    for (const b of local) {
      if (!remoteIds.has(b.id)) {
        saveBlogToCloud(b).catch(console.warn);
      }
    }

    const map = new Map<string, BlogPost>();
    for (const b of local) {
      map.set(b.id, b);
    }
    for (const b of remoteBlogs) {
      map.set(b.id, b);
    }
    
    const combined = Array.from(map.values()).sort(
      (a, b) => new Date(b.published_at || '').getTime() - new Date(a.published_at || '').getTime()
    );
    
    localStorage.setItem(BLOGS_KEY, JSON.stringify(combined));
    notifyDataChange('blogs');
  } catch (e) {
    console.error('Merge blogs error:', e);
  }
}

function mergeBreaking(remoteItems: BreakingNews[]) {
  try {
    const localRaw = localStorage.getItem(BREAKING_KEY);
    const local: BreakingNews[] = localRaw ? JSON.parse(localRaw) : [];

    const remoteIds = new Set(remoteItems.map((item) => item.id));
    for (const item of local) {
      if (!remoteIds.has(item.id)) {
        saveBreakingToCloud(item).catch(console.warn);
      }
    }

    const map = new Map<string, BreakingNews>();
    for (const item of remoteItems) {
      map.set(item.id, item);
    }
    const combined = Array.from(map.values());
    localStorage.setItem(BREAKING_KEY, JSON.stringify(combined));
    notifyDataChange('breaking');
  } catch (e) {
    console.error('Merge breaking error:', e);
  }
}

function mergeAds(remoteAds: Advertisement[]) {
  try {
    const localRaw = localStorage.getItem(ADS_KEY);
    const local: Advertisement[] = localRaw ? JSON.parse(localRaw) : [];

    const map = new Map<string, Advertisement>();
    for (const a of local) {
      map.set(a.slot || a.id, a);
    }
    // Remote ads saved by Admin in Firestore take priority
    for (const a of remoteAds) {
      map.set(a.slot || a.id, a);
    }
    const combined = Array.from(map.values());
    localStorage.setItem(ADS_KEY, JSON.stringify(combined));
    notifyDataChange('ads');
  } catch (e) {
    console.error('Merge ads error:', e);
  }
}


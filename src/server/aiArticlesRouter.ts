import { Router, Request, Response } from 'express';
import { db } from '../services/firebase';
import { collection, doc, getDoc, getDocs, setDoc, query, orderBy, limit as firestoreLimit } from 'firebase/firestore';
import { verifyAiApiKey, recordAiAuditLog, getRecentAiLogs, getActiveAiApiKey, rotateAiApiKey } from './aiAuth';
import { Article } from '../types/news';
import { INITIAL_ARTICLES } from '../data/initialData';

export const aiRouter = Router();

// Standard categories supported by Future News
const STANDARD_CATEGORIES = [
  { id: 'national', slug: 'national', name_bn: 'বাংলাদেশ ও জাতীয়', name_en: 'National News' },
  { id: 'international', slug: 'international', name_bn: 'আন্তর্জাতিক', name_en: 'International' },
  { id: 'business', slug: 'business', name_bn: 'বাণিজ্য ও অর্থনীতি', name_en: 'Business & Economy' },
  { id: 'technology', slug: 'technology', name_bn: 'তথ্যপ্রযুক্তি ও এআই', name_en: 'Technology & AI' },
  { id: 'sports', slug: 'sports', name_bn: 'খেলাধুলা', name_en: 'Sports' },
  { id: 'entertainment', slug: 'entertainment', name_bn: 'বিনোদন ও সংস্কৃতি', name_en: 'Entertainment' },
  { id: 'lifestyle', slug: 'lifestyle', name_bn: 'লাইফস্টাইল ও স্বাস্থ্য', name_en: 'Lifestyle & Health' },
  { id: 'opinion', slug: 'opinion', name_bn: 'মতামত ও সম্পাদকীয়', name_en: 'Editorial & Opinion' },
];

/**
 * Generate a clean, SEO-friendly URL slug
 */
function generateSlug(text: string): string {
  const sanitized = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u0980-\u09FF-]/g, '') // Keep letters, numbers, Bengali characters, and hyphens
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return sanitized || `article-${Date.now()}`;
}

/**
 * Clean object to prevent undefined values in Firestore
 */
function sanitizeForFirestore(obj: any): any {
  return JSON.parse(JSON.stringify(obj));
}

// ----------------------------------------------------------------------------
// Public Status / Category Helpers (API Key protected for security)
// ----------------------------------------------------------------------------

/**
 * GET /api/ai/status - Health, Role & Permissions check
 */
aiRouter.get('/status', verifyAiApiKey, async (req: Request, res: Response) => {
  return res.json({
    status: 'ok',
    service: 'Future News AI Publishing REST API',
    role: (req as any).aiPublisher?.role || 'ai_publisher',
    permissions: (req as any).aiPublisher?.permissions || [],
    rate_limit: '60 requests/minute',
    server_time: new Date().toISOString(),
  });
});

/**
 * GET /api/ai/categories - List available news categories
 */
aiRouter.get('/categories', verifyAiApiKey, async (_req: Request, res: Response) => {
  return res.json({
    success: true,
    count: STANDARD_CATEGORIES.length,
    categories: STANDARD_CATEGORIES,
  });
});

// ----------------------------------------------------------------------------
// 📰 1. LIST ARTICLES
// GET /api/ai/articles?page=1&limit=10&status=published&category=tech&search=keyword
// ----------------------------------------------------------------------------
aiRouter.get('/articles', verifyAiApiKey, async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || '10'), 10)));
    const statusFilter = String(req.query.status || 'all').toLowerCase();
    const categoryFilter = String(req.query.category || '').toLowerCase();
    const searchQuery = String(req.query.search || '').toLowerCase().trim();

    let allArticles: Article[] = [];

    try {
      const snap = await getDocs(collection(db, 'articles'));
      if (!snap.empty) {
        allArticles = snap.docs.map((d) => d.data() as Article);
      } else {
        allArticles = [...INITIAL_ARTICLES];
      }
    } catch (e) {
      console.warn('Firestore fetch failed in AI API, using fallback:', e);
      allArticles = [...INITIAL_ARTICLES];
    }

    // Filter by status
    if (statusFilter === 'published' || statusFilter === 'draft') {
      allArticles = allArticles.filter((a) => a.status === statusFilter);
    }

    // Filter by category
    if (categoryFilter) {
      allArticles = allArticles.filter(
        (a) => a.category_id?.toLowerCase() === categoryFilter || a.category_id?.includes(categoryFilter)
      );
    }

    // Filter by search keyword
    if (searchQuery) {
      allArticles = allArticles.filter((a) => {
        const text = `${a.title_bn || ''} ${a.title_en || ''} ${a.summary_bn || ''} ${a.summary_en || ''} ${(a.tags || []).join(' ')}`.toLowerCase();
        return text.includes(searchQuery);
      });
    }

    // Sort by latest created/published
    allArticles.sort((a, b) => {
      const timeA = new Date(a.published_at || a.created_at || '').getTime();
      const timeB = new Date(b.published_at || b.created_at || '').getTime();
      return timeB - timeA;
    });

    const total = allArticles.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = allArticles.slice(startIndex, startIndex + limit);

    return res.json({
      success: true,
      count: paginated.length,
      total,
      page,
      totalPages,
      articles: paginated,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error?.message || 'Could not retrieve articles.',
    });
  }
});

// ----------------------------------------------------------------------------
// 📰 2. GET SINGLE ARTICLE
// GET /api/ai/articles/:id (Accepts ID or slug)
// ----------------------------------------------------------------------------
aiRouter.get('/articles/:id', verifyAiApiKey, async (req: Request, res: Response) => {
  try {
    const idOrSlug = req.params.id.trim();

    // Check direct doc by ID first
    const directDoc = await getDoc(doc(db, 'articles', idOrSlug));
    if (directDoc.exists()) {
      return res.json({
        success: true,
        article: directDoc.data() as Article,
      });
    }

    // Search by slug
    const snap = await getDocs(collection(db, 'articles'));
    let found = snap.docs.find((d) => {
      const data = d.data() as Article;
      return (
        data.id === idOrSlug ||
        data.slug === idOrSlug ||
        data.slug_bn === idOrSlug ||
        data.slug_en === idOrSlug
      );
    });

    if (found) {
      return res.json({
        success: true,
        article: found.data() as Article,
      });
    }

    // Check initial fallback articles
    const initMatch = INITIAL_ARTICLES.find(
      (a) => a.id === idOrSlug || a.slug === idOrSlug
    );
    if (initMatch) {
      return res.json({
        success: true,
        article: initMatch,
      });
    }

    return res.status(404).json({
      error: 'Not Found',
      code: 'ARTICLE_NOT_FOUND',
      message: `No article found with ID or slug "${idOrSlug}".`,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error?.message || 'Could not retrieve article.',
    });
  }
});

// ----------------------------------------------------------------------------
// 📰 3. CREATE ARTICLE (Draft or Published)
// POST /api/ai/articles
// ----------------------------------------------------------------------------
aiRouter.post('/articles', verifyAiApiKey, async (req: Request, res: Response) => {
  try {
    const body = req.body || {};

    // Validate Title
    const title = (body.title || body.title_bn || body.title_en || '').trim();
    if (!title || title.length < 3) {
      return res.status(400).json({
        error: 'Bad Request',
        code: 'VALIDATION_FAILED',
        message: 'Field "title" is required and must be at least 3 characters long.',
      });
    }

    // Validate Content
    const content = (body.content || body.content_bn || body.content_en || '').trim();
    if (!content || content.length < 15) {
      return res.status(400).json({
        error: 'Bad Request',
        code: 'VALIDATION_FAILED',
        message: 'Field "content" is required and must be at least 15 characters long.',
      });
    }

    // Status: published or draft
    const status: 'published' | 'draft' =
      body.status === 'draft' ? 'draft' : 'published';

    // Summary / Excerpt
    const excerpt = (
      body.excerpt ||
      body.summary ||
      body.summary_bn ||
      body.summary_en ||
      content.slice(0, 180).replace(/\n/g, ' ') + '...'
    ).trim();

    // Category
    const category = (body.category || body.category_id || 'technology').toLowerCase().trim();

    // Tags
    let tags: string[] = [];
    if (Array.isArray(body.tags)) {
      tags = body.tags.map((t: any) => String(t).trim()).filter(Boolean);
    } else if (typeof body.tags === 'string') {
      tags = body.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
    }
    if (tags.length === 0) {
      tags = ['News', category];
    }

    // URL slug
    const customSlug = body.slug ? generateSlug(body.slug) : generateSlug(title);
    const uniqueSlug = `${customSlug}-${Math.random().toString(36).substring(2, 6)}`;

    // Reading time calculation (avg 180 words per min)
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 180));

    // Featured Image
    const defaultImage =
      'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80';
    const featuredImage = (body.featured_image || body.image_url || defaultImage).trim();

    // Timestamps
    const nowIso = new Date().toISOString();
    const articleId = `art-ai-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Intelligent bilingual title/content mapping
    const titleBn = (body.title_bn || title).trim();
    const titleEn = (body.title_en || title).trim();
    const contentBn = (body.content_bn || content).trim();
    const contentEn = (body.content_en || content).trim();
    const summaryBn = (body.summary_bn || excerpt).trim();
    const summaryEn = (body.summary_en || excerpt).trim();

    // SEO fields
    const seoTitleBn = (body.seo_title_bn || body.seo_title || titleBn).trim();
    const seoTitleEn = (body.seo_title_en || body.seo_title || titleEn).trim();
    const seoDescBn = (body.seo_description_bn || body.seo_description || summaryBn).trim();
    const seoDescEn = (body.seo_description_en || body.seo_description || summaryEn).trim();
    const focusKeyphrase = tags[0] || category;

    const newArticle: Article = {
      id: articleId,
      category_id: category,
      author_id: 'author-ai-editorial',
      featured_image: featuredImage,
      image_caption_bn: body.image_caption_bn || body.image_caption || '',
      image_caption_en: body.image_caption_en || body.image_caption || '',
      image_credit: body.image_credit || 'AI Editorial Desk',
      status: status,
      is_featured: Boolean(body.is_featured),
      is_breaking: Boolean(body.is_breaking),
      is_trending: false,
      is_sponsored: false,
      views: 1,
      reading_time_minutes: readingTime,
      published_at: status === 'published' ? nowIso : '',
      created_at: nowIso,
      updated_at: nowIso,
      tags,

      // Bilingual fields
      slug: uniqueSlug,
      slug_bn: uniqueSlug,
      slug_en: uniqueSlug,
      title_bn: titleBn,
      title_en: titleEn,
      summary_bn: summaryBn,
      summary_en: summaryEn,
      content_bn: contentBn,
      content_en: contentEn,

      // SEO
      seo_title_bn: seoTitleBn,
      seo_title_en: seoTitleEn,
      seo_description_bn: seoDescBn,
      seo_description_en: seoDescEn,
      focus_keyphrase_bn: focusKeyphrase,
      focus_keyphrase_en: focusKeyphrase,
    };

    // Save to Cloud Firestore
    const cleaned = sanitizeForFirestore(newArticle);
    await setDoc(doc(db, 'articles', articleId), cleaned, { merge: true });

    // Record audit log
    await recordAiAuditLog({
      timestamp: nowIso,
      action: status === 'published' ? 'PUBLISH_ARTICLE' : 'CREATE_ARTICLE',
      article_id: articleId,
      article_title: title,
      ip: req.ip || req.socket.remoteAddress || 'unknown',
      user_agent: req.headers['user-agent'] || '',
      status: 'SUCCESS',
      details: `Article created with status "${status}" in category "${category}"`,
    });

    const host = req.get('host') || 'futurenews65.netlify.app';
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const viewUrl = `${protocol}://${host}/?article=${uniqueSlug}`;

    return res.status(201).json({
      success: true,
      message: status === 'published' ? 'Article published successfully' : 'Article saved as draft',
      article_id: articleId,
      status: status,
      view_url: viewUrl,
      article: newArticle,
    });
  } catch (error: any) {
    console.error('AI createArticle error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error?.message || 'Could not save article to database.',
    });
  }
});

// ----------------------------------------------------------------------------
// 📰 4. UPDATE ARTICLE
// PUT or PATCH /api/ai/articles/:id
// ----------------------------------------------------------------------------
async function handleUpdateArticle(req: Request, res: Response) {
  try {
    const idOrSlug = req.params.id.trim();
    const body = req.body || {};

    // Find existing doc
    let targetDocRef = doc(db, 'articles', idOrSlug);
    let existingDoc = await getDoc(targetDocRef);
    let existingArticle: Article | null = null;

    if (existingDoc.exists()) {
      existingArticle = existingDoc.data() as Article;
    } else {
      // Find by slug
      const snap = await getDocs(collection(db, 'articles'));
      const found = snap.docs.find((d) => {
        const data = d.data() as Article;
        return data.slug === idOrSlug || data.id === idOrSlug;
      });
      if (found) {
        existingArticle = found.data() as Article;
        targetDocRef = doc(db, 'articles', existingArticle.id);
      }
    }

    if (!existingArticle) {
      return res.status(404).json({
        error: 'Not Found',
        code: 'ARTICLE_NOT_FOUND',
        message: `No article found with ID or slug "${idOrSlug}" to update.`,
      });
    }

    const nowIso = new Date().toISOString();

    // Partial updates with existing fallbacks
    const updatedTitleBn = (body.title_bn || body.title || existingArticle.title_bn).trim();
    const updatedTitleEn = (body.title_en || body.title || existingArticle.title_en).trim();
    const updatedContentBn = (body.content_bn || body.content || existingArticle.content_bn).trim();
    const updatedContentEn = (body.content_en || body.content || existingArticle.content_en).trim();
    const updatedSummaryBn = (body.summary_bn || body.excerpt || existingArticle.summary_bn).trim();
    const updatedSummaryEn = (body.summary_en || body.excerpt || existingArticle.summary_en).trim();

    // Word count calculation
    const wordCount = (updatedContentBn || updatedContentEn).split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 180));

    // Handle status changes
    let newStatus = existingArticle.status;
    let publishedAt = existingArticle.published_at;
    if (body.status === 'published' || body.status === 'draft') {
      newStatus = body.status;
      if (newStatus === 'published' && !publishedAt) {
        publishedAt = nowIso;
      }
    }

    const updatedArticle: Article = {
      ...existingArticle,
      title_bn: updatedTitleBn,
      title_en: updatedTitleEn,
      content_bn: updatedContentBn,
      content_en: updatedContentEn,
      summary_bn: updatedSummaryBn,
      summary_en: updatedSummaryEn,
      category_id: body.category || body.category_id || existingArticle.category_id,
      featured_image: body.featured_image || body.image_url || existingArticle.featured_image,
      image_caption_bn: body.image_caption_bn ?? body.image_caption ?? existingArticle.image_caption_bn,
      image_caption_en: body.image_caption_en ?? body.image_caption ?? existingArticle.image_caption_en,
      image_credit: body.image_credit ?? existingArticle.image_credit,
      status: newStatus,
      published_at: publishedAt,
      updated_at: nowIso,
      reading_time_minutes: readingTime,
      is_featured: body.is_featured !== undefined ? Boolean(body.is_featured) : existingArticle.is_featured,
      is_breaking: body.is_breaking !== undefined ? Boolean(body.is_breaking) : existingArticle.is_breaking,
      tags: Array.isArray(body.tags) ? body.tags : existingArticle.tags,
      seo_title_bn: body.seo_title_bn || body.seo_title || existingArticle.seo_title_bn,
      seo_title_en: body.seo_title_en || body.seo_title || existingArticle.seo_title_en,
      seo_description_bn: body.seo_description_bn || body.seo_description || existingArticle.seo_description_bn,
      seo_description_en: body.seo_description_en || body.seo_description || existingArticle.seo_description_en,
    };

    if (body.slug) {
      updatedArticle.slug = generateSlug(body.slug);
      updatedArticle.slug_bn = updatedArticle.slug;
      updatedArticle.slug_en = updatedArticle.slug;
    }

    await setDoc(targetDocRef, sanitizeForFirestore(updatedArticle), { merge: true });

    await recordAiAuditLog({
      timestamp: nowIso,
      action: 'UPDATE_ARTICLE',
      article_id: updatedArticle.id,
      article_title: updatedArticle.title_en || updatedArticle.title_bn,
      ip: req.ip || req.socket.remoteAddress || 'unknown',
      user_agent: req.headers['user-agent'] || '',
      status: 'SUCCESS',
      details: `Article updated successfully with status "${updatedArticle.status}"`,
    });

    return res.json({
      success: true,
      message: 'Article updated successfully',
      article: updatedArticle,
    });
  } catch (error: any) {
    console.error('AI updateArticle error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error?.message || 'Could not update article.',
    });
  }
}

aiRouter.put('/articles/:id', verifyAiApiKey, handleUpdateArticle);
aiRouter.patch('/articles/:id', verifyAiApiKey, handleUpdateArticle);

// ----------------------------------------------------------------------------
// 📰 5. PUBLISH ARTICLE ACTION
// POST /api/ai/articles/:id/publish
// ----------------------------------------------------------------------------
aiRouter.post('/articles/:id/publish', verifyAiApiKey, async (req: Request, res: Response) => {
  try {
    const idOrSlug = req.params.id.trim();
    let targetDocRef = doc(db, 'articles', idOrSlug);
    let existingDoc = await getDoc(targetDocRef);
    let existingArticle: Article | null = null;

    if (existingDoc.exists()) {
      existingArticle = existingDoc.data() as Article;
    } else {
      const snap = await getDocs(collection(db, 'articles'));
      const found = snap.docs.find((d) => (d.data() as Article).slug === idOrSlug);
      if (found) {
        existingArticle = found.data() as Article;
        targetDocRef = doc(db, 'articles', existingArticle.id);
      }
    }

    if (!existingArticle) {
      return res.status(404).json({
        error: 'Not Found',
        code: 'ARTICLE_NOT_FOUND',
        message: `Article "${idOrSlug}" not found.`,
      });
    }

    const nowIso = new Date().toISOString();
    const updatedArticle: Article = {
      ...existingArticle,
      status: 'published',
      published_at: existingArticle.published_at || nowIso,
      updated_at: nowIso,
    };

    await setDoc(targetDocRef, sanitizeForFirestore(updatedArticle), { merge: true });

    await recordAiAuditLog({
      timestamp: nowIso,
      action: 'PUBLISH_ARTICLE',
      article_id: updatedArticle.id,
      article_title: updatedArticle.title_en || updatedArticle.title_bn,
      ip: req.ip || req.socket.remoteAddress || 'unknown',
      user_agent: req.headers['user-agent'] || '',
      status: 'SUCCESS',
      details: 'Article status changed to published',
    });

    const host = req.get('host') || 'futurenews65.netlify.app';
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const viewUrl = `${protocol}://${host}/?article=${updatedArticle.slug}`;

    return res.json({
      success: true,
      message: 'Article published successfully and is now live.',
      article_id: updatedArticle.id,
      status: 'published',
      published_at: updatedArticle.published_at,
      view_url: viewUrl,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error?.message || 'Could not publish article.',
    });
  }
});

// ----------------------------------------------------------------------------
// 📰 6. SAVE AS DRAFT ACTION
// POST /api/ai/articles/:id/draft
// ----------------------------------------------------------------------------
aiRouter.post('/articles/:id/draft', verifyAiApiKey, async (req: Request, res: Response) => {
  try {
    const idOrSlug = req.params.id.trim();
    let targetDocRef = doc(db, 'articles', idOrSlug);
    let existingDoc = await getDoc(targetDocRef);
    let existingArticle: Article | null = null;

    if (existingDoc.exists()) {
      existingArticle = existingDoc.data() as Article;
    } else {
      const snap = await getDocs(collection(db, 'articles'));
      const found = snap.docs.find((d) => (d.data() as Article).slug === idOrSlug);
      if (found) {
        existingArticle = found.data() as Article;
        targetDocRef = doc(db, 'articles', existingArticle.id);
      }
    }

    if (!existingArticle) {
      return res.status(404).json({
        error: 'Not Found',
        code: 'ARTICLE_NOT_FOUND',
        message: `Article "${idOrSlug}" not found.`,
      });
    }

    const nowIso = new Date().toISOString();
    const updatedArticle: Article = {
      ...existingArticle,
      status: 'draft',
      updated_at: nowIso,
    };

    await setDoc(targetDocRef, sanitizeForFirestore(updatedArticle), { merge: true });

    await recordAiAuditLog({
      timestamp: nowIso,
      action: 'DRAFT_ARTICLE',
      article_id: updatedArticle.id,
      article_title: updatedArticle.title_en || updatedArticle.title_bn,
      ip: req.ip || req.socket.remoteAddress || 'unknown',
      user_agent: req.headers['user-agent'] || '',
      status: 'SUCCESS',
      details: 'Article status changed to draft',
    });

    return res.json({
      success: true,
      message: 'Article saved as draft for editorial review.',
      article_id: updatedArticle.id,
      status: 'draft',
    });
  } catch (error: any) {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error?.message || 'Could not set article to draft.',
    });
  }
});

// ----------------------------------------------------------------------------
// 🖼️ 7. MEDIA UPLOAD & ATTACHMENT
// POST /api/ai/media/upload
// ----------------------------------------------------------------------------
aiRouter.post('/media/upload', verifyAiApiKey, async (req: Request, res: Response) => {
  try {
    const { image_url, image_base64, caption, credit } = req.body || {};

    if (!image_url && !image_base64) {
      return res.status(400).json({
        error: 'Bad Request',
        code: 'MISSING_IMAGE',
        message: 'Provide either "image_url" (public HTTP URL) or "image_base64" (data URI).',
      });
    }

    let finalImageUrl = '';

    if (image_url) {
      // Validate URL format
      try {
        const parsed = new URL(image_url);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          throw new Error('Only HTTP/HTTPS image URLs are accepted.');
        }
        finalImageUrl = image_url;
      } catch {
        return res.status(400).json({
          error: 'Bad Request',
          code: 'INVALID_IMAGE_URL',
          message: 'The provided image_url is not a valid web URL.',
        });
      }
    } else if (image_base64) {
      // Check size limit (max 8MB base64)
      if (image_base64.length > 8 * 1024 * 1024) {
        return res.status(400).json({
          error: 'Bad Request',
          code: 'IMAGE_TOO_LARGE',
          message: 'Base64 image size exceeds maximum 8MB limit.',
        });
      }
      finalImageUrl = image_base64;
    }

    await recordAiAuditLog({
      timestamp: new Date().toISOString(),
      action: 'UPLOAD_MEDIA',
      ip: req.ip || req.socket.remoteAddress || 'unknown',
      user_agent: req.headers['user-agent'] || '',
      status: 'SUCCESS',
      details: `Media uploaded/attached: ${caption || 'featured photo'}`,
    });

    return res.json({
      success: true,
      image_url: finalImageUrl,
      caption: caption || '',
      credit: credit || 'AI Media Desk',
    });
  } catch (error: any) {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error?.message || 'Could not process media.',
    });
  }
});

// ----------------------------------------------------------------------------
// 🔐 Admin Management Helpers (Called by Admin UI frontend)
// ----------------------------------------------------------------------------
aiRouter.get('/admin/key-info', async (_req: Request, res: Response) => {
  try {
    const key = await getActiveAiApiKey();
    const masked = key.length > 10 ? `${key.substring(0, 10)}****************` : '***';
    return res.json({
      success: true,
      has_key: Boolean(key),
      masked_key: masked,
      full_key: key, // Safe to return to admin authenticated session
      recent_logs: getRecentAiLogs(),
    });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message });
  }
});

aiRouter.post('/admin/rotate-key', async (_req: Request, res: Response) => {
  try {
    const newKey = await rotateAiApiKey();
    return res.json({
      success: true,
      message: 'New AI Publishing API Key generated successfully.',
      new_key: newKey,
    });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message });
  }
});

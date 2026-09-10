import { Article, BlogPost } from '../types/news';

export function generateSlug(text: string): string {
  if (!text) return `post-${Date.now()}`;

  // If text contains mostly Latin chars, slugify cleanly
  const latinCleaned = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (latinCleaned.length >= 4) {
    return latinCleaned.slice(0, 75);
  }

  // If text has Bengali/Unicode characters:
  const unicodeCleaned = text
    .trim()
    .replace(/[।.,!?:;'"(){}[\]\\/+=@#$%^&*~`]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  return unicodeCleaned.length > 0 ? unicodeCleaned.slice(0, 65) : `post-${Date.now()}`;
}

export function autoGenerateSeoFromTitle(
  title: string,
  summary: string,
  categoryName: string,
  language: 'bn' | 'en'
) {
  if (language === 'bn') {
    const seoTitle = `${title.slice(0, 55)} | ফিউচার নিউজ ${categoryName}`;
    const seoDesc = summary
      ? summary.slice(0, 150) + (summary.length > 150 ? '...' : '')
      : `পড়ুন ${categoryName} বিষয়ক সর্বশেষ নির্ভরযোগ্য খবর ও বিশ্লেষণ ফিউচার নিউজ পোর্টালে।`;
    
    const words = title.split(' ').filter((w) => w.length > 3).slice(0, 4).join(' ');
    const focusKeyphrase = words || `${categoryName} খবর`;

    return {
      seo_title: seoTitle,
      seo_description: seoDesc,
      focus_keyphrase: focusKeyphrase,
      slug: generateSlug(title),
    };
  } else {
    const seoTitle = `${title.slice(0, 55)} | Future News ${categoryName}`;
    const seoDesc = summary
      ? summary.slice(0, 150) + (summary.length > 150 ? '...' : '')
      : `Read verified, in-depth reporting and updates on ${categoryName} from Future News.`;
    
    const words = title.split(' ').filter((w) => w.length > 3).slice(0, 4).join(' ');
    const focusKeyphrase = words || `${categoryName} news`;

    return {
      seo_title: seoTitle,
      seo_description: seoDesc,
      focus_keyphrase: focusKeyphrase,
      slug: generateSlug(title),
    };
  }
}

export function updatePageSeo(article?: Article, lang: 'bn' | 'en' = 'bn'): void {
  if (!article) {
    updateGeneralPageSeo(
      lang === 'bn'
        ? 'Future News - সত্য ও সময়ের প্রতিচ্ছবি | Daily News Portal'
        : 'Future News - Independent Bilingual Journalism & Daily Portal',
      lang === 'bn'
        ? 'দৈনিক ফিউচার নিউজ - দেশ বিদেশের সর্বশেষ ব্রেকিং নিউজ, রাজনীতি, বাণিজ্য, প্রযুক্তি এবং খেলাধুলার নিরপেক্ষ খবর।'
        : 'Future News - Breaking stories, politics, global economy, tech innovation, sports and investigative journalism.',
      lang
    );
    return;
  }

  const title =
    (lang === 'bn' ? (article.seo_title_bn || article.title_bn) : (article.seo_title_en || article.title_en)) ||
    article.title_bn ||
    article.title_en ||
    'Future News';
  const description =
    (lang === 'bn'
      ? (article.seo_description_bn || article.summary_bn)
      : (article.seo_description_en || article.summary_en)) ||
    article.summary_bn ||
    article.summary_en ||
    'Future News Online Portal';

  document.title = `${title} - Future News`;

  setMetaTag('name', 'description', description);
  const keywords = Array.isArray(article.tags) ? article.tags.join(', ') : 'news, bangladesh, future news';
  setMetaTag('name', 'keywords', keywords);
  setMetaTag('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1');
  setMetaTag('property', 'og:title', title);
  setMetaTag('property', 'og:description', description);
  setMetaTag('property', 'og:image', article.featured_image || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80');
  setMetaTag('property', 'og:type', 'article');
  setMetaTag('property', 'og:url', window.location.href);
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', title);
  setMetaTag('name', 'twitter:description', description);
  setMetaTag('name', 'twitter:image', article.featured_image || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80');

  setLinkTag('canonical', window.location.href.split('?')[0]);
  injectNewsSchema(article, lang);
}

export function updateBlogPageSeo(blog: BlogPost, lang: 'bn' | 'en' = 'bn'): void {
  const title =
    (lang === 'bn' ? (blog.seo_title_bn || blog.title_bn) : (blog.seo_title_en || blog.title_en)) ||
    blog.title_bn ||
    blog.title_en ||
    'ফিউচার নিউজ ব্লগ';
  const description =
    (lang === 'bn'
      ? (blog.seo_description_bn || blog.summary_bn)
      : (blog.seo_description_en || blog.summary_en)) ||
    blog.summary_bn ||
    blog.summary_en ||
    'Future News Blog & Gallery';

  document.title = `${title} | ফিউচার নিউজ ব্লগ`;

  setMetaTag('name', 'description', description);
  const keywords = Array.isArray(blog.tags) ? blog.tags.join(', ') : 'blog, future news, opinions';
  setMetaTag('name', 'keywords', keywords);
  setMetaTag('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1');
  setMetaTag('property', 'og:title', title);
  setMetaTag('property', 'og:description', description);
  setMetaTag('property', 'og:image', blog.featured_image || 'https://images.unsplash.com/photo-1542435503-956c469947f6?w=1200&auto=format&fit=crop&q=80');
  setMetaTag('property', 'og:type', 'article');
  setMetaTag('property', 'og:url', window.location.href);
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', title);
  setMetaTag('name', 'twitter:description', description);
  setMetaTag('name', 'twitter:image', blog.featured_image || 'https://images.unsplash.com/photo-1542435503-956c469947f6?w=1200&auto=format&fit=crop&q=80');

  setLinkTag('canonical', window.location.href.split('?')[0]);
  injectBlogSchema(blog, lang);
}

export function updateGeneralPageSeo(title: string, description: string, lang: 'bn' | 'en' = 'bn'): void {
  document.title = title;
  setMetaTag('name', 'description', description);
  setMetaTag('name', 'robots', 'index, follow');
  setMetaTag('property', 'og:title', title);
  setMetaTag('property', 'og:description', description);
  setMetaTag('property', 'og:type', 'website');
  setMetaTag('property', 'og:url', window.location.href);
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', title);
  setMetaTag('name', 'twitter:description', description);

  setLinkTag('canonical', window.location.href.split('?')[0]);
  injectWebSiteSchema(lang);
}

function setMetaTag(attr: 'name' | 'property', key: string, content: string): void {
  let element = document.querySelector(`meta[${attr}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setLinkTag(rel: string, href: string): void {
  let element = document.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

function injectNewsSchema(article: Article, lang: 'bn' | 'en'): void {
  const existingScript = document.getElementById('news-schema-jsonld');
  if (existingScript) existingScript.remove();

  const title = lang === 'bn' ? article.title_bn : article.title_en;
  const description = lang === 'bn' ? article.summary_bn : article.summary_en;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    'headline': title,
    'description': description,
    'image': [article.featured_image],
    'datePublished': article.published_at,
    'dateModified': article.updated_at,
    'author': {
      '@type': 'Person',
      'name': 'Future News Editorial Team',
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Future News',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=120&auto=format&fit=crop&q=80',
      },
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': window.location.href,
    },
  };

  const script = document.createElement('script');
  script.id = 'news-schema-jsonld';
  script.type = 'application/ld+json';
  script.text = JSON.stringify(schema);
  document.head.appendChild(script);
}

function injectBlogSchema(blog: BlogPost, lang: 'bn' | 'en'): void {
  const existingScript = document.getElementById('news-schema-jsonld');
  if (existingScript) existingScript.remove();

  const title = lang === 'bn' ? blog.title_bn : blog.title_en;
  const description = lang === 'bn' ? blog.summary_bn : blog.summary_en;

  const images = [blog.featured_image];
  if (blog.additional_images && blog.additional_images.length > 0) {
    images.push(...blog.additional_images);
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': title,
    'description': description,
    'image': images,
    'datePublished': blog.published_at,
    'author': {
      '@type': 'Person',
      'name': blog.author_name,
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Future News Blog Hub',
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': window.location.href,
    },
  };

  const script = document.createElement('script');
  script.id = 'news-schema-jsonld';
  script.type = 'application/ld+json';
  script.text = JSON.stringify(schema);
  document.head.appendChild(script);
}

function injectWebSiteSchema(lang: 'bn' | 'en'): void {
  const existingScript = document.getElementById('news-schema-jsonld');
  if (existingScript) existingScript.remove();

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'Future News',
    'alternateName': 'ফিউচার নিউজ',
    'url': window.location.origin,
    'potentialAction': {
      '@type': 'SearchAction',
      'target': `${window.location.origin}/?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  const script = document.createElement('script');
  script.id = 'news-schema-jsonld';
  script.type = 'application/ld+json';
  script.text = JSON.stringify(schema);
  document.head.appendChild(script);
}

export function generateDynamicSitemapXml(articles: Article[], blogs: BlogPost[]): string {
  const origin = window.location.origin || 'https://futurenews.netlify.app';
  const today = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <!-- Homepage -->
  <url>
    <loc>${origin}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>always</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="bn" href="${origin}/?lang=bn" />
    <xhtml:link rel="alternate" hreflang="en" href="${origin}/?lang=en" />
  </url>

  <!-- Blogs Hub -->
  <url>
    <loc>${origin}/blogs</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
`;

  // Add all articles
  articles.forEach((art) => {
    const modDate = (art.updated_at || art.published_at || today).split('T')[0];
    xml += `
  <url>
    <loc>${origin}/news/${art.slug}</loc>
    <lastmod>${modDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
    <news:news>
      <news:publication>
        <news:name>Future News</news:name>
        <news:language>bn</news:language>
      </news:publication>
      <news:publication_date>${art.published_at}</news:publication_date>
      <news:title>${art.title_bn.replace(/[<>&'"]/g, '')}</news:title>
    </news:news>
  </url>`;
  });

  // Add all blogs
  blogs.forEach((blog) => {
    const modDate = (blog.created_at || blog.published_at || today).split('T')[0];
    xml += `
  <url>
    <loc>${origin}/blog/${blog.slug}</loc>
    <lastmod>${modDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
  });

  xml += `\n</urlset>`;
  return xml;
}

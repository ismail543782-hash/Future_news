import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { aiRouter } from './src/server/aiArticlesRouter';
import { getOpenApiSpec } from './src/server/openApiSpec';
import { getActiveAiApiKey } from './src/server/aiAuth';

dotenv.config();

const PORT = 3000;
const app = express();

// Increase JSON limit to support base64 image uploads and long articles
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// ----------------------------------------------------------------------------
// 🌐 CORS Middleware (Crucial for OpenAI ChatGPT Custom GPT Actions & External APIs)
// ----------------------------------------------------------------------------
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key'
  );
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// ----------------------------------------------------------------------------
// 🩺 Health Check
// ----------------------------------------------------------------------------
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'Future News Portal',
    timestamp: new Date().toISOString(),
  });
});

// ----------------------------------------------------------------------------
// 🤖 OpenAPI 3.1 Specification for ChatGPT Custom GPT Actions
// ----------------------------------------------------------------------------
app.get('/api/ai/openapi.json', (req: Request, res: Response) => {
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  const host = req.get('host') || 'futurenews65.netlify.app';
  const serverUrl = `${protocol}://${host}`;
  const spec = getOpenApiSpec(serverUrl);
  res.setHeader('Content-Type', 'application/json');
  res.json(spec);
});

// ----------------------------------------------------------------------------
// 📖 Complete API Documentation Endpoint
// ----------------------------------------------------------------------------
app.get('/api/ai/docs', (req: Request, res: Response) => {
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  const host = req.get('host') || 'futurenews65.netlify.app';
  const baseUrl = `${protocol}://${host}`;

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Future News AI Publishing REST API - Documentation</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen p-4 sm:p-8">
  <div class="max-w-4xl mx-auto space-y-8">
    <div class="border-b border-slate-800 pb-6">
      <span class="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/30">
        AI Publisher Role Active
      </span>
      <h1 class="text-3xl font-bold mt-3 text-white">Future News AI Publishing REST API</h1>
      <p class="text-slate-400 mt-2">
        A secure, high-speed REST API designed for ChatGPT and autonomous AI workflows to research, draft, edit, and publish news articles and media.
      </p>
      <div class="mt-4 flex flex-wrap gap-3">
        <a href="/api/ai/openapi.json" target="_blank" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition">
          View OpenAPI 3.1 Spec (JSON)
        </a>
        <a href="/" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium border border-slate-700 transition">
          Open Website
        </a>
      </div>
    </div>

    <!-- Security & Role -->
    <div class="bg-slate-800/80 p-6 rounded-xl border border-slate-700">
      <h2 class="text-xl font-bold text-white mb-2">🔐 Security & AI Publisher Scope</h2>
      <p class="text-slate-300 text-sm mb-3">
        This API uses a dedicated <strong>AI Publisher Role</strong> (<code class="bg-slate-900 px-2 py-0.5 rounded text-emerald-300">ai_publisher</code>).
      </p>
      <ul class="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
        <li><strong class="text-emerald-400">Allowed:</strong> Create articles, edit articles, draft articles, publish articles, list articles, and upload media.</li>
        <li><strong class="text-rose-400">Strictly Forbidden:</strong> Admin credentials, passwords, user profiles, financial settings, ad network codes, and system configurations are entirely blocked.</li>
      </ul>
    </div>

    <!-- Authentication -->
    <div class="bg-slate-800/80 p-6 rounded-xl border border-slate-700">
      <h2 class="text-xl font-bold text-white mb-2">🔑 Authentication Method</h2>
      <p class="text-slate-300 text-sm mb-3">
        Provide your API Key in the HTTP Request Header in either of the following formats:
      </p>
      <div class="bg-slate-950 p-3 rounded-lg font-mono text-xs text-blue-300 overflow-x-auto">
        Authorization: Bearer YOUR_AI_API_KEY<br>
        # or<br>
        X-API-Key: YOUR_AI_API_KEY
      </div>
    </div>

    <!-- Core Endpoints -->
    <div class="space-y-4">
      <h2 class="text-2xl font-bold text-white">📡 Endpoints for ChatGPT</h2>

      <!-- Create Article -->
      <div class="bg-slate-800/50 p-5 rounded-xl border border-slate-700">
        <div class="flex items-center gap-2 mb-2">
          <span class="px-2 py-1 bg-emerald-600 text-white text-xs font-mono font-bold rounded">POST</span>
          <code class="text-sm font-mono text-white">/api/ai/articles</code>
          <span class="text-xs text-emerald-400 ml-auto font-medium">Create & Publish or Draft</span>
        </div>
        <p class="text-xs text-slate-400 mb-3">Creates a new article. Set <code class="text-slate-200">"status": "published"</code> to make it live immediately or <code class="text-slate-200">"status": "draft"</code> for review.</p>
        <div class="bg-slate-950 p-3 rounded font-mono text-xs text-slate-300 overflow-x-auto">
<pre>{
  "title": "Quantum Computing Breakthrough in 2026",
  "content": "Full article body with detailed paragraphs and research...",
  "excerpt": "Brief 1-2 sentence article summary",
  "category": "technology",
  "tags": ["Quantum", "Tech", "Science"],
  "featured_image": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200",
  "seo_title": "Quantum Computing Breakthrough 2026",
  "seo_description": "Scientists report new quantum coherence record.",
  "slug": "quantum-computing-breakthrough-2026",
  "status": "published"
}</pre>
        </div>
      </div>

      <!-- Update Article -->
      <div class="bg-slate-800/50 p-5 rounded-xl border border-slate-700">
        <div class="flex items-center gap-2 mb-2">
          <span class="px-2 py-1 bg-amber-600 text-white text-xs font-mono font-bold rounded">PUT / PATCH</span>
          <code class="text-sm font-mono text-white">/api/ai/articles/:id</code>
          <span class="text-xs text-amber-400 ml-auto font-medium">Edit / Update</span>
        </div>
        <p class="text-xs text-slate-400 mb-3">Update any existing article by its ID (e.g. <code class="text-slate-200">art-ai-123</code>) or slug.</p>
      </div>

      <!-- Publish Article -->
      <div class="bg-slate-800/50 p-5 rounded-xl border border-slate-700">
        <div class="flex items-center gap-2 mb-2">
          <span class="px-2 py-1 bg-blue-600 text-white text-xs font-mono font-bold rounded">POST</span>
          <code class="text-sm font-mono text-white">/api/ai/articles/:id/publish</code>
          <span class="text-xs text-blue-400 ml-auto font-medium">Publish Live</span>
        </div>
        <p class="text-xs text-slate-400">Instantly publishes a draft article.</p>
      </div>

      <!-- Draft Article -->
      <div class="bg-slate-800/50 p-5 rounded-xl border border-slate-700">
        <div class="flex items-center gap-2 mb-2">
          <span class="px-2 py-1 bg-purple-600 text-white text-xs font-mono font-bold rounded">POST</span>
          <code class="text-sm font-mono text-white">/api/ai/articles/:id/draft</code>
          <span class="text-xs text-purple-400 ml-auto font-medium">Save as Draft</span>
        </div>
        <p class="text-xs text-slate-400">Reverts an article to draft status.</p>
      </div>

      <!-- List Articles -->
      <div class="bg-slate-800/50 p-5 rounded-xl border border-slate-700">
        <div class="flex items-center gap-2 mb-2">
          <span class="px-2 py-1 bg-slate-600 text-white text-xs font-mono font-bold rounded">GET</span>
          <code class="text-sm font-mono text-white">/api/ai/articles?page=1&limit=10&status=all</code>
          <span class="text-xs text-slate-400 ml-auto font-medium">Query Articles</span>
        </div>
        <p class="text-xs text-slate-400">Retrieve existing articles with search and pagination.</p>
      </div>

      <!-- Upload Media -->
      <div class="bg-slate-800/50 p-5 rounded-xl border border-slate-700">
        <div class="flex items-center gap-2 mb-2">
          <span class="px-2 py-1 bg-emerald-600 text-white text-xs font-mono font-bold rounded">POST</span>
          <code class="text-sm font-mono text-white">/api/ai/media/upload</code>
          <span class="text-xs text-emerald-400 ml-auto font-medium">Attach Image</span>
        </div>
        <p class="text-xs text-slate-400">Attach or validate an image URL or base64 photo for article covers.</p>
      </div>
    </div>
  </div>
</body>
</html>`);
});

// ----------------------------------------------------------------------------
// 🤖 Mount AI Publishing API Router
// ----------------------------------------------------------------------------
app.use('/api/ai', aiRouter);

// ----------------------------------------------------------------------------
// 🚀 Frontend Serving (Vite dev middleware vs Production static build)
// ----------------------------------------------------------------------------
async function startServer() {
  // Pre-initialize AI API Key in background
  getActiveAiApiKey().catch(console.warn);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Future News Full-Stack Server running on port ${PORT}`);
    console.log(`AI Publishing REST API active at http://0.0.0.0:${PORT}/api/ai`);
    console.log(`OpenAPI 3.1 Spec available at http://0.0.0.0:${PORT}/api/ai/openapi.json`);
  });
}

startServer();

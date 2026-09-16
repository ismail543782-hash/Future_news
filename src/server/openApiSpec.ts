/**
 * OpenAPI 3.1.0 Specification for ChatGPT Custom GPT Actions
 * This schema can be imported directly into OpenAI ChatGPT Custom GPT "Actions"
 */

export function getOpenApiSpec(serverUrl: string = 'https://futurenews.example.com') {
  return {
    openapi: '3.1.0',
    info: {
      title: 'Future News AI Publishing REST API',
      description:
        'Secure API for ChatGPT and automated AI agents to research news/articles, create, edit, draft, and publish bilingual news articles on Future News portal with SEO metadata, categories, tags, and media.',
      version: '1.0.0',
      contact: {
        name: 'Future News Editorial Tech',
        url: serverUrl,
      },
    },
    servers: [
      {
        url: serverUrl,
        description: 'Future News Production Server',
      },
    ],
    paths: {
      '/api/ai/articles': {
        get: {
          operationId: 'listArticles',
          summary: 'Get existing articles',
          description: 'Retrieve a paginated list of articles filtered by status, category, or search keywords.',
          parameters: [
            {
              name: 'page',
              in: 'query',
              required: false,
              description: 'Page number (default: 1)',
              schema: { type: 'integer', default: 1, minimum: 1 },
            },
            {
              name: 'limit',
              in: 'query',
              required: false,
              description: 'Number of articles per page (default: 10, max: 50)',
              schema: { type: 'integer', default: 10, maximum: 50 },
            },
            {
              name: 'status',
              in: 'query',
              required: false,
              description: 'Filter by article status',
              schema: { type: 'string', enum: ['published', 'draft', 'all'], default: 'all' },
            },
            {
              name: 'category',
              in: 'query',
              required: false,
              description: 'Filter by category ID or slug (e.g., technology, national, business)',
              schema: { type: 'string' },
            },
            {
              name: 'search',
              in: 'query',
              required: false,
              description: 'Search query for article title, summary, or content',
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: 'Articles retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      count: { type: 'integer', example: 10 },
                      total: { type: 'integer', example: 45 },
                      page: { type: 'integer', example: 1 },
                      totalPages: { type: 'integer', example: 5 },
                      articles: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Article' },
                      },
                    },
                  },
                },
              },
            },
            '401': { $ref: '#/components/responses/Unauthorized' },
          },
        },
        post: {
          operationId: 'createArticle',
          summary: 'Create a new article',
          description:
            'Create and optionally publish or draft a new article with title, content, excerpt, category, tags, featured image, SEO title, SEO description, and URL slug. Bilingual content is automatically formatted.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateArticleInput' },
              },
            },
          },
          responses: {
            '201': {
              description: 'Article created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Article published successfully' },
                      article: { $ref: '#/components/schemas/Article' },
                      view_url: { type: 'string', example: 'https://site.com/?article=slug-here' },
                    },
                  },
                },
              },
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '401': { $ref: '#/components/responses/Unauthorized' },
          },
        },
      },
      '/api/ai/articles/{id}': {
        get: {
          operationId: 'getArticleById',
          summary: 'Get an article by ID or slug',
          description: 'Fetch complete details of a specific article by its ID or unique URL slug.',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'The article ID (e.g. art-123) or URL slug',
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: 'Article details retrieved',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      article: { $ref: '#/components/schemas/Article' },
                    },
                  },
                },
              },
            },
            '404': { $ref: '#/components/responses/NotFound' },
          },
        },
        put: {
          operationId: 'updateArticle',
          summary: 'Update or edit an existing article',
          description: 'Update article fields such as title, content, excerpt, category, tags, featured image, and SEO metadata.',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'The ID of the article to update',
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateArticleInput' },
              },
            },
          },
          responses: {
            '200': {
              description: 'Article updated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Article updated successfully' },
                      article: { $ref: '#/components/schemas/Article' },
                    },
                  },
                },
              },
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '404': { $ref: '#/components/responses/NotFound' },
          },
        },
      },
      '/api/ai/articles/{id}/publish': {
        post: {
          operationId: 'publishArticle',
          summary: 'Publish an article',
          description: 'Change the status of an existing draft article to "published", making it live on the site.',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'The article ID to publish',
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: 'Article published successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Article published successfully' },
                      article_id: { type: 'string' },
                      status: { type: 'string', example: 'published' },
                      published_at: { type: 'string' },
                      view_url: { type: 'string' },
                    },
                  },
                },
              },
            },
            '404': { $ref: '#/components/responses/NotFound' },
          },
        },
      },
      '/api/ai/articles/{id}/draft': {
        post: {
          operationId: 'draftArticle',
          summary: 'Save an article as draft',
          description: 'Change the status of an article to "draft", hiding it from public readers for editorial review.',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'The article ID to revert to draft',
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: 'Article reverted to draft successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Article saved as draft' },
                      article_id: { type: 'string' },
                      status: { type: 'string', example: 'draft' },
                    },
                  },
                },
              },
            },
            '404': { $ref: '#/components/responses/NotFound' },
          },
        },
      },
      '/api/ai/media/upload': {
        post: {
          operationId: 'uploadMedia',
          summary: 'Upload or attach a featured image',
          description: 'Attach a featured image via an existing image URL or upload base64 image data.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    image_url: {
                      type: 'string',
                      format: 'uri',
                      description: 'Public URL of the image to attach (e.g. Unsplash, CDN, or news photo URL)',
                      example: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200',
                    },
                    image_base64: {
                      type: 'string',
                      description: 'Optional base64 encoded image data (e.g., data:image/jpeg;base64,...)',
                    },
                    caption: {
                      type: 'string',
                      description: 'Image caption or description',
                      example: 'AI research center headquarters in 2026',
                    },
                    credit: {
                      type: 'string',
                      description: 'Image source or photographer credit',
                      example: 'Reuters / AI Studio',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Image attached or validated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      image_url: { type: 'string' },
                      caption: { type: 'string' },
                      credit: { type: 'string' },
                    },
                  },
                },
              },
            },
            '400': { $ref: '#/components/responses/BadRequest' },
          },
        },
      },
      '/api/ai/categories': {
        get: {
          operationId: 'listCategories',
          summary: 'Get available categories',
          description: 'List all active news categories with their IDs, names in Bengali and English, and slugs.',
          responses: {
            '200': {
              description: 'Categories list retrieved',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      categories: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', example: 'technology' },
                            name_bn: { type: 'string', example: 'তথ্যপ্রযুক্তি' },
                            name_en: { type: 'string', example: 'Technology' },
                            slug: { type: 'string', example: 'technology' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/ai/status': {
        get: {
          operationId: 'getApiStatus',
          summary: 'Check API status and AI permissions',
          description: 'Returns health status, active AI publishing role, and allowed capabilities.',
          responses: {
            '200': {
              description: 'API is healthy and active',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'ok' },
                      role: { type: 'string', example: 'ai_publisher' },
                      permissions: { type: 'array', items: { type: 'string' } },
                      timestamp: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'API Key',
          description: 'Enter your AI Publishing API Key generated in the Admin Dashboard.',
        },
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'Alternative header for the AI Publishing API Key.',
        },
      },
      schemas: {
        CreateArticleInput: {
          type: 'object',
          required: ['title', 'content'],
          properties: {
            title: {
              type: 'string',
              description: 'Article main title. If only one language is provided, it is automatically shared.',
              example: 'Global Breakthrough in Renewable Solar Energy Cells Announced',
            },
            title_bn: {
              type: 'string',
              description: 'Optional Bengali title (e.g. নবায়নযোগ্য সৌরশক্তিতে বৈশ্বিক সাফল্য)',
            },
            title_en: {
              type: 'string',
              description: 'Optional English title',
            },
            content: {
              type: 'string',
              description: 'Full body content of the article (paragraphs or Markdown formatting)',
              example: 'Scientists have achieved a new record in photovoltaic efficiency...',
            },
            content_bn: {
              type: 'string',
              description: 'Optional Bengali full content',
            },
            content_en: {
              type: 'string',
              description: 'Optional English full content',
            },
            excerpt: {
              type: 'string',
              description: 'Brief 1-2 sentence article summary or excerpt',
              example: 'New solar cell efficiency exceeds 35% in international laboratory trials.',
            },
            summary_bn: { type: 'string' },
            summary_en: { type: 'string' },
            category: {
              type: 'string',
              description: 'Category ID or slug (e.g., technology, national, international, business, sports, entertainment, lifestyle)',
              default: 'technology',
              example: 'technology',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of relevant keywords or tags',
              example: ['Solar Energy', 'Clean Tech', 'Innovation', 'Climate'],
            },
            featured_image: {
              type: 'string',
              format: 'uri',
              description: 'URL of the primary cover photo for the article',
              example: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=1200',
            },
            image_caption: {
              type: 'string',
              description: 'Caption displayed underneath the cover photo',
              example: 'Solar research facility testing the next-generation crystalline cells.',
            },
            image_credit: {
              type: 'string',
              description: 'Photographer or organization credit for the image',
              example: 'Green Energy Lab / Tech Media',
            },
            seo_title: {
              type: 'string',
              description: 'Custom SEO title tag (approx 50-65 characters)',
              example: 'Record Solar Energy Breakthrough: 35% Efficiency Achieved',
            },
            seo_description: {
              type: 'string',
              description: 'Meta description for Google search (approx 120-160 characters)',
              example: 'Global researchers achieve landmark solar cell efficiency, opening new possibilities for commercial clean power.',
            },
            slug: {
              type: 'string',
              description: 'Custom URL-friendly slug (e.g., record-solar-energy-breakthrough). If omitted, generated from title.',
              example: 'record-solar-energy-breakthrough',
            },
            status: {
              type: 'string',
              enum: ['published', 'draft'],
              default: 'published',
              description: 'Publication state: "published" makes it live immediately; "draft" saves for editorial review.',
              example: 'published',
            },
            is_featured: {
              type: 'boolean',
              default: false,
              description: 'Whether to highlight this article in top featured spots',
            },
            is_breaking: {
              type: 'boolean',
              default: false,
              description: 'Whether to display in breaking news alerts',
            },
          },
        },
        UpdateArticleInput: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            title_bn: { type: 'string' },
            title_en: { type: 'string' },
            content: { type: 'string' },
            content_bn: { type: 'string' },
            content_en: { type: 'string' },
            excerpt: { type: 'string' },
            category: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            featured_image: { type: 'string', format: 'uri' },
            image_caption: { type: 'string' },
            image_credit: { type: 'string' },
            seo_title: { type: 'string' },
            seo_description: { type: 'string' },
            slug: { type: 'string' },
            status: { type: 'string', enum: ['published', 'draft'] },
            is_featured: { type: 'boolean' },
            is_breaking: { type: 'boolean' },
          },
        },
        Article: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'art-ai-1741234567-abc' },
            slug: { type: 'string', example: 'solar-energy-breakthrough' },
            title_bn: { type: 'string', example: 'সৌরশক্তিতে নতুন বৈশ্বিক মাইলফলক' },
            title_en: { type: 'string', example: 'New Global Milestone in Solar Energy' },
            summary_bn: { type: 'string' },
            summary_en: { type: 'string' },
            content_bn: { type: 'string' },
            content_en: { type: 'string' },
            category_id: { type: 'string', example: 'technology' },
            featured_image: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            status: { type: 'string', enum: ['published', 'draft'] },
            views: { type: 'integer', example: 1 },
            reading_time_minutes: { type: 'integer', example: 3 },
            published_at: { type: 'string', format: 'date-time' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
            author_id: { type: 'string', example: 'author-ai-editorial' },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: 'Missing or invalid API Key',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string', example: 'Unauthorized' },
                  code: { type: 'string', example: 'INVALID_API_KEY' },
                  message: { type: 'string', example: 'Authentication required. Check your API Key.' },
                },
              },
            },
          },
        },
        BadRequest: {
          description: 'Invalid input parameters or validation failed',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string', example: 'Bad Request' },
                  code: { type: 'string', example: 'VALIDATION_FAILED' },
                  message: { type: 'string', example: 'Title and content are required' },
                },
              },
            },
          },
        },
        NotFound: {
          description: 'Article not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string', example: 'Not Found' },
                  code: { type: 'string', example: 'ARTICLE_NOT_FOUND' },
                  message: { type: 'string', example: 'Article with ID or slug not found' },
                },
              },
            },
          },
        },
      },
    },
    security: [
      { BearerAuth: [] },
      { ApiKeyAuth: [] },
    ],
  };
}

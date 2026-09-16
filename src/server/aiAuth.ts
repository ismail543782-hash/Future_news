import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc, collection, addDoc } from 'firebase/firestore';

export interface AiAuditLog {
  id: string;
  timestamp: string;
  action: 'CREATE_ARTICLE' | 'UPDATE_ARTICLE' | 'PUBLISH_ARTICLE' | 'DRAFT_ARTICLE' | 'UPLOAD_MEDIA' | 'LIST_ARTICLES' | 'GET_ARTICLE';
  article_id?: string;
  article_title?: string;
  ip: string;
  user_agent?: string;
  status: 'SUCCESS' | 'ERROR';
  details?: string;
}

// In-memory sliding window rate limiter (60 requests per minute per IP/Key)
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 60;
const requestCounts = new Map<string, { count: number; resetTime: number }>();

// In-memory audit log buffer for fast admin UI retrieval
const inMemoryLogs: AiAuditLog[] = [];

// Fallback generated API key if neither ENV nor Firestore has one
let cachedApiKey: string = process.env.AI_PUBLISHING_API_KEY || '';

/**
 * Generate a secure 32-byte hex API key with 'fn_ai_' prefix
 */
export function generateSecureApiKey(): string {
  return `fn_ai_${crypto.randomBytes(24).toString('hex')}`;
}

/**
 * Get or initialize the active AI Publishing API key
 */
export async function getActiveAiApiKey(): Promise<string> {
  if (process.env.AI_PUBLISHING_API_KEY && process.env.AI_PUBLISHING_API_KEY.trim() !== '') {
    return process.env.AI_PUBLISHING_API_KEY.trim();
  }

  if (cachedApiKey && cachedApiKey.trim() !== '') {
    return cachedApiKey;
  }

  // Check Firestore settings
  try {
    const keyDocRef = doc(db, 'settings', 'ai_publishing');
    const snap = await getDoc(keyDocRef);
    if (snap.exists() && snap.data().api_key) {
      cachedApiKey = snap.data().api_key;
      return cachedApiKey;
    }

    // Generate new key and persist to Firestore
    const newKey = generateSecureApiKey();
    await setDoc(
      keyDocRef,
      {
        api_key: newKey,
        role: 'ai_publisher',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        description: 'Dedicated API Key for ChatGPT / automated publishing',
      },
      { merge: true }
    );
    cachedApiKey = newKey;
    return cachedApiKey;
  } catch (err) {
    console.warn('Could not read/write API key from Firestore, using in-memory key:', err);
    if (!cachedApiKey) {
      cachedApiKey = generateSecureApiKey();
    }
    return cachedApiKey;
  }
}

/**
 * Rotate / Regenerate the AI Publishing API key
 */
export async function rotateAiApiKey(): Promise<string> {
  const newKey = generateSecureApiKey();
  cachedApiKey = newKey;
  try {
    const keyDocRef = doc(db, 'settings', 'ai_publishing');
    await setDoc(
      keyDocRef,
      {
        api_key: newKey,
        role: 'ai_publisher',
        updated_at: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Error saving rotated key to Firestore:', err);
  }
  return newKey;
}

/**
 * Record an audit log for AI activity
 */
export async function recordAiAuditLog(log: Omit<AiAuditLog, 'id'>): Promise<AiAuditLog> {
  const fullLog: AiAuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    ...log,
  };

  // Keep latest 200 in memory
  inMemoryLogs.unshift(fullLog);
  if (inMemoryLogs.length > 200) {
    inMemoryLogs.pop();
  }

  // Persist to Cloud Firestore asynchronously
  try {
    await addDoc(collection(db, 'ai_audit_logs'), fullLog);
  } catch (err) {
    console.warn('Could not persist audit log to Firestore:', err);
  }

  return fullLog;
}

/**
 * Get recent AI audit logs
 */
export function getRecentAiLogs(): AiAuditLog[] {
  return inMemoryLogs.slice(0, 50);
}

/**
 * Express Middleware: Validate AI Publishing API Key and enforce AI Publisher role
 */
export async function verifyAiApiKey(req: Request, res: Response, next: NextFunction) {
  // Extract token from Authorization header or X-API-Key header
  let providedKey = '';
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    providedKey = authHeader.substring(7).trim();
  } else if (req.headers['x-api-key']) {
    providedKey = String(req.headers['x-api-key']).trim();
  }

  if (!providedKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      code: 'MISSING_API_KEY',
      message: 'Authentication required. Provide your AI Publishing API Key via "Authorization: Bearer <KEY>" or "X-API-Key: <KEY>".',
      docs: '/api/ai/docs',
    });
  }

  const validKey = await getActiveAiApiKey();

  // Timing-safe comparison to prevent timing attacks
  const keyBuffer = Buffer.from(providedKey);
  const validBuffer = Buffer.from(validKey);

  let isMatch = false;
  if (keyBuffer.length === validBuffer.length) {
    isMatch = crypto.timingSafeEqual(keyBuffer, validBuffer);
  }

  if (!isMatch) {
    await recordAiAuditLog({
      timestamp: new Date().toISOString(),
      action: 'CREATE_ARTICLE',
      ip: req.ip || req.socket.remoteAddress || 'unknown',
      user_agent: req.headers['user-agent'] || '',
      status: 'ERROR',
      details: 'Failed authentication attempt with invalid API key',
    });

    return res.status(401).json({
      error: 'Unauthorized',
      code: 'INVALID_API_KEY',
      message: 'The provided API Key is invalid or expired. Check your Admin Dashboard -> AI Publishing tab to copy the active key.',
      docs: '/api/ai/docs',
    });
  }

  // Rate Limiting check
  const clientIdentifier = `${req.ip || 'ip'}_${providedKey.substring(0, 10)}`;
  const now = Date.now();
  const clientRate = requestCounts.get(clientIdentifier);

  if (!clientRate || now > clientRate.resetTime) {
    requestCounts.set(clientIdentifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
  } else {
    clientRate.count++;
    if (clientRate.count > MAX_REQUESTS_PER_WINDOW) {
      const retryAfterSec = Math.ceil((clientRate.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSec);
      return res.status(429).json({
        error: 'Too Many Requests',
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Rate limit of ${MAX_REQUESTS_PER_WINDOW} requests per minute exceeded. Please slow down.`,
        retry_after_seconds: retryAfterSec,
      });
    }
  }

  // Attach verified identity with limited AI role to request
  (req as any).aiPublisher = {
    role: 'ai_publisher',
    permissions: [
      'articles:create',
      'articles:read',
      'articles:update',
      'articles:publish',
      'articles:draft',
      'media:upload',
    ],
    // Explicitly denied areas
    denied: ['users', 'passwords', 'payments', 'settings', 'books:delete', 'system:manage'],
  };

  next();
}

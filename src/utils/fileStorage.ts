/**
 * fileStorage.ts
 * IndexedDB storage engine + Cloud Chunks integration for uploaded PDF books
 */
import { getPdfFromCloudChunks, savePdfToCloudChunks, deletePdfFromCloudChunks } from './cloudPdfStorage';
import { generateBookPdfBlob } from './pdfGenerator';
import { Book } from '../types/news';

const DB_NAME = 'future_news_library_db';
const DB_VERSION = 1;
const STORE_PDFS = 'book_pdfs';

interface StoredPdfRecord {
  bookId: string;
  blob: Blob;
  filename: string;
  size: number;
  uploadedAt: string;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.reject(new Error('IndexedDB is not supported in this environment'));
  }

  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_PDFS)) {
          db.createObjectStore(STORE_PDFS, { keyPath: 'bookId' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  return dbPromise;
}

/**
 * Save uploaded PDF file or blob into IndexedDB
 */
export async function savePdfBlob(
  bookId: string,
  fileOrBlob: Blob | File,
  filename?: string
): Promise<void> {
  try {
    const db = await getDB();
    const name = filename || (fileOrBlob instanceof File ? fileOrBlob.name : `book-${bookId}.pdf`);

    const record: StoredPdfRecord = {
      bookId,
      blob: fileOrBlob,
      filename: name,
      size: fileOrBlob.size,
      uploadedAt: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PDFS, 'readwrite');
      const store = tx.objectStore(STORE_PDFS);
      const req = store.put(record);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to save PDF in IndexedDB, falling back:', err);
  }
}

/**
 * Retrieve stored PDF Blob and metadata by bookId.
 * First checks local IndexedDB; if not found (e.g. user is on mobile),
 * checks Cloud Firestore chunk storage, downloads and caches in local IndexedDB.
 */
export async function getPdfBlob(
  bookId: string
): Promise<{ blob: Blob; filename: string; size: number } | null> {
  try {
    const db = await getDB();
    const localResult = await new Promise<StoredPdfRecord | null>((resolve) => {
      try {
        const tx = db.transaction(STORE_PDFS, 'readonly');
        const store = tx.objectStore(STORE_PDFS);
        const req = store.get(bookId);

        req.onsuccess = () => {
          resolve((req.result as StoredPdfRecord) || null);
        };
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });

    if (localResult && localResult.blob) {
      return {
        blob: localResult.blob,
        filename: localResult.filename,
        size: localResult.size,
      };
    }
  } catch (err) {
    console.warn('IndexedDB read note:', err);
  }

  // Fallback: Check Cloud Firestore chunk storage (for mobile devices or secondary browsers)
  try {
    const cloudRecord = await getPdfFromCloudChunks(bookId);
    if (cloudRecord && cloudRecord.blob) {
      // Cache in local IndexedDB for future fast offline reading
      savePdfBlob(bookId, cloudRecord.blob, cloudRecord.filename).catch(() => {});
      return cloudRecord;
    }
  } catch (e) {
    console.warn('Cloud PDF fetch note:', e);
  }

  return null;
}

/**
 * Delete a PDF blob from IndexedDB and Cloud Firestore
 */
export async function deletePdfBlob(bookId: string): Promise<void> {
  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_PDFS, 'readwrite');
      const store = tx.objectStore(STORE_PDFS);
      const req = store.delete(bookId);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to delete PDF from IndexedDB:', err);
  }

  try {
    await deletePdfFromCloudChunks(bookId);
  } catch (err) {
    console.warn('Failed to delete PDF from Cloud:', err);
  }
}

// Keep active Object URLs in memory for disposal
const activeObjectUrls = new Map<string, string>();

/**
 * Get an active Object URL for a book's PDF (either from IndexedDB or Cloud Firestore)
 */
export async function getPdfObjectUrl(bookId: string): Promise<string | null> {
  // Check if we already created an object URL in this session
  if (activeObjectUrls.has(bookId)) {
    return activeObjectUrls.get(bookId)!;
  }

  const stored = await getPdfBlob(bookId);
  if (stored && stored.blob) {
    const url = URL.createObjectURL(stored.blob);
    activeObjectUrls.set(bookId, url);
    return url;
  }
  return null;
}

/**
 * Normalize and convert any PDF link (Google Drive, Dropbox, standard URL, or Blob)
 * to an optimal in-browser embeddable viewer URL.
 * Automatically wraps direct URLs in Google Docs Viewer for mobile iframes when appropriate.
 */
export function normalizePdfViewerUrl(rawUrl: string, isMobile = false): {
  embedUrl: string;
  isGoogleDrive: boolean;
  canEmbed: boolean;
} {
  if (!rawUrl) return { embedUrl: '', isGoogleDrive: false, canEmbed: false };

  // Filter out invalid/stale blob URLs from other devices
  if (rawUrl.startsWith('blob:') && !rawUrl.includes(window.location.host)) {
    return { embedUrl: '', isGoogleDrive: false, canEmbed: false };
  }

  const trimmed = rawUrl.trim();

  // 1. Google Drive Share Link Converter
  const gDriveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (gDriveMatch && gDriveMatch[1]) {
    const fileId = gDriveMatch[1];
    return {
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      isGoogleDrive: true,
      canEmbed: true,
    };
  }

  // 2. Dropbox Link
  if (trimmed.includes('dropbox.com')) {
    const directDropbox = trimmed.replace(/[?&]dl=0/, '?raw=1');
    return {
      embedUrl: isMobile
        ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(directDropbox)}`
        : directDropbox,
      isGoogleDrive: false,
      canEmbed: true,
    };
  }

  // 3. If mobile and standard http/https PDF: wrap in Google Docs Viewer for reliable mobile iframe rendering
  if (isMobile && (trimmed.startsWith('http://') || trimmed.startsWith('https://'))) {
    return {
      embedUrl: `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(trimmed)}`,
      isGoogleDrive: false,
      canEmbed: true,
    };
  }

  // 4. Data URL or Blob URL or direct PDF
  return {
    embedUrl: trimmed,
    isGoogleDrive: false,
    canEmbed: true,
  };
}

/**
 * Compress and scale an uploaded cover image file (JPEG/PNG/WebP) using an HTML5 Canvas.
 */
export function compressImageFile(
  file: File,
  maxWidth = 1000,
  maxHeight = 1500,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image file for compression'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read image file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Trigger robust browser download for a PDF book.
 * Specially engineered for Mobile (Android & iOS) as well as Desktop:
 * 1. Checks local IndexedDB
 * 2. Checks Cloud Firestore chunk storage
 * 3. Attempts direct fetch & Blob conversion for external links
 * 4. Generates an authentic PDF on-the-fly using jsPDF if only text pages exist
 */
export async function downloadBookPdf(
  bookId: string,
  title: string,
  externalPdfUrl?: string,
  filename?: string,
  book?: Book
): Promise<boolean> {
  const safeFilename = (filename || `${title}.pdf`)
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\.pdf\.pdf$/i, '.pdf');

  const executeBlobDownload = (blob: Blob, name: string) => {
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = name.endsWith('.pdf') ? name : `${name}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 4000);
  };

  // 1. Check local IndexedDB or Cloud Firestore chunks
  try {
    const stored = await getPdfBlob(bookId);
    if (stored && stored.blob) {
      executeBlobDownload(stored.blob, stored.filename || safeFilename);
      return true;
    }
  } catch (err) {
    console.warn('PDF blob check error:', err);
  }

  // 2. Try fetching external PDF URL as Blob (bypasses cross-origin download blocking on mobile)
  if (externalPdfUrl && !externalPdfUrl.startsWith('blob:')) {
    try {
      const response = await fetch(externalPdfUrl, { mode: 'cors' });
      if (response.ok) {
        const fetchedBlob = await response.blob();
        executeBlobDownload(fetchedBlob, safeFilename);
        return true;
      }
    } catch {
      // CORS or network error, proceed to fallback
    }
  }

  // 3. If book has pages or data, generate authentic PDF on-the-fly using jsPDF!
  if (book) {
    try {
      const generatedBlob = await generateBookPdfBlob(book);
      executeBlobDownload(generatedBlob, safeFilename);
      return true;
    } catch (err) {
      console.warn('On-the-fly PDF generation error:', err);
    }
  }

  // 4. Fallback: Open external link in new tab if reachable
  if (externalPdfUrl && !externalPdfUrl.startsWith('blob:')) {
    window.open(externalPdfUrl, '_blank', 'noopener,noreferrer');
    return true;
  }

  return false;
}

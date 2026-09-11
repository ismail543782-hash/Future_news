/**
 * fileStorage.ts
 * IndexedDB storage engine for uploaded PDF books & high-performance image compression
 */

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
 * Retrieve stored PDF Blob and metadata by bookId
 */
export async function getPdfBlob(
  bookId: string
): Promise<{ blob: Blob; filename: string; size: number } | null> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PDFS, 'readonly');
      const store = tx.objectStore(STORE_PDFS);
      const req = store.get(bookId);

      req.onsuccess = () => {
        const result = req.result as StoredPdfRecord | undefined;
        if (result && result.blob) {
          resolve({
            blob: result.blob,
            filename: result.filename,
            size: result.size,
          });
        } else {
          resolve(null);
        }
      };

      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to get PDF from IndexedDB:', err);
    return null;
  }
}

/**
 * Delete a PDF blob from IndexedDB
 */
export async function deletePdfBlob(bookId: string): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PDFS, 'readwrite');
      const store = tx.objectStore(STORE_PDFS);
      const req = store.delete(bookId);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to delete PDF from IndexedDB:', err);
  }
}

// Keep active Object URLs in memory for disposal
const activeObjectUrls = new Map<string, string>();

/**
 * Get an active Object URL for a book's PDF (either from IndexedDB or Data URL)
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
 * to an optimal in-browser embeddable viewer URL
 */
export function normalizePdfViewerUrl(rawUrl: string): {
  embedUrl: string;
  isGoogleDrive: boolean;
  canEmbed: boolean;
} {
  if (!rawUrl) return { embedUrl: '', isGoogleDrive: false, canEmbed: false };

  const trimmed = rawUrl.trim();

  // 1. Google Drive Share Link Converter
  // e.g. https://drive.google.com/file/d/1A2B3C4D5E/view?usp=sharing
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
      embedUrl: directDropbox,
      isGoogleDrive: false,
      canEmbed: true,
    };
  }

  // 3. Data URL or Blob URL or direct PDF
  return {
    embedUrl: trimmed,
    isGoogleDrive: false,
    canEmbed: true,
  };
}

/**
 * Compress and scale an uploaded cover image file (JPEG/PNG/WebP) using an HTML5 Canvas.
 * Keeps aspect ratio, reduces a multi-megabyte photo to ~80-150KB Data URL.
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

        // Draw image smoothly
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to webp or jpeg Data URL
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
 * Trigger browser download for a PDF book
 */
export async function downloadBookPdf(
  bookId: string,
  title: string,
  externalPdfUrl?: string,
  filename?: string
): Promise<void> {
  const safeFilename = (filename || `${title}.pdf`).replace(/[\\/:*?"<>|]/g, '_');

  // Check if we have an uploaded blob in IndexedDB
  const stored = await getPdfBlob(bookId);
  if (stored && stored.blob) {
    const blobUrl = URL.createObjectURL(stored.blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = stored.filename || safeFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    return;
  }

  // Otherwise, use the external PDF URL
  if (externalPdfUrl) {
    const a = document.createElement('a');
    a.href = externalPdfUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.download = safeFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

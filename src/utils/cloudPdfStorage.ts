import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, orderBy, query } from 'firebase/firestore';
import { db } from '../services/firebase';

const BOOK_FILES_COLLECTION = 'book_files';
const CHUNKS_SUBCOLLECTION = 'chunks';
const CHUNK_SIZE_BYTES = 350 * 1024; // ~350KB per chunk (safe within Firestore 1MB document limit)

/**
 * Convert a Blob or File to Base64 string
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // remove data:application/pdf;base64, prefix if present
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Convert Base64 string back to a PDF Blob
 */
function base64ToBlob(base64: string, mimeType = 'application/pdf'): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Save PDF to Cloud Firestore chunked storage
 * Allows PDF files up to 10MB to sync seamlessly to mobile devices & other browsers
 */
export async function savePdfToCloudChunks(
  bookId: string,
  fileOrBlob: Blob | File,
  filename: string
): Promise<boolean> {
  try {
    const base64Data = await blobToBase64(fileOrBlob);
    const totalChars = base64Data.length;
    const totalChunks = Math.ceil(totalChars / CHUNK_SIZE_BYTES);

    console.log(`Uploading PDF "${filename}" to Cloud Firestore in ${totalChunks} chunks...`);

    // 1. Save metadata manifest
    const manifestRef = doc(db, BOOK_FILES_COLLECTION, bookId);
    await setDoc(
      manifestRef,
      {
        bookId,
        filename,
        size: fileOrBlob.size,
        totalChunks,
        mimeType: 'application/pdf',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // 2. Upload chunks in parallel batches of 3
    const chunksCol = collection(db, BOOK_FILES_COLLECTION, bookId, CHUNKS_SUBCOLLECTION);
    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE_BYTES;
      const end = Math.min(start + CHUNK_SIZE_BYTES, totalChars);
      const chunkStr = base64Data.substring(start, end);

      const chunkDocRef = doc(chunksCol, `chunk_${String(i).padStart(4, '0')}`);
      await setDoc(chunkDocRef, {
        chunkIndex: i,
        data: chunkStr,
      });
    }

    console.log(`PDF "${filename}" successfully stored in Cloud Firestore.`);
    return true;
  } catch (err) {
    console.error('Failed to save PDF chunks to Cloud Firestore:', err);
    return false;
  }
}

/**
 * Retrieve PDF from Cloud Firestore chunked storage
 */
export async function getPdfFromCloudChunks(
  bookId: string
): Promise<{ blob: Blob; filename: string; size: number } | null> {
  try {
    const manifestRef = doc(db, BOOK_FILES_COLLECTION, bookId);
    const manifestSnap = await getDoc(manifestRef);

    if (!manifestSnap.exists()) {
      return null;
    }

    const manifest = manifestSnap.data();
    const totalChunks = manifest?.totalChunks || 0;
    const filename = manifest?.filename || `book-${bookId}.pdf`;
    const size = manifest?.size || 0;

    if (totalChunks === 0) {
      return null;
    }

    const chunksCol = collection(db, BOOK_FILES_COLLECTION, bookId, CHUNKS_SUBCOLLECTION);
    const q = query(chunksCol, orderBy('chunkIndex', 'asc'));
    const chunkSnaps = await getDocs(q);

    if (chunkSnaps.empty) {
      return null;
    }

    let fullBase64 = '';
    chunkSnaps.forEach((d) => {
      const c = d.data();
      if (c && typeof c.data === 'string') {
        fullBase64 += c.data;
      }
    });

    if (!fullBase64) {
      return null;
    }

    const blob = base64ToBlob(fullBase64, 'application/pdf');
    return { blob, filename, size };
  } catch (err) {
    console.warn('Failed to retrieve PDF chunks from Cloud Firestore:', err);
    return null;
  }
}

/**
 * Delete PDF chunks from Cloud Firestore
 */
export async function deletePdfFromCloudChunks(bookId: string): Promise<void> {
  try {
    const manifestRef = doc(db, BOOK_FILES_COLLECTION, bookId);
    const chunksCol = collection(db, BOOK_FILES_COLLECTION, bookId, CHUNKS_SUBCOLLECTION);
    const chunkSnaps = await getDocs(chunksCol);

    for (const snap of chunkSnaps.docs) {
      await deleteDoc(snap.ref);
    }
    await deleteDoc(manifestRef);
  } catch (err) {
    console.warn('Failed to delete PDF chunks from Cloud Firestore:', err);
  }
}

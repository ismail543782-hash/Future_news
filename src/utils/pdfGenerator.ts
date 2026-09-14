import { jsPDF } from 'jspdf';
import { Book } from '../types/news';

/**
 * Generate an authentic downloadable PDF document for a Book on the fly.
 * Works seamlessly on mobile devices (Android Chrome, iOS Safari) and desktops.
 */
export async function generateBookPdfBlob(book: Book): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  // 1. Cover Page
  // Header bar
  doc.setFillColor(225, 29, 72); // Rose-600
  doc.rect(0, 0, pageWidth, 16, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('FUTURE NEWS DIGITAL E-LIBRARY', margin, 11);

  // Title
  let currentY = 50;
  doc.setTextColor(28, 25, 23); // Stone-900
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(book.title, contentWidth);
  doc.text(titleLines, margin, currentY);
  currentY += titleLines.length * 9 + 8;

  // Author & Category
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(87, 83, 78);
  doc.text(`Author / Publisher: ${book.author}`, margin, currentY);
  currentY += 7;
  doc.text(`Category: ${book.category_bn || book.category} | Published: ${book.published_year || '2026'}`, margin, currentY);
  currentY += 14;

  // Horizontal line
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 12;

  // Book Synopsis
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(225, 29, 72);
  doc.text('Book Synopsis / Overview', margin, currentY);
  currentY += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(41, 37, 36);
  const descLines = doc.splitTextToSize(book.description || '', contentWidth);
  doc.text(descLines, margin, currentY);
  currentY += descLines.length * 6 + 14;

  // Footer Note on Cover
  doc.setFontSize(9);
  doc.setTextColor(120, 113, 108);
  doc.text(
    'Published by Future News & Digital Publishing Hub • Verified E-Book Edition',
    margin,
    pageHeight - 15
  );

  // 2. Chapters & Pages
  if (book.pages && book.pages.length > 0) {
    for (let i = 0; i < book.pages.length; i++) {
      const page = book.pages[i];
      doc.addPage();

      // Top running header
      doc.setFillColor(245, 245, 244);
      doc.rect(0, 0, pageWidth, 12, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(120, 113, 108);
      doc.text(book.title.substring(0, 50), margin, 8);
      doc.text(`Page ${page.page_number}`, pageWidth - margin - 15, 8);

      let pageY = 25;

      // Chapter Title
      if (page.chapter_title) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(225, 29, 72);
        const chTitleLines = doc.splitTextToSize(page.chapter_title, contentWidth);
        doc.text(chTitleLines, margin, pageY);
        pageY += chTitleLines.length * 7 + 6;

        doc.setDrawColor(244, 63, 94);
        doc.setLineWidth(0.5);
        doc.line(margin, pageY - 3, margin + 40, pageY - 3);
        pageY += 4;
      }

      // Chapter Content
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(41, 37, 36);

      const paragraphs = page.content.split(/\n\n+/);
      for (const para of paragraphs) {
        const cleanPara = para.trim();
        if (!cleanPara) continue;

        const lines = doc.splitTextToSize(cleanPara, contentWidth);
        const paraHeight = lines.length * 5.5;

        // Check if paragraph exceeds page bottom
        if (pageY + paraHeight > pageHeight - 20) {
          doc.addPage();
          pageY = 25;
        }

        doc.text(lines, margin, pageY);
        pageY += paraHeight + 5;
      }

      // Page footer
      doc.setFontSize(8);
      doc.setTextColor(168, 162, 158);
      doc.text(
        `Future News E-Library • ${book.title}`,
        margin,
        pageHeight - 10
      );
      doc.text(
        `${i + 1} / ${book.pages.length}`,
        pageWidth - margin - 10,
        pageHeight - 10
      );
    }
  }

  return doc.output('blob');
}

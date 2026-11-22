import { jsPDF } from 'jspdf';
import type { Quiz, QuizQuestionItem } from '../types';

export interface GeneratedPdfResult {
  doc: jsPDF;
  blob: Blob;
  blobUrl: string;
  filename: string;
  totalPages: number;
}

/**
 * SkillNova Quiz PDF Generator
 * Creates an authentic, professional LMS study guide PDF with SkillNova branding,
 * repeated subtle diagonal watermarks on every page, page numbers (Page X of Y),
 * clean option lists, and full question explanations.
 */
export function generateQuizPdf(quiz: Quiz): GeneratedPdfResult {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm

  const marginLeft = 16;
  const marginRight = 16;
  const marginTop = 24;
  const marginBottom = 20;
  const contentWidth = pageWidth - marginLeft - marginRight; // 178mm

  const questions: QuizQuestionItem[] = quiz.questions || [];

  // Helper: Draw subtle diagonal SkillNova watermark across page
  const drawPageWatermark = () => {
    doc.saveGraphicsState();
    // Very faint cyan-blue tone with low alpha for seamless readability
    try {
      doc.setGState(new (doc as any).GState({ opacity: 0.06 }));
    } catch {
      // Fallback if GState unsupported
      doc.setTextColor(220, 235, 250);
    }
    doc.setTextColor(0, 168, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(44);

    // Repeated diagonal watermarks across page
    const watermarks = [
      { x: pageWidth * 0.25, y: pageHeight * 0.28 },
      { x: pageWidth * 0.5, y: pageHeight * 0.52 },
      { x: pageWidth * 0.75, y: pageHeight * 0.76 },
    ];

    watermarks.forEach(wm => {
      doc.text('SkillNova', wm.x, wm.y, {
        angle: -35,
        align: 'center',
      });
    });

    doc.restoreGraphicsState();
  };

  // Helper: Draw Header on page
  const drawPageHeader = (pageNum: number) => {
    doc.saveGraphicsState();
    // SkillNova Brand Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(23, 107, 255); // Electric Blue #176BFF
    doc.text('SKILLNOVA LEARNING PLATFORM', marginLeft, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      quiz.course_title ? `${quiz.course_title} • Study Material` : 'Official Question Bank & Detailed Explanations',
      pageWidth - marginRight,
      12,
      { align: 'right' }
    );

    // Top thin divider
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(marginLeft, 15, pageWidth - marginRight, 15);
    doc.restoreGraphicsState();
  };

  // Helper: Draw Footer on page
  const drawPageFooter = (pageNum: number, totalPages: number) => {
    doc.saveGraphicsState();
    const footerY = pageHeight - 10;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(marginLeft, footerY - 4, pageWidth - marginRight, footerY - 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('SkillNova Engineering Cohort • Confidential & Verified Study Resource', marginLeft, footerY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - marginRight, footerY, { align: 'right' });
    doc.restoreGraphicsState();
  };

  // Start with First Page
  let currentY = marginTop;

  // Title Banner on Page 1
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // Slate 900
  const titleLines = doc.splitTextToSize(quiz.title, contentWidth);
  doc.text(titleLines, marginLeft, currentY);
  currentY += titleLines.length * 7 + 2;

  // Metadata Strip (Marks, Duration, Total Questions)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  const metadataText = `Total Questions: ${questions.length}   |   Total Marks: ${quiz.total_marks || 10}   |   Duration: ${quiz.duration_minutes || 15} mins   |   Status: Evaluated`;
  doc.text(metadataText, marginLeft, currentY);
  currentY += 5;

  if (quiz.description) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    const descLines = doc.splitTextToSize(quiz.description, contentWidth);
    doc.text(descLines, marginLeft, currentY);
    currentY += descLines.length * 4.5 + 3;
  }

  // Divider below title
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(marginLeft, currentY, pageWidth - marginRight, currentY);
  currentY += 7;

  // Render Questions
  questions.forEach((q, idx) => {
    const qNum = idx + 1;
    const marksText = `(${q.marks || 1} Mark${(q.marks || 1) > 1 ? 's' : ''})`;

    // Compute estimated height for question block to avoid awkward cutoffs
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    const qHeader = `Q${qNum}. ${q.question}`;
    const qLines = doc.splitTextToSize(qHeader, contentWidth - 25);
    const qHeaderHeight = qLines.length * 5 + 3;

    // Options height
    const options = q.options || [];
    let optionsHeight = 0;
    options.forEach(opt => {
      const optText = typeof opt === 'string' ? opt : `${opt.key}. ${opt.text}`;
      const optLines = doc.splitTextToSize(optText, contentWidth - 10);
      optionsHeight += optLines.length * 4.5 + 2;
    });

    // Explanation height
    let explanationHeight = 0;
    let explLines: string[] = [];
    if (q.explanation) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      explLines = doc.splitTextToSize(`Explanation: ${q.explanation}`, contentWidth - 10);
      explanationHeight = explLines.length * 4.2 + 8;
    }

    const totalQuestionBlockHeight = qHeaderHeight + optionsHeight + explanationHeight + 8;

    // Check if new page is needed before printing question
    if (currentY + totalQuestionBlockHeight > pageHeight - marginBottom) {
      doc.addPage();
      currentY = marginTop;
    }

    // Question Number & Text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.text(qLines, marginLeft, currentY);

    // Marks tag on right
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(23, 107, 255); // Blue
    doc.text(marksText, pageWidth - marginRight, currentY, { align: 'right' });

    currentY += qHeaderHeight;

    // Render Answer Options
    const rawCorrect = (q.correct_answer || '').trim().toUpperCase();

    options.forEach((opt, optIdx) => {
      let optKey = String.fromCharCode(65 + optIdx);
      let optBody = '';

      if (typeof opt === 'string') {
        optBody = opt;
      } else {
        optKey = opt.key || optKey;
        optBody = opt.text;
      }

      const isCorrect =
        optKey.toUpperCase() === rawCorrect ||
        rawCorrect === optBody.trim().toUpperCase() ||
        (rawCorrect.length === 1 && optKey.toUpperCase() === rawCorrect);

      // Check if option fits current page
      if (currentY + 6 > pageHeight - marginBottom) {
        doc.addPage();
        currentY = marginTop;
      }

      if (isCorrect) {
        // Highlight correct option with light green card & checkmark
        doc.setFillColor(240, 253, 244); // light green bg #F0FDF4
        doc.setDrawColor(34, 197, 94); // green-500 border
        doc.setLineWidth(0.3);
        const optText = `${optKey}. ${optBody}  [CORRECT ANSWER]`;
        const optLines = doc.splitTextToSize(optText, contentWidth - 12);
        const blockH = optLines.length * 4.5 + 3;

        doc.roundedRect(marginLeft, currentY - 3.5, contentWidth, blockH, 1.5, 1.5, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(21, 128, 61); // emerald-700
        doc.text(optLines, marginLeft + 3, currentY);
        currentY += blockH + 1.5;
      } else {
        // Regular option
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(51, 65, 85); // Slate 700
        const optText = `${optKey}. ${optBody}`;
        const optLines = doc.splitTextToSize(optText, contentWidth - 6);
        doc.text(optLines, marginLeft + 3, currentY);
        currentY += optLines.length * 4.5 + 1.5;
      }
    });

    // Render Explanation Block
    if (q.explanation && explLines.length > 0) {
      // Check if explanation fits
      if (currentY + explanationHeight > pageHeight - marginBottom) {
        doc.addPage();
        currentY = marginTop;
      }

      doc.setFillColor(248, 250, 252); // slate-50 #F8FAFC
      doc.setDrawColor(226, 232, 240); // slate-200 border
      doc.setLineWidth(0.2);

      const expBoxH = explLines.length * 4.2 + 5;
      doc.roundedRect(marginLeft, currentY, contentWidth, expBoxH, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105); // slate-600
      doc.text(explLines, marginLeft + 3, currentY + 4);

      currentY += expBoxH + 4;
    }

    // Space after question
    currentY += 4;
  });

  // Second pass: Draw Header, Footer, and Watermark on all pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawPageWatermark();
    drawPageHeader(p);
    drawPageFooter(p, totalPages);
  }

  const cleanTitle = (quiz.title || 'SkillNova-Quiz')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const filename = `${cleanTitle}-questions-solutions.pdf`;

  const blob = doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);

  return {
    doc,
    blob,
    blobUrl,
    filename,
    totalPages,
  };
}

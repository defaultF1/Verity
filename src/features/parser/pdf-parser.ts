// PDF parsing with OCR fallback for scanned/image-based PDFs
// This module dynamically imports pdfjs-dist to avoid SSR issues

import { extractTextFromMultipleImages, type OCRProgress } from './ocr-parser';

export interface PDFParseResult {
    text: string;
    pages: number;
    wordCount: number;
    isScanned: boolean;
    metadata?: {
        title?: string;
        author?: string;
        creationDate?: string;
    };
    ocrConfidence?: number;
    parseMethod: 'text' | 'ocr';
}

/**
 * Render a PDF page to a canvas and return as Blob
 */
async function renderPageToImage(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pdf: any,
    pageNum: number,
    scale: number = 2.0 // Higher scale = better OCR quality
): Promise<Blob> {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const context = canvas.getContext('2d');
    if (!context) {
        throw new Error('Failed to create canvas context');
    }

    // Render PDF page to canvas
    await page.render({
        canvasContext: context,
        viewport: viewport
    }).promise;

    // Convert canvas to blob
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob);
            } else {
                reject(new Error('Failed to convert canvas to blob'));
            }
        }, 'image/png');
    });
}

/**
 * Parse a PDF file and extract text content
 * Uses OCR fallback for scanned/image-based PDFs
 * Runs entirely client-side - document never leaves the browser
 */
export async function parsePDF(
    file: File,
    onOCRProgress?: (progress: OCRProgress) => void
): Promise<PDFParseResult> {
    // Dynamically import PDF.js only on client side
    const pdfjsLib = await import('pdfjs-dist');

    // Set up the worker to use local file (copied to public directory)
    if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    }

    let pdf: Awaited<ReturnType<typeof pdfjsLib.getDocument>['promise']>;

    try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });

        // Add timeout for PDF loading (30 seconds)
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('PDF loading timed out. The file may be too large or corrupted.')), 30000);
        });

        pdf = await Promise.race([loadingTask.promise, timeoutPromise]);
    } catch (error) {
        // Handle specific PDF.js errors
        if (error instanceof Error) {
            const message = error.message.toLowerCase();

            if (message.includes('invalid pdf') || message.includes('missing pdf')) {
                throw new Error('This file is not a valid PDF document. Please check the file and try again.');
            }
            if (message.includes('encrypted') || message.includes('password')) {
                throw new Error('This PDF is password protected. Please provide an unencrypted file.');
            }
            if (message.includes('timeout')) {
                throw error;
            }
            if (message.includes('worker')) {
                throw new Error('Failed to initialize PDF reader. Please refresh the page and try again.');
            }

            throw new Error(`Failed to read PDF: ${error.message}`);
        }
        throw new Error('Failed to read PDF file. Please try again or use a different file.');
    }

    let fullText = '';
    let hasTextContent = false;

    // First pass: Try to extract text directly
    try {
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();

            const pageText = textContent.items
                .map((item) => {
                    if ('str' in item) {
                        return item.str;
                    }
                    return '';
                })
                .join(' ');

            if (pageText.trim().length > 0) {
                hasTextContent = true;
            }

            fullText += pageText + '\n\n';
        }
    } catch (error) {
        console.warn('Text extraction failed, will try OCR:', error);
    }

    // Clean up the extracted text
    let cleanedText = fullText
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n\n')
        .trim();

    // Count words
    let wordCount = cleanedText.split(/\s+/).filter(word => word.length > 0).length;

    // Check if this is a scanned/image-based PDF (little to no text extracted)
    const isScanned = !hasTextContent || wordCount < 50;
    let ocrConfidence: number | undefined;
    let parseMethod: 'text' | 'ocr' = 'text';

    // If scanned, use OCR to extract text
    if (isScanned && typeof window !== 'undefined') {
        onOCRProgress?.({ status: 'Detected image-based PDF, starting OCR...', progress: 0.1 });

        try {
            // Render all pages to images
            const imageBlobs: Blob[] = [];

            for (let i = 1; i <= pdf.numPages; i++) {
                onOCRProgress?.({
                    status: `Rendering page ${i} of ${pdf.numPages}...`,
                    progress: 0.1 + (0.3 * i / pdf.numPages)
                });

                const blob = await renderPageToImage(pdf, i);
                imageBlobs.push(blob);
            }

            onOCRProgress?.({ status: 'Running OCR on rendered pages...', progress: 0.4 });

            // Run OCR on all page images
            const ocrResult = await extractTextFromMultipleImages(imageBlobs, (progress) => {
                onOCRProgress?.({
                    status: progress.status,
                    progress: 0.4 + (0.5 * progress.progress)
                });
            });

            // Use OCR text if it has meaningful content
            if (ocrResult.wordCount > wordCount) {
                cleanedText = ocrResult.text;
                wordCount = ocrResult.wordCount;
                ocrConfidence = ocrResult.confidence;
                parseMethod = 'ocr';
            }

            onOCRProgress?.({ status: 'OCR complete', progress: 1 });

        } catch (ocrError) {
            console.error('OCR failed:', ocrError);
            // Continue with whatever text we have
            throw new Error(
                'This PDF contains images instead of text. OCR processing failed. ' +
                'Please try uploading a text-based PDF or a clearer image.'
            );
        }
    }

    // Get metadata if available
    let metadata = {};
    try {
        const info = await pdf.getMetadata();
        if (info.info) {
            metadata = {
                title: (info.info as Record<string, unknown>).Title as string || undefined,
                author: (info.info as Record<string, unknown>).Author as string || undefined,
                creationDate: (info.info as Record<string, unknown>).CreationDate as string || undefined,
            };
        }
    } catch {
        // Metadata not available
    }

    // Final check: if still no meaningful text, throw an error
    if (wordCount < 10) {
        throw new Error(
            'Could not extract text from this PDF. It may be empty, corrupted, or contain only images that could not be processed.'
        );
    }

    return {
        text: cleanedText,
        pages: pdf.numPages,
        wordCount,
        isScanned,
        metadata,
        ocrConfidence,
        parseMethod,
    };
}

/**
 * Check if a file is a valid PDF
 */
export function isValidPDF(file: File): boolean {
    return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

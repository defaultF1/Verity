import { parsePDF, type PDFParseResult } from './pdf-parser';
import { parseDocx, isDocxFile, type DocxParseResult } from './docx-parser';
import {
    extractTextFromImage,
    isSupportedImageType,
    type OCRResult,
    type OCRProgress
} from './ocr-parser';

export interface UnifiedParseResult {
    text: string;
    wordCount: number;
    pages: number;
    structure?: string[];
    parseMethod: 'pdf' | 'docx' | 'ocr' | 'text';
    confidence?: number;
    isScanned?: boolean;
    ocrProcessingTime?: number;
}

/**
 * Unified document parser that handles multiple file types
 */
export async function parseDocument(
    file: File,
    onOCRProgress?: (progress: OCRProgress) => void
): Promise<UnifiedParseResult> {
    const fileName = file.name.toLowerCase();
    const fileType = file.type;

    // Handle PDF files
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        const result = await parsePDF(file, onOCRProgress);

        // parseMethod will be 'text' for regular PDFs or 'ocr' for image-based PDFs
        return {
            text: result.text,
            wordCount: result.wordCount,
            pages: result.pages,
            parseMethod: result.parseMethod === 'ocr' ? 'ocr' : 'pdf',
            isScanned: result.isScanned,
            confidence: result.ocrConfidence,
        };
    }

    // Handle DOCX files
    if (isDocxFile(file)) {
        const result = await parseDocx(file);
        return {
            text: result.text,
            wordCount: result.wordCount,
            pages: result.pages,
            structure: result.structure,
            parseMethod: 'docx',
        };
    }

    // Handle images with OCR
    if (fileType.startsWith('image/') || fileName.match(/\.(png|jpg|jpeg|gif|bmp|tiff|webp)$/)) {
        if (!isSupportedImageType(file)) {
            throw new Error('Unsupported image format. Please use PNG, JPEG, BMP, TIFF, or WebP.');
        }

        onOCRProgress?.({ status: 'Initializing OCR engine...', progress: 0 });

        const ocrResult: OCRResult = await extractTextFromImage(file, onOCRProgress);

        // Check confidence threshold
        if (ocrResult.confidence < 40) {
            throw new Error(
                `OCR confidence too low (${Math.round(ocrResult.confidence)}%). ` +
                'Please ensure the image is clear, well-lit, and properly aligned.'
            );
        }

        return {
            text: ocrResult.text,
            wordCount: ocrResult.wordCount,
            pages: 1, // Single image = 1 page
            parseMethod: 'ocr',
            confidence: ocrResult.confidence,
            isScanned: true,
            ocrProcessingTime: ocrResult.processingTime,
        };
    }

    // Handle plain text
    if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
        const text = await file.text();
        const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
        return {
            text,
            wordCount,
            pages: Math.max(1, Math.ceil(wordCount / 500)),
            parseMethod: 'text',
        };
    }

    throw new Error(
        'Unsupported file format. Please upload a PDF, Word (.docx), image (PNG/JPG), or text file.'
    );
}

/**
 * Check if file type is supported
 */
export function isSupportedFile(file: File): boolean {
    const fileName = file.name.toLowerCase();
    const fileType = file.type;

    return (
        fileType === 'application/pdf' ||
        fileName.endsWith('.pdf') ||
        isDocxFile(file) ||
        fileType === 'text/plain' ||
        fileName.endsWith('.txt') ||
        isSupportedImageType(file) ||
        fileName.match(/\.(png|jpg|jpeg|bmp|tiff|webp)$/) !== null
    );
}

/**
 * Get accepted file types string for input
 */
export const ACCEPTED_FILE_TYPES =
    '.pdf,.docx,.txt,.png,.jpg,.jpeg,.bmp,.tiff,.webp,' +
    'application/pdf,' +
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document,' +
    'text/plain,' +
    'image/png,image/jpeg,image/bmp,image/tiff,image/webp';

/**
 * Get user-friendly file type description
 */
export function getFileTypeDescription(file: File): string {
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.pdf')) return 'PDF Document';
    if (fileName.endsWith('.docx')) return 'Word Document';
    if (fileName.endsWith('.txt')) return 'Text File';
    if (file.type.startsWith('image/')) return 'Image (OCR)';

    return 'Document';
}

/**
 * Estimate processing time based on file type and size
 */
export function estimateProcessingTime(file: File): string {
    const sizeMB = file.size / (1024 * 1024);

    if (file.type.startsWith('image/')) {
        // OCR: ~10-30 seconds per image
        return '15-30 seconds (OCR)';
    }

    if (sizeMB > 5) {
        return '10-20 seconds';
    }

    return '2-5 seconds';
}

// Re-export types for convenience
export type { PDFParseResult, DocxParseResult, OCRResult, OCRProgress };


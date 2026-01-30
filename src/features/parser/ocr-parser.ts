/**
 * OCR Parser using Tesseract.js
 * 
 * Handles text extraction from scanned PDFs and images.
 * Supports Hindi (hin) and English (eng) languages.
 */

import { createWorker, OEM, PSM } from 'tesseract.js';

export interface OCRResult {
    text: string;
    confidence: number;
    wordCount: number;
    language: string;
    processingTime: number;
}

export interface OCRProgress {
    status: string;
    progress: number;
}

/**
 * Extract text from an image file
 */
export async function extractTextFromImage(
    imageFile: File,
    onProgress?: (progress: OCRProgress) => void
): Promise<OCRResult> {
    const startTime = Date.now();

    onProgress?.({ status: 'Initializing OCR engine...', progress: 0.1 });

    // Create worker with English + Hindi language support
    const worker = await createWorker('eng+hin', OEM.LSTM_ONLY, {
        logger: (m: { status: string; progress: number }) => {
            onProgress?.({
                status: m.status,
                progress: m.progress
            });
        },
    });

    onProgress?.({ status: 'Processing image...', progress: 0.3 });

    // Convert file to data URL for Tesseract
    const imageUrl = await fileToDataUrl(imageFile);

    // Set parameters for contract-optimized recognition
    await worker.setParameters({
        tessedit_pageseg_mode: PSM.AUTO_OSD, // Automatic with orientation detection
    });

    onProgress?.({ status: 'Extracting text...', progress: 0.5 });

    // Recognize text
    const result = await worker.recognize(imageUrl);

    // Clean up worker
    await worker.terminate();

    const processingTime = Date.now() - startTime;

    // Extract text and confidence
    const text = result.data.text.trim();
    const confidence = result.data.confidence;
    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;

    // Detect primary language
    const hindiPattern = /[\u0900-\u097F]/; // Devanagari Unicode range
    const hasHindi = hindiPattern.test(text);
    const language = hasHindi ? 'hin+eng' : 'eng';

    onProgress?.({ status: 'Complete', progress: 1 });

    return {
        text,
        confidence,
        wordCount,
        language,
        processingTime,
    };
}

/**
 * Extract text from a scanned PDF (rendered as images)
 * This requires the PDF to be pre-rendered to images
 */
export async function extractTextFromPDFImage(
    imageBlob: Blob,
    pageNumber: number,
    onProgress?: (progress: OCRProgress) => void
): Promise<OCRResult> {
    // Convert blob to file
    const file = new File([imageBlob], `page-${pageNumber}.png`, { type: 'image/png' });
    return extractTextFromImage(file, onProgress);
}

/**
 * Process multiple images (from a multi-page scanned PDF)
 */
export async function extractTextFromMultipleImages(
    imageBlobs: Blob[],
    onProgress?: (progress: OCRProgress) => void
): Promise<OCRResult> {
    const startTime = Date.now();
    const results: OCRResult[] = [];

    for (let i = 0; i < imageBlobs.length; i++) {
        onProgress?.({
            status: `Processing page ${i + 1} of ${imageBlobs.length}`,
            progress: i / imageBlobs.length,
        });

        const result = await extractTextFromPDFImage(imageBlobs[i], i + 1);
        results.push(result);
    }

    // Combine results
    const combinedText = results.map(r => r.text).join('\n\n--- Page Break ---\n\n');
    const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
    const totalWordCount = results.reduce((sum, r) => sum + r.wordCount, 0);
    const processingTime = Date.now() - startTime;

    return {
        text: combinedText,
        confidence: avgConfidence,
        wordCount: totalWordCount,
        language: results[0]?.language || 'eng',
        processingTime,
    };
}

/**
 * Convert File to Data URL
 */
function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Check if a file is a supported image type
 */
export function isSupportedImageType(file: File): boolean {
    const supportedTypes = [
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/bmp',
        'image/tiff',
        'image/webp',
    ];
    return supportedTypes.includes(file.type);
}

/**
 * Check if text extraction quality is acceptable
 */
export function isConfidenceAcceptable(confidence: number): boolean {
    // Tesseract confidence: 0-100
    // Below 60 is usually too noisy to be reliable
    return confidence >= 60;
}

/**
 * Pre-process hint for the UI
 */
export function getOCRProcessingHint(): string {
    return 'OCR processing may take 10-30 seconds per page. For best results, ensure the document is well-lit and properly aligned.';
}


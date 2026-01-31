/**
 * OCR Parser using Tesseract.js
 * 
 * Handles text extraction from scanned PDFs and images.
 * Supports multiple Indic languages.
 */

import { createWorker, OEM, PSM } from 'tesseract.js';

export type SupportedLanguage = 'eng' | 'hin' | 'ben' | 'ori' | 'tel' | 'tam' | 'kan' | 'mal' | 'auto';

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
    auto: 'Auto-Detect Language',
    eng: 'English',
    hin: 'Hindi (हिंदी)',
    ben: 'Bengali (বাংলা)',
    ori: 'Odia (ଓଡ଼ିଆ)',
    tel: 'Telugu (తెలుగు)',
    tam: 'Tamil (தமிழ்)',
    kan: 'Kannada (ಕನ್ನಡ)',
    mal: 'Malayalam (മലയാളം)',
};

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
    onProgress?: (progress: OCRProgress) => void,
    language: SupportedLanguage = 'eng'
): Promise<OCRResult> {
    const startTime = Date.now();

    onProgress?.({ status: `Initializing OCR engine for ${LANGUAGE_LABELS[language]}...`, progress: 0.1 });

    // Configure language string for Tesseract
    let langString = 'eng';
    if (language === 'auto') {
        // In auto mode, load major languages. 
        // Note: This increases download size but ensures fallback.
        // Tesseract uses '+' to combine languages.
        langString = 'eng+hin+kan+tam+tel+mal+ben+ori';
    } else {
        // Always include English for mixed content
        langString = language === 'eng' ? 'eng' : `${language}+eng`;
    }

    // Create worker with selected language support
    const worker = await createWorker(langString, OEM.LSTM_ONLY, {
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
 */
export async function extractTextFromPDFImage(
    imageBlob: Blob,
    pageNumber: number,
    onProgress?: (progress: OCRProgress) => void,
    language: SupportedLanguage = 'eng'
): Promise<OCRResult> {
    // Convert blob to file
    const file = new File([imageBlob], `page-${pageNumber}.png`, { type: 'image/png' });
    return extractTextFromImage(file, onProgress, language);
}

/**
 * Process multiple images (from a multi-page scanned PDF)
 */
export async function extractTextFromMultipleImages(
    imageBlobs: Blob[],
    onProgress?: (progress: OCRProgress) => void,
    language: SupportedLanguage = 'eng'
): Promise<OCRResult> {
    const startTime = Date.now();
    const results: OCRResult[] = [];

    for (let i = 0; i < imageBlobs.length; i++) {
        onProgress?.({
            status: `Processing page ${i + 1} of ${imageBlobs.length}`,
            progress: i / imageBlobs.length,
        });

        const result = await extractTextFromPDFImage(imageBlobs[i], i + 1, undefined, language);
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
    return confidence >= 60;
}

/**
 * Pre-process hint for the UI
 */
export function getOCRProcessingHint(): string {
    return 'OCR processing may take 10-30 seconds per page. Select the correct language for best results.';
}


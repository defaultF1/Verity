import { SupportedLanguage } from './ocr-parser';

/**
 * Unicode ranges for supported Indian languages
 */
const UNICODE_RANGES: Record<Exclude<SupportedLanguage, 'auto'>, [number, number]> = {
    eng: [0x0041, 0x007A], // Basic Latin (approximate check)
    hin: [0x0900, 0x097F], // Devanagari
    ben: [0x0980, 0x09FF], // Bengali
    ori: [0x0B00, 0x0B7F], // Oriya
    tel: [0x0C00, 0x0C7F], // Telugu
    tam: [0x0B80, 0x0BFF], // Tamil
    kan: [0x0C80, 0x0CFF], // Kannada
    mal: [0x0D00, 0x0D7F], // Malayalam
};

/**
 * Detect the primary language of the text based on Unicode character counts
 */
export function detectLanguage(text: string): SupportedLanguage {
    if (!text || text.trim().length === 0) return 'eng';

    const counts: Record<string, number> = {
        eng: 0,
        hin: 0,
        ben: 0,
        ori: 0,
        tel: 0,
        tam: 0,
        kan: 0,
        mal: 0
    };

    let totalChars = 0;

    // Sample first 5000 chars for efficiency
    const sample = text.slice(0, 5000);

    for (const char of sample) {
        const code = char.charCodeAt(0);

        // Skip whitespace and common punctuation
        if (code < 65 && code > 122) continue;

        let matched = false;
        for (const [lang, [start, end]] of Object.entries(UNICODE_RANGES)) {
            // Special handling for English (Latin) to avoid outliers
            if (lang === 'eng') {
                if ((code >= 0x0041 && code <= 0x005A) || (code >= 0x0061 && code <= 0x007A)) {
                    counts[lang]++;
                    matched = true;
                }
            } else {
                if (code >= start && code <= end) {
                    counts[lang]++;
                    matched = true;
                }
            }
        }
        if (matched) totalChars++;
    }

    if (totalChars === 0) return 'eng';

    // Find language with highest count
    let maxCount = 0;
    let detectedLang: SupportedLanguage = 'eng';

    for (const [lang, count] of Object.entries(counts)) {
        if (count > maxCount) {
            maxCount = count;
            detectedLang = lang as SupportedLanguage;
        }
    }

    return detectedLang;
}

/**
 * Check if the text actually contains characters of the expected language.
 * Useful for validating if PDF extraction worked correctly (or if we got garbage/English only).
 */
export function validateScriptContent(text: string, expectedLanguage: SupportedLanguage): boolean {
    if (expectedLanguage === 'eng' || expectedLanguage === 'auto') return true; // English/Auto is always "valid"

    const range = UNICODE_RANGES[expectedLanguage as Exclude<SupportedLanguage, 'auto'>];
    if (!range) return true; // Unknown language, assume valid

    let indicCharCount = 0;
    const sample = text.slice(0, 2000); // Check first 2k chars

    for (const char of sample) {
        const code = char.charCodeAt(0);
        if (code >= range[0] && code <= range[1]) {
            indicCharCount++;
        }
    }

    // specific check: if we expect Kannada but found < 5 characters, it's likely a bad extraction
    return indicCharCount > 5;
}

/**
 * Check if text looks like valid English (contains common stopwords).
 * Useful for detecting "mojibake" or broken text encoding where text is extracted but is just random symbols/letters.
 */
export function validateEnglishContent(text: string): boolean {
    if (!text || text.length < 50) return false;

    // Common English stopwords
    const stopwords = ['the', 'and', 'is', 'of', 'to', 'in', 'it', 'that', 'with', 'for', 'are', 'was', 'on', 'as'];
    const lowerText = text.toLowerCase();

    // Check if at least a few stopwords appear relative to text length
    let matchCount = 0;
    for (const word of stopwords) {
        // Use word boundary to match whole words
        if (new RegExp(`\\b${word}\\b`).test(lowerText)) {
            matchCount++;
        }
    }

    // If text is long > 100 chars, we expect at least 2 distinct stopwords
    return matchCount >= 2;
}

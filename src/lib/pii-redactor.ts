/**
 * PII Redactor - Client-side utility for redacting sensitive information
 * before sending contract text to the API.
 * 
 * This ensures Privacy by Design compliance with GDPR/DPDP Act.
 */

// Redaction patterns for Indian PII
const PII_PATTERNS = {
    // PAN Card: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)
    pan: {
        regex: /[A-Z]{5}[0-9]{4}[A-Z]/g,
        replacement: '<REDACTED_PAN>',
    },
    // Aadhaar: 12 digits, often formatted as XXXX XXXX XXXX
    aadhaar: {
        regex: /\d{4}\s?\d{4}\s?\d{4}/g,
        replacement: '<REDACTED_AADHAAR>',
    },
    // Indian Mobile: +91 followed by 10 digits, or just 10 digits starting with 6-9
    phone: {
        regex: /(\+91[\s-]?)?[6-9]\d{9}/g,
        replacement: '<REDACTED_PHONE>',
    },
    // Email addresses
    email: {
        regex: /[\w.-]+@[\w.-]+\.\w{2,}/g,
        replacement: '<REDACTED_EMAIL>',
    },
    // GST Number: 15 alphanumeric (2 state code + 10 PAN + 1 entity + 1 Z + 1 check)
    gst: {
        regex: /\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z\d]/g,
        replacement: '<REDACTED_GST>',
    },
};

export interface RedactionResult {
    redactedText: string;
    redactedCount: number;
    redactedTypes: string[];
}

/**
 * Redact PII from contract text before sending to API.
 * @param text - The raw contract text
 * @returns Object containing redacted text and metadata
 */
export function redactPII(text: string): RedactionResult {
    let redactedText = text;
    let redactedCount = 0;
    const redactedTypes: string[] = [];

    for (const [type, { regex, replacement }] of Object.entries(PII_PATTERNS)) {
        const matches = redactedText.match(regex);
        if (matches && matches.length > 0) {
            redactedCount += matches.length;
            redactedTypes.push(type);
            redactedText = redactedText.replace(regex, replacement);
        }
    }

    return {
        redactedText,
        redactedCount,
        redactedTypes,
    };
}

/**
 * Check if text contains any PII without redacting.
 * Useful for showing warnings to users.
 */
export function containsPII(text: string): boolean {
    for (const { regex } of Object.values(PII_PATTERNS)) {
        if (regex.test(text)) {
            return true;
        }
    }
    return false;
}

/**
 * Get a summary of PII types found in text.
 */
export function detectPIITypes(text: string): string[] {
    const detectedTypes: string[] = [];

    for (const [type, { regex }] of Object.entries(PII_PATTERNS)) {
        // Reset regex lastIndex for global patterns
        regex.lastIndex = 0;
        if (regex.test(text)) {
            detectedTypes.push(type);
        }
    }

    return detectedTypes;
}

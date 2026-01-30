// PII Anonymization Layer for Privacy Protection
// Removes sensitive data before sending to AI APIs

export interface AnonymizationResult {
    anonymizedText: string;
    replacements: Array<{
        type: string;
        original: string;
        replacement: string;
        count: number;
    }>;
    totalReplacements: number;
}

// Patterns for Indian PII detection
const PII_PATTERNS = {
    // PAN Card: ABCDE1234F format
    pan: {
        pattern: /[A-Z]{5}[0-9]{4}[A-Z]/g,
        replacement: '<PAN_REDACTED>',
        label: 'PAN Number',
    },

    // Aadhaar: 12 digits, often in groups of 4
    aadhaar: {
        pattern: /\d{4}[\s-]?\d{4}[\s-]?\d{4}/g,
        replacement: '<AADHAAR_REDACTED>',
        label: 'Aadhaar Number',
    },

    // Email addresses
    email: {
        pattern: /[\w.-]+@[\w.-]+\.\w+/g,
        replacement: '<EMAIL_REDACTED>',
        label: 'Email Address',
    },

    // Indian phone numbers
    phone: {
        pattern: /(\+91[\-\s]?)?[6-9]\d{9}/g,
        replacement: '<PHONE_REDACTED>',
        label: 'Phone Number',
    },

    // Indian currency amounts
    currency: {
        pattern: /(?:₹|Rs\.?|INR)\s?[\d,]+(?:\.\d{2})?/gi,
        replacement: '<AMOUNT_REDACTED>',
        label: 'Currency Amount',
    },

    // Dates in various formats
    dates: {
        pattern: /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/g,
        replacement: '<DATE_REDACTED>',
        label: 'Date',
    },

    // GSTIN (GST Number)
    gstin: {
        pattern: /\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}/g,
        replacement: '<GSTIN_REDACTED>',
        label: 'GST Number',
    },

    // Bank account numbers (10-18 digits)
    bankAccount: {
        pattern: /(?:account\s*(?:no\.?|number)?:?\s*)?(\d{10,18})/gi,
        replacement: '<BANK_ACCOUNT_REDACTED>',
        label: 'Bank Account',
    },

    // IFSC Code
    ifsc: {
        pattern: /[A-Z]{4}0[A-Z0-9]{6}/g,
        replacement: '<IFSC_REDACTED>',
        label: 'IFSC Code',
    },
};

// Names after common Indian honorifics
const HONORIFIC_NAME_PATTERN = /(?:Mr\.?|Mrs\.?|Ms\.?|Dr\.?|Shri|Smt\.?|Kumari)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g;

/**
 * Anonymize PII in contract text before sending to AI
 */
export function anonymizeText(text: string): AnonymizationResult {
    let anonymizedText = text;
    const replacements: AnonymizationResult['replacements'] = [];
    let totalReplacements = 0;

    // Process each PII pattern
    for (const [key, config] of Object.entries(PII_PATTERNS)) {
        const matches = anonymizedText.match(config.pattern);
        if (matches) {
            const uniqueMatches = [...new Set(matches)];
            const count = matches.length;

            anonymizedText = anonymizedText.replace(config.pattern, config.replacement);

            replacements.push({
                type: key,
                original: uniqueMatches.slice(0, 3).join(', ') + (uniqueMatches.length > 3 ? '...' : ''),
                replacement: config.replacement,
                count,
            });

            totalReplacements += count;
        }
    }

    // Handle names after honorifics
    const nameMatches = text.match(HONORIFIC_NAME_PATTERN);
    if (nameMatches) {
        let partyIndex = 1;
        const seenNames = new Set<string>();

        for (const match of nameMatches) {
            if (!seenNames.has(match)) {
                seenNames.add(match);
                const replacement = `<PARTY_${partyIndex}>`;
                anonymizedText = anonymizedText.replace(new RegExp(escapeRegex(match), 'g'), replacement);
                partyIndex++;
                totalReplacements++;
            }
        }

        if (seenNames.size > 0) {
            replacements.push({
                type: 'names',
                original: [...seenNames].slice(0, 3).join(', '),
                replacement: '<PARTY_X>',
                count: seenNames.size,
            });
        }
    }

    return {
        anonymizedText,
        replacements,
        totalReplacements,
    };
}

/**
 * Create a rehydration map to restore original values for display
 */
export function createRehydrationMap(result: AnonymizationResult): Map<string, string> {
    const map = new Map<string, string>();

    for (const replacement of result.replacements) {
        // Note: This is a simplified version. In production, you'd want to 
        // track individual replacements with unique IDs
        map.set(replacement.replacement, `[${replacement.type}]`);
    }

    return map;
}

/**
 * Get a summary of what was anonymized
 */
export function getAnonymizationSummary(result: AnonymizationResult): string {
    if (result.totalReplacements === 0) {
        return 'No sensitive data detected';
    }

    const items = result.replacements.map(r => `${r.count} ${r.type}`);
    return `Anonymized: ${items.join(', ')}`;
}

// Helper function to escape special regex characters
function escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

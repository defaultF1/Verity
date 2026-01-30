/**
 * Clause Extractor - Extracts clause context from contract text
 * Provides context around matched terms for display in violation cards
 */

interface ClauseContext {
    fullClause: string;
    highlightedClause: string;
    clauseNumber?: string;
    pageNumber?: number;
    startIndex: number;
    endIndex: number;
}

interface ExtractOptions {
    contextBefore?: number;  // Characters before match
    contextAfter?: number;   // Characters after match
    expandToSentence?: boolean;
    expandToClause?: boolean;
}

const DEFAULT_OPTIONS: ExtractOptions = {
    contextBefore: 150,
    contextAfter: 150,
    expandToSentence: true,
    expandToClause: true
};

/**
 * Extract context around a matched term
 */
export function extractClauseContext(
    fullText: string,
    matchedText: string,
    options: ExtractOptions = {}
): ClauseContext | null {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // Find the match (case-insensitive, fuzzy for OCR errors)
    const matchIndex = findFuzzyMatch(fullText, matchedText);

    if (matchIndex === -1) {
        return null;
    }

    let startIndex = Math.max(0, matchIndex - (opts.contextBefore || 150));
    let endIndex = Math.min(fullText.length, matchIndex + matchedText.length + (opts.contextAfter || 150));

    // Expand to sentence boundaries if requested
    if (opts.expandToSentence) {
        const sentenceStart = findSentenceStart(fullText, startIndex);
        const sentenceEnd = findSentenceEnd(fullText, endIndex);
        startIndex = sentenceStart;
        endIndex = sentenceEnd;
    }

    // Expand to clause boundaries if requested
    if (opts.expandToClause) {
        const clauseStart = findClauseStart(fullText, startIndex);
        const clauseEnd = findClauseEnd(fullText, endIndex);
        if (clauseStart !== -1) startIndex = clauseStart;
        if (clauseEnd !== -1) endIndex = clauseEnd;
    }

    const fullClause = fullText.slice(startIndex, endIndex).trim();

    // Create highlighted version with match wrapped in markers
    const relativeMatchStart = matchIndex - startIndex;
    const relativeMatchEnd = relativeMatchStart + matchedText.length;
    const highlightedClause =
        fullClause.slice(0, relativeMatchStart) +
        `<mark class="bg-danger/30 text-danger font-bold px-1 rounded">${fullClause.slice(relativeMatchStart, relativeMatchEnd)}</mark>` +
        fullClause.slice(relativeMatchEnd);

    // Try to find clause number
    const clauseNumber = findClauseNumber(fullText, startIndex);

    return {
        fullClause,
        highlightedClause,
        clauseNumber,
        startIndex,
        endIndex
    };
}

/**
 * Find a fuzzy match for OCR errors (common in scanned documents)
 */
function findFuzzyMatch(text: string, searchTerm: string): number {
    // First try exact match
    const exactIndex = text.toLowerCase().indexOf(searchTerm.toLowerCase());
    if (exactIndex !== -1) return exactIndex;

    // Try with common OCR substitutions
    const ocrVariants = generateOCRVariants(searchTerm);
    for (const variant of ocrVariants) {
        const index = text.toLowerCase().indexOf(variant.toLowerCase());
        if (index !== -1) return index;
    }

    // Try word-by-word matching for partial matches
    const words = searchTerm.split(/\s+/);
    if (words.length >= 3) {
        // Try to find at least 3 consecutive words
        for (let i = 0; i <= words.length - 3; i++) {
            const phrase = words.slice(i, i + 3).join(' ');
            const index = text.toLowerCase().indexOf(phrase.toLowerCase());
            if (index !== -1) return index;
        }
    }

    return -1;
}

/**
 * Generate common OCR error variants
 */
function generateOCRVariants(text: string): string[] {
    const substitutions: Record<string, string[]> = {
        '0': ['O', 'o'],
        'O': ['0'],
        'l': ['1', 'I', '|'],
        '1': ['l', 'I', '|'],
        'I': ['l', '1', '|'],
        'S': ['5', '$'],
        '5': ['S'],
        'B': ['8'],
        '8': ['B'],
        'rn': ['m'],
        'm': ['rn'],
    };

    const variants: string[] = [];

    for (const [original, subs] of Object.entries(substitutions)) {
        if (text.includes(original)) {
            for (const sub of subs) {
                variants.push(text.replace(new RegExp(original, 'g'), sub));
            }
        }
    }

    return variants;
}

/**
 * Find the start of the sentence containing the given index
 */
function findSentenceStart(text: string, index: number): number {
    const sentenceEnders = /[.!?]\s+/g;
    let lastEnd = 0;
    let match;

    while ((match = sentenceEnders.exec(text)) !== null) {
        if (match.index + match[0].length >= index) break;
        lastEnd = match.index + match[0].length;
    }

    return lastEnd;
}

/**
 * Find the end of the sentence containing the given index
 */
function findSentenceEnd(text: string, index: number): number {
    const sentenceEnders = /[.!?]\s+/g;
    let match;

    while ((match = sentenceEnders.exec(text)) !== null) {
        if (match.index >= index) {
            return match.index + 1;
        }
    }

    return text.length;
}

/**
 * Find the start of a legal clause (look for numbered headers)
 */
function findClauseStart(text: string, index: number): number {
    // Look for patterns like "1.", "1.1", "(a)", "Section 1", etc.
    const clausePattern = /(?:^|\n)\s*(?:\d+\.|\d+\.\d+\.?|\([a-z]\)|\([ivx]+\)|Section\s+\d+)/gi;
    let lastClauseStart = -1;
    let match;

    while ((match = clausePattern.exec(text)) !== null) {
        if (match.index >= index) break;
        lastClauseStart = match.index;
    }

    return lastClauseStart;
}

/**
 * Find the end of a legal clause
 */
function findClauseEnd(text: string, index: number): number {
    const clausePattern = /(?:^|\n)\s*(?:\d+\.|\d+\.\d+\.?|\([a-z]\)|\([ivx]+\)|Section\s+\d+)/gi;
    let match;

    // Reset regex
    clausePattern.lastIndex = index;

    while ((match = clausePattern.exec(text)) !== null) {
        return match.index;
    }

    // No next clause found, return end of text
    return text.length;
}

/**
 * Find the clause number for the given position
 */
function findClauseNumber(text: string, index: number): string | undefined {
    const clausePattern = /(?:^|\n)\s*((?:\d+\.)+|\d+\.\d+\.?|Section\s+\d+)/gi;
    let lastClause: string | undefined;
    let match;

    while ((match = clausePattern.exec(text)) !== null) {
        if (match.index >= index) break;
        lastClause = match[1].trim();
    }

    return lastClause;
}

/**
 * Extract multiple clause contexts from a document
 */
export function extractAllClauseContexts(
    fullText: string,
    matches: string[],
    options?: ExtractOptions
): Map<string, ClauseContext> {
    const results = new Map<string, ClauseContext>();

    for (const match of matches) {
        const context = extractClauseContext(fullText, match, options);
        if (context) {
            results.set(match, context);
        }
    }

    return results;
}

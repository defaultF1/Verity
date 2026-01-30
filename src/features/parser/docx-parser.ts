import mammoth from 'mammoth';

export interface DocxParseResult {
    text: string;
    wordCount: number;
    pages: number;
    structure: string[];
}

/**
 * Parse DOCX file and extract text content
 */
export async function parseDocx(file: File): Promise<DocxParseResult> {
    const arrayBuffer = await file.arrayBuffer();

    // Extract raw text
    const textResult = await mammoth.extractRawText({ arrayBuffer });
    const text = textResult.value;

    // Also get HTML for structure extraction
    const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
    const structure = extractHeadings(htmlResult.value);

    // Calculate word count
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;

    // Estimate pages (roughly 500 words per page)
    const pages = Math.max(1, Math.ceil(wordCount / 500));

    return {
        text,
        wordCount,
        pages,
        structure,
    };
}

/**
 * Extract headings from HTML for document structure
 */
function extractHeadings(html: string): string[] {
    const headingRegex = /<h[1-3][^>]*>(.*?)<\/h[1-3]>/gi;
    const headings: string[] = [];
    let match;

    while ((match = headingRegex.exec(html)) !== null) {
        // Remove any remaining HTML tags from heading text
        const cleanHeading = match[1].replace(/<[^>]*>/g, '').trim();
        if (cleanHeading) {
            headings.push(cleanHeading);
        }
    }

    return headings;
}

/**
 * Check if a file is a DOCX file
 */
export function isDocxFile(file: File): boolean {
    return (
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.name.toLowerCase().endsWith('.docx')
    );
}

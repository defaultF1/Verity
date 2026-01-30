"use client";

import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType,
    Header,
    Footer,
    BorderStyle,
    Table,
    TableRow,
    TableCell,
    WidthType,
} from 'docx';
import { saveAs } from 'file-saver';

export interface Change {
    type: 'removed' | 'added' | 'modified';
    original?: string;
    replacement?: string;
    description?: string;
}

export interface DocxMetadata {
    fileName: string;
    analysisDate: Date;
    riskScore: number;
    issuesFixed: number;
    termsModified: number;
}

// Parse the fixed contract text for changes
function parseChanges(fixedText: string): { changes: Change[] } {
    const changes: Change[] = [];

    // Extract [REMOVED: ...] blocks (using [\s\S] for ES2017 compatibility)
    const removedRegex = /\[REMOVED:\s*([\s\S]*?)\]/g;
    let match: RegExpExecArray | null;
    while ((match = removedRegex.exec(fixedText)) !== null) {
        changes.push({
            type: 'removed',
            original: match[1].trim(),
        });
    }

    // Extract [ADDED: ...] blocks
    const addedRegex = /\[ADDED:\s*([\s\S]*?)\]/g;
    while ((match = addedRegex.exec(fixedText)) !== null) {
        changes.push({
            type: 'added',
            replacement: match[1].trim(),
        });
    }

    // Extract [MODIFIED: ... → ...] blocks
    const modifiedRegex = /\[MODIFIED:\s*([\s\S]*?)\s*→\s*([\s\S]*?)\]/g;
    while ((match = modifiedRegex.exec(fixedText)) !== null) {
        changes.push({
            type: 'modified',
            original: match[1].trim(),
            replacement: match[2].trim(),
        });
    }

    return { changes };
}

// Create styled text runs for the document
function createStyledParagraph(text: string): Paragraph {
    const runs: TextRun[] = [];
    let lastIndex = 0;

    // Pattern to match all change markers (using [\s\S] for ES2017 compatibility)
    const changePattern = /\[(REMOVED|ADDED|MODIFIED):\s*([\s\S]*?)(?:\s*→\s*([\s\S]*?))?\]/g;

    const allMatches: Array<{ type: string; content: string; replacement?: string; start: number; end: number }> = [];
    let m: RegExpExecArray | null;
    while ((m = changePattern.exec(text)) !== null) {
        allMatches.push({
            type: m[1],
            content: m[2],
            replacement: m[3],
            start: m.index,
            end: m.index + m[0].length,
        });
    }

    if (allMatches.length === 0) {
        return new Paragraph({
            children: [new TextRun({ text, size: 22 })],
            spacing: { after: 200 },
        });
    }

    allMatches.forEach((match) => {
        // Add normal text before this match
        if (match.start > lastIndex) {
            const normalText = text.slice(lastIndex, match.start);
            if (normalText.trim()) {
                runs.push(new TextRun({ text: normalText, size: 22 }));
            }
        }

        // Add styled text based on type
        if (match.type === 'REMOVED') {
            runs.push(new TextRun({
                text: match.content,
                color: 'DC2626', // Red
                strike: true,
                size: 22,
            }));
        } else if (match.type === 'ADDED') {
            runs.push(new TextRun({
                text: match.content,
                color: '16A34A', // Green
                underline: {},
                size: 22,
            }));
        } else if (match.type === 'MODIFIED') {
            runs.push(new TextRun({
                text: match.content,
                color: 'DC2626', // Red (old)
                strike: true,
                size: 22,
            }));
            runs.push(new TextRun({
                text: ' → ',
                size: 22,
            }));
            runs.push(new TextRun({
                text: match.replacement || '',
                color: '2563EB', // Blue (new)
                bold: true,
                size: 22,
            }));
        }

        lastIndex = match.end;
    });

    // Add remaining normal text
    if (lastIndex < text.length) {
        const normalText = text.slice(lastIndex);
        if (normalText.trim()) {
            runs.push(new TextRun({ text: normalText, size: 22 }));
        }
    }

    return new Paragraph({
        children: runs,
        spacing: { after: 200 },
    });
}

export async function generateFixedContractDocx(
    fixedText: string,
    metadata: DocxMetadata
): Promise<void> {
    parseChanges(fixedText);

    // Split text into paragraphs
    const paragraphs = fixedText.split('\n').filter(p => p.trim());

    const doc = new Document({
        creator: 'Verity - The Truth Behind the Clause',
        title: `Fixed Contract - ${metadata.fileName}`,
        description: 'Contract reviewed and fixed by Verity AI',
        styles: {
            default: {
                document: {
                    run: {
                        font: 'Arial',
                        size: 22,
                    },
                },
            },
        },
        sections: [
            {
                properties: {
                    page: {
                        margin: {
                            top: 1440,
                            right: 1440,
                            bottom: 1440,
                            left: 1440,
                        },
                    },
                },
                headers: {
                    default: new Header({
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: '⚖️ VERITY',
                                        bold: true,
                                        size: 28,
                                        color: 'EA580C',
                                    }),
                                    new TextRun({
                                        text: '  |  The Truth Behind the Clause',
                                        size: 20,
                                        color: '6B7280',
                                    }),
                                ],
                                alignment: AlignmentType.LEFT,
                            }),
                        ],
                    }),
                },
                footers: {
                    default: new Footer({
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: 'Generated by Verity | ',
                                        size: 18,
                                        color: '6B7280',
                                    }),
                                    new TextRun({
                                        text: 'This is AI-assisted analysis, not legal advice.',
                                        size: 18,
                                        color: '6B7280',
                                        italics: true,
                                    }),
                                    new TextRun({
                                        text: '  |  Page ',
                                        size: 18,
                                        color: '6B7280',
                                    }),
                                ],
                                alignment: AlignmentType.CENTER,
                            }),
                        ],
                    }),
                },
                children: [
                    // Title
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: 'CONTRACT ANALYSIS REPORT',
                                bold: true,
                                size: 36,
                                color: '1F2937',
                            }),
                        ],
                        heading: HeadingLevel.TITLE,
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 400 },
                    }),

                    // Metadata
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `Original File: ${metadata.fileName}`,
                                size: 22,
                                color: '6B7280',
                            }),
                        ],
                        alignment: AlignmentType.CENTER,
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `Analysis Date: ${metadata.analysisDate.toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })}`,
                                size: 22,
                                color: '6B7280',
                            }),
                        ],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 600 },
                    }),

                    // Summary Section
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: 'ANALYSIS SUMMARY',
                                bold: true,
                                size: 28,
                                color: '1F2937',
                            }),
                        ],
                        heading: HeadingLevel.HEADING_1,
                        spacing: { before: 400, after: 200 },
                        border: {
                            bottom: {
                                color: 'EA580C',
                                size: 6,
                                style: BorderStyle.SINGLE,
                                space: 4,
                            },
                        },
                    }),

                    // Summary Table
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: 'Original Risk Score', bold: true, size: 22 })] })],
                                        width: { size: 50, type: WidthType.PERCENTAGE },
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({
                                            children: [new TextRun({
                                                text: `${metadata.riskScore}/100`,
                                                bold: true,
                                                size: 22,
                                                color: metadata.riskScore > 70 ? 'DC2626' : metadata.riskScore > 40 ? 'F59E0B' : '16A34A',
                                            })],
                                        })],
                                    }),
                                ],
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: 'Issues Fixed', bold: true, size: 22 })] })],
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: `${metadata.issuesFixed} violations removed`, size: 22, color: '16A34A' })] })],
                                    }),
                                ],
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: 'Terms Modified', bold: true, size: 22 })] })],
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: `${metadata.termsModified} clauses improved`, size: 22, color: '2563EB' })] })],
                                    }),
                                ],
                            }),
                        ],
                    }),

                    // Spacing
                    new Paragraph({ children: [], spacing: { after: 400 } }),

                    // Legend
                    new Paragraph({
                        children: [
                            new TextRun({ text: 'CHANGE LEGEND', bold: true, size: 24 }),
                        ],
                        spacing: { before: 400, after: 200 },
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: '■ ', color: 'DC2626' }),
                            new TextRun({ text: 'Red strikethrough', strike: true, color: 'DC2626', size: 22 }),
                            new TextRun({ text: ' = Removed (void/illegal clauses)', size: 22 }),
                        ],
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: '■ ', color: '16A34A' }),
                            new TextRun({ text: 'Green underline', underline: {}, color: '16A34A', size: 22 }),
                            new TextRun({ text: ' = Added (fair replacement)', size: 22 }),
                        ],
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: '■ ', color: '2563EB' }),
                            new TextRun({ text: 'Blue bold', bold: true, color: '2563EB', size: 22 }),
                            new TextRun({ text: ' = Modified (improved wording)', size: 22 }),
                        ],
                        spacing: { after: 600 },
                    }),

                    // Fixed Contract Section
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: 'REVISED CONTRACT',
                                bold: true,
                                size: 28,
                                color: '1F2937',
                            }),
                        ],
                        heading: HeadingLevel.HEADING_1,
                        spacing: { before: 400, after: 200 },
                        border: {
                            bottom: {
                                color: '16A34A',
                                size: 6,
                                style: BorderStyle.SINGLE,
                                space: 4,
                            },
                        },
                    }),

                    // Contract content with styled changes
                    ...paragraphs.map(p => createStyledParagraph(p)),

                    // Disclaimer
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: '\n\nDISCLAIMER: ',
                                bold: true,
                                size: 20,
                                color: '6B7280',
                            }),
                            new TextRun({
                                text: 'This document was generated by Verity AI. While we strive for accuracy, this is not legal advice. Please consult a qualified lawyer before signing any contract.',
                                size: 20,
                                color: '6B7280',
                                italics: true,
                            }),
                        ],
                        spacing: { before: 800 },
                        border: {
                            top: {
                                color: 'D1D5DB',
                                size: 1,
                                style: BorderStyle.SINGLE,
                                space: 4,
                            },
                        },
                    }),
                ],
            },
        ],
    });

    // Generate and download
    const blob = await Packer.toBlob(doc);
    const fileName = `Fixed_Contract_Verity_${Date.now()}.docx`;
    saveAs(blob, fileName);
}

// Helper to count changes in text
export function countChanges(text: string): { removed: number; added: number; modified: number } {
    const removed = (text.match(/\[REMOVED:/g) || []).length;
    const added = (text.match(/\[ADDED:/g) || []).length;
    const modified = (text.match(/\[MODIFIED:/g) || []).length;
    return { removed, added, modified };
}

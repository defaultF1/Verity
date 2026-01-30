import { NextRequest, NextResponse } from 'next/server';

interface Violation {
    id: string;
    type: string;
    match: string;
    severity: number;
    section?: string;
    eli5?: string;
    fairAlternative?: string;
}

const FIX_SYSTEM_PROMPT = `You are Verity, an expert Indian contract lawyer. Rewrite contracts to be fair and legal under Indian law.

REWRITING RULES:

1. Section 27 violations (non-compete): REMOVE entirely, replace with:
   "Non-Solicitation: For six (6) months following termination, Contractor shall not directly solicit the specific clients with whom Contractor worked during the engagement."

2. Unlimited liability: CAP at contract value:
   "Contractor's total liability shall not exceed the total fees paid under this Agreement."

3. One-sided termination: Make MUTUAL:
   "Either party may terminate this Agreement with thirty (30) days written notice."

4. Foreign jurisdiction: Change to INDIA:
   "This Agreement shall be governed by the laws of India. Disputes shall be subject to the exclusive jurisdiction of courts in [City], India."

5. IP overreach: Limit to PROJECT work:
   "Intellectual property created specifically for this Project shall transfer to Client upon full payment. Contractor retains rights to pre-existing materials, general skills, and work created outside the scope of this Project."

6. Moral rights waiver: REMOVE entirely (void under Section 57 Copyright Act)

7. Excessive payment terms (>45 days): Change to:
   "Payment shall be made within thirty (30) days of invoice submission."

8. Penalty clauses: Add reasonableness:
   "Late payment shall incur interest at 2% per month, subject to Section 74 of the Indian Contract Act, 1872."

Keep all legitimate, fair terms unchanged.

OUTPUT FORMAT:
Return the complete rewritten contract with changes marked:
[REMOVED: original text that was deleted]
[ADDED: new text that was inserted]
[MODIFIED: old text → new text]

Start immediately with the rewritten contract. Do not add any preamble.`;

export async function POST(request: NextRequest) {
    try {
        const { contractText, violations } = await request.json();

        if (!contractText) {
            return NextResponse.json(
                { error: 'Contract text is required' },
                { status: 400 }
            );
        }

        const apiKey = process.env.ANTHROPIC_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: 'AI service unavailable' },
                { status: 503 }
            );
        }

        // Format violations for the prompt
        const violationsList = violations?.map((v: Violation) =>
            `- ${v.type}: "${v.match.slice(0, 100)}..." (Severity: ${v.severity})`
        ).join('\n') || 'No specific violations provided';

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for longer response

        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 8192,
                    system: FIX_SYSTEM_PROMPT,
                    messages: [
                        {
                            role: 'user',
                            content: `Rewrite this contract to be fair and legal under Indian law.

ORIGINAL CONTRACT:
${contractText}

VIOLATIONS TO FIX:
${violationsList}

Return the complete rewritten contract with all changes clearly marked.`,
                        },
                    ],
                }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Claude API error:', response.status, errorText);
                return NextResponse.json(
                    { error: 'Failed to fix contract' },
                    { status: 502 }
                );
            }

            const data = await response.json();

            const textContent = data.content?.find((c: { type: string }) => c.type === 'text');
            if (!textContent?.text) {
                throw new Error('No content in response');
            }

            const fixedContract = textContent.text;

            // For now, return as plain text
            // TODO: Generate proper DOCX file
            return new NextResponse(fixedContract, {
                headers: {
                    'Content-Type': 'text/plain; charset=utf-8',
                    'Content-Disposition': 'attachment; filename="fixed_contract.txt"',
                },
            });

        } catch (fetchError) {
            clearTimeout(timeoutId);
            if (fetchError instanceof Error && fetchError.name === 'AbortError') {
                return NextResponse.json(
                    { error: 'Request timed out' },
                    { status: 504 }
                );
            }
            throw fetchError;
        }

    } catch (error) {
        console.error('Fix contract error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fix contract' },
            { status: 500 }
        );
    }
}

export const runtime = 'edge';

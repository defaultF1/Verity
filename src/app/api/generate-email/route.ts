import { NextRequest, NextResponse } from 'next/server';

// Types for email generation
interface ViolationSummary {
    type: string;
    clauseText: string;
    severity: number;
    section: string;
    eli5: string;
}

interface EmailRequest {
    violations: ViolationSummary[];
    tone: 'polite' | 'firm';
    senderName: string;
    recipientRole?: string; // e.g., "HR Manager", "Client", "Vendor"
}

interface EmailResponse {
    subject: string;
    body: string;
    tone: string;
}

const POLITE_PROMPT = `You are drafting a professional, diplomatic negotiation email for an Indian freelancer or professional.

TONE GUIDELINES:
- Be respectful and collaborative
- Express appreciation for the opportunity
- Frame concerns as "clarifications" or "suggestions"
- Use phrases like "I noticed", "I'd like to discuss", "Perhaps we could consider"
- Maintain a positive relationship focus
- Avoid accusatory language`;

const FIRM_PROMPT = `You are drafting a firm, assertive negotiation email for an Indian freelancer or professional.

TONE GUIDELINES:
- Be direct and clear about concerns
- Reference specific legal provisions confidently
- Use phrases like "This clause is unenforceable under Indian law", "I require modification of"
- Set clear expectations and boundaries
- Professional but not aggressive
- Make it clear these terms are non-negotiable for legal reasons`;

const COMMON_PROMPT = `
CONTEXT:
- This is for an Indian contract negotiation
- The sender has analyzed their contract using Verity AI Legal Sentinel
- Detected violations of Indian Contract Act, 1872 and related laws
- Goal is to renegotiate problematic clauses before signing

OUTPUT FORMAT:
Return ONLY valid JSON (no markdown, no explanation):
{
  "subject": "Email subject line",
  "body": "Complete email body with proper greeting, paragraphs, and signature placeholder"
}

EMAIL STRUCTURE:
1. Professional greeting
2. Express interest in the engagement/role (brief)
3. Mention you've reviewed the contract
4. List specific concerns with legal backing (cite Section numbers)
5. Propose fair alternatives for each issue
6. Request a discussion/revised contract
7. Professional closing with [YOUR NAME] placeholder

IMPORTANT:
- Keep it concise (under 400 words)
- Use ₹ for any currency references
- Reference Indian law, never US/UK concepts
- Include the actual clause concerns provided
- Be specific, not generic`;

export async function POST(request: NextRequest) {
    try {
        const body: EmailRequest = await request.json();
        const { violations, tone, senderName, recipientRole } = body;

        if (!violations || !Array.isArray(violations) || violations.length === 0) {
            return NextResponse.json(
                { error: 'At least one violation is required to generate an email' },
                { status: 400 }
            );
        }

        if (!tone || !['polite', 'firm'].includes(tone)) {
            return NextResponse.json(
                { error: 'Tone must be either "polite" or "firm"' },
                { status: 400 }
            );
        }

        const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error('ANTHROPIC_API_KEY not configured');
            return NextResponse.json(
                { error: 'Email generation unavailable - API key not configured' },
                { status: 503 }
            );
        }

        // Build the violation summary for the prompt
        const violationSummary = violations.map((v, i) =>
            `${i + 1}. **${v.type}** (Severity: ${v.severity}/100)
   - Clause: "${v.clauseText.substring(0, 200)}${v.clauseText.length > 200 ? '...' : ''}"
   - Issue: ${v.eli5}
   - Legal Reference: ${v.section}`
        ).join('\n\n');

        const tonePrompt = tone === 'polite' ? POLITE_PROMPT : FIRM_PROMPT;
        const recipientContext = recipientRole ? `Recipient: ${recipientRole}` : 'Recipient: The contracting party';

        const userMessage = `Generate a negotiation email based on the following contract analysis:

SENDER NAME: ${senderName || '[YOUR NAME]'}
${recipientContext}
TONE: ${tone.toUpperCase()}

DETECTED ISSUES:
${violationSummary}

Write the email now. Return only JSON.`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `${tonePrompt}\n\n${COMMON_PROMPT}\n\n${userMessage}`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 2048,
                        responseMimeType: "application/json"
                    }
                }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Gemini API error:', response.status, errorText);
                return NextResponse.json(
                    { error: 'Email generation failed' },
                    { status: 502 }
                );
            }

            const data = await response.json();
            const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!responseText) {
                throw new Error('No text content in response');
            }

            // Parse the JSON response
            let emailResult: EmailResponse;
            try {
                emailResult = JSON.parse(responseText);
            } catch {
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    emailResult = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error('Could not parse AI response as JSON');
                }
            }

            // Validate response structure
            if (!emailResult.subject || !emailResult.body) {
                throw new Error('Invalid email response structure');
            }

            // Replace placeholder with actual sender name if provided
            if (senderName) {
                emailResult.body = emailResult.body.replace(/\[YOUR NAME\]/g, senderName);
            }

            return NextResponse.json({
                success: true,
                email: {
                    subject: emailResult.subject,
                    body: emailResult.body,
                    tone: tone,
                },
            });

        } catch (fetchError) {
            clearTimeout(timeoutId);
            if (fetchError instanceof Error && fetchError.name === 'AbortError') {
                return NextResponse.json(
                    { error: 'Email generation timed out' },
                    { status: 504 }
                );
            }
            throw fetchError;
        }

    } catch (error) {
        console.error('Email generation error:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Email generation failed',
            },
            { status: 500 }
        );
    }
}

export const runtime = 'edge';

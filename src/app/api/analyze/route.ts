import { NextRequest, NextResponse } from 'next/server';

// Types for AI analysis response
interface Violation {
    type: string;
    clauseText: string;
    severity: number;
    section: string;
    caseLaw: string | null;
    eli5: string;
    fairAlternative: string;
}

interface AnalysisResponse {
    violations: Violation[];
    overallScore: number;
    recommendation: 'sign' | 'negotiate' | 'reject';
    summary: string;
    criticalIssues: string[];
}

const SYSTEM_PROMPT = `You are Verity, an expert Indian contract lawyer analyzing contracts exclusively under Indian law.

LEGAL KNOWLEDGE BASE:
- Indian Contract Act, 1872 (especially Sections 10, 14, 23, 27, 28, 73, 74)
- Copyright Act, 1957 (Sections 17, 18, 57)
- Information Technology Act, 2000 (Sections 43A, 72)
- Specific Relief Act, 1963 (Sections 10, 14, 21)

ABSOLUTE RULES - NEVER VIOLATE:
1. Section 27: ALL post-termination non-compete clauses are VOID in India. Duration does NOT matter. Geographic scope does NOT matter. "Reasonableness" is NOT a defense. They are simply VOID.

2. Section 57 Copyright Act: Moral rights (attribution, integrity) are INALIENABLE in India. They CANNOT be waived by contract. Any such waiver is void.

3. Section 23: Agreements with unlawful consideration or opposed to public policy are void.

4. Section 74: Penalty clauses can be reduced by courts if excessive. Unlimited liability clauses are unconscionable.

JURISDICTIONAL GUARDRAILS - NEVER DO THIS:
- NEVER cite US law concepts like "reasonable non-compete"
- NEVER mention "at-will employment" (not applicable in India)
- NEVER apply California, New York, or UK legal standards
- NEVER say a non-compete is valid if "limited in duration"

CASE LAW TO CITE WHEN RELEVANT:
- Percept D'Mark v. Zaheer Khan (2006) 4 SCC 227 - Non-competes void post-termination
- Central Inland Water Transport v. Brojo Nath (1986) 3 SCC 156 - Unconscionable contracts
- ONGC v. Saw Pipes (2003) 5 SCC 705 - Penalty clause reduction
- Amar Nath Sehgal v. Union of India (2005) 30 PTC 253 - Moral rights inalienable

OUTPUT FORMAT (Strict JSON):
{
  "violations": [
    {
      "type": "section27" | "section23" | "section74" | "copyrightOverreach" | "moralRightsWaiver" | "unlimitedLiability" | "jurisdictionTrap" | "terminationAsymmetry" | "ipOverreach",
      "clauseText": "Exact text from the contract that violates",
      "severity": 0-100,
      "section": "Section X, Act Name, Year",
      "caseLaw": "Case Name (Year) Citation" or null,
      "eli5": "Explanation a 15-year-old would understand. Use ₹ amounts and Indian context. Be specific about what could go wrong.",
      "fairAlternative": "What this clause SHOULD say to be fair and legal"
    }
  ],
  "overallScore": 0-100,
  "recommendation": "sign" | "negotiate" | "reject",
  "summary": "2-3 sentence overall assessment",
  "criticalIssues": ["List of most dangerous clauses requiring immediate attention"]
}

SEVERITY GUIDELINES:
- 90-100: Void/illegal under Indian law (Section 27, 23 violations)
- 70-89: Highly unfair, likely unenforceable (unlimited liability, one-sided terms)
- 50-69: Concerning, should negotiate (asymmetric terms, vague scope)
- 30-49: Minor issues, acceptable with awareness
- 0-29: Standard terms, no significant risk

ANALYSIS APPROACH:
1. Read the entire contract first
2. Identify each clause type (payment, termination, IP, liability, non-compete, etc.)
3. Check each against Indian law requirements
4. For violations, always cite the specific Section and Act
5. Provide actionable, specific recommendations
6. Be protective of the freelancer/smaller party

PRIVACY & ANONYMIZATION PROTOCOL (STRICT MANDATE):
1. You MUST redact any PII found in the "clauseText" or "summary".
2. Replace specific names of people/companies with "Party A" / "Party B" where possible in the summary, but keep them in "clauseText" if essential for context (or redact if sensitive).
3. DETECT & REDACT:
   - Indian Mobile Numbers (+91...) -> <REDACTED_PHONE>
   - PAN Card Numbers (5 letters, 4 digits, 1 letter) -> <REDACTED_PAN>
   - Aadhaar Numbers (12 digits) -> <REDACTED_AADHAAR>
   - Email Addresses -> <REDACTED_EMAIL>
   - Physical Addresses -> <REDACTED_ADDRESS>

Your output generally should warn the user about the legal risks, not store their personal data.`;

// Multi-language ELI5 prompt generator
const getLanguagePrompt = (langCode: string) => {
    const configs: Record<string, { name: string; script: string; example: string }> = {
        'hin': {
            name: 'Hindi',
            script: 'Devanagari',
            example: '"यह धारा कहती है कि आप अपने शहर में काम नहीं कर सकते। यह वैसा ही है जैसे कोई चायवाला कहे कि आप पूरे मोहल्ले में किसी और को चाय नहीं बेच सकते!"'
        },
        'ben': {
            name: 'Bengali',
            script: 'Bengali',
            example: '"এই ধারাটি বলছে যে আপনি আপনার শহরে কাজ করতে পারবেন না। এটা এমন যেন কোনো চা-ওয়ালা বলছে যে আপনি পুরো পাড়ায় আর কাউকে চা বিক্রি করতে পারবেন না!"'
        },
        'ori': {
            name: 'Odia',
            script: 'Odia',
            example: '"ଏହି ଧାରା କହୁଛି ଯେ ଆପଣ ନିଜ ସହରରେ କାମ କରିପାରିବେ ନାହିଁ। ଏହା ଯେମିତି କୌଣସି ଚା’ ଦୋକାନୀ କହୁଛି ଯେ ଆପଣ ପୂରା ସାହିରେ ଆଉ କାହାକୁ ଚା’ ବିକିପାରିବେ ନାହିଁ!"'
        },
        'tel': {
            name: 'Telugu',
            script: 'Telugu',
            example: '"ఈ నిబంధన ప్రకారం మీరు మీ నగరంలో పని చేయడానికి వీలు లేదు. ఇది ఒక చాయ్ వాలా మీరు ఆ కాలనీలో ఇంకెవరికీ చాయ్ అమ్మకూడదు అని చెప్పినట్లు ఉంది!"'
        },
        'tam': {
            name: 'Tamil',
            script: 'Tamil',
            example: '"இந்த விதி நீங்கள் உங்கள் நகரத்தில் வேலை செய்ய முடியாது என்று கூறுகிறது. இது ஒரு டீக்கடைக்காரர் நீங்கள் அந்த தெருவில் வேறு யாருக்கும் டீ விற்கக்கூடாது என்று சொல்வது போன்றது!"'
        },
        'kan': {
            name: 'Kannada',
            script: 'Kannada',
            example: '"ಈ ನಿಯಮವು ನಿಮ್ಮ ನಗರದಲ್ಲಿ ನೀವು ಕೆಲಸ ಮಾಡುವಂತಿಲ್ಲ ಎಂದು ಹೇಳುತ್ತದೆ. ಇದು ಒಬ್ಬ ಚಾಯ್‌ವಾಲಾ ನೀವು ಇಡೀ ಬಡಾವಣೆಯಲ್ಲಿ ಬೇರೆ ಯಾರಿಗೂ ಚಾಯ್ ಮಾರಾಟ ಮಾಡುವಂತಿಲ್ಲ ಎಂದು ಹೇಳಿದಂತಿದೆ!"'
        },
        'mal': {
            name: 'Malayalam',
            script: 'Malayalam',
            example: '"നിങ്ങൾക്ക് നിങ്ങളുടെ നഗരത്തിൽ ജോലി ചെയ്യാൻ കഴിയില്ലെന്ന് ഈ വകുപ്പ് പറയുന്നു. ഒരു ചായക്കടക്കാരൻ നിങ്ങളോട് ഈ പ്രദേശത്ത് മറ്റാർക്കും ചായ വിൽക്കാൻ പാടില്ല എന്ന് പറയുന്നത് പോലെയാണിത്!"'
        }
    };

    const config = configs[langCode];
    if (!config) return '';

    return `
IMPORTANT: Generate the "eli5" (Explain Like I'm 5) explanation and "summary" in ${config.name} (${config.script} script).
The ${config.name} explanation should be:
- Simple and conversational
- Use everyday ${config.name}, avoid legal jargon
- Maximum 2-3 sentences
- Use relatable examples like chai shops, rickshaw fares, or neighborhood scenarios

For legal sections, use ${config.name} format if standard (e.g. "Section 27" -> "धारा 27" for Hindi).
Example ELI5: ${config.example}
`;
};

export async function POST(request: NextRequest) {
    try {
        const { contractText, hindiMode, outputLanguage } = await request.json();

        // Backward compatibility for hindiMode
        const targetLang = outputLanguage || (hindiMode ? 'hin' : 'eng');

        if (!contractText || typeof contractText !== 'string') {
            return NextResponse.json(
                { error: 'Contract text is required' },
                { status: 400 }
            );
        }

        const apiKey = process.env.ANTHROPIC_API_KEY;

        if (!apiKey) {
            console.error('ANTHROPIC_API_KEY not configured');
            return NextResponse.json(
                { error: 'AI analysis unavailable - API key not configured', fallbackToRegex: true },
                { status: 503 }
            );
        }

        // Call Claude API
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const languagePrompt = getLanguagePrompt(targetLang);

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
                    max_tokens: 4096,
                    system: SYSTEM_PROMPT,
                    messages: [
                        {
                            role: 'user',
                            content: `Analyze this contract and return ONLY valid JSON (no markdown, no explanation, just the JSON object):${languagePrompt}

CONTRACT TEXT:
${contractText}`,
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
                    { error: 'AI analysis failed', fallbackToRegex: true },
                    { status: 502 }
                );
            }

            const data = await response.json();

            // Extract the text content from Claude's response
            const textContent = data.content?.find((c: { type: string }) => c.type === 'text');
            if (!textContent?.text) {
                throw new Error('No text content in response');
            }

            // Parse the JSON response
            let analysisResult: AnalysisResponse;
            try {
                // Try to parse directly
                analysisResult = JSON.parse(textContent.text);
            } catch {
                // If direct parse fails, try to extract JSON from the response
                const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    analysisResult = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error('Could not parse AI response as JSON');
                }
            }

            // Validate the response structure
            if (!analysisResult.violations || !Array.isArray(analysisResult.violations)) {
                throw new Error('Invalid response structure');
            }

            return NextResponse.json({
                success: true,
                analysis: analysisResult,
                source: 'ai',
            });

        } catch (fetchError) {
            clearTimeout(timeoutId);
            if (fetchError instanceof Error && fetchError.name === 'AbortError') {
                return NextResponse.json(
                    { error: 'AI analysis timed out', fallbackToRegex: true },
                    { status: 504 }
                );
            }
            throw fetchError;
        }

    } catch (error) {
        console.error('Analysis error:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Analysis failed',
                fallbackToRegex: true
            },
            { status: 500 }
        );
    }
}

export const runtime = 'edge';

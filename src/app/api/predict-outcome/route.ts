import { NextRequest, NextResponse } from 'next/server';

// Types for Simulation Response
interface SimulationResult {
    outcome: "VOID" | "VALID" | "RISKY";
    confidenceScore: number;
    courtPath: string[];
    timeline: string;
    legalCosts: {
        min: number;
        max: number;
        currency: "INR";
    };
    settlementEstimation: string;
    keyPrecedent: {
        caseName: string;
        year: number;
        rulingSummary: string;
    };
    riskProfile: {
        repeatOffender: boolean;
        judgeView: string;
    };
}

const JUDGE_PERSONA_PROMPT = `You are an expert Indian Legal Strategist and retired Supreme Court Judge with 30 years of experience.

Your task is to predict how Indian courts would rule on a specific contract clause violation.

LEGAL KNOWLEDGE BASE:
- Indian Contract Act, 1872 (Sections 10, 14, 23, 27, 28, 73, 74)
- Copyright Act, 1957 (Sections 17, 18, 57)
- Specific Relief Act, 1963
- Consumer Protection Act, 2019

KEY PRECEDENTS:
- Percept D'Mark v. Zaheer Khan (2006) 4 SCC 227 - Non-competes void post-termination
- Central Inland Water Transport v. Brojo Nath Ganguly (1986) 3 SCC 156 - Unconscionable contracts
- ONGC v. Saw Pipes (2003) 5 SCC 705 - Penalty clause reduction
- Amar Nath Sehgal v. Union of India (2005) - Moral rights inalienable

PREDICTION METHODOLOGY:
1. Identify the exact legal provision violated
2. Map to established Supreme Court precedents
3. Calculate litigation timeline based on typical Indian court delays
4. Estimate legal costs for the freelancer/employee tier
5. Assess settlement probability

OUTPUT FORMAT (Strict JSON):
{
  "outcome": "VOID" | "VALID" | "RISKY",
  "confidenceScore": 0-100,
  "courtPath": ["District Court", "High Court", "Supreme Court"],
  "timeline": "X-Y months",
  "legalCosts": {
    "min": number,
    "max": number,
    "currency": "INR"
  },
  "settlementEstimation": "₹X-Y lakhs in your favor" or "No recovery expected",
  "keyPrecedent": {
    "caseName": "Case Name",
    "year": YYYY,
    "rulingSummary": "Brief summary of the ruling"
  },
  "riskProfile": {
    "repeatOffender": true/false,
    "judgeView": "Why judges would favor/disfavor the plaintiff"
  }
}

GUIDELINES:
- For Section 27 violations (non-compete): ALWAYS return "VOID" with 90%+ confidence
- For unlimited liability: Return "RISKY" with 70-85% confidence
- Be specific with cost ranges based on Indian legal fees (₹50,000 - ₹10,00,000 typical range)
- Timeline should reflect realistic Indian court delays (12-36 months typical)`;

export async function POST(request: NextRequest) {
    try {
        const { clauseText, violationType } = await request.json();

        if (!clauseText || !violationType) {
            return NextResponse.json(
                { error: 'Clause text and violation type are required' },
                { status: 400 }
            );
        }

        const apiKey = process.env.ANTHROPIC_API_KEY;

        if (!apiKey) {
            // Return mock data for demo purposes
            console.warn('ANTHROPIC_API_KEY not configured, returning mock simulation');
            return NextResponse.json({
                success: true,
                simulation: getMockSimulation(violationType),
                source: 'mock',
            });
        }

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
                    max_tokens: 2048,
                    system: JUDGE_PERSONA_PROMPT,
                    messages: [
                        {
                            role: 'user',
                            content: `Analyze this contract clause violation and predict the court outcome. Return ONLY valid JSON.

VIOLATION TYPE: ${violationType}
CLAUSE TEXT: ${clauseText}`,
                        },
                    ],
                }),
            });

            if (!response.ok) {
                console.error('Claude API error:', response.status);
                return NextResponse.json({
                    success: true,
                    simulation: getMockSimulation(violationType),
                    source: 'mock',
                });
            }

            const data = await response.json();
            const textContent = data.content?.find((c: { type: string }) => c.type === 'text');

            if (!textContent?.text) {
                throw new Error('No text content in response');
            }

            let simulation: SimulationResult;
            try {
                simulation = JSON.parse(textContent.text);
            } catch {
                const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    simulation = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error('Could not parse AI response as JSON');
                }
            }

            return NextResponse.json({
                success: true,
                simulation,
                source: 'ai',
            });

        } catch (fetchError) {
            console.error('Fetch error:', fetchError);
            return NextResponse.json({
                success: true,
                simulation: getMockSimulation(violationType),
                source: 'mock',
            });
        }

    } catch (error) {
        console.error('Simulation error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Simulation failed' },
            { status: 500 }
        );
    }
}

// Mock simulation for demo/fallback
function getMockSimulation(violationType: string): SimulationResult {
    const isNonCompete = violationType.toLowerCase().includes('section27') ||
        violationType.toLowerCase().includes('non-compete') ||
        violationType.toLowerCase().includes('restraint');

    if (isNonCompete) {
        return {
            outcome: "VOID",
            confidenceScore: 94,
            courtPath: ["Labour Court", "Bombay High Court", "Supreme Court"],
            timeline: "18-24 months",
            legalCosts: {
                min: 300000,
                max: 800000,
                currency: "INR",
            },
            settlementEstimation: "₹1.5-4 lakhs in your favor",
            keyPrecedent: {
                caseName: "Percept D'Mark (India) Pvt. Ltd. v. Zaheer Khan",
                year: 2006,
                rulingSummary: "Post-termination non-compete clauses are completely void under Section 27. No duration or geographic limitation makes them enforceable.",
            },
            riskProfile: {
                repeatOffender: true,
                judgeView: "Judges strongly favor employees in Section 27 cases. The Supreme Court has consistently held that restraint of trade post-employment is void ab initio.",
            },
        };
    }

    // Default mock for other violations
    return {
        outcome: "RISKY",
        confidenceScore: 72,
        courtPath: ["District Court", "High Court"],
        timeline: "12-18 months",
        legalCosts: {
            min: 150000,
            max: 500000,
            currency: "INR",
        },
        settlementEstimation: "₹50,000-2 lakhs potential recovery",
        keyPrecedent: {
            caseName: "Central Inland Water Transport Corp v. Brojo Nath Ganguly",
            year: 1986,
            rulingSummary: "Unconscionable contract terms can be struck down as opposed to public policy under Section 23.",
        },
        riskProfile: {
            repeatOffender: false,
            judgeView: "Courts may reduce excessive penalties but typically uphold the core contract terms if not fundamentally unfair.",
        },
    };
}

export const runtime = 'edge';

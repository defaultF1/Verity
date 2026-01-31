import { NextRequest, NextResponse } from "next/server";

interface NegotiationRequest {
    messages: Array<{ role: string; content: string }>;
    difficulty: "easy" | "medium" | "hard";
    violationType: string;
    violationContext: string;
}

const DIFFICULTY_PROMPTS = {
    easy: `You are Mr. Sharma, an understanding and reasonable client. You are open to discussion and willing to negotiate fair terms. You ask clarifying questions and generally want to find a solution that works for both parties. Be warm and collaborative.`,

    medium: `You are Ms. Kapoor, a skeptical but professional client. You require justification for any changes and want to see legal citations or industry standards. You're not immediately convinced but can be persuaded with good arguments. Push back moderately but fairly.`,

    hard: `You are Mr. Reddy, a tough and impatient client. You use "take it or leave it" tactics and emphasize that "everyone signs this contract." Create time pressure and resist changes. Only concede if the freelancer makes very strong legal arguments with specific citations.`,
};

export async function POST(request: NextRequest) {
    try {
        const body: NegotiationRequest = await request.json();
        const { messages, difficulty, violationType, violationContext } = body;

        const apiKey = process.env.ANTHROPIC_API_KEY;

        if (!apiKey) {
            // Return fallback response if no API key
            return NextResponse.json({
                response: "I need to think about this. Can you elaborate on your position?",
                shouldEnd: false,
            });
        }

        const systemPrompt = `${DIFFICULTY_PROMPTS[difficulty]}

You are negotiating about this contract clause type: ${violationType}
The specific clause text is: "${violationContext}"

RULES:
- Keep responses short (2-3 sentences max)
- Stay in character based on difficulty
- React to what the freelancer says
- If they make good legal arguments, acknowledge them appropriately for your difficulty level
- After 3-4 exchanges, start moving toward a resolution
- Set shouldEnd: true when the negotiation reaches a natural conclusion (agreement or clear impasse)

Respond as the client would, in first person.`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

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
                    max_tokens: 300,
                    system: systemPrompt,
                    messages: messages
                        .filter(m => m.role !== "system")
                        .map(m => ({
                            role: m.role === "user" ? "user" : "assistant",
                            content: m.content,
                        })),
                }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error("API request failed");
            }

            const data = await response.json();
            const textContent = data.content?.find((block: { type: string }) => block.type === "text");
            const responseText = textContent?.text || "Let me think about that...";

            // Determine if we should end
            const shouldEnd = messages.length >= 6 ||
                /agree|deal|accepted|fine|okay we can|let's proceed/i.test(responseText);

            return NextResponse.json({
                response: responseText,
                shouldEnd,
            });

        } catch (fetchError) {
            clearTimeout(timeoutId);
            throw fetchError;
        }

    } catch (error) {
        console.error("Negotiation simulation error:", error);

        // Return fallback response
        return NextResponse.json({
            response: "I need to think about this. Can you elaborate on your position?",
            shouldEnd: false,
        });
    }
}

export const runtime = 'edge';

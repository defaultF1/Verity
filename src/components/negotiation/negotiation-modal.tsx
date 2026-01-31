"use client";

import { useState, useRef, useEffect } from "react";
import { X, MessageSquare, Send, Trophy, Target, Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Violation } from "@/features/detection/regex-engine";

interface NegotiationModalProps {
    isOpen: boolean;
    onClose: () => void;
    violation: Violation | null;
}

type Difficulty = "easy" | "medium" | "hard";
type MessageRole = "user" | "client" | "system";

interface Message {
    id: string;
    role: MessageRole;
    content: string;
    timestamp: Date;
}

interface NegotiationScore {
    acknowledgedConcern: boolean;
    citedLaw: boolean;
    mentionedCaseLaw: boolean;
    offeredAlternative: boolean;
    professionalTone: boolean;
    total: number;
}

// Client personas based on difficulty
const CLIENT_PERSONAS: Record<Difficulty, { name: string; behavior: string; style: string }> = {
    easy: {
        name: "Mr. Sharma (Understanding Client)",
        behavior: "Open to discussion, asks clarifying questions, willing to negotiate",
        style: "I appreciate you bringing this up. Let me understand your concern better...",
    },
    medium: {
        name: "Ms. Kapoor (Skeptical Client)",
        behavior: "Requires justification, needs legal citations, somewhat resistant",
        style: "Hmm, I'm not sure I agree. Can you explain why this is problematic?",
    },
    hard: {
        name: "Mr. Reddy (Tough Client)",
        behavior: "Push back strongly, 'take it or leave it' attitude, time pressure tactics",
        style: "Look, this is our standard contract. Everyone signs it. We don't have time for changes.",
    },
};

// Scoring criteria weights
const SCORE_WEIGHTS = {
    acknowledgedConcern: 20,
    citedLaw: 25,
    mentionedCaseLaw: 15,
    offeredAlternative: 25,
    professionalTone: 15,
};

export function NegotiationModal({ isOpen, onClose, violation }: NegotiationModalProps) {
    const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [score, setScore] = useState<NegotiationScore | null>(null);
    const [isComplete, setIsComplete] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Reset on open
    useEffect(() => {
        if (isOpen) {
            setDifficulty(null);
            setMessages([]);
            setInput("");
            setScore(null);
            setIsComplete(false);
        }
    }, [isOpen]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const startSimulation = (selectedDifficulty: Difficulty) => {
        setDifficulty(selectedDifficulty);
        const persona = CLIENT_PERSONAS[selectedDifficulty];

        // Initial client message based on the violation
        const clauseIntro = violation
            ? `regarding the clause about "${violation.type.replace(/([A-Z])/g, ' $1').trim()}"`
            : "regarding the contract terms";

        setMessages([
            {
                id: "1",
                role: "system",
                content: `Simulation started with ${persona.name}. Your goal: Negotiate a fair modification to the problematic clause.`,
                timestamp: new Date(),
            },
            {
                id: "2",
                role: "client",
                content: `${persona.style} You wanted to discuss ${clauseIntro}. What's your concern?`,
                timestamp: new Date(),
            },
        ]);
    };

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading || !difficulty) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            // Call API for AI response
            const response = await fetch("/api/negotiation-simulate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map(m => ({
                        role: m.role,
                        content: m.content,
                    })),
                    difficulty,
                    violationType: violation?.type || "general",
                    violationContext: violation?.match || "",
                }),
            });

            if (response.ok) {
                const data = await response.json();

                const clientMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "client",
                    content: data.response,
                    timestamp: new Date(),
                };

                setMessages(prev => [...prev, clientMessage]);

                // Check if simulation should end
                if (data.shouldEnd || messages.length >= 8) {
                    evaluatePerformance([...messages, userMessage, clientMessage]);
                }
            } else {
                // Fallback response
                const fallbackResponses: Record<Difficulty, string> = {
                    easy: "I see your point. That does sound reasonable. What specific change would you propose?",
                    medium: "I'll need to discuss this with our legal team. But I need more justification for why this clause is problematic.",
                    hard: "We've used this contract for years with no issues. I don't see why we need to change it now.",
                };

                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    role: "client",
                    content: fallbackResponses[difficulty],
                    timestamp: new Date(),
                }]);
            }
        } catch {
            // Use fallback
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: "client",
                content: "Let me think about that for a moment...",
                timestamp: new Date(),
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const evaluatePerformance = (allMessages: Message[]) => {
        const userMessages = allMessages.filter(m => m.role === "user");
        const fullText = userMessages.map(m => m.content).join(" ").toLowerCase();

        // Evaluate criteria
        const newScore: NegotiationScore = {
            acknowledgedConcern: /understand|appreciate|see your point|valid concern|reasonable/i.test(fullText),
            citedLaw: /section\s+\d+|act|statute|law|legal|clause|provision/i.test(fullText),
            mentionedCaseLaw: /supreme court|case|judgment|precedent|v\.|vs\.|versus/i.test(fullText),
            offeredAlternative: /instead|alternative|suggest|propose|modification|change to|revise/i.test(fullText),
            professionalTone: !/rude|unfair|terrible|hate|awful|stupid/i.test(fullText),
            total: 0,
        };

        // Calculate total
        newScore.total =
            (newScore.acknowledgedConcern ? SCORE_WEIGHTS.acknowledgedConcern : 0) +
            (newScore.citedLaw ? SCORE_WEIGHTS.citedLaw : 0) +
            (newScore.mentionedCaseLaw ? SCORE_WEIGHTS.mentionedCaseLaw : 0) +
            (newScore.offeredAlternative ? SCORE_WEIGHTS.offeredAlternative : 0) +
            (newScore.professionalTone ? SCORE_WEIGHTS.professionalTone : 0);

        setScore(newScore);
        setIsComplete(true);
    };

    const endSimulation = () => {
        if (messages.length > 2) {
            evaluatePerformance(messages);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-sm shadow-2xl max-w-2xl w-full h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white relative flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/70 hover:text-white transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="size-12 bg-white/20 rounded-sm flex items-center justify-center rotate-3">
                            <MessageSquare className="w-6 h-6 -rotate-3" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Negotiation Simulator</h2>
                            <p className="text-white/80 text-sm">
                                {difficulty ? `Playing as: ${CLIENT_PERSONAS[difficulty].name}` : "Practice negotiating contract terms"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Difficulty Selection */}
                {!difficulty && (
                    <div className="flex-1 p-6 flex flex-col items-center justify-center">
                        <Target className="w-12 h-12 text-indigo-500 mb-4" />
                        <h3 className="text-xl font-bold text-stone-800 mb-2">Select Difficulty</h3>
                        <p className="text-stone-500 text-sm text-center mb-6 max-w-md">
                            Practice negotiating the problematic clause with AI clients of varying difficulty.
                        </p>

                        {violation && (
                            <div className="w-full max-w-md p-4 bg-amber-50 border border-amber-200 rounded-sm mb-6">
                                <p className="text-xs font-bold uppercase text-amber-600 mb-1">Negotiating:</p>
                                <p className="text-sm text-amber-800">{violation.match.slice(0, 150)}...</p>
                            </div>
                        )}

                        <div className="grid grid-cols-3 gap-4 w-full max-w-md">
                            {(["easy", "medium", "hard"] as Difficulty[]).map((level) => (
                                <button
                                    key={level}
                                    onClick={() => startSimulation(level)}
                                    className={cn(
                                        "p-4 rounded-sm border-2 transition text-center hover:scale-105",
                                        level === "easy" && "border-green-300 bg-green-50 hover:border-green-500",
                                        level === "medium" && "border-amber-300 bg-amber-50 hover:border-amber-500",
                                        level === "hard" && "border-red-300 bg-red-50 hover:border-red-500"
                                    )}
                                >
                                    <div className="text-2xl mb-2">
                                        {level === "easy" && "😊"}
                                        {level === "medium" && "🤔"}
                                        {level === "hard" && "😤"}
                                    </div>
                                    <p className={cn(
                                        "font-bold uppercase text-sm",
                                        level === "easy" && "text-green-700",
                                        level === "medium" && "text-amber-700",
                                        level === "hard" && "text-red-700"
                                    )}>
                                        {level}
                                    </p>
                                    <p className="text-xs text-stone-500 mt-1">
                                        {CLIENT_PERSONAS[level].behavior.split(",")[0]}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Chat Interface */}
                {difficulty && !isComplete && (
                    <>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={cn(
                                        "flex",
                                        message.role === "user" && "justify-end",
                                        message.role === "system" && "justify-center"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "max-w-[80%] p-3 rounded-sm",
                                            message.role === "user" && "bg-indigo-600 text-white",
                                            message.role === "client" && "bg-white border border-stone-200 text-stone-800",
                                            message.role === "system" && "bg-stone-200 text-stone-600 text-xs"
                                        )}
                                    >
                                        {message.role === "client" && (
                                            <p className="text-xs font-bold text-indigo-600 mb-1">
                                                {CLIENT_PERSONAS[difficulty].name.split(" ")[0]}
                                            </p>
                                        )}
                                        <p className="text-sm">{message.content}</p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-stone-200 p-3 rounded-sm">
                                        <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-stone-200 bg-white flex-shrink-0">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                                    placeholder="Type your negotiation response..."
                                    className="flex-1 px-4 py-3 bg-stone-50 border border-stone-200 rounded-sm focus:outline-none focus:border-indigo-500 text-stone-800 placeholder:text-stone-400"
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={isLoading || !input.trim()}
                                    className="px-4 py-3 bg-indigo-600 text-white rounded-sm hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex justify-between mt-2">
                                <p className="text-xs text-stone-400">
                                    {messages.filter(m => m.role === "user").length}/4 responses
                                </p>
                                <button
                                    onClick={endSimulation}
                                    className="text-xs text-indigo-600 hover:underline"
                                >
                                    End & Get Feedback
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {/* Results */}
                {isComplete && score && (
                    <div className="flex-1 p-6 overflow-y-auto">
                        {/* Score Display */}
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center size-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full mb-4">
                                <Trophy className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-3xl font-black text-stone-800">{score.total}/100</h3>
                            <p className="text-stone-500">
                                {score.total >= 80 ? "Excellent Negotiator! 🎉" :
                                    score.total >= 60 ? "Good Effort! Keep practicing." :
                                        score.total >= 40 ? "Room for improvement." :
                                            "Needs more practice."}
                            </p>
                        </div>

                        {/* Criteria Breakdown */}
                        <div className="space-y-3">
                            {[
                                { key: "acknowledgedConcern", label: "Acknowledged Client's Concern", weight: SCORE_WEIGHTS.acknowledgedConcern },
                                { key: "citedLaw", label: "Cited Legal Provisions", weight: SCORE_WEIGHTS.citedLaw },
                                { key: "mentionedCaseLaw", label: "Referenced Case Law", weight: SCORE_WEIGHTS.mentionedCaseLaw },
                                { key: "offeredAlternative", label: "Offered Alternative Solution", weight: SCORE_WEIGHTS.offeredAlternative },
                                { key: "professionalTone", label: "Maintained Professional Tone", weight: SCORE_WEIGHTS.professionalTone },
                            ].map(({ key, label, weight }) => (
                                <div key={key} className="flex items-center gap-3 p-3 bg-stone-50 rounded-sm">
                                    <div className={cn(
                                        "size-8 rounded-full flex items-center justify-center",
                                        score[key as keyof NegotiationScore] ? "bg-green-100" : "bg-red-100"
                                    )}>
                                        <Star className={cn(
                                            "w-4 h-4",
                                            score[key as keyof NegotiationScore] ? "text-green-600" : "text-red-400"
                                        )} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-stone-700">{label}</p>
                                    </div>
                                    <div className={cn(
                                        "px-2 py-1 rounded text-xs font-bold",
                                        score[key as keyof NegotiationScore]
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                    )}>
                                        {score[key as keyof NegotiationScore] ? `+${weight}` : "0"}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Try Again */}
                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => {
                                    setDifficulty(null);
                                    setMessages([]);
                                    setScore(null);
                                    setIsComplete(false);
                                }}
                                className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-sm hover:bg-indigo-700"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 border border-stone-300 text-stone-600 font-bold rounded-sm hover:bg-stone-50"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Scale, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CaseLaw } from "@/data/case-law";

interface CitationCardProps {
    caseLaw: CaseLaw;
    context?: string; // What clause triggered this citation
}

export function CitationCard({ caseLaw, context }: CitationCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <Card
            className={cn(
                "mb-4 overflow-hidden",
                "bg-gradient-to-r from-info/10 to-background",
                "border-l-4 border-l-info"
            )}
        >
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        {/* Badge Row */}
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="px-3 py-1 text-xs font-black uppercase tracking-wider rounded bg-info/20 text-info">
                                Supreme Court
                            </span>
                            <span className="text-xs font-bold uppercase tracking-widest text-white/50">
                                {caseLaw.citation}
                            </span>
                        </div>

                        {/* Title */}
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Scale className="w-5 h-5 text-info" />
                            <span className="font-serif">{caseLaw.name}</span>
                        </CardTitle>
                    </div>

                    {/* Year Badge */}
                    <div className="flex items-center justify-center px-3 py-2 rounded-lg bg-info/20 text-info font-black text-sm">
                        {caseLaw.year}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-4">
                {/* Holding */}
                <div className="mb-4 p-3 bg-black/30 rounded border border-white/10">
                    <p className="text-xs font-bold uppercase tracking-wider text-info mb-2">Holding</p>
                    <p className="text-sm text-white/90 leading-relaxed">{caseLaw.holding}</p>
                </div>

                {/* Context (if provided) */}
                {context && (
                    <div className="mb-4 text-sm">
                        <span className="text-white/40">Applied to: </span>
                        <span className="text-white/80 italic">&ldquo;{context}&rdquo;</span>
                    </div>
                )}

                {/* Expand/Collapse Button */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-2 text-sm font-bold text-info hover:text-info/80 transition-colors"
                >
                    {isExpanded ? (
                        <>Less details <ChevronUp className="w-4 h-4" /></>
                    ) : (
                        <>View key quote <ChevronDown className="w-4 h-4" /></>
                    )}
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                    <div className="mt-4 space-y-4 pt-4 border-t border-white/10">
                        {/* Key Quote */}
                        <div className="p-4 bg-info/5 rounded-lg border border-info/20">
                            <p className="text-xs font-bold uppercase tracking-wider text-info mb-2">Key Quote</p>
                            <p className="text-sm font-serif italic text-white/80 leading-relaxed">
                                &ldquo;{caseLaw.keyQuote}&rdquo;
                            </p>
                        </div>

                        {/* Court Info */}
                        <div className="flex items-center justify-between text-sm text-white/50">
                            <span>{caseLaw.court}</span>
                            {/* Optional: Link to external database */}
                            <a
                                href={`https://indiankanoon.org/search/?formInput=${encodeURIComponent(caseLaw.name)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-info hover:text-info/80 transition-colors"
                            >
                                <span>View on Indian Kanoon</span>
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>

                        {/* Relevant Sections (if available) */}
                        {caseLaw.relevantSections && caseLaw.relevantSections.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-white/40">
                                    Relevant Sections:
                                </span>
                                {caseLaw.relevantSections.map((section) => (
                                    <span
                                        key={section}
                                        className="px-2 py-1 text-xs font-bold rounded bg-info/10 text-info"
                                    >
                                        Section {section}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// Compact version for inline use
export function CitationBadge({ caseLaw }: { caseLaw: CaseLaw }) {
    return (
        <a
            href={`https://indiankanoon.org/search/?formInput=${encodeURIComponent(caseLaw.name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg",
                "bg-info/10 border border-info/20",
                "text-sm text-info hover:bg-info/20 transition-colors",
                "group"
            )}
        >
            <Scale className="w-4 h-4" />
            <span className="font-medium">{caseLaw.name.split(' v. ')[0]} v. ...</span>
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
    );
}

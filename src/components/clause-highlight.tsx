"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, FileText, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClauseHighlightProps {
    originalClause: string;
    highlightedTerms?: string[];
    clauseNumber?: string;
    className?: string;
}

export function ClauseHighlight({
    originalClause,
    highlightedTerms = [],
    clauseNumber,
    className
}: ClauseHighlightProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Create highlighted version
    let displayClause = originalClause;
    for (const term of highlightedTerms) {
        const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
        displayClause = displayClause.replace(
            regex,
            '<mark class="bg-danger/30 text-danger font-bold px-0.5 rounded">$1</mark>'
        );
    }

    // Truncate for collapsed view
    const truncatedClause = originalClause.length > 150
        ? originalClause.slice(0, 150) + '...'
        : originalClause;

    return (
        <div className={cn(
            "rounded-lg overflow-hidden",
            "bg-black/40 border border-white/10",
            className
        )}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-black/30 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-white/40" />
                    <span className="text-xs font-black uppercase tracking-wider text-white/50">
                        From Your Contract
                    </span>
                    {clauseNumber && (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-white/10 text-white/60">
                            Clause {clauseNumber}
                        </span>
                    )}
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-1 text-xs font-bold text-[var(--color-accent)] hover:text-[var(--color-accent-light)] transition-colors"
                >
                    {isExpanded ? (
                        <>Collapse <ChevronUp className="w-3 h-3" /></>
                    ) : (
                        <>Expand <ChevronDown className="w-3 h-3" /></>
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="flex items-start gap-3">
                    <Quote className="w-5 h-5 text-white/20 flex-shrink-0 mt-1 rotate-180" />
                    <div className={cn(
                        "text-sm font-serif italic text-white/70 leading-relaxed",
                        !isExpanded && "line-clamp-3"
                    )}>
                        {isExpanded ? (
                            <span dangerouslySetInnerHTML={{ __html: displayClause }} />
                        ) : (
                            truncatedClause
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Utility to escape regex special characters
function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Compact inline version
export function ClauseHighlightInline({
    text,
    highlightedTerms = []
}: {
    text: string;
    highlightedTerms?: string[];
}) {
    let displayText = text;
    for (const term of highlightedTerms) {
        const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
        displayText = displayText.replace(
            regex,
            '<mark class="bg-danger/30 text-danger font-bold">$1</mark>'
        );
    }

    return (
        <span
            className="font-serif italic text-white/70"
            dangerouslySetInnerHTML={{ __html: displayText }}
        />
    );
}

"use client";

import { Shield, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface DisclaimerProps {
    variant: 'footer' | 'results' | 'modal' | 'checkbox';
    onAccept?: (accepted: boolean) => void;
    className?: string;
}

export function Disclaimer({ variant, onAccept, className }: DisclaimerProps) {
    const [accepted, setAccepted] = useState(false);

    const handleCheckboxChange = () => {
        const newValue = !accepted;
        setAccepted(newValue);
        onAccept?.(newValue);
    };

    // Footer variant - subtle, always visible
    if (variant === 'footer') {
        return (
            <div className={cn("border-t border-white/10 mt-8 pt-8 pb-4", className)}>
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-white/30 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs text-white/40 leading-relaxed">
                                <strong className="text-white/50">Legal Disclaimer:</strong> Verity
                                provides legal information and analysis based on Indian law, not legal
                                advice. This tool is designed to help identify potential issues in
                                contracts but should not be considered a substitute for professional
                                legal counsel. Always consult a qualified advocate before signing
                                contracts involving significant financial or legal obligations.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Results variant - prominent warning above analysis
    if (variant === 'results') {
        return (
            <div className={cn(
                "p-5 rounded-xl mb-6",
                "bg-gradient-to-r from-warning/10 to-transparent",
                "border border-warning/20",
                className
            )}>
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-warning/20 rounded-lg flex-shrink-0">
                        <AlertTriangle className="w-5 h-5 text-warning" />
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-black text-sm uppercase tracking-wider text-[#c65316]">
                            Important Notice
                        </h4>
                        <p className="text-sm text-stone-600 leading-relaxed">
                            This analysis is for <strong className="text-stone-900">informational purposes only</strong> and
                            does not constitute legal advice. While Verity uses AI trained on Indian contract law and
                            Supreme Court precedents, it may not catch every issue. For contracts involving significant
                            amounts (₹10L+), always have a qualified advocate review the document.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Modal variant - info banner for downloads
    if (variant === 'modal') {
        return (
            <div className={cn(
                "p-4 rounded-lg",
                "bg-info/10 border border-info/20",
                className
            )}>
                <div className="flex items-start gap-3">
                    <Info className="w-4 h-4 text-info flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-white/60 leading-relaxed">
                        AI-generated content may contain errors. Review all changes before use.
                        Verity is not responsible for any legal consequences arising from the use of this document.
                    </p>
                </div>
            </div>
        );
    }

    // Checkbox variant - for explicit acknowledgment
    if (variant === 'checkbox') {
        return (
            <div className={cn(
                "p-4 rounded-lg",
                "bg-white/5 border border-white/10",
                className
            )}>
                <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex-shrink-0 mt-0.5">
                        <input
                            type="checkbox"
                            checked={accepted}
                            onChange={handleCheckboxChange}
                            className="sr-only"
                        />
                        <div className={cn(
                            "w-5 h-5 rounded border-2 transition-all",
                            accepted
                                ? "bg-[var(--color-accent)] border-[var(--color-accent)]"
                                : "border-white/30 group-hover:border-white/50"
                        )}>
                            {accepted && (
                                <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            )}
                        </div>
                    </div>
                    <span className="text-xs text-white/60 leading-relaxed">
                        I understand that this document was generated by AI and may contain errors.
                        I will review all content before use and consult a qualified legal professional
                        for matters involving significant financial or legal obligations.
                    </span>
                </label>
            </div>
        );
    }

    return null;
}

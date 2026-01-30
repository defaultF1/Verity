"use client";

import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { Shield, Info } from "lucide-react";

interface ShieldToggleProps {
    enabled: boolean;
    onToggle: (enabled: boolean) => void;
}

export function ShieldToggle({ enabled, onToggle }: ShieldToggleProps) {
    const { profile } = useAuth();

    // Show toggle for everyone, but highlight for women
    const isWoman = profile?.gender === "female";

    return (
        <div className={cn(
            "p-5 rounded-sm border transition-all",
            enabled
                ? "bg-purple-50 border-purple-300 shadow-lg shadow-purple-100"
                : "bg-white border-stone-200"
        )}>
            <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={cn(
                    "size-12 rounded-sm flex items-center justify-center flex-shrink-0",
                    enabled ? "bg-purple-500" : "bg-stone-100"
                )}>
                    <Shield className={cn(
                        "w-6 h-6",
                        enabled ? "text-white" : "text-stone-400"
                    )} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                        <h3 className={cn(
                            "font-bold text-lg",
                            enabled ? "text-purple-800" : "text-stone-800"
                        )}>
                            Women Freelancer Shield
                            {isWoman && (
                                <span className="ml-2 text-xs bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full">
                                    Recommended
                                </span>
                            )}
                        </h3>

                        {/* Toggle */}
                        <button
                            onClick={() => onToggle(!enabled)}
                            className={cn(
                                "relative w-14 h-7 rounded-full transition-colors",
                                enabled ? "bg-purple-500" : "bg-stone-300"
                            )}
                        >
                            <span className={cn(
                                "absolute top-1 left-1 size-5 bg-white rounded-full transition-transform shadow",
                                enabled && "translate-x-7"
                            )} />
                        </button>
                    </div>

                    <p className={cn(
                        "text-sm mt-1",
                        enabled ? "text-purple-600" : "text-stone-500"
                    )}>
                        Detects clauses that disproportionately affect women:
                    </p>

                    <ul className={cn(
                        "mt-2 text-xs space-y-1",
                        enabled ? "text-purple-600" : "text-stone-400"
                    )}>
                        <li>• Safety-compromising access clauses</li>
                        <li>• Jurisdiction traps requiring travel</li>
                        <li>• Unreasonable availability requirements</li>
                        <li>• Image/likeness rights concerns</li>
                    </ul>

                    {/* Source */}
                    <div className={cn(
                        "mt-3 flex items-center gap-2 text-[10px] uppercase tracking-wider",
                        enabled ? "text-purple-400" : "text-stone-400"
                    )}>
                        <Info className="w-3 h-3" />
                        Developed with input from Women Freelancers India (8,000+ members)
                    </div>
                </div>
            </div>
        </div>
    );
}

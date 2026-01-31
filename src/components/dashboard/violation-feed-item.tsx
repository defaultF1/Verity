"use client";

import { useState } from "react";
import { ShieldX, TimerOff, Handshake, BookOpen, ChevronDown, ChevronUp, CheckCircle, Scale, PenTool } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";

interface ViolationFeedItemProps {
    id: string;
    title: string;
    description: string;
    riskLevel: "high" | "medium" | "low";
    executiveSummary: string;
    section?: string;
    progress?: number;
    icon?: "security" | "timer" | "handshake";
}

const icons = {
    security: ShieldX,
    timer: TimerOff,
    handshake: Handshake,
};

export function ViolationFeedItem({
    id,
    title,
    description,
    riskLevel,
    executiveSummary,
    section,
    progress = 0,
    icon = "security",
    fairAlternative,
    caseLaw,
    onAcknowledge,
    isAcknowledged = false
}: ViolationFeedItemProps & {
    fairAlternative?: string;
    caseLaw?: string | null;
    onAcknowledge?: (id: string) => void;
    isAcknowledged?: boolean;
}) {
    const Icon = icons[icon];
    const [isExpanded, setIsExpanded] = useState(false);

    const riskStyles = {
        high: {
            badge: "bg-[#5D3D50] text-white shadow-sm shadow-[#5D3D50]/20",
            iconBg: "bg-[#5D3D50]/5",
            iconColor: "text-[#5D3D50]"
        },
        medium: {
            badge: "bg-stone-200 text-stone-700",
            iconBg: "bg-stone-100",
            iconColor: "text-stone-500"
        },
        low: {
            badge: "bg-emerald-100 text-emerald-700",
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-600"
        }
    };

    const styles = riskStyles[riskLevel];
    const { t } = useLanguage();

    const riskLabel = {
        high: t("High Risk"),
        medium: t("Medium Risk"),
        low: t("Low Risk")
    }[riskLevel];

    return (
        <div
            id={id}
            className={cn(
                "scroll-mt-32 bg-[#FDFDFD] rounded-sm shadow-lg border border-white overflow-hidden transition-all duration-300",
                isAcknowledged ? "opacity-60 grayscale-[50%]" : "hover:border-[#c65316]/20"
            )}
        >
            <div className="p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-4">
                        <div className={cn("w-12 h-12 rounded-sm flex items-center justify-center mt-1", styles.iconBg)}>
                            {isAcknowledged ? <CheckCircle className="w-7 h-7 text-stone-400" /> : <Icon className={cn("w-7 h-7", styles.iconColor)} />}
                        </div>
                        <div>
                            <h3 className={cn("font-bold text-2xl leading-tight transition-colors", isAcknowledged ? "text-stone-600 line-through decoration-2 decoration-stone-400" : "text-[#c65316]")}>
                                {section && `${section}: `}{title}
                            </h3>
                            <p className="text-sm text-stone-500 mt-2 font-medium">
                                {description}
                            </p>
                        </div>
                    </div>
                    <span className={cn(
                        "px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm whitespace-nowrap",
                        isAcknowledged ? "bg-stone-200 text-stone-500" : styles.badge
                    )}>
                        {isAcknowledged ? t("Acknowledged") : riskLabel}
                    </span>
                </div>

                {/* Executive Summary */}
                <div className={cn("mt-8 rounded-sm p-6 border-l-2", isAcknowledged ? "bg-stone-100 border-stone-300" : "bg-[#c65316]/5 border-[#c65316]")}>
                    <div className="flex gap-4">
                        <BookOpen className={cn("w-5 h-5 flex-shrink-0", isAcknowledged ? "text-stone-400" : "text-[#c65316]")} />
                        <div>
                            <span className={cn("text-[10px] font-bold uppercase tracking-widest", isAcknowledged ? "text-stone-500" : "text-[#c65316]")}>
                                {t("Executive Summary")}
                            </span>
                            <p className="text-sm text-stone-700 mt-2 leading-relaxed font-medium">
                                {executiveSummary}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                    <div className="mt-6 space-y-6 animate-in slide-in-from-top-4 fade-in duration-300">
                        {fairAlternative && (
                            <div className="bg-emerald-50/50 p-6 rounded-sm border border-emerald-100">
                                <div className="flex gap-3 mb-2">
                                    <PenTool className="w-4 h-4 text-emerald-600" />
                                    <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-widest">{t("Fair Alternative")}</h4>
                                </div>
                                <p className="text-sm text-stone-700 font-medium leading-relaxed italic">
                                    "{fairAlternative}"
                                </p>
                            </div>
                        )}

                        {caseLaw && (
                            <div className="bg-stone-50 p-6 rounded-sm border border-stone-100">
                                <div className="flex gap-3 mb-2">
                                    <Scale className="w-4 h-4 text-stone-500" />
                                    <h4 className="text-xs font-bold text-stone-600 uppercase tracking-widest">{t("Relevant Case Law")}</h4>
                                </div>
                                <p className="text-xs text-stone-600 font-mono bg-white p-2 border border-stone-200 rounded-sm inline-block">
                                    {caseLaw}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-[#c65316]/5">
                    <div className="flex gap-4 w-full sm:w-auto">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 text-xs font-bold uppercase tracking-widest text-white bg-[#c65316] rounded-sm hover:bg-[#2A3D36] transition shadow-lg shadow-[#c65316]/10"
                        >
                            {isExpanded ? (
                                <>
                                    {t("Hide Details")}
                                    <ChevronUp className="w-3 h-3" />
                                </>
                            ) : (
                                <>
                                    {t("View Details")}
                                    <ChevronDown className="w-3 h-3" />
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => onAcknowledge?.(id)}
                            className={cn(
                                "flex-1 sm:flex-none px-8 py-3 text-xs font-bold uppercase tracking-widest border rounded-sm transition",
                                isAcknowledged
                                    ? "bg-stone-100 text-stone-400 border-stone-200 hover:bg-stone-200"
                                    : "text-[#c65316] bg-white border-[#c65316]/20 hover:bg-[#c65316]/5"
                            )}
                        >
                            {isAcknowledged ? t("Undo") : t("Acknowledge")}
                        </button>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                            {t("Resolution Progress")}
                        </span>
                        <div className="h-1 w-32 bg-[#c65316]/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#c65316] transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

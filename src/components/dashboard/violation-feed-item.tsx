"use client";

import { ShieldX, TimerOff, Handshake, BookOpen } from "lucide-react";
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
    icon = "security"
}: ViolationFeedItemProps) {
    const Icon = icons[icon];

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
        <div id={id} className="scroll-mt-32 bg-[#FDFDFD] rounded-sm shadow-lg border border-white overflow-hidden hover:border-[#c65316]/20 transition-all duration-300">
            <div className="p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-4">
                        <div className={cn("w-12 h-12 rounded-sm flex items-center justify-center mt-1", styles.iconBg)}>
                            <Icon className={cn("w-7 h-7", styles.iconColor)} />
                        </div>
                        <div>
                            <h3 className="font-bold text-2xl text-[#c65316] leading-tight">
                                {section && `${section}: `}{title}
                            </h3>
                            <p className="text-sm text-stone-500 mt-2 font-medium">
                                {description}
                            </p>
                        </div>
                    </div>
                    <span className={cn(
                        "px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm whitespace-nowrap",
                        styles.badge
                    )}>
                        {riskLabel}
                    </span>
                </div>

                {/* Executive Summary */}
                <div className="mt-8 bg-[#c65316]/5 rounded-sm p-6 border-l-2 border-[#c65316]">
                    <div className="flex gap-4">
                        <BookOpen className="w-5 h-5 text-[#c65316] flex-shrink-0" />
                        <div>
                            <span className="text-[10px] font-bold text-[#c65316] uppercase tracking-widest">
                                {t("Executive Summary")}
                            </span>
                            <p className="text-sm text-stone-700 mt-2 leading-relaxed font-medium">
                                {executiveSummary}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-[#c65316]/5">
                    <div className="flex gap-4 w-full sm:w-auto">
                        <button className="flex-1 sm:flex-none px-8 py-3 text-xs font-bold uppercase tracking-widest text-white bg-[#c65316] rounded-sm hover:bg-[#2A3D36] transition shadow-lg shadow-[#c65316]/10">
                            {t("View Details")}
                        </button>
                        <button className="flex-1 sm:flex-none px-8 py-3 text-xs font-bold uppercase tracking-widest text-[#c65316] bg-white border border-[#c65316]/20 rounded-sm hover:bg-[#c65316]/5 transition">
                            {t("Acknowledge")}
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

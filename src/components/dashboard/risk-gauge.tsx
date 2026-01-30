"use client";

import { cn } from "@/lib/utils";

interface RiskGaugeProps {
    score: number;
    className?: string;
}

function getRiskLevel(score: number): { label: string; color: string; bgColor: string } {
    if (score >= 70) {
        return { label: "High Risk", color: "text-white", bgColor: "bg-[#5D3D50]" };
    } else if (score >= 40) {
        return { label: "Medium Risk", color: "text-stone-700", bgColor: "bg-stone-200" };
    }
    return { label: "Low Risk", color: "text-white", bgColor: "bg-emerald-600" };
}

export function RiskGauge({ score, className }: RiskGaugeProps) {
    const riskLevel = getRiskLevel(score);

    // Calculate stroke-dashoffset for the gauge
    // Circle circumference = 2 * π * r = 2 * 3.14159 * 72 ≈ 452
    const circumference = 2 * Math.PI * 72;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className={cn(
            "bg-[#FDFDFD] rounded-sm shadow-lg p-10 text-center border border-white relative",
            className
        )}>
            {/* Top gradient line */}
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#c65316] to-transparent opacity-30" />

            <h2 className="text-stone-400 text-[11px] font-bold tracking-[0.2em] uppercase mb-8">
                Overall Risk Assessment
            </h2>

            {/* SVG Gauge */}
            <div className="relative w-52 h-52 mx-auto mb-6">
                <svg className="w-full h-full" viewBox="0 0 160 160">
                    {/* Background circle */}
                    <circle
                        className="fill-none stroke-[#E3EDE9]"
                        cx="80"
                        cy="80"
                        r="72"
                        strokeWidth="6"
                        strokeLinecap="round"
                    />
                    {/* Value circle */}
                    <circle
                        className="fill-none stroke-[#c65316] transition-all duration-1000 ease-out"
                        cx="80"
                        cy="80"
                        r="72"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        style={{
                            transform: "rotate(-90deg)",
                            transformOrigin: "50% 50%"
                        }}
                    />
                </svg>

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-7xl font-bold text-[#c65316]">
                        {score}
                    </span>
                    <div className={cn(
                        "px-3 py-1 text-[10px] font-bold tracking-widest uppercase mt-2",
                        riskLevel.bgColor,
                        riskLevel.color
                    )}>
                        {riskLevel.label}
                    </div>
                </div>
            </div>

            <p className="text-sm text-stone-500 italic leading-relaxed">
                Score based on detected violations and risk factors.
            </p>
        </div>
    );
}

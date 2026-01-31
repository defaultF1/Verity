"use client";

import { useState } from "react";
import { ChevronDown, TrendingDown, TrendingUp, Minus, IndianRupee, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    MARKET_RATES,
    CATEGORY_LABELS,
    EXPERIENCE_LABELS,
    UNIT_LABELS,
    formatINR,
    type MarketRateData,
} from "@/data/market-rates";

interface RateComparisonProps {
    contractRate?: number;
    rateType?: string;
    className?: string;
}

export function RateComparison({ contractRate, rateType, className }: RateComparisonProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>("content_writing");
    const [selectedRate, setSelectedRate] = useState<string>("content_blog");
    const [experienceLevel, setExperienceLevel] = useState<"beginner" | "intermediate" | "expert">("intermediate");
    const [inputRate, setInputRate] = useState<string>(contractRate?.toString() || "");
    const [showAnalysis, setShowAnalysis] = useState(false);

    // Get rates for selected category
    const categoryRates = MARKET_RATES.filter(r => r.category === selectedCategory);
    const selectedRateData = MARKET_RATES.find(r => r.id === selectedRate);

    // Calculate comparison
    const marketRate = selectedRateData?.rates[experienceLevel];
    const contractValue = parseFloat(inputRate) || 0;

    let verdict: "below" | "fair" | "above" | null = null;
    let percentDiff = 0;
    let verdictMessage = "";
    let verdictColor = "";

    if (marketRate && contractValue > 0) {
        const marketMid = (marketRate.min + marketRate.max) / 2;
        percentDiff = Math.round(((contractValue - marketMid) / marketMid) * 100);

        if (contractValue < marketRate.min * 0.8) {
            verdict = "below";
            verdictMessage = `You're being offered ${Math.abs(percentDiff)}% BELOW market rate`;
            verdictColor = "text-red-600 bg-red-50 border-red-200";
        } else if (contractValue > marketRate.max * 1.2) {
            verdict = "above";
            verdictMessage = `You're being offered ${percentDiff}% ABOVE market rate`;
            verdictColor = "text-green-600 bg-green-50 border-green-200";
        } else {
            verdict = "fair";
            verdictMessage = "Your rate is within market range";
            verdictColor = "text-blue-600 bg-blue-50 border-blue-200";
        }
        setShowAnalysis(true);
    }

    const handleCategoryChange = (cat: string) => {
        setSelectedCategory(cat);
        const firstRate = MARKET_RATES.find(r => r.category === cat);
        if (firstRate) setSelectedRate(firstRate.id);
    };

    return (
        <div className={cn("bg-white/5 rounded-xl border border-white/10 p-6 backdrop-blur-sm", className)}>
            <div className="flex items-center gap-3 mb-6">
                <div className="size-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <IndianRupee className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-white">Market Rate Comparison</h3>
                    <p className="text-xs text-white/50">Compare your contract rate against current market data</p>
                </div>
            </div>

            <div className="space-y-4">
                {/* Category Selector */}
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">
                        Category
                    </label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer hover:bg-black/30 transition"
                    >
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                            <option key={key} value={key} className="bg-stone-900 text-white">{label}</option>
                        ))}
                    </select>
                </div>

                {/* Rate Type Selector */}
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">
                        Service Type
                    </label>
                    <select
                        value={selectedRate}
                        onChange={(e) => setSelectedRate(e.target.value)}
                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer hover:bg-black/30 transition"
                    >
                        {categoryRates.map((rate) => (
                            <option key={rate.id} value={rate.id} className="bg-stone-900 text-white">{rate.label}</option>
                        ))}
                    </select>
                </div>

                {/* Experience Level */}
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">
                        Your Experience Level
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {(["beginner", "intermediate", "expert"] as const).map((level) => (
                            <button
                                key={level}
                                onClick={() => setExperienceLevel(level)}
                                className={cn(
                                    "px-3 py-2 text-xs font-bold rounded-lg border transition capitalize",
                                    experienceLevel === level
                                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
                                        : "bg-transparent text-white/60 border-white/10 hover:bg-white/5 hover:text-white"
                                )}
                            >
                                {level}
                                <div className="text-[9px] font-normal opacity-50 mt-1">
                                    {EXPERIENCE_LABELS[level]}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Contract Rate Input */}
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">
                        Your Contract Rate (₹)
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">₹</span>
                        <input
                            type="number"
                            value={inputRate}
                            onChange={(e) => setInputRate(e.target.value)}
                            placeholder="Enter your rate"
                            className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 transition"
                        />
                        {marketRate && (
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/40">
                                {UNIT_LABELS[marketRate.unit]}
                            </span>
                        )}
                    </div>
                </div>

                {/* Market Data Display */}
                {marketRate && (
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="text-xs text-white/50 mb-2">
                            Market Rate ({EXPERIENCE_LABELS[experienceLevel]}):
                        </div>
                        <div className="text-lg font-bold text-white">
                            {formatINR(marketRate.min)} - {formatINR(marketRate.max)}
                            <span className="text-sm font-normal text-white/50 ml-1">
                                {UNIT_LABELS[marketRate.unit]}
                            </span>
                        </div>
                        <div className="text-[10px] text-white/30 mt-2 flex items-center gap-1">
                            <Info className="w-3 h-3" />
                            Source: {selectedRateData?.dataSource}
                        </div>
                    </div>
                )}

                {/* Verdict */}
                {verdict && contractValue > 0 && (
                    <div className={cn("p-4 rounded-lg border backdrop-blur-sm",
                        verdict === "below" ? "bg-red-500/10 border-red-500/20 text-red-200" :
                            verdict === "above" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-200" :
                                "bg-blue-500/10 border-blue-500/20 text-blue-200"
                    )}>
                        <div className="flex items-center gap-2 mb-2">
                            {verdict === "below" && <TrendingDown className="w-5 h-5" />}
                            {verdict === "above" && <TrendingUp className="w-5 h-5" />}
                            {verdict === "fair" && <Minus className="w-5 h-5" />}
                            <span className="font-bold">{verdictMessage}</span>
                        </div>

                        {verdict === "below" && marketRate && (
                            <div className="mt-3 p-3 bg-black/20 rounded-md text-sm border border-white/5">
                                <strong className="text-white/70 block mb-1">Negotiation Script:</strong>
                                <p className="text-white/60 italic leading-relaxed">
                                    &quot;Based on current market rates for {selectedRateData?.label} with my {experienceLevel} experience level,
                                    the standard rate would be {formatINR(marketRate.min)} - {formatINR(marketRate.max)}.
                                    I&apos;d be happy to discuss a rate of {formatINR(marketRate.min)} for this project.&quot;
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

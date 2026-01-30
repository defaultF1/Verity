"use client";

import { useState, useEffect } from "react";
import { X, Calculator, Scale, Copy, Check, FileText, IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    calculateKillFee,
    INDUSTRY_MULTIPLIERS,
    COMPLETION_FACTORS,
    type Industry,
    type CompletionStage,
    type KillFeeResult,
} from "@/lib/kill-fee-logic";

interface KillFeeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function KillFeeModal({ isOpen, onClose }: KillFeeModalProps) {
    // Form state
    const [projectValue, setProjectValue] = useState<string>("");
    const [industry, setIndustry] = useState<Industry>("software");
    const [completionStage, setCompletionStage] = useState<CompletionStage>("not_started");

    // Result state
    const [result, setResult] = useState<KillFeeResult | null>(null);
    const [copied, setCopied] = useState(false);

    // Calculate on input change
    useEffect(() => {
        const value = parseFloat(projectValue.replace(/,/g, ""));
        if (value > 0) {
            const res = calculateKillFee({
                projectValue: value,
                industry,
                completionStage,
            });
            setResult(res);
        } else {
            setResult(null);
        }
    }, [projectValue, industry, completionStage]);

    const handleCopyClause = () => {
        if (result) {
            navigator.clipboard.writeText(result.generatedClause);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(value);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-sm shadow-2xl max-w-2xl w-full my-8 overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/70 hover:text-white transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="size-16 bg-white/20 rounded-sm flex items-center justify-center mb-4 rotate-3">
                        <Calculator className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold">Kill Fee Calculator</h2>
                    <p className="text-white/80 text-sm mt-1">
                        Calculate fair cancellation compensation backed by Indian law
                    </p>
                </div>

                {/* Calculator Form */}
                <div className="p-6 space-y-6">
                    {/* Project Value */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">
                            <IndianRupee className="w-3 h-3 inline mr-1" />
                            Total Project Value
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">₹</span>
                            <input
                                type="text"
                                value={projectValue}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, "");
                                    setProjectValue(val ? parseInt(val).toLocaleString("en-IN") : "");
                                }}
                                placeholder="4,00,000"
                                className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-sm text-stone-700 placeholder:text-stone-400 focus:outline-none focus:border-emerald-500/30 focus:ring-2 focus:ring-emerald-500/10 text-lg font-mono"
                            />
                        </div>
                    </div>

                    {/* Industry */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">
                            Industry / Service Type
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {Object.entries(INDUSTRY_MULTIPLIERS).map(([key, data]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setIndustry(key as Industry)}
                                    className={cn(
                                        "p-3 border rounded-sm text-xs font-medium transition text-left",
                                        industry === key
                                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                            : "border-stone-200 text-stone-600 hover:border-stone-300"
                                    )}
                                >
                                    {data.label}
                                    <span className="block text-[10px] text-stone-400 mt-0.5">
                                        {data.multiplier}x multiplier
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Completion Stage */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">
                            Project Completion Stage
                        </label>
                        <div className="space-y-2">
                            {Object.entries(COMPLETION_FACTORS).map(([key, data]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setCompletionStage(key as CompletionStage)}
                                    className={cn(
                                        "w-full p-3 border rounded-sm text-sm font-medium transition flex items-center justify-between",
                                        completionStage === key
                                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                            : "border-stone-200 text-stone-600 hover:border-stone-300"
                                    )}
                                >
                                    <span>{data.label}</span>
                                    <span className="text-[10px] bg-stone-100 px-2 py-1 rounded">
                                        Base: {((data.workDone + data.opportunityCost) * 100).toFixed(0)}%
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Results */}
                    {result && (
                        <div className="space-y-4 pt-4 border-t border-stone-200">
                            {/* Kill Fee Display */}
                            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-sm border border-emerald-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                                            Calculated Kill Fee
                                        </p>
                                        <p className="text-4xl font-black text-emerald-700 mt-1">
                                            {formatCurrency(result.killFee)}
                                        </p>
                                        <p className="text-sm text-emerald-600 mt-1">
                                            {result.percentage}% of project value
                                        </p>
                                    </div>
                                    <div className="size-16 bg-emerald-500 rounded-sm flex items-center justify-center rotate-3">
                                        <Scale className="w-8 h-8 text-white -rotate-3" />
                                    </div>
                                </div>
                            </div>

                            {/* Breakdown */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="p-3 bg-stone-50 rounded-sm text-center">
                                    <p className="text-sm font-bold text-stone-700">
                                        {formatCurrency(result.breakdown.workCompletedValue)}
                                    </p>
                                    <p className="text-[10px] text-stone-500 uppercase">Work Value</p>
                                </div>
                                <div className="p-3 bg-stone-50 rounded-sm text-center">
                                    <p className="text-sm font-bold text-stone-700">
                                        {formatCurrency(result.breakdown.opportunityCost)}
                                    </p>
                                    <p className="text-[10px] text-stone-500 uppercase">Opportunity Cost</p>
                                </div>
                                <div className="p-3 bg-stone-50 rounded-sm text-center">
                                    <p className="text-sm font-bold text-stone-700">
                                        {result.breakdown.industryAdjustment > 0 ? "+" : ""}
                                        {formatCurrency(result.breakdown.industryAdjustment)}
                                    </p>
                                    <p className="text-[10px] text-stone-500 uppercase">Industry Adj.</p>
                                </div>
                            </div>

                            {/* Legal Basis */}
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-sm">
                                <div className="flex items-start gap-3">
                                    <Scale className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold text-amber-800">Legal Basis</p>
                                        <p className="text-xs text-amber-700 mt-1">
                                            {result.legalBasis}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Generated Clause */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                                        <FileText className="w-3 h-3 inline mr-1" />
                                        Ready-to-Use Clause
                                    </p>
                                    <button
                                        onClick={handleCopyClause}
                                        className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700"
                                    >
                                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        {copied ? "Copied!" : "Copy Clause"}
                                    </button>
                                </div>
                                <div className="p-4 bg-stone-50 rounded-sm border border-stone-200 max-h-48 overflow-y-auto">
                                    <pre className="text-xs text-stone-600 whitespace-pre-wrap font-sans">
                                        {result.generatedClause}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-stone-600 hover:text-stone-800 font-medium"
                    >
                        Close
                    </button>
                    {result && (
                        <button
                            onClick={handleCopyClause}
                            className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-sm hover:bg-emerald-700 transition flex items-center gap-2"
                        >
                            <Copy className="w-4 h-4" />
                            Copy Clause
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

"use client";

import { AlertTriangle, Lightbulb, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface DeviationCardProps {
    type: string;
    typeLabel: string;
    found: string;
    fairStandard: string;
    severity: number;
    explanation: string;
    recommendation: string;
}

export function DeviationCard({
    typeLabel,
    found,
    fairStandard,
    severity,
    explanation,
    recommendation,
}: DeviationCardProps) {
    return (
        <Card className="mb-4 bg-amber-950/20 border-l-4 border-l-amber-500 border-amber-500/20">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-500/20">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                            <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider rounded bg-amber-500 text-black">
                                Deviation
                            </span>
                            <h3 className="text-lg font-bold text-white mt-1">{typeLabel}</h3>
                        </div>
                    </div>

                    {/* Severity Badge */}
                    <div className={cn(
                        "flex items-center justify-center w-12 h-12 rounded-lg font-black text-lg",
                        severity >= 70 ? "bg-amber-500 text-black" :
                            severity >= 50 ? "bg-amber-500/60 text-white" :
                                "bg-amber-500/30 text-amber-200"
                    )}>
                        {severity}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Side-by-side comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* This Contract */}
                    <div className="p-4 rounded-lg bg-danger/10 border border-danger/20">
                        <p className="text-xs font-bold uppercase tracking-wider text-danger mb-2">
                            This Contract
                        </p>
                        <p className="text-xl font-black text-white">{found}</p>
                    </div>

                    {/* Fair Standard */}
                    <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                        <p className="text-xs font-bold uppercase tracking-wider text-success mb-2">
                            Fair Standard
                        </p>
                        <p className="text-xl font-black text-white">{fairStandard}</p>
                    </div>
                </div>

                {/* Arrow indicator (mobile only) */}
                <div className="hidden md:flex items-center justify-center -mt-2 -mb-2">
                    <ArrowRight className="w-6 h-6 text-amber-500" />
                </div>

                {/* Explanation */}
                <p className="text-white/70 leading-relaxed">{explanation}</p>

                {/* Recommendation */}
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <div className="flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-1">
                                Recommendation
                            </p>
                            <p className="text-white/80 text-sm">{recommendation}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

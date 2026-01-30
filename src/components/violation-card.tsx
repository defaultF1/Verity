"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Scale, BookOpen, Lightbulb, Gavel } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Violation } from "@/features/detection/regex-engine";
import { getViolationTypeInfo } from "@/features/detection/regex-engine";
import { VoidStamp } from "@/components/void-stamp";
import { SimulationModal } from "@/components/simulation/simulation-modal";
import { cn } from "@/lib/utils";

interface ViolationCardProps {
    violation: Violation;
}

export function ViolationCard({ violation }: ViolationCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showSimulation, setShowSimulation] = useState(false);
    const typeInfo = getViolationTypeInfo(violation.type);

    // Show VOID stamp for Section 27 non-compete violations
    const isSection27 = violation.section?.includes('27') ||
        violation.type.toLowerCase().includes('non-compete') ||
        violation.type.toLowerCase().includes('restraint');

    return (
        <>
            <Card variant={violation.category === 'legal' ? 'violation' : 'deviation'} className="mb-4 relative overflow-hidden">
                <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className={cn(
                                    "px-3 py-1 text-xs font-black uppercase tracking-wider rounded",
                                    violation.category === 'legal'
                                        ? "bg-danger text-white"
                                        : "bg-warning text-black"
                                )}>
                                    {violation.category === 'legal' ? 'Void Clause' : 'Unfair Term'}
                                </span>
                                {violation.section && (
                                    <span className="text-xs font-bold uppercase tracking-widest text-white/50">
                                        {violation.section}, {violation.actName}
                                    </span>
                                )}
                            </div>
                            <CardTitle className="flex items-center gap-2">
                                <span>{typeInfo.icon}</span>
                                <span>{typeInfo.title}</span>
                            </CardTitle>
                        </div>

                        {/* Severity Badge */}
                        <div className={cn(
                            "flex items-center justify-center w-12 h-12 rounded-lg font-black text-lg",
                            violation.severity >= 80 ? "bg-danger text-white" :
                                violation.severity >= 60 ? "bg-accent text-white" :
                                    violation.severity >= 40 ? "bg-warning text-black" :
                                        "bg-white/20 text-white"
                        )}>
                            {violation.severity}
                        </div>
                    </div>

                    {/* VOID Stamp for Section 27 violations */}
                    <VoidStamp
                        show={isSection27 && violation.category === 'legal'}
                        type="void"
                        delay={0.5}
                    />
                </CardHeader>

                <CardContent className="pt-4">
                    {/* Matched Text */}
                    <div className="mb-4 p-3 bg-black/30 rounded border border-white/10">
                        <p className="text-sm font-medium text-white/80">
                            <span className="text-white/40 mr-2">Found:</span>
                            &ldquo;<span className="text-danger font-bold">{violation.match}</span>&rdquo;
                        </p>
                    </div>

                    {/* ELI5 Explanation */}
                    {violation.eli5 && (
                        <div className="mb-4 p-4 bg-warning/10 rounded-lg border border-warning/20">
                            <div className="flex items-start gap-3">
                                <Lightbulb className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-warning mb-1">What this means:</p>
                                    <p className="text-sm text-white/80">{violation.eli5}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center gap-2 text-sm font-bold text-accent hover:text-accent-light transition-colors"
                        >
                            {isExpanded ? (
                                <>Less details <ChevronUp className="w-4 h-4" /></>
                            ) : (
                                <>More details <ChevronDown className="w-4 h-4" /></>
                            )}
                        </button>

                        {/* Simulate Court Case Button - Only for legal violations */}
                        {violation.category === 'legal' && (
                            <button
                                onClick={() => setShowSimulation(true)}
                                className="flex items-center gap-2 text-sm font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded transition-colors"
                            >
                                <Gavel className="w-4 h-4" />
                                Simulate Court Case
                            </button>
                        )}
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                        <div className="mt-4 space-y-4 pt-4 border-t border-white/10">
                            {/* Context */}
                            {violation.context && (
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-white/40 mb-2">Context</p>
                                    <p className="text-sm text-white/60 font-serif italic leading-relaxed">
                                        {violation.context}
                                    </p>
                                </div>
                            )}

                            {/* Case Law */}
                            {violation.caseLaw && (
                                <div className="p-4 bg-info/10 rounded-lg border border-info/20">
                                    <div className="flex items-start gap-3">
                                        <Scale className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-info mb-1">Supreme Court Precedent</p>
                                            <p className="text-sm font-serif italic text-white/80">{violation.caseLaw}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Fair Alternative */}
                            {violation.fairAlternative && (
                                <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                                    <div className="flex items-start gap-3">
                                        <BookOpen className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-success mb-1">Fair Alternative</p>
                                            <p className="text-sm text-white/80">{violation.fairAlternative}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Simulation Modal */}
            <SimulationModal
                isOpen={showSimulation}
                onClose={() => setShowSimulation(false)}
                clauseText={violation.match}
                violationType={violation.type}
            />
        </>
    );
}

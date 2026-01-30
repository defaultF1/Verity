"use client";

import { useState, useEffect } from "react";

interface SimulationResult {
    outcome: "VOID" | "VALID" | "RISKY";
    confidenceScore: number;
    courtPath: string[];
    timeline: string;
    legalCosts: {
        min: number;
        max: number;
        currency: "INR";
    };
    settlementEstimation: string;
    keyPrecedent: {
        caseName: string;
        year: number;
        rulingSummary: string;
    };
    riskProfile: {
        repeatOffender: boolean;
        judgeView: string;
    };
}

interface SimulationCardProps {
    simulation: SimulationResult;
    onClose?: () => void;
}

export function SimulationCard({ simulation, onClose }: SimulationCardProps) {
    const [animatedScore, setAnimatedScore] = useState(0);

    // Animate confidence score
    useEffect(() => {
        const duration = 1500;
        const steps = 60;
        const increment = simulation.confidenceScore / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= simulation.confidenceScore) {
                setAnimatedScore(simulation.confidenceScore);
                clearInterval(timer);
            } else {
                setAnimatedScore(Math.floor(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [simulation.confidenceScore]);

    const getOutcomeStyles = () => {
        switch (simulation.outcome) {
            case "VOID":
                return {
                    bg: "bg-red-500/20",
                    border: "border-red-500",
                    text: "text-red-500",
                    stamp: "VOID",
                };
            case "VALID":
                return {
                    bg: "bg-green-500/20",
                    border: "border-green-500",
                    text: "text-green-500",
                    stamp: "VALID",
                };
            case "RISKY":
                return {
                    bg: "bg-yellow-500/20",
                    border: "border-yellow-500",
                    text: "text-yellow-500",
                    stamp: "RISKY",
                };
        }
    };

    const styles = getOutcomeStyles();
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

    const formatCurrency = (amount: number) => {
        if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(1)} Lakhs`;
        }
        return `₹${amount.toLocaleString("en-IN")}`;
    };

    return (
        <div className="bg-black border-2 border-white/20 p-8 space-y-8 relative overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xs font-bold tracking-[0.3em] text-white/40 uppercase mb-2">
                        Supreme Court Simulation
                    </h3>
                    <h2 className="text-3xl font-black uppercase tracking-tight">
                        Predicted Outcome
                    </h2>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-white/40 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                )}
            </div>

            {/* Main Result Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Outcome Stamp & Confidence */}
                <div className="flex flex-col items-center justify-center space-y-6">
                    {/* VOID/VALID/RISKY Stamp */}
                    <div
                        className={`${styles.bg} ${styles.border} border-4 px-12 py-6 transform -rotate-6 animate-stamp`}
                    >
                        <span className={`${styles.text} text-5xl font-black tracking-widest`}>
                            {styles.stamp}
                        </span>
                    </div>

                    {/* Confidence Meter */}
                    <div className="relative w-32 h-32">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="64"
                                cy="64"
                                r="45"
                                fill="none"
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth="8"
                            />
                            <circle
                                cx="64"
                                cy="64"
                                r="45"
                                fill="none"
                                stroke={simulation.outcome === "VOID" ? "#ef4444" : simulation.outcome === "VALID" ? "#22c55e" : "#eab308"}
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-black">{animatedScore}%</span>
                            <span className="text-xs text-white/40 uppercase tracking-wider">
                                Confidence
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: Details */}
                <div className="space-y-6">
                    {/* Court Path */}
                    <div>
                        <h4 className="text-xs font-bold tracking-[0.2em] text-white/40 uppercase mb-3">
                            Court Pathway
                        </h4>
                        <div className="flex items-center gap-2 flex-wrap">
                            {simulation.courtPath.map((court, index) => (
                                <div key={court} className="flex items-center gap-2">
                                    <span className="bg-white/10 px-3 py-1 text-sm font-bold">
                                        {court}
                                    </span>
                                    {index < simulation.courtPath.length - 1 && (
                                        <span className="material-symbols-outlined text-white/40">
                                            arrow_forward
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Timeline */}
                    <div>
                        <h4 className="text-xs font-bold tracking-[0.2em] text-white/40 uppercase mb-1">
                            Estimated Timeline
                        </h4>
                        <p className="text-2xl font-black">{simulation.timeline}</p>
                    </div>

                    {/* Costs */}
                    <div>
                        <h4 className="text-xs font-bold tracking-[0.2em] text-white/40 uppercase mb-1">
                            Legal Costs (Estimated)
                        </h4>
                        <p className="text-2xl font-black">
                            {formatCurrency(simulation.legalCosts.min)} - {formatCurrency(simulation.legalCosts.max)}
                        </p>
                    </div>

                    {/* Settlement */}
                    <div>
                        <h4 className="text-xs font-bold tracking-[0.2em] text-white/40 uppercase mb-1">
                            Settlement Estimation
                        </h4>
                        <p className={`text-xl font-bold ${styles.text}`}>
                            {simulation.settlementEstimation}
                        </p>
                    </div>
                </div>
            </div>

            {/* Precedent Section */}
            <div className="border-t border-white/10 pt-6">
                <h4 className="text-xs font-bold tracking-[0.2em] text-white/40 uppercase mb-3">
                    Key Precedent
                </h4>
                <div className="bg-white/5 p-4 border-l-4 border-[var(--color-accent)]">
                    <p className="font-serif italic text-lg">
                        &ldquo;{simulation.keyPrecedent.rulingSummary}&rdquo;
                    </p>
                    <p className="text-[var(--color-accent)] font-bold mt-2">
                        — {simulation.keyPrecedent.caseName} ({simulation.keyPrecedent.year})
                    </p>
                </div>
            </div>

            {/* Risk Profile */}
            <div className="border-t border-white/10 pt-6">
                <div className="flex items-center gap-4 mb-3">
                    <h4 className="text-xs font-bold tracking-[0.2em] text-white/40 uppercase">
                        Risk Profile
                    </h4>
                    {simulation.riskProfile.repeatOffender && (
                        <span className="bg-red-500/20 text-red-400 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                            ⚠️ Repeat Offender
                        </span>
                    )}
                </div>
                <p className="text-white/70">{simulation.riskProfile.judgeView}</p>
            </div>

            {/* Decorative Corner */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/5 to-transparent" />
        </div>
    );
}

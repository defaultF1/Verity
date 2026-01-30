"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRiskClassification } from "@/features/detection/regex-engine";

interface RiskScoreProps {
    score: number;
    violationCount: number;
    legalViolations: number;
    unfairTerms: number;
    analysisTime?: number;
}

export function RiskScore({
    score,
    legalViolations,
    unfairTerms,
    analysisTime
}: RiskScoreProps) {
    const [displayScore, setDisplayScore] = useState(0);
    const classification = getRiskClassification(score);

    // Animate score counter
    useEffect(() => {
        const duration = 1500;
        const steps = 60;
        const increment = score / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= score) {
                setDisplayScore(score);
                clearInterval(timer);
            } else {
                setDisplayScore(Math.round(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [score]);

    const getScoreColor = (s: number) => {
        if (s <= 30) return { bg: 'bg-success', stroke: 'stroke-success', text: 'text-success', glow: 'shadow-success/50' };
        if (s <= 50) return { bg: 'bg-warning', stroke: 'stroke-warning', text: 'text-warning', glow: 'shadow-warning/50' };
        if (s <= 70) return { bg: 'bg-accent', stroke: 'stroke-accent', text: 'text-accent', glow: 'shadow-accent/50' };
        return { bg: 'bg-danger', stroke: 'stroke-danger', text: 'text-danger', glow: 'shadow-danger/50' };
    };

    const colors = getScoreColor(displayScore);
    const circumference = 2 * Math.PI * 120;
    const strokeDashoffset = circumference - (displayScore / 100) * circumference;

    const getIcon = () => {
        switch (classification.level) {
            case 'low': return <CheckCircle className="w-8 h-8" />;
            case 'moderate': return <AlertTriangle className="w-8 h-8" />;
            case 'high': return <AlertCircle className="w-8 h-8" />;
            case 'critical': return <Shield className="w-8 h-8" />;
        }
    };

    return (
        <div className="sticky top-24">
            <div className="bg-background-card border border-white/10 rounded-2xl p-8 space-y-8">
                {/* Score Circle */}
                <div className="relative flex items-center justify-center">
                    <svg className="w-64 h-64 -rotate-90" viewBox="0 0 260 260">
                        {/* Background circle */}
                        <circle
                            cx="130"
                            cy="130"
                            r="120"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="8"
                            className="text-white/10"
                        />
                        {/* Progress circle */}
                        <motion.circle
                            cx="130"
                            cy="130"
                            r="120"
                            fill="none"
                            strokeWidth="12"
                            strokeLinecap="round"
                            className={colors.stroke}
                            style={{
                                strokeDasharray: circumference,
                                strokeDashoffset: strokeDashoffset,
                            }}
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                    </svg>

                    {/* Score Display */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={displayScore}
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className={cn("text-7xl font-black font-cabinet", colors.text)}
                            >
                                {displayScore}
                            </motion.div>
                        </AnimatePresence>
                        <p className="text-white/50 text-sm uppercase tracking-widest mt-2">Risk Score</p>
                    </div>
                </div>

                {/* Classification Badge */}
                <div className={cn(
                    "flex items-center justify-center gap-3 py-4 rounded-xl",
                    colors.bg,
                    classification.level === 'low' ? 'text-white' :
                        classification.level === 'moderate' ? 'text-black' : 'text-white'
                )}>
                    {getIcon()}
                    <span className="text-xl font-black uppercase tracking-tight">
                        {classification.label}
                    </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/30 rounded-lg p-4 text-center">
                        <p className="text-3xl font-black text-danger">{legalViolations}</p>
                        <p className="text-xs text-white/50 uppercase tracking-wider mt-1">Legal Violations</p>
                    </div>
                    <div className="bg-black/30 rounded-lg p-4 text-center">
                        <p className="text-3xl font-black text-warning">{unfairTerms}</p>
                        <p className="text-xs text-white/50 uppercase tracking-wider mt-1">Unfair Terms</p>
                    </div>
                </div>

                {/* Analysis Time */}
                {analysisTime && (
                    <div className="text-center text-white/40 text-sm">
                        Analyzed in {analysisTime}ms
                    </div>
                )}

                {/* Recommendation */}
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-sm text-white/60 leading-relaxed">
                        {classification.recommendation}
                    </p>
                </div>
            </div>
        </div>
    );
}

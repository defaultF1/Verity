"use client";

import { useState } from "react";
import { SimulationCard } from "./simulation-card";

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

interface SimulationModalProps {
    isOpen: boolean;
    onClose: () => void;
    clauseText: string;
    violationType: string;
}

export function SimulationModal({
    isOpen,
    onClose,
    clauseText,
    violationType,
}: SimulationModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [simulation, setSimulation] = useState<SimulationResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const runSimulation = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/predict-outcome", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clauseText, violationType }),
            });

            const data = await response.json();

            if (data.success && data.simulation) {
                setSimulation(data.simulation);
            } else {
                setError(data.error || "Simulation failed");
            }
        } catch (err) {
            setError("Failed to connect to simulation service");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-run simulation when modal opens
    if (isOpen && !simulation && !isLoading && !error) {
        runSimulation();
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {isLoading ? (
                    <div className="bg-black border-2 border-white/20 p-16 flex flex-col items-center justify-center space-y-6">
                        {/* Loading Animation */}
                        <div className="relative w-24 h-24">
                            <div className="absolute inset-0 border-4 border-white/20 rounded-full animate-ping" />
                            <div className="absolute inset-2 border-4 border-t-[var(--color-accent)] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="material-symbols-outlined text-4xl text-[var(--color-accent)]">
                                    gavel
                                </span>
                            </div>
                        </div>
                        <div className="text-center">
                            <h3 className="text-2xl font-black uppercase tracking-tight mb-2">
                                Simulating Court Outcome
                            </h3>
                            <p className="text-white/40 text-sm">
                                Analyzing precedents and predicting verdict...
                            </p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="bg-black border-2 border-red-500/50 p-12 text-center">
                        <span className="material-symbols-outlined text-5xl text-red-500 mb-4 block">
                            error
                        </span>
                        <h3 className="text-xl font-bold mb-2">Simulation Error</h3>
                        <p className="text-white/60 mb-6">{error}</p>
                        <button
                            onClick={runSimulation}
                            className="bg-[var(--color-accent)] text-white px-6 py-3 font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-colors"
                        >
                            Retry Simulation
                        </button>
                    </div>
                ) : simulation ? (
                    <SimulationCard simulation={simulation} onClose={onClose} />
                ) : null}
            </div>
        </div>
    );
}

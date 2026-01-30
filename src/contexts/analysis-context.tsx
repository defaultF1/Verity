"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Violation } from "@/features/detection/regex-engine";
import type { Deviation } from "@/data/fair-templates";

interface DocumentInfo {
    pages: number;
    wordCount: number;
    fileName: string;
    parseMethod: string;
}

interface AIAnalysisResponse {
    violations: Array<{
        type: string;
        clauseText: string;
        severity: number;
        section: string;
        caseLaw: string | null;
        eli5: string;
        fairAlternative: string;
    }>;
    overallScore: number;
    recommendation: 'sign' | 'negotiate' | 'reject';
    summary: string;
    criticalIssues: string[];
}

export interface AnalysisResult {
    violations: Violation[];
    deviations: Deviation[];
    riskScore: number;
    legalViolations: number;
    unfairTerms: number;
    analysisTime: number;
    documentInfo: DocumentInfo;
    aiAnalysis?: AIAnalysisResponse;
    aiAvailable: boolean;
    timestamp: number; // For expiration check
}

interface AnalysisContextType {
    results: AnalysisResult | null;
    setResults: (results: AnalysisResult) => void;
    clearResults: () => void;
    isExpired: () => boolean;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    error: string | null;
    setError: (error: string | null) => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

const ANALYSIS_STORAGE_KEY = "verity_analysis";
const EXPIRATION_MS = 60 * 60 * 1000; // 1 hour

export function AnalysisProvider({ children }: { children: ReactNode }) {
    const [results, setResultsState] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(ANALYSIS_STORAGE_KEY);
        if (stored) {
            try {
                const parsed: AnalysisResult = JSON.parse(stored);
                // Check expiration
                if (Date.now() - parsed.timestamp < EXPIRATION_MS) {
                    // eslint-disable-next-line react-hooks/set-state-in-effect
                    setResultsState(parsed);
                } else {
                    localStorage.removeItem(ANALYSIS_STORAGE_KEY);
                }
            } catch {
                localStorage.removeItem(ANALYSIS_STORAGE_KEY);
            }
        }
        setIsInitialized(true);
    }, []);

    // Persist to localStorage when results change
    useEffect(() => {
        if (!isInitialized) return;

        if (results) {
            localStorage.setItem(ANALYSIS_STORAGE_KEY, JSON.stringify(results));
        } else {
            localStorage.removeItem(ANALYSIS_STORAGE_KEY);
        }
    }, [results, isInitialized]);

    const setResults = (newResults: AnalysisResult) => {
        const resultsWithTimestamp = {
            ...newResults,
            timestamp: Date.now()
        };
        setResultsState(resultsWithTimestamp);
        setError(null);
    };

    const clearResults = () => {
        setResultsState(null);
        localStorage.removeItem(ANALYSIS_STORAGE_KEY);
    };

    const isExpired = (): boolean => {
        if (!results) return true;
        return Date.now() - results.timestamp >= EXPIRATION_MS;
    };

    return (
        <AnalysisContext.Provider value={{
            results,
            setResults,
            clearResults,
            isExpired,
            isLoading,
            setIsLoading,
            error,
            setError
        }}>
            {children}
        </AnalysisContext.Provider>
    );
}

export function useAnalysis() {
    const context = useContext(AnalysisContext);
    if (context === undefined) {
        throw new Error("useAnalysis must be used within an AnalysisProvider");
    }
    return context;
}

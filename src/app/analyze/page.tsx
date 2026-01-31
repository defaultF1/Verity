"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Wrench, Mail, AlertCircle, CheckCircle, FileText, Info, ArrowRight, Upload, Sparkles, Download, Zap, ArrowLeft, Globe } from "lucide-react";
import { RateComparison } from "@/components/rate-comparison";
import { useAnalysis, type AnalysisResult as ContextAnalysisResult } from "@/contexts/analysis-context";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { UploadZone } from "@/components/upload-zone";
import { ProcessingAnimation, type ProcessingLayer } from "@/components/processing-animation";
import { RiskScore } from "@/components/risk-score";
import { ViolationCard } from "@/components/violation-card";
import { DeviationCard, type DeviationCardProps } from "@/components/deviation-card";
import { EmailModal } from "@/components/email-modal";
import { ContractFixModal } from "@/components/contract-fix-modal";
import { ProfileSetupModal } from "@/components/profile-setup-modal";
import { parseDocument } from "@/features/parser";
import { SupportedLanguage, LANGUAGE_LABELS } from "@/features/parser/ocr-parser";
import {
    detectViolations,
    calculateRiskScore,
    type Violation
} from "@/features/detection/regex-engine";
import { checkDeviations, type Deviation } from "@/data/fair-templates";
import { generateFixedContractDocx, countChanges, type DocxMetadata } from "@/features/export/docx-generator";
import { redactPII } from "@/lib/pii-redactor";

// ... (previous type definitions remain the same) 
type AppState = 'upload' | 'processing' | 'results';

// AI Analysis response types
interface AIViolation {
    type: string;
    clauseText: string;
    severity: number;
    section: string;
    caseLaw: string | null;
    eli5: string;
    fairAlternative: string;
}

interface AIAnalysisResponse {
    violations: AIViolation[];
    overallScore: number;
    recommendation: 'sign' | 'negotiate' | 'reject';
    summary: string;
    criticalIssues: string[];
}

interface AnalysisResult {
    violations: Violation[];
    deviations: Deviation[];
    riskScore: number;
    legalViolations: number;
    unfairTerms: number;
    analysisTime: number;
    documentInfo: {
        pages: number;
        wordCount: number;
        fileName: string;
        parseMethod: string;
    };
    aiAnalysis?: AIAnalysisResponse;
    aiAvailable: boolean;
}

// Convert AI violations to our Violation format
function convertAIViolation(aiViolation: AIViolation, index: number): Violation {
    const typeMap: Record<string, string> = {
        'section27': 'restraintOfTrade',
        'section23': 'unlawfulAgreement',
        'section74': 'penaltyClause',
        'copyrightOverreach': 'ipOverreach',
        'moralRightsWaiver': 'moralRightsWaiver', // Fixed mapping
        'unlimitedLiability': 'unlimitedLiability',
        'jurisdictionTrap': 'foreignLaw',
        'terminationAsymmetry': 'terminationAsymmetry',
        'ipOverreach': 'ipOverreach',
    };

    const mappedType = typeMap[aiViolation.type] || aiViolation.type;
    const legalTypes = ['section27', 'section23', 'section74', 'moralRightsWaiver', 'restraintOfTrade'];
    const isLegal = legalTypes.includes(aiViolation.type) || aiViolation.severity >= 80;

    return {
        id: `ai-${index}-${Date.now()}`,
        type: mappedType,
        match: aiViolation.clauseText.slice(0, 200) + (aiViolation.clauseText.length > 200 ? '...' : ''),
        context: aiViolation.clauseText.length > 200 ? aiViolation.clauseText : undefined,
        severity: aiViolation.severity,
        category: isLegal ? 'legal' : 'unfair',
        section: aiViolation.section?.split(',')[0]?.trim(),
        actName: aiViolation.section?.split(',').slice(1).join(',')?.trim() || 'Indian Contract Act, 1872',
        caseLaw: aiViolation.caseLaw || undefined,
        eli5: aiViolation.eli5,
        fairAlternative: aiViolation.fairAlternative,
        source: 'ai' as const,
    };
}

// Merge violations from regex and AI
function mergeViolations(regexViolations: Violation[], aiViolations: Violation[]): Violation[] {
    const merged: Violation[] = [];
    const seen = new Set<string>();

    for (const violation of aiViolations) {
        const key = violation.match.toLowerCase().slice(0, 50);
        if (!seen.has(key)) {
            seen.add(key);
            merged.push(violation);
        }
    }

    for (const violation of regexViolations) {
        const key = violation.match.toLowerCase().slice(0, 50);
        const isDuplicate = [...seen].some(seenKey =>
            key.includes(seenKey.slice(0, 30)) || seenKey.includes(key.slice(0, 30))
        );
        if (!isDuplicate) {
            seen.add(key);
            merged.push({ ...violation, source: 'regex' as const });
        }
    }

    return merged.sort((a, b) => b.severity - a.severity);
}

// Convert Deviation to DeviationCardProps
function deviationToCardProps(deviation: Deviation): DeviationCardProps {
    const typeLabels: Record<string, string> = {
        'payment_days': 'Payment Terms',
        'revision_rounds': 'Revision Rounds',
        'late_fee_monthly': 'Late Payment Fee',
        'client_notice_days': 'Client Notice Period',
        'freelancer_notice_days': 'Your Notice Period',
        'liability_cap': 'Liability Cap',
        'kill_fee_percent': 'Cancellation Fee',
    };

    return {
        type: deviation.term,
        typeLabel: typeLabels[deviation.term] || deviation.termLabel,
        found: String(deviation.contractValue),
        fairStandard: String(deviation.fairValue),
        severity: deviation.severity === 'critical' ? 85 : deviation.severity === 'warning' ? 60 : 30,
        explanation: deviation.recommendation,
        recommendation: deviation.severity === 'critical'
            ? 'This is significantly below industry standard. Negotiate firmly or consider walking away.'
            : 'Consider requesting terms closer to industry standard.',
    };
}

export default function AnalyzePage() {
    const router = useRouter();
    const { setResults: setContextResults } = useAnalysis();
    const { isLoggedIn, openLoginModal } = useAuth();
    const { t, isHindi } = useLanguage();
    const [appState, setAppState] = useState<AppState>('upload');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [currentLayer, setCurrentLayer] = useState<ProcessingLayer | 'complete'>('regex');
    const [completedLayers, setCompletedLayers] = useState<ProcessingLayer[]>([]);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [extractedText, setExtractedText] = useState<string>('');
    const [isFixingContract, setIsFixingContract] = useState(false);
    const [fixedContractText, setFixedContractText] = useState<string | null>(null);
    const [processingError, setProcessingError] = useState<string | null>(null);
    const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('eng');

    // Sync with global language toggle initially
    useEffect(() => {
        if (isHindi && selectedLanguage === 'eng') {
            setSelectedLanguage('hin');
        }
    }, [isHindi]); // Only run when isHindi changes

    // Email Generator State
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
    const [emailData, setEmailData] = useState<{ subject: string; body: string; tone: string } | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [showFixModal, setShowFixModal] = useState(false);

    const processDocument = useCallback(async (file: File) => {
        setAppState('processing');
        setProcessingError(null);
        setCurrentLayer('regex');
        setCompletedLayers([]);

        const startTime = performance.now();

        try {
            // Layer 1: Parse document (unified parser handles PDF/DOCX)
            setCurrentLayer('regex');

            const parseResult = await parseDocument(file, undefined, selectedLanguage);
            setExtractedText(parseResult.text);

            // Run regex detection
            const regexViolations = detectViolations(parseResult.text);

            // Run deviation checking
            const deviations = checkDeviations(parseResult.text, 'freelance_general');

            await new Promise(resolve => setTimeout(resolve, 500));
            setCompletedLayers(['regex']);

            // Layer 2: RAG matching
            setCurrentLayer('rag');
            await new Promise(resolve => setTimeout(resolve, 600));
            setCompletedLayers(['regex', 'rag']);

            // Layer 3: AI Analysis
            setCurrentLayer('ai');

            let aiAnalysis: AIAnalysisResponse | undefined;
            let aiViolations: Violation[] = [];
            let aiAvailable = false;

            try {
                // Apply PII redaction before sending to API (Privacy by Design)
                const { redactedText } = redactPII(parseResult.text);

                const response = await fetch('/api/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contractText: redactedText,
                        hindiMode: isHindi,
                        outputLanguage: selectedLanguage
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.analysis) {
                        aiAnalysis = data.analysis;
                        aiViolations = data.analysis.violations.map(convertAIViolation);
                        aiAvailable = true;
                    }
                }
            } catch (error) {
                console.warn('AI analysis unavailable:', error);
            }

            setCompletedLayers(['regex', 'rag', 'ai']);

            const endTime = performance.now();

            // Merge violations
            const violations = aiAvailable
                ? mergeViolations(regexViolations, aiViolations)
                : regexViolations.map(v => ({ ...v, source: 'regex' as const }));

            // Calculate results
            const riskScore = aiAnalysis?.overallScore ?? calculateRiskScore(violations);
            const legalViolations = violations.filter(v => v.category === 'legal').length;
            const unfairTerms = violations.filter(v => v.category === 'unfair').length;

            setAnalysisResult({
                violations,
                deviations,
                riskScore,
                legalViolations,
                unfairTerms,
                analysisTime: Math.round(endTime - startTime),
                documentInfo: {
                    pages: parseResult.pages,
                    wordCount: parseResult.wordCount,
                    fileName: file.name,
                    parseMethod: parseResult.parseMethod,
                },
                aiAnalysis,
                aiAvailable,
            });

            // Store results in context for the results page
            const contextResults: ContextAnalysisResult = {
                violations,
                deviations,
                riskScore,
                legalViolations,
                unfairTerms,
                analysisTime: Math.round(endTime - startTime),
                documentInfo: {
                    pages: parseResult.pages,
                    wordCount: parseResult.wordCount,
                    fileName: file.name,
                    parseMethod: parseResult.parseMethod,
                },
                aiAnalysis,
                aiAvailable,
                timestamp: Date.now(),
            };
            setContextResults(contextResults);

            // Save to history for Reports page
            try {
                const history = localStorage.getItem("verity_report_history");
                const parsedHistory = history ? JSON.parse(history) : [];
                // Save full result to allow viewing details later
                // Limit to last 20 to avoid quota issues
                const newHistory = [contextResults, ...parsedHistory].slice(0, 20);
                localStorage.setItem("verity_report_history", JSON.stringify(newHistory));
            } catch (e) {
                console.error("Failed to save history", e);
            }

            setCurrentLayer('complete');
            await new Promise(resolve => setTimeout(resolve, 500));

            // Redirect to results page
            router.push('/results');

        } catch (error) {
            console.error('Analysis failed:', error);
            const errorMessage = error instanceof Error
                ? error.message
                : 'Failed to analyze document. Please try again.';
            setProcessingError(errorMessage);
            setAppState('upload');
        }
    }, [selectedLanguage, isHindi, setContextResults, router]);

    const handleFileSelect = useCallback((file: File) => {
        setSelectedFile(file);
        processDocument(file);
    }, [processDocument]);

    const handleClear = useCallback(() => {
        setSelectedFile(null);
        setAppState('upload');
        setAnalysisResult(null);
        setExtractedText('');
        setFixedContractText(null);
        setProcessingError(null);
        setEmailData(null);
        setEmailError(null);
    }, []);

    const handleNewAnalysis = useCallback(() => {
        handleClear();
    }, [handleClear]);

    const handleGenerateEmail = useCallback(async (tone: 'polite' | 'firm') => {
        if (!analysisResult) return;

        setIsGeneratingEmail(true);
        setEmailError(null);
        try {
            const response = await fetch('/api/generate-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    violations: analysisResult.violations.map(v => v.type),
                    tone: tone,
                    senderName: "[Your Name]", // Ideally this would come from user profile
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.email) {
                    setEmailData(data.email);
                } else {
                    throw new Error(data.error || 'Failed to generate email');
                }
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate email');
            }
        } catch (error) {
            console.error('Email generation error:', error);
            setEmailError(error instanceof Error ? error.message : 'Failed to generate email');
        } finally {
            setIsGeneratingEmail(false);
        }
    }, [analysisResult]);

    const handleFixContract = useCallback(async () => {
        if (!extractedText || !analysisResult) return;

        setIsFixingContract(true);
        try {
            const response = await fetch('/api/fix-contract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contractText: extractedText,
                    violations: analysisResult.violations,
                }),
            });

            if (response.ok) {
                const fixedText = await response.text();
                setFixedContractText(fixedText);
                setShowFixModal(true);
            } else {
                console.error('Fix contract failed');
            }
        } catch (error) {
            console.error('Fix contract error:', error);
        } finally {
            setIsFixingContract(false);
        }
    }, [extractedText, analysisResult]);

    const handleDownloadFixed = useCallback(async () => {
        if (!fixedContractText || !analysisResult) return;

        // Count changes for metadata
        const changes = countChanges(fixedContractText);

        // Generate and download DOCX
        const metadata: DocxMetadata = {
            fileName: analysisResult.documentInfo.fileName,
            analysisDate: new Date(),
            riskScore: analysisResult.riskScore,
            issuesFixed: changes.removed,
            termsModified: changes.modified + changes.added,
        };

        await generateFixedContractDocx(fixedContractText, metadata);
    }, [fixedContractText, analysisResult]);

    return (
        <main className="min-h-screen bg-background-dark">
            {/* Header */}
            <header className="fixed top-0 z-50 w-full bg-black/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-4">
                        <div className="size-10 flex items-center justify-center bg-accent text-black rotate-45">
                            <span className="material-symbols-outlined -rotate-45" style={{ fontSize: '24px', fontWeight: 'bold' }}>gavel</span>
                        </div>
                        <h2 className="text-2xl font-black tracking-tighter uppercase font-cabinet">Verity</h2>
                    </Link>

                    <nav className="flex items-center gap-6">
                        {isLoggedIn ? (
                            <Link href="/reports">
                                <Button variant="outline" size="sm" className="font-bold uppercase tracking-wider">Dashboard</Button>
                            </Link>
                        ) : (
                            <Button variant="outline" size="sm" onClick={openLoginModal} className="font-bold uppercase tracking-wider text-accent border-accent/20 hover:bg-accent/10">Login</Button>
                        )}
                        {appState === 'results' && (
                            <Button variant="ghost" size="sm" onClick={handleNewAnalysis}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                New Analysis
                            </Button>
                        )}
                    </nav>
                </div>
            </header>

            <div className="pt-28 pb-24 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Upload State */}
                    {appState === 'upload' && (
                        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-8">
                            <div className="text-center space-y-4">
                                <h1 className="font-cabinet text-4xl md:text-6xl uppercase">
                                    Analyze Your <span className="text-accent">Contract</span>
                                </h1>
                                <p className="text-white/50 text-lg max-w-xl mx-auto">
                                    Upload your contract and get instant insights on legal violations, unfair terms,
                                    and Supreme Court citations.
                                </p>
                            </div>

                            {/* Language Selector */}
                            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                                <Globe className="w-4 h-4 text-white/50" />
                                <span className="text-sm text-white/60">Document Language:</span>
                                <select
                                    className="bg-transparent border-none text-sm text-white focus:ring-0 cursor-pointer"
                                    value={selectedLanguage}
                                    onChange={(e) => setSelectedLanguage(e.target.value as SupportedLanguage)}
                                >
                                    {(Object.entries(LANGUAGE_LABELS) as [SupportedLanguage, string][]).map(([code, label]) => (
                                        <option key={code} value={code} className="bg-black text-white">
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <UploadZone
                                onFileSelect={handleFileSelect}
                                selectedFile={selectedFile}
                                onClear={handleClear}
                            />

                            {/* Error Message */}
                            {processingError && (
                                <div className="w-full max-w-2xl mx-auto mt-6 p-4 bg-danger/10 border border-danger/20 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-danger font-bold text-sm">Analysis Failed</p>
                                            <p className="text-danger/70 text-sm mt-1">{processingError}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex gap-3">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setProcessingError(null);
                                                setSelectedFile(null);
                                            }}
                                        >
                                            Try Different File
                                        </Button>
                                        {selectedFile && (
                                            <Button
                                                size="sm"
                                                onClick={() => processDocument(selectedFile)}
                                            >
                                                Retry Analysis
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
// ... rest of file

                    {/* Processing State */}
                    {appState === 'processing' && (
                        <div className="min-h-[60vh] flex items-center justify-center">
                            <ProcessingAnimation
                                currentLayer={currentLayer}
                                completedLayers={completedLayers}
                            />
                        </div>
                    )}

                    {/* Results State */}
                    {appState === 'results' && analysisResult && (
                        <div className="space-y-8">
                            {/* Results Header */}
                            <div className="text-center space-y-4">
                                <h1 className="font-cabinet text-3xl md:text-5xl uppercase">
                                    Analysis <span className="text-accent">Complete</span>
                                </h1>
                                <p className="text-white/50">
                                    {analysisResult.documentInfo.fileName} • {analysisResult.documentInfo.pages} pages • {analysisResult.documentInfo.wordCount.toLocaleString()} words
                                </p>

                                {/* Status Badges */}
                                <div className="flex flex-wrap justify-center gap-2">
                                    {analysisResult.aiAvailable ? (
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/20 border border-success/30 rounded-full text-success text-sm">
                                            <Sparkles className="w-4 h-4" />
                                            AI-Powered Analysis
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-warning/20 border border-warning/30 rounded-full text-warning text-sm">
                                            <AlertCircle className="w-4 h-4" />
                                            Regex Analysis Only
                                        </div>
                                    )}
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-info/20 border border-info/30 rounded-full text-info text-sm">
                                        <FileText className="w-4 h-4" />
                                        {analysisResult.documentInfo.parseMethod.toUpperCase()}
                                    </div>
                                </div>
                            </div>

                            {/* AI Summary */}
                            {analysisResult.aiAnalysis && (
                                <div className="bg-background-card border border-white/10 rounded-xl p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Sparkles className="w-5 h-5 text-accent" />
                                        <h3 className="text-lg font-bold uppercase tracking-wider">AI Assessment</h3>
                                        <span className={`ml-auto px-3 py-1 rounded-full text-sm font-bold uppercase ${analysisResult.aiAnalysis.recommendation === 'reject' ? 'bg-danger text-white' :
                                            analysisResult.aiAnalysis.recommendation === 'negotiate' ? 'bg-warning text-black' :
                                                'bg-success text-white'
                                            }`}>
                                            {analysisResult.aiAnalysis.recommendation}
                                        </span>
                                    </div>
                                    <p className="text-white/70 leading-relaxed">{analysisResult.aiAnalysis.summary}</p>

                                    {analysisResult.aiAnalysis.criticalIssues.length > 0 && (
                                        <div className="mt-4 p-4 bg-danger/10 border border-danger/20 rounded-lg">
                                            <p className="text-xs font-bold uppercase tracking-wider text-danger mb-2">Critical Issues</p>
                                            <ul className="list-disc list-inside space-y-1 text-sm text-white/60">
                                                {analysisResult.aiAnalysis.criticalIssues.map((issue, i) => (
                                                    <li key={i}>{issue}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Two Column Layout */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                {/* Left Column - Risk Score */}
                                <div className="lg:col-span-4">
                                    <RiskScore
                                        score={analysisResult.riskScore}
                                        violationCount={analysisResult.violations.length}
                                        legalViolations={analysisResult.legalViolations}
                                        unfairTerms={analysisResult.unfairTerms}
                                        analysisTime={analysisResult.analysisTime}
                                    />
                                </div>

                                {/* Right Column - Violations & Deviations */}
                                <div className="lg:col-span-8 space-y-8">
                                    {/* Legal Violations Section */}
                                    {analysisResult.legalViolations > 0 && (
                                        <div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="h-1 w-8 bg-danger rounded" />
                                                <h2 className="text-xl font-black uppercase text-danger">
                                                    Legal Violations ({analysisResult.legalViolations})
                                                </h2>
                                            </div>
                                            {analysisResult.violations
                                                .filter(v => v.category === 'legal')
                                                .map(violation => (
                                                    <ViolationCard key={violation.id} violation={violation} />
                                                ))
                                            }
                                        </div>
                                    )}

                                    {/* Unfair Terms Section */}
                                    {analysisResult.unfairTerms > 0 && (
                                        <div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="h-1 w-8 bg-warning rounded" />
                                                <h2 className="text-xl font-black uppercase text-warning">
                                                    Unfair Terms ({analysisResult.unfairTerms})
                                                </h2>
                                            </div>
                                            {analysisResult.violations
                                                .filter(v => v.category === 'unfair')
                                                .map(violation => (
                                                    <ViolationCard key={violation.id} violation={violation} />
                                                ))
                                            }
                                        </div>
                                    )}

                                    {/* Deviations Section */}
                                    {analysisResult.deviations.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="h-1 w-8 bg-amber-500 rounded" />
                                                <h2 className="text-xl font-black uppercase text-amber-500">
                                                    <Zap className="inline w-5 h-5 mr-2" />
                                                    Deviations from Fair Standard ({analysisResult.deviations.length})
                                                </h2>
                                            </div>
                                            <p className="text-white/50 text-sm mb-4">
                                                These terms are legal but significantly harsher than industry norms.
                                            </p>
                                            {analysisResult.deviations.map((deviation, index) => (
                                                <DeviationCard key={index} {...deviationToCardProps(deviation)} />
                                            ))}
                                        </div>
                                    )}

                                    {/* Market Rate Comparison */}
                                    <div className="mb-8">
                                        <RateComparison className="w-full" />
                                    </div>

                                    {/* No Issues Found */}
                                    {analysisResult.violations.length === 0 && analysisResult.deviations.length === 0 && (
                                        <div className="bg-success/10 border border-success/20 rounded-xl p-8 text-center">
                                            <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Sparkles className="w-8 h-8 text-white" />
                                            </div>
                                            <h3 className="text-xl font-black uppercase text-success mb-2">
                                                Looking Good!
                                            </h3>
                                            <p className="text-white/60">
                                                No significant legal violations or unfair terms detected.
                                                This contract appears to be reasonably fair.
                                            </p>
                                        </div>
                                    )}

                                    {/* Extracted Text Preview */}
                                    {extractedText && (
                                        <div className="bg-background-card border border-white/10 rounded-xl p-6">
                                            <h3 className="text-sm font-bold uppercase tracking-wider text-white/50 mb-4">
                                                Extracted Text Preview
                                            </h3>
                                            <div className="font-serif text-sm text-white/40 leading-relaxed max-h-48 overflow-y-auto">
                                                {extractedText.slice(0, 1500)}...
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Bar */}
                            <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/10 p-4">
                                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={() => setShowEmailModal(true)}
                                        disabled={analysisResult.violations.length === 0}
                                    >
                                        <Mail className="w-5 h-5 mr-2" />
                                        Generate Negotiation Email
                                    </Button>
                                    <Button
                                        size="lg"
                                        onClick={handleFixContract}
                                        disabled={isFixingContract || analysisResult.violations.length === 0}
                                    >
                                        {isFixingContract ? (
                                            <>
                                                <div className="w-5 h-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Generating Document...
                                            </>
                                        ) : (
                                            <>
                                                <Wrench className="w-5 h-5 mr-2" />
                                                Fix This Contract
                                                <Download className="w-4 h-4 ml-2" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <EmailModal
                isOpen={showEmailModal}
                onClose={() => setShowEmailModal(false)}
                onGenerate={handleGenerateEmail}
                loading={isGeneratingEmail}
                emailData={emailData}
                error={emailError}
            />

            <ContractFixModal
                isOpen={showFixModal}
                onClose={() => setShowFixModal(false)}
                fixedText={fixedContractText}
                onDownload={handleDownloadFixed}
                fileName={analysisResult?.documentInfo.fileName || 'contract'}
            />

            <ProfileSetupModal />
        </main>
    );
}

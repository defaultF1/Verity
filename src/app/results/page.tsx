"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { RiskGauge } from "@/components/dashboard/risk-gauge";
import { AnalysisOverview } from "@/components/dashboard/analysis-overview";
import { ViolationFeedItem } from "@/components/dashboard/violation-feed-item";
import { StatusBar } from "@/components/dashboard/status-bar";
import { BookmarkRail } from "@/components/dashboard/bookmark-rail";
import { Disclaimer } from "@/components/disclaimer";
import { useAnalysis } from "@/contexts/analysis-context";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { Filter, ArrowUpDown, Calculator, MessageSquare, DollarSign } from "lucide-react";

// Import feature components
// import { ShieldToggle } from "@/components/shield/shield-toggle";
import { ShieldAlerts } from "@/components/shield/shield-alerts";
import { KillFeeModal } from "@/components/kill-fee/kill-fee-modal";
import { NegotiationModal } from "@/components/negotiation/negotiation-modal";
import { EmailModal as NegotiationEmailModal } from "@/components/email-modal";
import { LanguageToggle } from "@/components/language-toggle";

// Import detection logic
import { detectShieldIssues, type ShieldAlert } from "@/lib/shield-patterns";

// Violation type for negotiation modal
interface ViolationForNegotiation {
    id: string;
    type: string;
    match: string;
    context?: string;
    severity: number;
    category: "legal" | "unfair";
    section?: string;
    actName?: string;
    caseLaw?: string;
    eli5?: string;
    fairAlternative?: string;
    source?: "regex" | "ai";
}

// Wrapper component to handle Suspense for search params
function ResultsPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const { results, setResults, isExpired } = useAnalysis();
    const { profile } = useAuth();
    const { t, isHindi } = useLanguage();

    const [sortBy, setSortBy] = useState("risk");
    const [filterBy, setFilterBy] = useState("all");

    // Feature states
    const [shieldEnabled, setShieldEnabled] = useState(false);
    const [shieldAlerts, setShieldAlerts] = useState<ShieldAlert[]>([]);
    const [showKillFeeModal, setShowKillFeeModal] = useState(false);
    const [showNegotiationModal, setShowNegotiationModal] = useState(false);
    const [selectedViolation, setSelectedViolation] = useState<ViolationForNegotiation | null>(null);
    const [hasKillFeeClause, setHasKillFeeClause] = useState(true);

    // Acknowledgements State
    const [acknowledgedIds, setAcknowledgedIds] = useState<string[]>([]);

    // Email Generator State
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
    const [emailData, setEmailData] = useState<{ subject: string; body: string; tone: string } | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);

    // Email Generation Logic
    const handleGenerateEmail = async (tone: 'polite' | 'firm') => {
        if (!results) return;

        setIsGeneratingEmail(true);
        setEmailError(null);
        try {
            const response = await fetch('/api/generate-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    violations: results.violations.map((v: ViolationForNegotiation) => ({
                        type: v.type,
                        clauseText: v.match,
                        severity: v.severity,
                        section: v.section || "General",
                        eli5: v.eli5 || "Potential legal risk identified in this clause."
                    })),
                    tone: tone,
                    senderName: profile?.name || "[Your Name]",
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
    };

    // Auto-enable shield mode for female users
    useEffect(() => {
        if (profile?.gender === "female") {
            setShieldEnabled(true);
        }
    }, [profile]);

    // Detect shield issues when enabled
    useEffect(() => {
        if (shieldEnabled && results) {
            // Get contract text from localStorage if available
            const stored = localStorage.getItem("verity_analysis");
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    // Try to get extracted text from the analysis
                    const contractText = parsed.violations?.map((v: ViolationForNegotiation) => v.match).join(" ") || "";
                    if (contractText) {
                        const alerts = detectShieldIssues(contractText);
                        setShieldAlerts(alerts);
                    }
                } catch (e) {
                    console.error("Failed to detect shield issues", e);
                }
            }
        } else {
            setShieldAlerts([]);
        }

    }, [shieldEnabled, results]);

    // Load acknowledgements
    useEffect(() => {
        const stored = localStorage.getItem("verity_acknowledged_violations");
        if (stored) {
            try {
                setAcknowledgedIds(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to load acknowledgements", e);
            }
        }
    }, []);

    // Check for kill fee clause
    useEffect(() => {
        if (results) {
            // Check if any violation mentions kill fee, termination fee, or cancellation
            const hasKillFee = results.violations?.some((v: ViolationForNegotiation) =>
                v.match.toLowerCase().includes("kill fee") ||
                v.match.toLowerCase().includes("termination fee") ||
                v.match.toLowerCase().includes("cancellation fee")
            );
            setHasKillFeeClause(!!hasKillFee);
        }
    }, [results]);

    // Handle initial load, history loading, and redirection
    useEffect(() => {
        // If we have an ID, try to load it specifically
        if (id) {
            // If current results match the ID, we're good
            if (results && results.timestamp.toString() === id) {
                return;
            }

            // Otherwise try to find in history
            const history = localStorage.getItem("verity_report_history");
            if (history) {
                try {
                    const parsed = JSON.parse(history);
                    const found = parsed.find((r: { timestamp: number }) => r.timestamp.toString() === id);
                    if (found) {
                        setResults(found);
                        return;
                    }
                } catch (e) {
                    console.error("Failed to load history", e);
                }
            }
        }

        // Standard check: redirect if no results or expired (and we're not viewing a valid history item)
        if (!results || (isExpired() && !id)) {
            router.push("/analyze");
        }
    }, [id, results, isExpired, router, setResults]);

    // Handle opening negotiation modal
    const handlePracticeNegotiation = (violation: ViolationForNegotiation) => {
        setSelectedViolation(violation);
        setShowNegotiationModal(true);
    };

    // Handle acknowledgement
    const handleAcknowledge = (violationId: string) => {
        setAcknowledgedIds(prev => {
            const next = prev.includes(violationId)
                ? prev.filter(id => id !== violationId) // Toggle off if already exists (undo)
                : [...prev, violationId];

            localStorage.setItem("verity_acknowledged_violations", JSON.stringify(next));
            return next;
        });
    };

    // Show loading if no results yet
    if (!results) {
        return (
            <div className="min-h-screen bg-[#f8f6f6] dark:bg-[#211611] flex items-center justify-center">
                <div className="animate-pulse text-[#c65316] text-xl">Loading results...</div>
            </div>
        );
    }

    // Format date
    const scanDate = new Date(results.timestamp).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });

    // Helper for deterministic progress
    const getStableProgress = (violationId: string) => {
        let hash = 0;
        for (let i = 0; i < violationId.length; i++) {
            hash = violationId.charCodeAt(i) + ((hash << 5) - hash);
        }
        return (Math.abs(hash) % 75) + 25; // Range 25-99
    };

    // Map violations to feed items
    const violationItems = results.violations.map((v, i) => {
        const translatedType = t(v.type);
        // If translation returns the key itself (meaning no translation found), use regex formatting
        // Otherwise use the translation (which handles both En and Hi correctly)
        const title = translatedType === v.type
            ? v.type.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())
            : translatedType;

        return {
            id: v.id,
            title: title,
            description: v.match,
            riskLevel: (v.severity >= 70 ? "high" : v.severity >= 40 ? "medium" : "low") as "high" | "medium" | "low",
            executiveSummary: isHindi && v.eli5 ? v.eli5 : (v.eli5 || "This clause may pose legal risks under Indian Contract Law."),
            section: v.section ? t(v.section) : undefined,
            progress: getStableProgress(v.id),
            icon: (v.category === "legal" ? "security" : "handshake") as "security" | "handshake",
            violation: v, // Keep original violation for negotiation
            fairAlternative: v.fairAlternative,
            caseLaw: v.caseLaw,
            isAcknowledged: acknowledgedIds.includes(v.id),
            onAcknowledge: handleAcknowledge
        };
    });

    // Apply filters
    let filteredItems = violationItems;
    if (filterBy === "critical") {
        filteredItems = violationItems.filter(v => v.riskLevel === "high");
    }

    // Apply sorting
    if (sortBy === "risk") {
        filteredItems.sort((a, b) => {
            const order = { high: 0, medium: 1, low: 2 };
            return order[a.riskLevel] - order[b.riskLevel];
        });
    }

    // Generate bookmarks for the rail
    const bookmarks = filteredItems.map(item => ({
        id: item.id,
        label: item.section ? `${item.section}: ${item.title}` : item.title,
        riskLevel: item.riskLevel
    }));

    return (
        <div className="min-h-screen bg-[#f8f6f6]">
            <DashboardNav activeTab="Dashboard" />
            <BookmarkRail items={bookmarks} />

            <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:pr-72 py-10 pb-24">
                {/* Language Toggle */}
                <div className="flex justify-end mb-6">
                    <LanguageToggle />
                </div>

                {/* Shield Mode Section - Automated based on profile, no toggle needed */}
                {shieldEnabled && (
                    <div className="mb-8 flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-sm text-purple-800 text-sm font-bold uppercase tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                        Women Freelancer Shield Active
                    </div>
                )}

                {/* Shield Alerts */}
                {shieldEnabled && shieldAlerts.length > 0 && (
                    <div className="mb-8">
                        <ShieldAlerts alerts={shieldAlerts} />
                    </div>
                )}

                {/* Kill Fee Alert */}
                {!hasKillFeeClause && (
                    <div className="mb-8 p-5 bg-amber-50 border border-amber-300 rounded-sm">
                        <div className="flex items-start gap-4">
                            <div className="size-12 rounded-sm bg-amber-500 flex items-center justify-center flex-shrink-0">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-amber-800">
                                    ⚠️ {t("Missing: Kill Fee Protection") || "Missing: Kill Fee Protection"}
                                </h3>
                                <p className="text-amber-700 text-sm mt-1">
                                    This contract does not appear to have a kill fee clause.
                                    If the client terminates the project early, you may not receive fair compensation.
                                </p>
                                <button
                                    onClick={() => setShowKillFeeModal(true)}
                                    className="mt-4 px-6 py-3 bg-amber-500 text-white font-bold uppercase tracking-wider text-sm rounded-sm hover:bg-amber-600 transition flex items-center gap-2"
                                >
                                    <Calculator className="w-4 h-4" />
                                    Calculate Your Kill Fee
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Sidebar */}
                    <aside className="lg:col-span-3 space-y-8">
                        <RiskGauge score={results.riskScore} />

                        <AnalysisOverview
                            entityName={results.documentInfo.fileName.split(".")[0]}
                            lastScanDate={scanDate}
                            criticalIssues={results.legalViolations}
                            mediumIssues={results.unfairTerms}
                            dataPoints={`${(results.documentInfo.wordCount / 1000).toFixed(1)}K Words`}
                        />

                        {/* Quick Actions */}
                        <div className="bg-white rounded-sm shadow-lg border border-white p-5">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-4">
                                Quick Actions
                            </h4>
                            <div className="space-y-3">
                                <button
                                    onClick={() => setShowEmailModal(true)}
                                    className="w-full px-4 py-3 text-sm font-bold text-accent bg-accent/5 border border-accent/20 rounded-sm hover:bg-accent/10 transition flex items-center gap-2"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    Draft Negotiation Email
                                </button>
                                <button
                                    onClick={() => setShowKillFeeModal(true)}
                                    className="w-full px-4 py-3 text-sm font-bold text-[#c65316] bg-[#c65316]/5 border border-[#c65316]/20 rounded-sm hover:bg-[#c65316]/10 transition flex items-center gap-2"
                                >
                                    <Calculator className="w-4 h-4" />
                                    Kill Fee Calculator
                                </button>
                            </div>
                        </div>

                        {/* Footer Links */}
                        <div className="flex justify-center gap-6 text-[11px] font-bold uppercase tracking-widest text-stone-400">
                            <Link href="#" className="hover:text-[#c65316] transition-colors underline decoration-[#c65316]/20 underline-offset-4">
                                Privacy
                            </Link>
                            <Link href="#" className="hover:text-[#c65316] transition-colors underline decoration-[#c65316]/20 underline-offset-4">
                                Terms
                            </Link>
                            <Link href="#" className="hover:text-[#c65316] transition-colors underline decoration-[#c65316]/20 underline-offset-4">
                                Support
                            </Link>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <section className="lg:col-span-9">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
                            <div>
                                <h1 className="text-4xl font-bold text-[#c65316]">
                                    {t("Violation Feed") || "Violation Feed"}
                                </h1>
                                <p className="text-stone-500 mt-2">
                                    {t("Prioritized legal and regulatory findings") || "Prioritized legal and regulatory findings"}
                                </p>
                            </div>

                            {/* Filters */}
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                        <ArrowUpDown className="w-4 h-4 text-stone-400" />
                                    </span>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="pl-10 pr-10 py-2.5 text-xs font-bold border border-[#c65316]/10 rounded-sm shadow-sm bg-white text-[#c65316] focus:ring-[#c65316] focus:border-[#c65316] uppercase tracking-wider"
                                    >
                                        <option value="risk">Risk Level</option>
                                        <option value="date">Date</option>
                                    </select>
                                </div>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                        <Filter className="w-4 h-4 text-stone-400" />
                                    </span>
                                    <select
                                        value={filterBy}
                                        onChange={(e) => setFilterBy(e.target.value)}
                                        className="pl-10 pr-10 py-2.5 text-xs font-bold border border-[#c65316]/10 rounded-sm shadow-sm bg-white text-[#c65316] focus:ring-[#c65316] focus:border-[#c65316] uppercase tracking-wider"
                                    >
                                        <option value="all">{t("All Violations") || "All Violations"}</option>
                                        <option value="critical">{t("Critical Only") || "Critical Only"}</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Legal Disclaimer */}
                        <Disclaimer variant="results" />

                        {/* Violation List */}
                        <div className="space-y-8">
                            {filteredItems.length > 0 ? (
                                filteredItems.map((item) => (
                                    <div key={item.id} className="relative">
                                        <ViolationFeedItem {...item} />
                                        {/* Practice Negotiation Button */}
                                        <div className="mt-3 flex justify-end">
                                            <button
                                                onClick={() => handlePracticeNegotiation(item.violation)}
                                                className="px-6 py-2 text-xs font-bold uppercase tracking-widest text-purple-700 bg-purple-50 border border-purple-200 rounded-sm hover:bg-purple-100 transition flex items-center gap-2"
                                            >
                                                <MessageSquare className="w-4 h-4" />
                                                Practice Negotiating This
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-[#FDFDFD] rounded-sm shadow-lg p-12 text-center border border-white">
                                    <p className="text-stone-500">
                                        No violations found matching your filter.
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>

            <StatusBar />

            {/* Feature Modals */}
            <KillFeeModal
                isOpen={showKillFeeModal}
                onClose={() => setShowKillFeeModal(false)}
            />

            <NegotiationModal
                isOpen={showNegotiationModal}
                onClose={() => setShowNegotiationModal(false)}
                violation={selectedViolation}
            />

            <NegotiationEmailModal
                isOpen={showEmailModal}
                onClose={() => setShowEmailModal(false)}
                onGenerate={handleGenerateEmail}
                loading={isGeneratingEmail}
                emailData={emailData}
                error={emailError}
            />
        </div>
    );
}

// Default export with Suspense wrapper for useSearchParams
export default function ResultsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#f8f6f6] flex items-center justify-center">
                <div className="animate-pulse text-[#c65316] text-xl">Loading results...</div>
            </div>
        }>
            <ResultsPageContent />
        </Suspense>
    );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { RiskGauge } from "@/components/dashboard/risk-gauge";
import { AnalysisOverview } from "@/components/dashboard/analysis-overview";
import { ViolationFeedItem } from "@/components/dashboard/violation-feed-item";
import { StatusBar } from "@/components/dashboard/status-bar";
import { LoginModal } from "@/components/login-modal";
import { BookmarkRail } from "@/components/dashboard/bookmark-rail";
import { Disclaimer } from "@/components/disclaimer";
import { useAnalysis } from "@/contexts/analysis-context";
import { Filter, ArrowUpDown } from "lucide-react";

export default function ResultsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const { results, setResults, isExpired } = useAnalysis();
    const [sortBy, setSortBy] = useState("risk");
    const [filterBy, setFilterBy] = useState("all");

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
                    const found = parsed.find((r: any) => r.timestamp.toString() === id);
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
        // If we have an ID but failed to find it (results is null), we should probably redirect too
        if (!results || (isExpired() && !id)) {
            router.push("/analyze");
        }
    }, [id, results, isExpired, router, setResults]);

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
    const getStableProgress = (id: string) => {
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            hash = id.charCodeAt(i) + ((hash << 5) - hash);
        }
        return (Math.abs(hash) % 75) + 25; // Range 25-99
    };

    // Map violations to feed items
    const violationItems = results.violations.map((v, i) => ({
        id: v.id,
        title: v.type.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase()),
        description: v.match,
        riskLevel: (v.severity >= 70 ? "high" : v.severity >= 40 ? "medium" : "low") as "high" | "medium" | "low",
        executiveSummary: v.eli5 || "This clause may pose legal risks under Indian Contract Law.",
        section: v.section,
        progress: getStableProgress(v.id),
        icon: (v.category === "legal" ? "security" : "handshake") as "security" | "handshake"
    }));

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
            <LoginModal />

            <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:pr-72 py-10 pb-24">
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
                                    Violation Feed
                                </h1>
                                <p className="text-stone-500 mt-2">
                                    Prioritized legal and regulatory findings
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
                                        <option value="all">All Violations</option>
                                        <option value="critical">Critical Only</option>
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
                                    <ViolationFeedItem key={item.id} {...item} />
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
        </div>
    );
}

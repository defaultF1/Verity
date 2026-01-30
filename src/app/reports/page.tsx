"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { StatusBar } from "@/components/dashboard/status-bar";
import { LoginModal } from "@/components/login-modal";
import { useAuth } from "@/contexts/auth-context";
import {
    FileText,
    Download,
    Trash2,
    Eye,
    MoreVertical,
    Plus,
    Search,
    Calendar,
    AlertTriangle,
    CheckCircle,
    Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnalysisResult } from "@/contexts/analysis-context";

// Mock report data
interface Report {
    id: string;
    fileName: string;
    scanDate: string;
    riskScore: number;
    violations: number;
    status: "critical" | "warning" | "safe";
}

const mockReports: Report[] = [
    {
        id: "1",
        fileName: "predatory-freelance-agreement.pdf",
        scanDate: "2026-01-30",
        riskScore: 85,
        violations: 6,
        status: "critical"
    },
    {
        id: "2",
        fileName: "client-nda-v2.docx",
        scanDate: "2026-01-29",
        riskScore: 45,
        violations: 2,
        status: "warning"
    },
    {
        id: "3",
        fileName: "consulting-agreement.pdf",
        scanDate: "2026-01-28",
        riskScore: 22,
        violations: 0,
        status: "safe"
    },
    {
        id: "4",
        fileName: "employment-contract-draft.docx",
        scanDate: "2026-01-27",
        riskScore: 67,
        violations: 4,
        status: "warning"
    }
];

function StatusBadge({ status }: { status: "critical" | "warning" | "safe" }) {
    const styles = {
        critical: {
            bg: "bg-[#5D3D50]",
            text: "text-white",
            icon: AlertTriangle,
            label: "Critical"
        },
        warning: {
            bg: "bg-amber-100",
            text: "text-amber-700",
            icon: Clock,
            label: "Review"
        },
        safe: {
            bg: "bg-emerald-100",
            text: "text-emerald-700",
            icon: CheckCircle,
            label: "Safe"
        }
    };

    const style = styles[status];
    const Icon = style.icon;

    return (
        <span className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm",
            style.bg,
            style.text
        )}>
            <Icon className="w-3 h-3" />
            {style.label}
        </span>
    );
}

function ActionMenu({ onView, onDownload, onDelete }: {
    onView: () => void;
    onDownload: () => void;
    onDelete: () => void;
}) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-[#c65316]/5 rounded-sm transition"
            >
                <MoreVertical className="w-4 h-4 text-stone-400" />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-1 w-40 bg-white border border-stone-200 rounded-sm shadow-lg z-20">
                        <button
                            onClick={() => { onView(); setIsOpen(false); }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-stone-600 hover:bg-[#c65316]/5 hover:text-[#c65316] transition"
                        >
                            <Eye className="w-4 h-4" />
                            View Details
                        </button>
                        <button
                            onClick={() => { onDownload(); setIsOpen(false); }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-stone-600 hover:bg-[#c65316]/5 hover:text-[#c65316] transition"
                        >
                            <Download className="w-4 h-4" />
                            Download PDF
                        </button>
                        <button
                            onClick={() => { onDelete(); setIsOpen(false); }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default function ReportsPage() {
    const router = useRouter();
    const { isLoggedIn, openLoginModal } = useAuth();
    const [reports, setReports] = useState<Report[]>(mockReports);
    const [searchQuery, setSearchQuery] = useState("");

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isLoggedIn) {
            openLoginModal();
        }
    }, [isLoggedIn, openLoginModal]);

    // Load history
    useEffect(() => {
        const savedHistory = localStorage.getItem("verity_report_history");
        if (savedHistory) {
            try {
                const parsed: AnalysisResult[] = JSON.parse(savedHistory);
                const mappedReports: Report[] = parsed.map(item => ({
                    id: item.timestamp.toString(),
                    fileName: item.documentInfo.fileName,
                    scanDate: new Date(item.timestamp).toISOString(),
                    riskScore: item.riskScore,
                    violations: item.violations.length,
                    status: (item.riskScore >= 70 ? "critical" : item.riskScore >= 40 ? "warning" : "safe") as "critical" | "warning" | "safe"
                }));

                // Remove duplicates if any (though unlikely with mock IDs being small numbers)
                setReports(prev => {
                    // meaningful merge if needed, but for now just appending mapped + mock
                    return [...mappedReports, ...mockReports];
                });
            } catch (e) {
                console.error("Failed to load history", e);
            }
        }
    }, []);

    const filteredReports = reports.filter(report =>
        report.fileName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleView = (id: string) => {
        router.push(`/results?id=${id}`);
    };

    const handleDownload = (report: Report) => {
        // Mock PDF download
        const element = document.createElement("a");
        const content = `Verity Analysis Report\n\nFile: ${report.fileName}\nDate: ${report.scanDate}\nRisk Score: ${report.riskScore}\nViolations: ${report.violations}`;
        const file = new Blob([content], { type: "text/plain" });
        element.href = URL.createObjectURL(file);
        element.download = `verity-report-${report.id}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const handleDelete = (id: string) => {
        setReports(reports.filter(r => r.id !== id));

        // Remove from local storage history
        const history = localStorage.getItem("verity_report_history");
        if (history) {
            try {
                const parsed = JSON.parse(history);
                const newHistory = parsed.filter((r: any) => r.timestamp.toString() !== id);
                localStorage.setItem("verity_report_history", JSON.stringify(newHistory));
            } catch (e) {
                console.error(e);
            }
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    };

    return (
        <div className="min-h-screen bg-[#f8f6f6]">
            <DashboardNav activeTab="Reports" />
            <LoginModal />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-[#c65316]">
                            Reports
                        </h1>
                        <p className="text-stone-500 mt-2">
                            View and manage your contract analysis history
                        </p>
                    </div>
                    <Link
                        href="/analyze"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#c65316] text-white text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-[#2A3D36] transition shadow-lg shadow-[#c65316]/10"
                    >
                        <Plus className="w-4 h-4" />
                        New Scan
                    </Link>
                </div>

                {/* Search Bar */}
                <div className="relative mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <input
                        type="text"
                        placeholder="Search contracts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-[#c65316]/10 rounded-sm text-stone-700 placeholder:text-stone-400 focus:outline-none focus:border-[#c65316]/30 focus:ring-2 focus:ring-[#c65316]/10"
                    />
                </div>

                {/* Reports Table */}
                <div className="bg-white rounded-sm shadow-lg border border-white overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-stone-50 border-b border-stone-200 text-[10px] font-bold uppercase tracking-widest text-stone-500">
                        <div className="col-span-5">Contract</div>
                        <div className="col-span-2">Date</div>
                        <div className="col-span-2 text-center">Risk Score</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-1"></div>
                    </div>

                    {/* Table Body */}
                    {filteredReports.length > 0 ? (
                        filteredReports.map((report) => (
                            <div
                                key={report.id}
                                className="grid grid-cols-12 gap-4 px-6 py-5 border-b border-stone-100 hover:bg-[#c65316]/[0.02] transition items-center"
                            >
                                {/* Contract Name */}
                                <div className="col-span-5 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#c65316]/5 rounded-sm flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-[#c65316]" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-stone-800 truncate max-w-[200px]">
                                            {report.fileName}
                                        </p>
                                        <p className="text-[10px] text-stone-400 uppercase tracking-wider">
                                            {report.violations} {report.violations === 1 ? "issue" : "issues"} found
                                        </p>
                                    </div>
                                </div>

                                {/* Date */}
                                <div className="col-span-2 flex items-center gap-2 text-sm text-stone-500">
                                    <Calendar className="w-4 h-4 text-stone-400" />
                                    {formatDate(report.scanDate)}
                                </div>

                                {/* Risk Score */}
                                <div className="col-span-2 flex justify-center">
                                    <div className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg",
                                        report.riskScore >= 70 ? "bg-[#5D3D50] text-white" :
                                            report.riskScore >= 40 ? "bg-amber-100 text-amber-700" :
                                                "bg-emerald-100 text-emerald-700"
                                    )}>
                                        {report.riskScore}
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="col-span-2">
                                    <StatusBadge status={report.status} />
                                </div>

                                {/* Actions */}
                                <div className="col-span-1 flex justify-end">
                                    <ActionMenu
                                        onView={() => handleView(report.id)}
                                        onDownload={() => handleDownload(report)}
                                        onDelete={() => handleDelete(report.id)}
                                    />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="px-6 py-16 text-center">
                            <FileText className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                            <p className="text-stone-500 mb-2">No reports found</p>
                            <p className="text-sm text-stone-400">
                                {searchQuery ? "Try a different search term" : "Upload a contract to get started"}
                            </p>
                        </div>
                    )}
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
                    <div className="bg-white rounded-sm shadow-lg p-6 border border-white">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">
                            Total Scans
                        </p>
                        <p className="text-3xl font-bold text-[#c65316]">{reports.length}</p>
                    </div>
                    <div className="bg-white rounded-sm shadow-lg p-6 border border-white">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">
                            Critical Issues
                        </p>
                        <p className="text-3xl font-bold text-[#5D3D50]">
                            {reports.filter(r => r.status === "critical").length}
                        </p>
                    </div>
                    <div className="bg-white rounded-sm shadow-lg p-6 border border-white">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">
                            Safe Contracts
                        </p>
                        <p className="text-3xl font-bold text-emerald-600">
                            {reports.filter(r => r.status === "safe").length}
                        </p>
                    </div>
                </div>
            </div>

            <StatusBar />
        </div>
    );
}

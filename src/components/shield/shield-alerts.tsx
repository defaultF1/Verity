"use client";

import type { ShieldAlert } from "@/lib/shield-patterns";
import { cn } from "@/lib/utils";
import { Shield, AlertTriangle, MapPin, Clock, Camera, FileQuestion, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { useState } from "react";

interface ShieldAlertsProps {
    alerts: ShieldAlert[];
}

const CATEGORY_ICONS: Record<ShieldAlert["category"], React.ReactNode> = {
    physical_access: <MapPin className="w-5 h-5" />,
    jurisdiction: <MapPin className="w-5 h-5" />,
    availability: <Clock className="w-5 h-5" />,
    image_rights: <Camera className="w-5 h-5" />,
    scope_vulnerability: <FileQuestion className="w-5 h-5" />,
};

export function ShieldAlerts({ alerts }: ShieldAlertsProps) {
    if (alerts.length === 0) return null;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="size-10 bg-purple-500 rounded-sm flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-purple-700">
                        Women Freelancer Shield Alerts
                    </h2>
                    <p className="text-sm text-purple-500">
                        {alerts.length} potential concern{alerts.length > 1 ? "s" : ""} detected
                    </p>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatBadge
                    label="High Risk"
                    count={alerts.filter(a => a.severity === "high").length}
                    color="red"
                />
                <StatBadge
                    label="Medium Risk"
                    count={alerts.filter(a => a.severity === "medium").length}
                    color="amber"
                />
                <StatBadge
                    label="Access Issues"
                    count={alerts.filter(a => a.category === "physical_access").length}
                    color="purple"
                />
                <StatBadge
                    label="Availability"
                    count={alerts.filter(a => a.category === "availability").length}
                    color="blue"
                />
            </div>

            {/* Alert Cards */}
            <div className="space-y-4">
                {alerts.map(alert => (
                    <ShieldAlertCard key={alert.id} alert={alert} />
                ))}
            </div>

            {/* Footer Stats */}
            <div className="p-4 bg-purple-50 rounded-sm border border-purple-200">
                <p className="text-xs text-purple-600 leading-relaxed">
                    <strong>Based on research:</strong> 67% of women freelancers work from home.
                    Women report 3x more safety concerns in client interactions.
                    42% cite travel requirements as a barrier to taking contracts.
                </p>
                <p className="text-[10px] text-purple-400 mt-2">
                    Sources: Freelancers Union India 2024, Women in Gig Work Report
                </p>
            </div>
        </div>
    );
}

function StatBadge({ label, count, color }: { label: string; count: number; color: "red" | "amber" | "purple" | "blue" }) {
    const colors = {
        red: "bg-red-50 text-red-700 border-red-200",
        amber: "bg-amber-50 text-amber-700 border-amber-200",
        purple: "bg-purple-50 text-purple-700 border-purple-200",
        blue: "bg-blue-50 text-blue-700 border-blue-200",
    };

    return (
        <div className={cn("p-3 rounded-sm border text-center", colors[color])}>
            <div className="text-2xl font-bold">{count}</div>
            <div className="text-[10px] uppercase tracking-wider">{label}</div>
        </div>
    );
}

function ShieldAlertCard({ alert }: { alert: ShieldAlert }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(alert.suggestedRevision);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={cn(
            "bg-white rounded-sm border overflow-hidden",
            alert.severity === "high" ? "border-red-200" : "border-amber-200"
        )}>
            {/* Header */}
            <div
                className={cn(
                    "p-4 flex items-start gap-3 cursor-pointer",
                    alert.severity === "high" ? "bg-red-50" : "bg-amber-50"
                )}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className={cn(
                    "size-10 rounded-sm flex items-center justify-center flex-shrink-0",
                    alert.severity === "high" ? "bg-red-500 text-white" : "bg-amber-500 text-white"
                )}>
                    {CATEGORY_ICONS[alert.category]}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className={cn(
                            "w-4 h-4",
                            alert.severity === "high" ? "text-red-500" : "text-amber-500"
                        )} />
                        <h3 className={cn(
                            "font-bold text-sm uppercase tracking-wider",
                            alert.severity === "high" ? "text-red-700" : "text-amber-700"
                        )}>
                            {alert.categoryLabel}
                        </h3>
                        <span className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                            alert.severity === "high"
                                ? "bg-red-200 text-red-700"
                                : "bg-amber-200 text-amber-700"
                        )}>
                            {alert.severity} risk
                        </span>
                    </div>

                    <p className="text-sm text-stone-600 mt-1 line-clamp-2">
                        &ldquo;{alert.clauseText}&rdquo;
                    </p>
                </div>

                <button className="text-stone-400 hover:text-stone-600">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="p-4 border-t border-stone-100 space-y-4">
                    {/* Clause */}
                    <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">
                            Clause Detected
                        </h4>
                        <div className="p-3 bg-stone-50 rounded-sm border border-stone-200">
                            <p className="text-sm text-stone-700 italic">
                                &ldquo;{alert.clauseText}&rdquo;
                            </p>
                        </div>
                    </div>

                    {/* Why It Matters */}
                    <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">
                            Why This Matters
                        </h4>
                        <p className="text-sm text-stone-600 leading-relaxed">
                            {alert.whyItMatters}
                        </p>
                    </div>

                    {/* Suggested Revision */}
                    <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">
                            Suggested Revision
                        </h4>
                        <div className="p-3 bg-green-50 rounded-sm border border-green-200 relative">
                            <p className="text-sm text-green-800 pr-10">
                                &ldquo;{alert.suggestedRevision}&rdquo;
                            </p>
                            <button
                                onClick={handleCopy}
                                className="absolute top-3 right-3 text-green-600 hover:text-green-800"
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

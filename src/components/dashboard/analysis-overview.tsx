"use client";

import { Building2, Clock, AlertCircle, AlertTriangle, Database } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalysisOverviewProps {
    entityName: string;
    lastScanDate: string;
    criticalIssues: number;
    mediumIssues: number;
    dataPoints: string;
    className?: string;
}

export function AnalysisOverview({
    entityName,
    lastScanDate,
    criticalIssues,
    mediumIssues,
    dataPoints,
    className
}: AnalysisOverviewProps) {
    return (
        <div className={cn(
            "bg-[#FDFDFD] rounded-sm shadow-lg border border-white overflow-hidden",
            className
        )}>
            {/* Header */}
            <div className="bg-[#c65316]/5 px-8 py-5 border-b border-[#c65316]/10 flex justify-between items-center">
                <h3 className="font-bold text-lg text-[#c65316]">
                    Analysis Overview
                </h3>
                <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-[#c65316]/10 text-[#c65316]">
                    Optimal Status
                </span>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
                {/* Entity */}
                <div className="flex items-center justify-between group gap-4">
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Building2 className="w-4 h-4 text-stone-300 group-hover:text-[#c65316] transition" />
                        <span className="text-stone-500 text-xs uppercase tracking-wider font-bold">Entity</span>
                    </div>
                    <span className="font-bold text-[#c65316] text-sm truncate text-right flex-1 min-w-0" title={entityName}>{entityName}</span>
                </div>

                {/* Last Scan */}
                <div className="flex items-center justify-between group gap-4">
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Clock className="w-4 h-4 text-stone-300 group-hover:text-[#c65316] transition" />
                        <span className="text-stone-500 text-xs uppercase tracking-wider font-bold">Last Scan</span>
                    </div>
                    <span className="font-medium text-[#c65316] text-sm whitespace-nowrap">{lastScanDate}</span>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-[#c65316]/5 my-2" />

                {/* Critical Issues */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-[#5D3D50]" />
                        <span className="text-stone-500 text-sm">Critical Issues</span>
                    </div>
                    <span className="font-bold text-xl text-[#5D3D50]">{criticalIssues}</span>
                </div>

                {/* Medium Issues */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-stone-400" />
                        <span className="text-stone-500 text-sm">Medium Issues</span>
                    </div>
                    <span className="font-bold text-xl text-stone-600">{mediumIssues}</span>
                </div>

                {/* Data Points */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Database className="w-4 h-4 text-[#c65316]/40" />
                        <span className="text-stone-500 text-xs uppercase tracking-wider font-bold">Data Points</span>
                    </div>
                    <span className="font-bold text-[#c65316] text-sm whitespace-nowrap">{dataPoints}</span>
                </div>
            </div>
        </div>
    );
}

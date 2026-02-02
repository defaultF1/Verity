"use client";

import { ShieldCheck, Copy, Check, Scale } from "lucide-react";
import { useState } from "react";

interface MissingClause {
    type: string;
    name: string;
    description: string;
    legalBasis?: string;
}

interface MissingRightsCardProps {
    missingClauses: MissingClause[];
}

export function MissingRightsCard({ missingClauses }: MissingRightsCardProps) {
    const [copiedId, setCopiedId] = useState<string | null>(null);

    if (!missingClauses || missingClauses.length === 0) return null;

    const handleCopy = (clause: MissingClause) => {
        const text = `I noticed the contract is missing a clause regarding ${clause.name}. As per ${clause.legalBasis || 'standard industry practice'}, I would like to include this for my protection.`;
        navigator.clipboard.writeText(text);
        setCopiedId(clause.type);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="bg-white rounded-sm shadow-lg border border-emerald-100 overflow-hidden">
            <div className="bg-emerald-50 px-5 py-4 border-b border-emerald-100 flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-sm">
                    <ShieldCheck className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                    <h3 className="text-emerald-900 font-bold text-sm uppercase tracking-wider">
                        Rights You Should Claim
                    </h3>
                    <p className="text-emerald-700 text-xs mt-0.5">
                        These protective clauses are missing from your contract.
                    </p>
                </div>
            </div>

            <div className="divide-y divide-gray-100">
                {missingClauses.map((clause, index) => (
                    <div key={index} className="p-5 hover:bg-gray-50 transition-colors group">
                        <div className="flex justify-between items-start gap-3">
                            <div>
                                <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                    {clause.name}
                                    {clause.legalBasis && (
                                        <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full uppercase tracking-wide border border-stone-200">
                                            {clause.legalBasis}
                                        </span>
                                    )}
                                </h4>
                                <p className="text-stone-600 text-xs mt-2 leading-relaxed">
                                    {clause.description}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-100 border-dashed flex justify-end">
                             <button
                                onClick={() => handleCopy(clause)}
                                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 px-3 py-1.5 rounded-sm hover:bg-emerald-50 transition-colors"
                             >
                                {copiedId === clause.type ? (
                                    <>
                                        <Check className="w-3.5 h-3.5" />
                                        Copied Request
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-3.5 h-3.5" />
                                        Copy Request Text
                                    </>
                                )}
                             </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 text-center">
                <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">
                    Verity Legal Detective
                </p>
            </div>
        </div>
    );
}

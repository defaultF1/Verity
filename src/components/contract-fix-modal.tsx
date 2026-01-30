"use client";

import React, { useState } from 'react';
import { X, Download, FileText, CheckCircle, Eye, Code, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Disclaimer } from "@/components/disclaimer";
import { cn } from "@/lib/utils";

interface Change {
    type: 'removed' | 'added' | 'modified';
    original?: string;
    replacement?: string;
    location?: string;
}

interface ContractFixModalProps {
    isOpen: boolean;
    onClose: () => void;
    fixedText: string | null;
    onDownload: () => void;
    fileName: string;
    changes?: Change[];
    loading?: boolean;
}

export function ContractFixModal({
    isOpen,
    onClose,
    fixedText,
    onDownload,
    fileName,
    changes = [],
    loading = false
}: ContractFixModalProps) {
    const [viewMode, setViewMode] = useState<'preview' | 'diff'>('preview');
    const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

    if (!isOpen) return null;

    // Parse text for diff markers
    const renderDiffView = () => {
        if (!fixedText) return null;

        const lines = fixedText.split('\n');
        return lines.map((line, index) => {
            // Check for markers
            if (line.includes('[REMOVED:')) {
                const content = line.replace(/\[REMOVED:\s*/, '').replace(/\]$/, '');
                return (
                    <div key={index} className="flex items-start gap-2 py-1 px-2 bg-red-500/10 border-l-4 border-red-500">
                        <span className="text-red-400 text-xs font-bold uppercase tracking-wider mt-0.5">DEL</span>
                        <span className="line-through text-red-300/70 text-sm">{content}</span>
                    </div>
                );
            }
            if (line.includes('[ADDED:')) {
                const content = line.replace(/\[ADDED:\s*/, '').replace(/\]$/, '');
                return (
                    <div key={index} className="flex items-start gap-2 py-1 px-2 bg-green-500/10 border-l-4 border-green-500">
                        <span className="text-green-400 text-xs font-bold uppercase tracking-wider mt-0.5">ADD</span>
                        <span className="text-green-300 text-sm font-medium">{content}</span>
                    </div>
                );
            }
            if (line.includes('[MODIFIED:')) {
                const content = line.replace(/\[MODIFIED:\s*/, '').replace(/\]$/, '');
                const [oldText, newText] = content.split(' → ');
                return (
                    <div key={index} className="py-1 px-2 bg-yellow-500/10 border-l-4 border-yellow-500">
                        <div className="flex items-start gap-2">
                            <span className="text-yellow-400 text-xs font-bold uppercase tracking-wider mt-0.5">MOD</span>
                            <div className="flex flex-col gap-1">
                                <span className="line-through text-red-300/70 text-sm">{oldText}</span>
                                <span className="text-green-300 text-sm font-medium">→ {newText}</span>
                            </div>
                        </div>
                    </div>
                );
            }
            return (
                <div key={index} className="py-0.5 px-2 text-sm text-white/70">
                    {line || '\u00A0'}
                </div>
            );
        });
    };

    // Count changes
    const removedCount = fixedText?.match(/\[REMOVED:/g)?.length || 0;
    const addedCount = fixedText?.match(/\[ADDED:/g)?.length || 0;
    const modifiedCount = fixedText?.match(/\[MODIFIED:/g)?.length || 0;
    const totalChanges = removedCount + addedCount + modifiedCount;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-5xl bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-success/10 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-success" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase text-[#FAF9F6] font-display">Fixed Contract Ready</h2>
                            <p className="text-xs text-white/50 font-bold uppercase tracking-wider font-display">
                                {totalChanges} {totalChanges === 1 ? 'Change' : 'Changes'} Made
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* View Mode Toggle */}
                        <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg border border-white/10">
                            <button
                                onClick={() => setViewMode('preview')}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-all",
                                    viewMode === 'preview'
                                        ? "bg-[var(--color-accent)] text-white"
                                        : "text-white/60 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <Eye className="w-3 h-3" />
                                Preview
                            </button>
                            <button
                                onClick={() => setViewMode('diff')}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-all",
                                    viewMode === 'diff'
                                        ? "bg-[var(--color-accent)] text-white"
                                        : "text-white/60 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <Code className="w-3 h-3" />
                                Track Changes
                            </button>
                        </div>

                        <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Change Summary */}
                {totalChanges > 0 && (
                    <div className="flex items-center gap-4 px-6 py-3 border-b border-white/10 bg-black/30">
                        <span className="text-xs text-white/40 font-bold uppercase tracking-wider">Summary:</span>
                        {removedCount > 0 && (
                            <span className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 rounded text-xs font-bold text-red-400">
                                <span className="w-2 h-2 rounded-full bg-red-500" />
                                {removedCount} Removed
                            </span>
                        )}
                        {addedCount > 0 && (
                            <span className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 rounded text-xs font-bold text-green-400">
                                <span className="w-2 h-2 rounded-full bg-green-500" />
                                {addedCount} Added
                            </span>
                        )}
                        {modifiedCount > 0 && (
                            <span className="flex items-center gap-1.5 px-2 py-1 bg-yellow-500/10 rounded text-xs font-bold text-yellow-400">
                                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                                {modifiedCount} Modified
                            </span>
                        )}
                    </div>
                )}

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-auto p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
                            <div className="animate-spin w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full mb-4" />
                            <p className="text-white/50 text-sm font-bold uppercase tracking-wider">Fixing your contract...</p>
                        </div>
                    ) : fixedText ? (
                        <div className={cn(
                            "rounded-lg overflow-hidden",
                            viewMode === 'preview'
                                ? "bg-white text-black p-8 font-serif text-[15px] leading-relaxed"
                                : "bg-black/50 border border-white/10 font-mono text-sm"
                        )}>
                            {viewMode === 'preview' ? (
                                <div className="max-w-3xl mx-auto whitespace-pre-wrap">
                                    {/* Clean preview without markers */}
                                    {fixedText
                                        .replace(/\[REMOVED:[^\]]*\]\n?/g, '')
                                        .replace(/\[ADDED:\s*/g, '')
                                        .replace(/\[MODIFIED:[^→]*→\s*/g, '')
                                        .replace(/\](?=\n|$)/g, '')
                                    }
                                </div>
                            ) : (
                                <div className="space-y-0.5 p-4">
                                    {renderDiffView()}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full min-h-[300px] opacity-50">
                            <FileText className="w-12 h-12 mb-4 text-white/40" />
                            <p className="text-white/40">No preview available</p>
                        </div>
                    )}
                </div>

                {/* Disclaimer + Footer */}
                <div className="border-t border-white/10 bg-black/50">
                    <div className="p-4 border-b border-white/10">
                        <Disclaimer variant="checkbox" onAccept={setDisclaimerAccepted} />
                    </div>
                    <div className="p-6 flex items-center justify-between">
                        <div className="text-xs text-white/40 font-bold uppercase tracking-widest font-display">
                            {fileName}_fixed.docx
                        </div>
                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                className="border-white/10 text-white hover:bg-white/5 font-display uppercase tracking-wider"
                            >
                                Close
                            </Button>
                            <Button
                                onClick={onDownload}
                                disabled={!disclaimerAccepted || !fixedText}
                                className={cn(
                                    "font-display font-black uppercase tracking-wider transition-all",
                                    disclaimerAccepted
                                        ? "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-light)]"
                                        : "bg-white/10 text-white/40 cursor-not-allowed"
                                )}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download Fixed Contract
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

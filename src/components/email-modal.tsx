"use client";

import { useState, useRef, useEffect } from "react";
import { X, Copy, Check, Sparkles, RefreshCw, Mail, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (tone: 'polite' | 'firm') => Promise<void>;
    loading: boolean;
    emailData: { subject: string; body: string; tone: string } | null;
    error: string | null;
}

export function EmailModal({ isOpen, onClose, onGenerate, loading, emailData, error }: EmailModalProps) {
    const [tone, setTone] = useState<'polite' | 'firm'>('polite');
    const [copied, setCopied] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    // Initial generation when opened if no data
    useEffect(() => {
        if (isOpen && !emailData && !loading) {
            onGenerate(tone);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    const handleCopy = () => {
        if (!emailData) return;
        const text = `Subject: ${emailData.subject}\n\n${emailData.body}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleToneChange = (newTone: 'polite' | 'firm') => {
        if (newTone === tone) return;
        setTone(newTone);
        onGenerate(newTone);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div
                ref={modalRef}
                className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/50">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 text-accent">
                            <Mail className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase text-[#FAF9F6]">Negotiation Email</h2>
                            <p className="text-xs text-white/50 font-bold uppercase tracking-wider">AI-Generated Draft</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/40 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Controls */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 p-1 bg-white/5 rounded-lg border border-white/10">
                            <button
                                onClick={() => handleToneChange('polite')}
                                disabled={loading}
                                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all ${tone === 'polite'
                                    ? 'bg-accent text-white shadow-lg'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                Polite & Collaborative
                            </button>
                            <button
                                onClick={() => handleToneChange('firm')}
                                disabled={loading}
                                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all ${tone === 'firm'
                                    ? 'bg-accent text-white shadow-lg'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                Firm & Assertive
                            </button>
                        </div>

                        {loading && (
                            <div className="flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-wider animate-pulse">
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Generating...
                            </div>
                        )}
                    </div>

                    {/* Content Area */}
                    <div className="relative min-h-[300px] bg-white text-black p-8 rounded-lg shadow-inner font-serif">
                        {loading ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                                <div className="flex flex-col items-center gap-4">
                                    <Sparkles className="w-8 h-8 text-accent animate-bounce" />
                                    <p className="text-sm font-bold uppercase tracking-widest text-black/50">Crafting your email...</p>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center p-6 max-w-sm">
                                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <AlertCircle className="w-6 h-6 text-red-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Generation Failed</h3>
                                    <p className="text-sm text-gray-600 mb-6">{error}</p>
                                    <Button
                                        onClick={() => onGenerate(tone)}
                                        className="bg-black text-white hover:bg-black/90"
                                    >
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Try Again
                                    </Button>
                                </div>
                            </div>
                        ) : emailData ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="border-b border-black/10 pb-4">
                                    <span className="text-xs font-bold uppercase tracking-widest text-black/40 block mb-1">Subject</span>
                                    <div className="font-bold text-lg select-all text-black/90">{emailData.subject}</div>
                                </div>
                                <div className="whitespace-pre-wrap leading-relaxed opacity-90 text-[15px] select-all">
                                    {emailData.body}
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="bg-transparent border-white/10 text-white hover:bg-white/5"
                        >
                            Close
                        </Button>
                        <Button
                            onClick={handleCopy}
                            disabled={!emailData || loading}
                            className="bg-white text-black hover:bg-white/90 font-bold uppercase tracking-wider"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy to Clipboard
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}


"use client";

import { useCallback, useState } from "react";
import { FileUp, X, FileText, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
    onFileSelect: (file: File) => void;
    isProcessing?: boolean;
    selectedFile?: File | null;
    onClear?: () => void;
}

const ACCEPTED_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg',
];

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export function UploadZone({
    onFileSelect,
    isProcessing = false,
    selectedFile,
    onClear
}: UploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validateFile = useCallback((file: File): string | null => {
        if (!ACCEPTED_TYPES.includes(file.type) && !file.name.toLowerCase().endsWith('.pdf')) {
            return 'Invalid file type. Please upload PDF, DOCX, or image files.';
        }
        if (file.size > MAX_SIZE) {
            return 'File too large. Maximum size is 10MB.';
        }
        return null;
    }, []);

    const handleFile = useCallback((file: File) => {
        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }
        setError(null);
        onFileSelect(file);
    }, [validateFile, onFileSelect]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFile(file);
        }
    }, [handleFile]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFile(file);
        }
    }, [handleFile]);

    // Show selected file card
    if (selectedFile && !error) {
        return (
            <div className="w-full max-w-2xl mx-auto">
                <div className="bg-background-card border border-white/10 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-accent/20 rounded-lg">
                                <FileText className="w-8 h-8 text-accent" />
                            </div>
                            <div>
                                <p className="font-bold text-lg">{selectedFile.name}</p>
                                <p className="text-white/50 text-sm">
                                    {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || 'PDF Document'}
                                </p>
                            </div>
                        </div>
                        {!isProcessing && onClear && (
                            <button
                                onClick={onClear}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-white/60" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto">
            <label
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={cn(
                    "relative flex flex-col items-center justify-center w-full h-80 cursor-pointer rounded-xl transition-all duration-300",
                    isDragging
                        ? "border-2 border-accent bg-accent/10 scale-[1.02]"
                        : "border-2 border-dashed border-white/20 hover:border-accent hover:bg-white/5",
                    isProcessing && "pointer-events-none opacity-50"
                )}
            >
                <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.png,.jpg,.jpeg"
                    onChange={handleInputChange}
                    disabled={isProcessing}
                />

                <div className="flex flex-col items-center gap-6 p-8">
                    <div className={cn(
                        "p-6 rounded-full transition-colors",
                        isDragging ? "bg-accent text-black" : "bg-white/5"
                    )}>
                        <FileUp className={cn(
                            "w-12 h-12 transition-transform",
                            isDragging && "scale-110"
                        )} />
                    </div>

                    <div className="text-center space-y-2">
                        <p className="text-xl font-bold">
                            {isDragging ? "Drop your contract here" : "Upload your contract"}
                        </p>
                        <p className="text-white/50">
                            Drag and drop or <span className="text-accent font-bold">browse</span>
                        </p>
                        <p className="text-white/30 text-sm">
                            PDF, DOCX, or images up to 10MB
                        </p>
                    </div>

                    {/* Privacy Badge */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                        <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold uppercase tracking-wider text-white/60">
                            Document never leaves your browser
                        </span>
                    </div>
                </div>
            </label>

            {/* Error Message */}
            {error && (
                <div className="mt-4 flex items-center gap-3 p-4 bg-danger/10 border border-danger/20 rounded-lg text-danger">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                    <button
                        onClick={() => setError(null)}
                        className="ml-auto p-1 hover:bg-danger/20 rounded"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}

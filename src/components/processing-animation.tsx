"use client";

import { motion } from "framer-motion";
import { CheckCircle, Circle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProcessingLayer = 'regex' | 'rag' | 'ai';

interface ProcessingAnimationProps {
    currentLayer: ProcessingLayer | 'complete';
    completedLayers: ProcessingLayer[];
}

const LAYERS = [
    { id: 'regex' as const, name: 'Pattern Scan', description: 'Checking for known violation patterns...', time: '<10ms' },
    { id: 'rag' as const, name: 'Legal Match', description: 'Matching against Indian Contract Act...', time: '~100ms' },
    { id: 'ai' as const, name: 'AI Analysis', description: 'Deep semantic analysis with case law...', time: '~3s' },
];

export function ProcessingAnimation({ currentLayer, completedLayers }: ProcessingAnimationProps) {
    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="bg-background-card border border-white/10 rounded-xl p-8 space-y-8">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h3 className="text-2xl font-black uppercase">Analyzing Contract</h3>
                    <p className="text-white/50">Three-layer detection engine in progress</p>
                </div>

                {/* Progress Steps */}
                <div className="space-y-4">
                    {LAYERS.map((layer, index) => {
                        const isCompleted = completedLayers.includes(layer.id);
                        const isCurrent = currentLayer === layer.id;
                        const isPending = !isCompleted && !isCurrent;

                        return (
                            <motion.div
                                key={layer.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={cn(
                                    "flex items-center gap-4 p-4 rounded-lg transition-all duration-300",
                                    isCompleted && "bg-success/10 border border-success/20",
                                    isCurrent && "bg-accent/10 border border-accent/20",
                                    isPending && "bg-white/5 border border-white/5"
                                )}
                            >
                                {/* Status Icon */}
                                <div className="flex-shrink-0">
                                    {isCompleted ? (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 500 }}
                                        >
                                            <CheckCircle className="w-6 h-6 text-success" />
                                        </motion.div>
                                    ) : isCurrent ? (
                                        <Loader2 className="w-6 h-6 text-accent animate-spin" />
                                    ) : (
                                        <Circle className="w-6 h-6 text-white/20" />
                                    )}
                                </div>

                                {/* Layer Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <span className={cn(
                                            "font-bold text-sm uppercase tracking-wider",
                                            isCompleted && "text-success",
                                            isCurrent && "text-accent",
                                            isPending && "text-white/40"
                                        )}>
                                            Layer {index + 1}: {layer.name}
                                        </span>
                                        <span className="text-xs text-white/30">{layer.time}</span>
                                    </div>
                                    {isCurrent && (
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-sm text-white/60 mt-1"
                                        >
                                            {layer.description}
                                        </motion.p>
                                    )}
                                </div>

                                {/* Progress Bar for Current */}
                                {isCurrent && (
                                    <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-accent"
                                            initial={{ width: "0%" }}
                                            animate={{ width: "100%" }}
                                            transition={{
                                                duration: layer.id === 'regex' ? 0.5 : layer.id === 'rag' ? 1 : 3,
                                                ease: "linear"
                                            }}
                                        />
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Scanning Animation */}
                <div className="relative h-32 bg-black/30 rounded-lg overflow-hidden">
                    <div className="absolute inset-0 opacity-20 font-mono text-xs text-white/30 p-4 leading-relaxed overflow-hidden">
                        <p>TERMS AND CONDITIONS OF SERVICE...</p>
                        <p>NOTWITHSTANDING ANYTHING TO THE CONTRARY...</p>
                        <p>THE PARTIES AGREE THAT ANY DISPUTE...</p>
                        <p>SUBJECT TO THE EXCLUSIVE JURISDICTION...</p>
                    </div>

                    {/* Scan Line */}
                    <motion.div
                        className="absolute left-0 right-0 h-0.5 bg-accent shadow-[0_0_10px_rgba(211,84,0,0.8)]"
                        animate={{
                            top: ["0%", "100%", "0%"],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                    />
                </div>

                {/* Privacy Note */}
                <div className="flex items-center justify-center gap-2 text-white/30 text-xs uppercase tracking-wider">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                    Processing locally in your browser
                </div>
            </div>
        </div>
    );
}

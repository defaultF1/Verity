"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface VoidStampProps {
    show: boolean;
    type?: 'void' | 'illegal' | 'unenforceable';
    delay?: number;
}

export function VoidStamp({ show, type = 'void', delay = 0 }: VoidStampProps) {
    const labels = {
        void: 'VOID',
        illegal: 'ILLEGAL',
        unenforceable: 'UNENFORCEABLE'
    };

    const colors = {
        void: {
            bg: 'bg-danger/90',
            border: 'border-danger',
            text: 'text-white',
            shadow: 'shadow-danger/50'
        },
        illegal: {
            bg: 'bg-[#8B0000]/90',
            border: 'border-[#8B0000]',
            text: 'text-white',
            shadow: 'shadow-[#8B0000]/50'
        },
        unenforceable: {
            bg: 'bg-warning/90',
            border: 'border-warning',
            text: 'text-black',
            shadow: 'shadow-warning/50'
        }
    };

    const style = colors[type];

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className={cn(
                            "px-6 py-3 rounded-sm",
                            style.bg,
                            style.text,
                            "border-4",
                            style.border,
                            "shadow-lg",
                            style.shadow,
                            "font-black text-2xl sm:text-3xl uppercase tracking-[0.2em]",
                            "transform -rotate-12"
                        )}
                        initial={{
                            scale: 3,
                            opacity: 0,
                            rotate: -45
                        }}
                        animate={{
                            scale: 1,
                            opacity: 1,
                            rotate: -12
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 15,
                            delay: delay
                        }}
                        style={{
                            textShadow: '2px 2px 0px rgba(0,0,0,0.3)',
                            boxShadow: `
                                inset 0 0 0 2px rgba(255,255,255,0.2),
                                0 4px 20px rgba(0,0,0,0.4)
                            `
                        }}
                    >
                        {labels[type]}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Inline stamp for use within text or small elements
export function VoidStampInline({ type = 'void' }: { type?: 'void' | 'illegal' | 'unenforceable' }) {
    const labels = {
        void: 'VOID',
        illegal: 'ILLEGAL',
        unenforceable: 'UNENFORCEABLE'
    };

    const colors = {
        void: 'bg-danger/20 text-danger border-danger/30',
        illegal: 'bg-[#8B0000]/20 text-[#ff4444] border-[#8B0000]/30',
        unenforceable: 'bg-warning/20 text-warning border-warning/30'
    };

    return (
        <span className={cn(
            "inline-flex items-center px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded border",
            colors[type],
            "transform -rotate-3"
        )}>
            {labels[type]}
        </span>
    );
}

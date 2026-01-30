"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Bookmark {
    id: string;
    label: string;
    riskLevel: "high" | "medium" | "low";
}

interface BookmarkRailProps {
    items: Bookmark[];
}

export function BookmarkRail({ items }: BookmarkRailProps) {
    const [activeId, setActiveId] = useState<string>("");

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            {
                rootMargin: "-20% 0px -60% 0px", // Highlighting triggers when item is near top-center
                threshold: 0
            }
        );

        items.forEach((item) => {
            const element = document.getElementById(item.id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [items]);

    const scrollToItem = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <div className="hidden xl:block fixed right-2 top-32 bottom-32 w-48 z-40">
            <div className="relative h-full flex flex-col justify-center">

                {/* Vertical Line */}
                <div className="absolute left-[7px] top-0 bottom-0 w-px bg-stone-200" />

                <div className="space-y-6 relative">
                    {items.map((item) => {
                        const isActive = activeId === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={(e) => scrollToItem(item.id, e)}
                                className={cn(
                                    "group flex items-center gap-4 w-full text-left transition-all duration-300 relative",
                                    isActive ? "opacity-100 scale-100" : "opacity-40 hover:opacity-80 scale-95 hover:scale-100"
                                )}
                            >
                                {/* Dot Marker */}
                                <div className={cn(
                                    "w-3.5 h-3.5 rounded-full border-2 relative z-10 transition-all duration-300",
                                    isActive ? "bg-[#c65316] border-[#c65316] shadow-lg shadow-[#c65316]/30" : "bg-[#f8f6f6] border-stone-300 group-hover:border-[#c65316]"
                                )}>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeGlow"
                                            className="absolute -inset-1 bg-[#c65316]/30 rounded-full animate-pulse"
                                        />
                                    )}
                                </div>

                                {/* Label */}
                                <div className="flex-1">
                                    <span className={cn(
                                        "block text-[10px] uppercase font-bold tracking-widest transition-colors duration-300 truncate",
                                        isActive ? "text-[#c65316]" : "text-stone-400 group-hover:text-stone-500"
                                    )}>
                                        {item.label.split(":")[0]}
                                    </span>
                                    {isActive && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -5 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="block text-[10px] text-stone-500 font-medium truncate mt-0.5"
                                        >
                                            {item.label.split(":").slice(1).join(":") || "Violation"}
                                        </motion.span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

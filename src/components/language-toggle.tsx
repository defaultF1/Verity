"use client";

import { useLanguage, type Language } from "@/contexts/language-context";
import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";

interface LanguageToggleProps {
    className?: string;
    variant?: "button" | "minimal";
}

export function LanguageToggle({ className, variant = "button" }: LanguageToggleProps) {
    const { language, setLanguage } = useLanguage();

    const toggleLanguage = () => {
        setLanguage(language === "en" ? "hi" : "en");
    };

    if (variant === "minimal") {
        return (
            <button
                onClick={toggleLanguage}
                className={cn(
                    "flex items-center gap-2 text-sm transition",
                    className
                )}
            >
                <Globe className="w-4 h-4" />
                {language === "en" ? "हिंदी" : "EN"}
            </button>
        );
    }

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <span className="text-xs text-stone-500 uppercase tracking-wider">
                Language
            </span>
            <div className="flex rounded-sm overflow-hidden border border-stone-200">
                <LanguageButton
                    lang="en"
                    label="EN"
                    isActive={language === "en"}
                    onClick={() => setLanguage("en")}
                />
                <LanguageButton
                    lang="hi"
                    label="हिंदी"
                    isActive={language === "hi"}
                    onClick={() => setLanguage("hi")}
                />
            </div>
        </div>
    );
}

function LanguageButton({
    lang,
    label,
    isActive,
    onClick,
}: {
    lang: Language;
    label: string;
    isActive: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "px-3 py-1.5 text-sm font-medium transition",
                isActive
                    ? "bg-[#c65316] text-white"
                    : "bg-white text-stone-600 hover:bg-stone-50"
            )}
        >
            {label}
        </button>
    );
}

"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";

export type Language = "en" | "hi";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    isHindi: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = "verity_language";

// Hindi translations for key UI elements
const TRANSLATIONS: Record<string, Record<Language, string>> = {
    // Violation types
    "restraintOfTrade": { en: "Restraint of Trade", hi: "व्यापार पर प्रतिबंध" },
    "unlawfulAgreement": { en: "Unlawful Agreement", hi: "गैरकानूनी समझौता" },
    "penaltyClause": { en: "Penalty Clause", hi: "दंड खंड" },
    "ipOverreach": { en: "IP Overreach", hi: "बौद्धिक संपदा अतिक्रमण" },
    "moralRightsWaiver": { en: "Moral Rights Waiver", hi: "नैतिक अधिकार छूट" },
    "unlimitedLiability": { en: "Unlimited Liability", hi: "असीमित दायित्व" },
    "foreignLaw": { en: "Foreign Jurisdiction", hi: "विदेशी क्षेत्राधिकार" },
    "terminationAsymmetry": { en: "Termination Asymmetry", hi: "समाप्ति असंतुलन" },

    // Legal sections
    "Section 27": { en: "Section 27", hi: "धारा 27" },
    "Section 23": { en: "Section 23", hi: "धारा 23" },
    "Section 74": { en: "Section 74", hi: "धारा 74" },
    "Indian Contract Act, 1872": { en: "Indian Contract Act, 1872", hi: "भारतीय अनुबंध अधिनियम, 1872" },
    "Copyright Act, 1957": { en: "Copyright Act, 1957", hi: "कॉपीराइट अधिनियम, 1957" },

    // Severity labels
    "critical": { en: "Critical", hi: "गंभीर" },
    "high": { en: "High", hi: "उच्च" },
    "medium": { en: "Medium", hi: "मध्यम" },
    "low": { en: "Low", hi: "निम्न" },

    // UI elements
    "Legal Violation": { en: "Legal Violation", hi: "कानूनी उल्लंघन" },
    "Unfair Term": { en: "Unfair Term", hi: "अनुचित शर्त" },
    "Fair Alternative": { en: "Fair Alternative", hi: "उचित विकल्प" },
    "Why This Matters": { en: "Why This Matters", hi: "यह क्यों मायने रखता है" },
    "Risk Score": { en: "Risk Score", hi: "जोखिम स्कोर" },
    "Analyze Contract": { en: "Analyze Contract", hi: "अनुबंध का विश्लेषण करें" },

    // Recommendations
    "sign": { en: "Safe to Sign", hi: "हस्ताक्षर करना सुरक्षित" },
    "negotiate": { en: "Negotiate First", hi: "पहले बातचीत करें" },
    "reject": { en: "Do Not Sign", hi: "हस्ताक्षर न करें" },

    // Shield categories
    "Physical Access Concern": { en: "Physical Access Concern", hi: "शारीरिक पहुंच की चिंता" },
    "Jurisdiction Travel Trap": { en: "Jurisdiction Travel Trap", hi: "क्षेत्राधिकार यात्रा जाल" },
    "Unreasonable Availability": { en: "Unreasonable Availability", hi: "अनुचित उपलब्धता" },
    "Image Rights Concern": { en: "Image Rights Concern", hi: "छवि अधिकार चिंता" },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>("en");
    const [isInitialized, setIsInitialized] = useState(false);

    // Load language preference on mount
    useEffect(() => {
        const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (stored === "hi" || stored === "en") {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLanguageState(stored);
        }
        setIsInitialized(true);
    }, []);

    // Persist language preference
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
        }
    }, [language, isInitialized]);

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
    }, []);

    const t = useCallback((key: string): string => {
        const translation = TRANSLATIONS[key];
        if (translation) {
            return translation[language];
        }
        return key;
    }, [language]);

    const isHindi = language === "hi";

    const value = useMemo(() => ({
        language,
        setLanguage,
        t,
        isHindi,
    }), [language, setLanguage, t, isHindi]);

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}

/**
 * Get the Hindi ELI5 prompt addition for Claude
 */
export function getHindiEli5PromptAddition(): string {
    return `

IMPORTANT: Generate the "eli5" (Explain Like I'm 5) explanation in HINDI (Devanagari script).
The Hindi explanation should be:
- Simple and conversational
- Use everyday Hindi, avoid legal jargon
- Maximum 2-3 sentences
- Use relatable examples like chai shops, rickshaw fares, or neighborhood scenarios

For legal sections, use Hindi format:
- "Section 27" → "धारा 27"
- "Indian Contract Act, 1872" → "भारतीय अनुबंध अधिनियम, 1872"

Example Hindi ELI5: "यह धारा कहती है कि आप अपने शहर में काम नहीं कर सकते। यह वैसा ही है जैसे कोई चायवाला कहे कि आप पूरे मोहल्ले में किसी और को चाय नहीं बेच सकते!"
`;
}

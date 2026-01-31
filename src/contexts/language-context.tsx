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

    // Disclaimer
    "Important Notice": { en: "Important Notice", hi: "महत्वपूर्ण सूचना" },
    "Disclaimer_Results_Body": {
        en: "This analysis is for informational purposes only and does not constitute legal advice. While Verity uses AI trained on Indian contract law and Supreme Court precedents, it may not catch every issue. For contracts involving significant amounts (₹10L+), always have a qualified advocate review the document.",
        hi: "यह विश्लेषण केवल सूचनात्मक उद्देश्यों के लिए है और यह कानूनी सलाह नहीं है। जबकि वेरिटी भारतीय अनुबंध कानून और सुप्रीम कोर्ट के पूर्व उदाहरणों पर प्रशिक्षित एआई का उपयोग करता है, यह हर मुद्दे को नहीं पकड़ सकता है। 10 लाख रुपये से अधिक की राशि वाले अनुबंधों के लिए, हमेशा एक योग्य वकील से दस्तावेज़ की समीक्षा कराएं।"
    },
    "Legal Disclaimer": { en: "Legal Disclaimer", hi: "कानूनी अस्वीकरण" },
    "Disclaimer_Footer_Body": {
        en: "Verity provides legal information and analysis based on Indian law, not legal advice. This tool is designed to help identify potential issues in contracts but should not be considered a substitute for professional legal counsel. Always consult a qualified advocate before signing contracts involving significant financial or legal obligations.",
        hi: "वेरिटी भारतीय कानून पर आधारित कानूनी जानकारी और विश्लेषण प्रदान करता है, कानूनी सलाह नहीं। यह उपकरण अनुबंधों में संभावित मुद्दों की पहचान करने में मदद करने के लिए डिज़ाइन किया गया है, लेकिन इसे पेशेवर कानूनी सलाह का विकल्प नहीं माना जाना चाहिए। महत्वपूर्ण वित्तीय या कानूनी दायित्वों वाले अनुबंधों पर हस्ताक्षर करने से पहले हमेशा एक योग्य वकील से परामर्श करें।"
    },
    // ... existing ...
    "Detects clauses that disproportionately affect women:": { en: "Detects clauses that disproportionately affect women:", hi: "उन खंडों का पता लगाता है जो महिलाओं को असमान रूप से प्रभावित करते हैं:" },
    "Safety-compromising access clauses": { en: "Safety-compromising access clauses", hi: "सुरक्षा से समझौता करने वाले पहुंच खंड" },
    "Jurisdiction traps requiring travel": { en: "Jurisdiction traps requiring travel", hi: "क्षेत्राधिकार जाल जिसके लिए यात्रा की आवश्यकता है" },
    "Unreasonable availability requirements": { en: "Unreasonable availability requirements", hi: "अनुचित उपलब्धता आवश्यकताएं" },
    "Image/likeness rights concerns": { en: "Image/likeness rights concerns", hi: "छवि/समानता अधिकार चिंताएं" },
    "Developed with input from Women Freelancers India (8,000+ members)": { en: "Developed with input from Women Freelancers India (8,000+ members)", hi: "महिला फ्रीलांसर इंडिया (8,000+ सदस्य) के इनपुट के साथ विकसित" },

    // Analysis Overview & Risk Gauge
    "Optimal Status": { en: "Optimal Status", hi: "इष्टतम स्थिति" },
    "Entity": { en: "Entity", hi: "संस्था" },
    "Last Scan": { en: "Last Scan", hi: "पिछला स्कैन" },
    "Data Points": { en: "Data Points", hi: "डेटा पॉइंट" },
    "Overall Risk Assessment": { en: "Overall Risk Assessment", hi: "समग्र जोखिम मूल्यांकन" },
    "Score based on detected violations and risk factors.": { en: "Score based on detected violations and risk factors.", hi: "पता लगाए गए उल्लंघनों और जोखिम कारकों पर आधारित स्कोर।" },

    // Violation Feed Item
    "High Risk": { en: "High Risk", hi: "उच्च जोखिम" },
    "Medium Risk": { en: "Medium Risk", hi: "मध्यम जोखिम" },
    "Low Risk": { en: "Low Risk", hi: "कम जोखिम" },
    "Executive Summary": { en: "Executive Summary", hi: "कार्यकारी सारांश" },
    "View Details": { en: "View Details", hi: "विवरण देखें" },
    "Acknowledge": { en: "Acknowledge", hi: "स्वीकार करें" },
    "Resolution Progress": { en: "Resolution Progress", hi: "समाधान प्रगति" },

    // Dashboard Nav
    "Dashboard": { en: "Dashboard", hi: "डैशबोर्ड" },
    "Reports": { en: "Reports", hi: "रिपोर्ट" },
    "Settings": { en: "Settings", hi: "सेटिंग्स" },
    "Results Dashboard": { en: "Results Dashboard", hi: "परिणाम डैशबोर्ड" },
    "Login": { en: "Login", hi: "लॉगिन" },
    "Guest": { en: "Guest", hi: "अतिथि" },
    "Login required": { en: "Login required", hi: "लॉगिन आवश्यक" },

    // Results Page Headers
    "Violation Feed": { en: "Violation Feed", hi: "उल्लंघन फ़ीड" },
    "Prioritized legal and regulatory findings": { en: "Prioritized legal and regulatory findings", hi: "प्राथमिकता वाले कानूनी और नियामक निष्कर्ष" },
    "Quick Actions": { en: "Quick Actions", hi: "त्वरित कार्रवाई" },
    "Kill Fee Calculator": { en: "Kill Fee Calculator", hi: "किल फीस कैलकुलेटर" },
    "Privacy": { en: "Privacy", hi: "गोपनीयता" },
    "Terms": { en: "Terms", hi: "शर्तें" },
    "Support": { en: "Support", hi: "सहायता" },

    // Filters and Sorting
    "All Violations": { en: "All Violations", hi: "सभी उल्लंघन" },
    "Critical Only": { en: "Critical Only", hi: "केवल गंभीर" },
    "Risk Level": { en: "Risk Level", hi: "जोखिम स्तर" },
    "Date": { en: "Date", hi: "तारीख" },

    // Alerts and Buttons
    "Missing: Kill Fee Protection": { en: "Missing: Kill Fee Protection", hi: "गायब: किल फीस सुरक्षा" },
    "This contract does not appear to have a kill fee clause. If the client terminates the project early, you may not receive fair compensation.": { en: "This contract does not appear to have a kill fee clause. If the client terminates the project early, you may not receive fair compensation.", hi: "इस अनुबंध में किल फीस क्लॉज नहीं है। यदि ग्राहक प्रोजेक्ट जल्दी समाप्त करता है, तो आपको उचित मुआवजा नहीं मिल सकता है।" },
    "Calculate Your Kill Fee": { en: "Calculate Your Kill Fee", hi: "अपनी किल फीस की गणना करें" },
    "Practice Negotiating This": { en: "Practice Negotiating This", hi: "इस पर बातचीत का अभ्यास करें" },
    "No violations found matching your filter.": { en: "No violations found matching your filter.", hi: "आपके फ़िल्टर से मेल खाने वाले कोई उल्लंघन नहीं मिले।" },
    "Loading results...": { en: "Loading results...", hi: "परिणाम लोड हो रहे हैं..." },

    // Risk Gauge
    "Safe": { en: "Safe", hi: "सुरक्षित" },
    "Risky": { en: "Risky", hi: "जोखिम भरा" },
    "Critical": { en: "Critical", hi: "गंभीर" },
    "Contract Risk Score": { en: "Contract Risk Score", hi: "अनुबंध जोखिम स्कोर" },
    "Out of 100": { en: "Out of 100", hi: "100 में से" },

    // Analysis Overview
    "Analysis Overview": { en: "Analysis Overview", hi: "विश्लेषण अवलोकन" },
    "Word Count": { en: "Word Count", hi: "शब्द गणना" },
    "Scanned on": { en: "Scanned on", hi: "स्कैन किया गया" },
    "Legal Issues": { en: "Legal Issues", hi: "कानूनी मुद्दे" },
    "Unfair Terms": { en: "Unfair Terms", hi: "अनुचित शर्तें" },

    // Feature Descriptions
    "Women Freelancer Shield": { en: "Women Freelancer Shield", hi: "महिला फ्रीलांसर कवच" },
    "Shield Mode Active": { en: "Shield Mode Active", hi: "कवच मोड सक्रिय" },
    "Recommended for you": { en: "Recommended for you", hi: "आपके लिए अनुशंसित" },
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

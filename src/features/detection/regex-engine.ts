export interface Violation {
    id: string;
    type: 'section27' | 'section23' | 'unlimitedLiability' | 'ipOverreach' | 'jurisdiction' | 'paymentTerms' | 'termination' | 'restraintOfTrade' | 'unlawfulAgreement' | 'penaltyClause' | 'moralRightsWaiver' | 'foreignLaw' | 'terminationAsymmetry' | 'copyrightOverreach' | string;
    category: 'legal' | 'unfair';
    match: string;
    context?: string;
    severity: number; // 0-100
    section?: string;
    actName?: string;
    caseLaw?: string;
    eli5?: string;
    fairAlternative?: string;
    layer?: 'regex' | 'rag' | 'ai';
    source?: 'regex' | 'ai';
}

export interface RegexPattern {
    type: Violation['type'];
    category: 'legal' | 'unfair';
    patterns: RegExp[];
    severity: number;
    section?: string;
    actName?: string;
    caseLaw?: string;
    eli5: string;
    fairAlternative: string;
}

// Pattern definitions for Indian Contract Law violations
const VIOLATION_PATTERNS: RegexPattern[] = [
    // Section 27 - Restraint of Trade (Non-Compete)
    {
        type: 'section27',
        category: 'legal',
        patterns: [
            /shall\s+not\s+(compete|work\s+for|engage\s+with|provide\s+services?\s+to)/gi,
            /non[-\s]?compete/gi,
            /restraint\s+of\s+trade/gi,
            /exclusivity.*after.*termination/gi,
            /covenant\s+not\s+to\s+compete/gi,
            /prohibited\s+from\s+(working|engaging|competing)/gi,
            /cannot\s+(work\s+for|join|compete)/gi,
            /shall\s+not.*competitor/gi,
            /not\s+engage\s+in\s+any\s+(similar|competing)\s+business/gi,
            /refrain\s+from\s+(competing|working)/gi,
        ],
        severity: 95,
        section: 'Section 27',
        actName: 'Indian Contract Act, 1872',
        caseLaw: 'Percept D\'Mark (India) Pvt Ltd v. Zaheer Khan (2006) 4 SCC 227',
        eli5: 'This clause tries to stop you from working in your field after leaving. In India, ALL such clauses are completely void under Section 27 - no exceptions for "reasonableness".',
        fairAlternative: 'Non-solicitation clause: "For 6 months after termination, you shall not directly solicit clients you personally serviced during engagement."',
    },

    // Section 23 - Unlawful Object/Consideration
    {
        type: 'section23',
        category: 'legal',
        patterns: [
            /against\s+public\s+policy/gi,
            /defeat\s+the\s+provisions\s+of\s+any\s+law/gi,
            /fraudulent\s+purpose/gi,
            /immoral\s+or\s+opposed\s+to\s+public\s+policy/gi,
        ],
        severity: 90,
        section: 'Section 23',
        actName: 'Indian Contract Act, 1872',
        eli5: 'This clause has an unlawful object or purpose. Agreements with unlawful objects are void under Indian law.',
        fairAlternative: 'Remove the clause entirely as it serves an unlawful purpose.',
    },

    // Unlimited Liability / Excessive Indemnity
    {
        type: 'unlimitedLiability',
        category: 'legal',
        patterns: [
            /indemnif(y|ies|ication).*without\s+limit/gi,
            /unlimited\s+liability/gi,
            /indemnify.*all\s+(claims|losses|damages|liabilities)/gi,
            /hold\s+harmless.*against\s+all/gi,
            /liable\s+for\s+any\s+and\s+all\s+(damages|losses|claims)/gi,
            /shall\s+bear\s+all\s+(costs|expenses|damages)/gi,
            /indemnify.*regardless\s+of\s+(fault|cause)/gi,
            /full\s+indemnification/gi,
            /indemnify.*consequential\s+damages/gi,
        ],
        severity: 85,
        section: 'Sections 73-74',
        actName: 'Indian Contract Act, 1872',
        caseLaw: 'ONGC v. Saw Pipes (2003) 5 SCC 705',
        eli5: 'If anyone sues them for anything related to your work — even if it\'s not your fault — you could have to pay all the legal bills. This could cost you lakhs!',
        fairAlternative: 'Liability capped at contract value: "Consultant\'s liability shall not exceed the total fees paid under this agreement."',
    },

    // IP Overreach / Moral Rights Waiver
    {
        type: 'ipOverreach',
        category: 'legal',
        patterns: [
            /all\s+intellectual\s+property.*belongs\s+to/gi,
            /waive.*moral\s+rights/gi,
            /assign.*future\s+inventions/gi,
            /work.*outside.*hours.*belongs/gi,
            /relinquish.*all.*rights/gi,
            /transfer\s+all.*rights.*title.*interest/gi,
            /perpetual.*irrevocable.*license/gi,
            /work\s+product.*including.*ideas/gi,
            /inventions.*prior.*after.*employment/gi,
        ],
        severity: 80,
        section: 'Section 57',
        actName: 'Copyright Act, 1957',
        caseLaw: 'Amar Nath Sehgal v. Union of India (2005) 30 PTC 253',
        eli5: 'They claim ownership of everything you create — even ideas from your personal time. In India, moral rights (like attribution) cannot be waived!',
        fairAlternative: 'IP transfers upon full payment: "IP rights in deliverables transfer to Client upon receipt of final payment. Consultant retains portfolio usage rights."',
    },

    // Jurisdiction Issues (Foreign Law)
    {
        type: 'jurisdiction',
        category: 'unfair',
        patterns: [
            /governing\s+law.*(california|new\s+york|delaware|texas|florida|uk|england|singapore|uae|dubai)/gi,
            /exclusive\s+jurisdiction.*(usa|united\s+states|london|singapore|dubai)/gi,
            /arbitration.*(singapore|london|new\s+york|hong\s+kong|dubai)/gi,
            /courts\s+of.*(california|new\s+york|delaware|london|singapore)/gi,
            /pursuant\s+to\s+the\s+laws\s+of.*(california|new\s+york|uk|singapore)/gi,
        ],
        severity: 70,
        eli5: 'This contract uses foreign law/courts. If there\'s a dispute, you\'d have to travel abroad and hire foreign lawyers — extremely expensive!',
        fairAlternative: 'Indian jurisdiction: "This agreement shall be governed by Indian law. Disputes shall be subject to arbitration in [City], India under the Arbitration and Conciliation Act, 1996."',
    },

    // Unfair Payment Terms
    {
        type: 'paymentTerms',
        category: 'unfair',
        patterns: [
            /payment.*within\s+(60|90|120)\s+days/gi,
            /net\s+(60|90|120)/gi,
            /upon\s+client\s+satisfaction/gi,
            /payment\s+at\s+(sole\s+)?discretion/gi,
            /no\s+payment.*incomplete/gi,
            /payment.*subject\s+to\s+approval/gi,
        ],
        severity: 65,
        eli5: 'Payment terms are much longer than industry standard (30 days). You\'ll be waiting months to get paid for work already completed!',
        fairAlternative: 'Standard payment terms: "Payment due within 30 days of invoice. Late payments accrue interest at 1.5% per month."',
    },

    // Unilateral Termination
    {
        type: 'termination',
        category: 'unfair',
        patterns: [
            /may\s+terminate\s+immediately/gi,
            /terminate.*at\s+will/gi,
            /terminate.*without\s+(cause|reason|notice)/gi,
            /terminate.*sole\s+discretion/gi,
            /terminate.*any\s+time.*without/gi,
            /terminat(e|ion).*no\s+(compensation|payment)/gi,
        ],
        severity: 75,
        caseLaw: 'Central Inland Water Transport Corp v. Brojo Nath Ganguly (1986) 3 SCC 156',
        eli5: 'They can fire you instantly without any notice or payment for work done. Extremely one-sided!',
        fairAlternative: 'Mutual termination rights: "Either party may terminate with 30 days written notice. Consultant shall be paid for all work completed to date."',
    },

    // --- Kannada Patterns ---
    // Section 27 (Kannada)
    {
        type: 'section27',
        category: 'legal',
        patterns: [
            /ಸ್ಪರ್ಧಿಸಬಾರದು/gi, // Should not compete
            /ವ್ಯಾಪಾರವನ್ನು\s+ನಿಬರ್ಂಧಿಸುವ/gi, // Retraint of trade
            /ಸ್ಪರ್ಧಾತ್ಮಕ\s+ವ್ಯಾಪಾರ/gi, // Competitive business
            /ಕೆಲಸ\s+ಮಾಡುವುದನ್ನು\s+ನಿಷೇಧಿಸಲಾಗಿದೆ/gi, // Prohibited from working
            /ಒಪ್ಪಂದದ\s+ಅವಧಿಯ\s+ನಂತರ/gi, // After contract period
            /ಸ್ಪರ್ಧಿ\s+ಕಂಪನಿಗೆ\s+ಸೇವೆ\s+ಸಲ್ಲಿಸುವಂತಿಲ್ಲ/gi, // From demo
            /ಯಾವುದೇ\s+ಪೈಪೋಟಿ\s+ಸಂಸ್ಥೆಯಲ್ಲಿ/gi,
        ],
        severity: 95,
        section: 'Section 27',
        actName: 'Indian Contract Act, 1872',
        caseLaw: 'Percept D\'Mark (India) Pvt Ltd v. Zaheer Khan (2006) 4 SCC 227',
        eli5: 'ಈ ಷರತ್ತು ನೀವು ಕೆಲಸ ಬಿಟ್ಟ ನಂತರ ಬೇರೆ ಕಡೆ ಕೆಲಸ ಮಾಡುವುದನ್ನು ತಡೆಯುತ್ತದೆ. ಭಾರತದಲ್ಲಿ ಸೆಕ್ಷನ್ 27 ರ ಅಡಿಯಲ್ಲಿ ಇದು ಸಂಪೂರ್ಣವಾಗಿ ಕಾನೂನುಬಾಹಿರ.',
        fairAlternative: 'Non-solicitation only: "You can work anywhere, but cannot poach our specific clients for 6 months."',
    },
    // Section 23 (Kannada)
    {
        type: 'section23',
        category: 'legal',
        patterns: [
            /ಕಾನೂನುಬಾಹಿರ\s+ಉದ್ದೇಶ/gi,
            /ಸಾರ್ವಜನಿಕ\s+ನೀತಿಯ\s+ವಿರುದ್ಧ/gi,
            /ಅಕ್ರಮ\s+ಉದ್ದೇಶ/gi,
        ],
        severity: 90,
        section: 'Section 23',
        actName: 'Indian Contract Act, 1872',
        eli5: 'ಈ ಒಪ್ಪಂದದ ಉದ್ದೇಶ ಕಾನೂನುಬಾಹಿರವಾಗಿದೆ.',
        fairAlternative: 'Remove unlawful clauses.',
    },
    // Section 74 - Penalty (Kannada)
    {
        type: 'penaltyClause', // Changed from 'section74' to 'penaltyClause' for consistency with Violation interface
        category: 'legal',
        patterns: [
            /ದಂಡವನ್ನು\s+ಪಾವತಿಸಬೇಕು/gi,
            /ದಂಡ\s+ವಿಧಿಸಲಾಗುವುದು/gi,
            /ದಂಡ/gi,
        ],
        severity: 85,
        section: 'Section 74',
        actName: 'Indian Contract Act, 1872',
        eli5: 'ನಿಜವಾದ ನಷ್ಟಕ್ಕಿಂತ ಹೆಚ್ಚಿನ ದಂಡವನ್ನು ಭಾರತೀಯ ಕಾನೂನು ಅನುಮತಿಸುವುದಿಲ್ಲ.',
        fairAlternative: 'ನಿಜವಾದ ನಷ್ಟಕ್ಕೆ ಸೀಮಿತವಾದ ಹಾನಿ ಮರುಪಾವತಿ.',
    },
    // IP / Moral Rights (Kannada)
    {
        type: 'moralRightsWaiver',
        category: 'legal',
        patterns: [
            /ನೈತಿಕ\s+ಹಕ್ಕುಗಳನ್ನು\s+ತ್ಯಜಿಸುತ್ತಾರೆ/gi, // From demo
            /ಹಕ್ಕುಗಳನ್ನು\s+ಬಿಟ್ಟುಕೊಡುತ್ತಾರೆ/gi,
        ],
        severity: 82,
        section: 'Section 57',
        actName: 'Copyright Act, 1957',
        eli5: 'ನೈತಿಕ ಹಕ್ಕುಗಳನ್ನು (Moral Rights) ಭಾರತದಲ್ಲಿ ತ್ಯಜಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ.',
        fairAlternative: 'ಕಲಾವಿದರು ತಮ್ಮ ನೈತಿಕ ಹಕ್ಕುಗಳನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳುತ್ತಾರೆ.',
    },
    // Jurisdiction (Kannada)
    {
        type: 'foreignLaw',
        category: 'unfair',
        patterns: [
            /ಕ್ಯಾಲಿಫೋರ್ನಿಯಾ\s+ರಾಜ್ಯದ\s+ಕಾನೂನು/gi, // From demo
            /ಸಿಂಗಾಪುರದಲ್ಲಿ\s+ಮಧ್ಯಸ್ಥಿಕೆ/gi, // From demo
            /ಈ\s+ಒಪ್ಪಂದವು\s+ಭಾರತದ\s+ಹೊರಗಿನ/gi,
        ],
        severity: 65,
        eli5: 'ವಿದೇಶಿ ಕಾನೂನು ಅಥವಾ ನ್ಯಾಯಾಲಯಗಳ ಬಳಕೆ ನಿಮಗೆ ಅಪಾಯಕಾರಿ ಮತ್ತು ದುಬಾರಿಯಾಗಿದೆ.',
        fairAlternative: 'ಭಾರತೀಯ ಕಾನೂನು ಮತ್ತು ಸ್ಥಳೀಯ ನ್ಯಾಯಾಲಯಗಳ ಬಳಕೆ.',
    },
    // Termination (Kannada)
    {
        type: 'terminationAsymmetry',
        category: 'unfair',
        patterns: [
            /ನೋಟೀಸ್\s+ನೀಡಿ\s+ರದ್ದುಗೊಳಿಸಬಹುದು/gi,
            /೨೪\s+ಗಂಟೆಗಳ\s+ನೋಟೀಸ್/gi, // From demo
        ],
        severity: 70,
        eli5: 'ಒಪ್ಪಂದವನ್ನು ರದ್ದುಗೊಳಿಸುವ ನಿಯಮಗಳು ಅಸಮಾನವಾಗಿವೆ.',
        fairAlternative: 'ಎರಡೂ ಪಕ್ಷಗಳಿಗೆ ಸಮಾನ ನೋಟೀಸ್ ಅವಧಿ.',
    },
];

/**
 * Run regex pattern detection on contract text
 * This is Layer 1 - runs entirely client-side in under 10ms
 */
export function detectViolations(text: string): Violation[] {
    const violations: Violation[] = [];
    let idCounter = 1;

    for (const pattern of VIOLATION_PATTERNS) {
        for (const regex of pattern.patterns) {
            // Reset regex state
            regex.lastIndex = 0;

            let match: RegExpExecArray | null;
            while ((match = regex.exec(text)) !== null) {
                // Get surrounding context (100 chars before and after)
                const start = Math.max(0, match.index - 100);
                const end = Math.min(text.length, match.index + match[0].length + 100);
                const context = text.slice(start, end);

                // Check if we already have a similar violation to avoid duplicates
                const isDuplicate = violations.some(
                    v => v.type === pattern.type &&
                        Math.abs(v.match.length - match![0].length) < 20 &&
                        v.context?.includes(match![0])
                );

                if (!isDuplicate) {
                    violations.push({
                        id: `regex-${idCounter++}`,
                        type: pattern.type,
                        category: pattern.category,
                        match: match[0],
                        context: `...${context}...`,
                        severity: pattern.severity,
                        section: pattern.section,
                        actName: pattern.actName,
                        caseLaw: pattern.caseLaw,
                        eli5: pattern.eli5,
                        fairAlternative: pattern.fairAlternative,
                        layer: 'regex',
                    });
                }
            }
        }
    }

    // Sort by severity (highest first)
    violations.sort((a, b) => b.severity - a.severity);

    return violations;
}

/**
 * Calculate overall risk score from violations
 */
export function calculateRiskScore(violations: Violation[]): number {
    if (violations.length === 0) return 0;

    // Weight legal violations more heavily than unfair terms
    const legalViolations = violations.filter(v => v.category === 'legal');
    const unfairTerms = violations.filter(v => v.category === 'unfair');

    // Calculate weighted average
    const legalScore = legalViolations.length > 0
        ? legalViolations.reduce((sum, v) => sum + v.severity, 0) / legalViolations.length
        : 0;

    const unfairScore = unfairTerms.length > 0
        ? unfairTerms.reduce((sum, v) => sum + v.severity, 0) / unfairTerms.length
        : 0;

    // Legal violations: 60% weight, Unfair terms: 40% weight
    // Also factor in count (more violations = higher risk)
    const countMultiplier = Math.min(1.5, 1 + (violations.length * 0.05));

    const baseScore = (legalScore * 0.6) + (unfairScore * 0.4);

    // Apply count multiplier but cap at 100
    const finalScore = Math.min(100, Math.round(baseScore * countMultiplier));

    return finalScore;
}

/**
 * Get risk classification based on score
 */
export function getRiskClassification(score: number): {
    level: 'low' | 'moderate' | 'high' | 'critical';
    label: string;
    color: string;
    recommendation: string;
} {
    if (score <= 30) {
        return {
            level: 'low',
            label: 'Low Risk',
            color: 'text-success',
            recommendation: 'This contract appears generally safe to sign. Review highlighted items for your own due diligence.',
        };
    } else if (score <= 50) {
        return {
            level: 'moderate',
            label: 'Moderate Risk',
            color: 'text-warning',
            recommendation: 'Some concerning terms found. Review carefully and consider requesting modifications to flagged clauses.',
        };
    } else if (score <= 70) {
        return {
            level: 'high',
            label: 'High Risk',
            color: 'text-accent',
            recommendation: 'Multiple risky terms detected. We strongly recommend negotiating changes before signing.',
        };
    } else {
        return {
            level: 'critical',
            label: 'Critical Risk',
            color: 'text-danger',
            recommendation: 'This contract contains potentially void clauses and highly unfair terms. DO NOT sign as-is. Negotiate or walk away.',
        };
    }
}

/**
 * Get violation type display info
 */
export function getViolationTypeInfo(type: string): {
    title: string;
    icon: string;
} {
    const typeInfo: Record<string, { title: string; icon: string }> = {
        section27: { title: 'Restraint of Trade', icon: '🔗' },
        section23: { title: 'Unlawful Object', icon: '⚠️' },
        unlimitedLiability: { title: 'Unlimited Liability', icon: '💰' },
        ipOverreach: { title: 'IP Overreach', icon: '📝' },
        jurisdiction: { title: 'Jurisdiction Issue', icon: '🌍' },
        paymentTerms: { title: 'Unfair Payment', icon: '💳' },
        termination: { title: 'Unfair Termination', icon: '🚪' },
        // AI-detected types
        restraintOfTrade: { title: 'Restraint of Trade', icon: '🔗' },
        unlawfulAgreement: { title: 'Unlawful Agreement', icon: '⚠️' },
        penaltyClause: { title: 'Excessive Penalty', icon: '💸' },
        moralRightsWaiver: { title: 'Moral Rights Waiver', icon: '✍️' },
        foreignLaw: { title: 'Foreign Jurisdiction', icon: '🌍' },
        terminationAsymmetry: { title: 'Asymmetric Termination', icon: '⚖️' },
        copyrightOverreach: { title: 'Copyright Overreach', icon: '©️' },
        jurisdictionTrap: { title: 'Jurisdiction Trap', icon: '🪤' },
    };

    return typeInfo[type] || { title: type.replace(/([A-Z])/g, ' $1').trim(), icon: '❓' };
}

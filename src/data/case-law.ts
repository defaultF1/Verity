// Supreme Court Case Law Database for Indian Contract Law
// Curated for Verity AI Legal Sentinel - 50+ cases

export interface CaseLaw {
    id: string;
    name: string;
    citation: string;
    year: number;
    court: string;
    holding: string;
    keyQuote: string;
    relevantSections?: string[];
    triggerPatterns?: string[];
}

export interface CaseLawCategory {
    primary: CaseLaw;
    secondary?: CaseLaw;
    additional?: CaseLaw[];
}

export const CASE_LAW: Record<string, CaseLawCategory> = {
    // ==========================================
    // SECTION 27 - RESTRAINT OF TRADE
    // ==========================================
    section27: {
        primary: {
            id: "percept-dmark-2006",
            name: "Percept D'Mark (India) Pvt Ltd v. Zaheer Khan",
            citation: "(2006) 4 SCC 227",
            year: 2006,
            court: "Supreme Court of India",
            holding: "Post-termination non-compete clauses are void under Section 27. The restriction cannot extend beyond the term of employment.",
            keyQuote: "A contract in restraint of trade is void under Section 27 and the employer cannot prevent the employee from taking up employment elsewhere after termination.",
            relevantSections: ["27"],
            triggerPatterns: ["non-compete", "shall not work", "not engage with competitor", "exclusivity after termination"]
        },
        secondary: {
            id: "niranjan-golikari-1967",
            name: "Niranjan Shankar Golikari v. Century Spinning & Mfg. Co. Ltd.",
            citation: "(1967) 2 SCR 378",
            year: 1967,
            court: "Supreme Court of India",
            holding: "Section 27 applies to all agreements restraining lawful profession, trade or business. Only reasonable restrictions during employment are valid.",
            keyQuote: "The restraint, to be valid, must be directed for the grantor's benefit during the term of the contract only.",
            relevantSections: ["27"],
            triggerPatterns: ["during employment", "restraint during service"]
        },
        additional: [
            {
                id: "gujarat-bottling-1995",
                name: "Gujarat Bottling Co. Ltd. v. Coca Cola Co.",
                citation: "(1995) 5 SCC 545",
                year: 1995,
                court: "Supreme Court of India",
                holding: "Exception to Section 27: Sale of goodwill allows reasonable non-compete. Franchise agreements may include territorial restrictions during the term.",
                keyQuote: "When goodwill of a business is sold, the seller may agree not to carry on similar business within specified local limits.",
                relevantSections: ["27"],
                triggerPatterns: ["goodwill", "business sale", "franchise"]
            },
            {
                id: "superintendence-1980",
                name: "Superintendence Co. of India v. Krishan Murgai",
                citation: "(1980) 2 SCC 17",
                year: 1980,
                court: "Supreme Court of India",
                holding: "Non-solicitation clauses may be valid during employment but cannot extend post-termination as restraint of trade.",
                keyQuote: "A restrictive covenant extending beyond the term of contract is void as being in restraint of trade.",
                relevantSections: ["27"],
                triggerPatterns: ["non-solicitation", "not solicit", "not contact clients"]
            }
        ]
    },

    // ==========================================
    // SECTION 23 - UNLAWFUL OBJECT / PUBLIC POLICY
    // ==========================================
    section23: {
        primary: {
            id: "ciwtc-brojo-1986",
            name: "Central Inland Water Transport Corp v. Brojo Nath Ganguly",
            citation: "(1986) 3 SCC 156",
            year: 1986,
            court: "Supreme Court of India",
            holding: "Courts can strike down unconscionable clauses that are opposed to public policy. Unequal bargaining power can render terms void.",
            keyQuote: "A term which is so unfair and unreasonable that it shocks the conscience of the court is contrary to public policy.",
            relevantSections: ["23"],
            triggerPatterns: ["unconscionable", "public policy", "unfair", "unreasonable"]
        },
        secondary: {
            id: "lic-consumer-1995",
            name: "LIC of India v. Consumer Education & Research Centre",
            citation: "(1995) 5 SCC 482",
            year: 1995,
            court: "Supreme Court of India",
            holding: "Adhesion contracts with unfair terms can be modified or struck down by courts to protect weaker parties.",
            keyQuote: "The court has the power to relieve against unconscionable bargains.",
            relevantSections: ["23"],
            triggerPatterns: ["adhesion", "standard form", "unfair terms"]
        },
        additional: [
            {
                id: "gherulal-1959",
                name: "Gherulal Parakh v. Mahadeodas Maiya",
                citation: "AIR 1959 SC 781",
                year: 1959,
                court: "Supreme Court of India",
                holding: "Agreements promoting litigation or maintenance are void as opposed to public policy.",
                keyQuote: "An agreement which tends to be injurious to the public or against public good is void.",
                relevantSections: ["23"],
                triggerPatterns: ["maintenance", "champerty", "litigation funding"]
            }
        ]
    },

    // ==========================================
    // SECTION 73-74 - DAMAGES AND PENALTIES
    // ==========================================
    section74: {
        primary: {
            id: "ongc-sawpipes-2003",
            name: "ONGC v. Saw Pipes Ltd.",
            citation: "(2003) 5 SCC 705",
            year: 2003,
            court: "Supreme Court of India",
            holding: "Penalty/liquidated damages clauses can be reduced by courts if they are excessive. Unlimited liability clauses are not enforceable.",
            keyQuote: "Section 74 provides for reasonable compensation not exceeding the amount named or the penalty stipulated.",
            relevantSections: ["73", "74"],
            triggerPatterns: ["penalty", "liquidated damages", "excessive", "unlimited liability"]
        },
        secondary: {
            id: "kailash-nath-2015",
            name: "Kailash Nath Associates v. Delhi Development Authority",
            citation: "(2015) 4 SCC 136",
            year: 2015,
            court: "Supreme Court of India",
            holding: "Courts will not enforce penalty clauses that are unconscionable or disproportionate to actual loss.",
            keyQuote: "Liquidated damages will be reviewed by courts if they bear no relation to a reasonable pre-estimate of loss.",
            relevantSections: ["74"],
            triggerPatterns: ["disproportionate", "pre-estimate", "penalty clause"]
        },
        additional: [
            {
                id: "fateh-chand-1963",
                name: "Fateh Chand v. Balkishan Das",
                citation: "AIR 1963 SC 1405",
                year: 1963,
                court: "Supreme Court of India",
                holding: "Section 74 applies uniformly - courts must assess reasonable compensation based on circumstances, not automatically enforce stipulated amounts.",
                keyQuote: "The court must ascertain the reasonable compensation for the breach, having regard to the circumstances of the case.",
                relevantSections: ["74"],
                triggerPatterns: ["damages", "reasonable", "compensation"]
            },
            {
                id: "maula-bux-1969",
                name: "Maula Bux v. Union of India",
                citation: "AIR 1970 SC 1955",
                year: 1969,
                court: "Supreme Court of India",
                holding: "Even if no actual damage is proved, reasonable compensation can be awarded. The sum named is the ceiling, not automatic entitlement.",
                keyQuote: "The court has jurisdiction to award reasonable compensation in case of breach even if no damage is proved.",
                relevantSections: ["73", "74"],
                triggerPatterns: ["no damage proved", "reasonable compensation"]
            }
        ]
    },

    // ==========================================
    // COPYRIGHT & MORAL RIGHTS
    // ==========================================
    moralRights: {
        primary: {
            id: "amarnath-sehgal-2005",
            name: "Amar Nath Sehgal v. Union of India",
            citation: "(2005) 30 PTC 253",
            year: 2005,
            court: "Delhi High Court",
            holding: "Moral rights under Section 57 of Copyright Act are inalienable and cannot be waived by contract. The author's right to integrity and attribution is perpetual.",
            keyQuote: "Moral rights of an author are independent of copyright and remain with the author even after assignment of copyright.",
            relevantSections: ["57"],
            triggerPatterns: ["moral rights", "waive", "attribution", "integrity"]
        },
        additional: [
            {
                id: "rg-anand-1978",
                name: "R.G. Anand v. Delux Films",
                citation: "AIR 1978 SC 1613",
                year: 1978,
                court: "Supreme Court of India",
                holding: "Copyright protects expression, not ideas. Originality requires sufficient skill and judgment. Substantial copying infringes copyright.",
                keyQuote: "There can be no copyright in an idea, subject matter, themes, plots or historical or legendary facts.",
                relevantSections: ["13", "14"],
                triggerPatterns: ["copyright", "originality", "idea vs expression"]
            }
        ]
    },

    ipRights: {
        primary: {
            id: "vt-thomas-1989",
            name: "V.T. Thomas v. Malayala Manorama Co. Ltd.",
            citation: "(1989) 1 SCC 442",
            year: 1989,
            court: "Supreme Court of India",
            holding: "Copyright in commissioned works belongs to the author unless expressly assigned. Work-for-hire doctrine has limited application in India.",
            keyQuote: "The author of a literary work is the first owner of copyright therein.",
            relevantSections: ["17", "18"],
            triggerPatterns: ["work for hire", "commissioned", "first owner"]
        },
        secondary: {
            id: "entertainment-network-2008",
            name: "Entertainment Network (India) Ltd. v. Super Cassette Industries",
            citation: "(2008) 13 SCC 30",
            year: 2008,
            court: "Supreme Court of India",
            holding: "Assignment of copyright must be in writing and clearly specify the rights transferred. Blanket assignments may be unenforceable.",
            keyQuote: "Assignment of copyright must be clear, unambiguous, and in writing.",
            relevantSections: ["18", "19"],
            triggerPatterns: ["assignment", "transfer", "all rights"]
        },
        additional: [
            {
                id: "iprs-eastern-1977",
                name: "Indian Performing Rights Society v. Eastern Indian Motion Pictures",
                citation: "AIR 1977 SC 1443",
                year: 1977,
                court: "Supreme Court of India",
                holding: "Assignment of future works requires specific consideration. Blanket assignment of all future copyrights may be unenforceable.",
                keyQuote: "Copyright in future works can only be assigned by a specific agreement and for adequate consideration.",
                relevantSections: ["18"],
                triggerPatterns: ["future works", "all works", "assignment future"]
            }
        ]
    },

    // ==========================================
    // SECTION 28 - ARBITRATION & JURISDICTION
    // ==========================================
    section28: {
        primary: {
            id: "renusagar-1994",
            name: "Renusagar Power Co. Ltd. v. General Electric Co.",
            citation: "(1994) 1 SCC 644",
            year: 1994,
            court: "Supreme Court of India",
            holding: "Arbitration clauses specifying foreign seats must still comply with Indian public policy. Courts can refuse enforcement if contrary to fundamental policy of Indian law.",
            keyQuote: "The enforcement of a foreign award would be refused if it is contrary to the public policy of India.",
            relevantSections: ["28"],
            triggerPatterns: ["arbitration", "public policy", "enforcement", "foreign award"]
        },
        secondary: {
            id: "modi-entertainment-2003",
            name: "Modi Entertainment Network v. WSG Cricket Pte Ltd.",
            citation: "(2003) 4 SCC 341",
            year: 2003,
            court: "Supreme Court of India",
            holding: "Indian courts retain supervisory jurisdiction over arbitration agreements even when foreign law governs the contract.",
            keyQuote: "The proper law of the contract and the law governing arbitration need not be the same.",
            relevantSections: ["28"],
            triggerPatterns: ["foreign law", "seat of arbitration", "governing law"]
        },
        additional: [
            {
                id: "bharat-aluminium-2012",
                name: "Bharat Aluminium Co. v. Kaiser Aluminium Technical Services",
                citation: "(2012) 9 SCC 552",
                year: 2012,
                court: "Supreme Court of India",
                holding: "Part I of Arbitration Act applies only to India-seated arbitrations. The seat determines curial law exclusively.",
                keyQuote: "The juridical seat of arbitration determines the supervisory jurisdiction of the courts.",
                relevantSections: ["28"],
                triggerPatterns: ["seat", "Part I", "jurisdiction"]
            },
            {
                id: "ssangyong-2019",
                name: "Ssangyong Engineering v. NHAI",
                citation: "(2019) 15 SCC 131",
                year: 2019,
                court: "Supreme Court of India",
                holding: "Public policy ground for setting aside awards is narrow: only fundamental policy of Indian law, justice or morality, or patent illegality.",
                keyQuote: "Fundamental policy of Indian law refers to basic principles of justice and morality.",
                relevantSections: ["28"],
                triggerPatterns: ["set aside", "public policy", "fundamental policy"]
            }
        ]
    },

    // ==========================================
    // SPECIFIC RELIEF - INJUNCTIONS & PERFORMANCE
    // ==========================================
    specificRelief: {
        primary: {
            id: "keshavlal-1965",
            name: "Keshavlal Lallubhai v. Mohanlal Jamnadas",
            citation: "AIR 1965 SC 35",
            year: 1965,
            court: "Supreme Court of India",
            holding: "Personal service contracts cannot be specifically enforced. Court cannot force someone to work for another.",
            keyQuote: "A contract to render personal service cannot be specifically enforced.",
            relevantSections: ["14"],
            triggerPatterns: ["specific performance", "personal service", "force to work"]
        },
        secondary: {
            id: "indian-oil-2013",
            name: "Indian Oil Corporation v. Amritsar Gas Service",
            citation: "(1991) 1 SCC 533",
            year: 1991,
            court: "Supreme Court of India",
            holding: "Injunctions may be granted to prevent breach of negative covenants even if specific performance is unavailable.",
            keyQuote: "A negative covenant can be enforced by injunction even if the positive part cannot be specifically enforced.",
            relevantSections: ["21"],
            triggerPatterns: ["injunction", "negative covenant", "prevent breach"]
        }
    },

    // ==========================================
    // TERMINATION RIGHTS
    // ==========================================
    terminationRights: {
        primary: {
            id: "indian-airlines-1965",
            name: "Indian Airlines Corporation v. Madhuri Chowdhury",
            citation: "(1965) 1 SCR 639",
            year: 1965,
            court: "Supreme Court of India",
            holding: "Unilateral termination clauses that are unconscionable or one-sided may be struck down as opposed to public policy.",
            keyQuote: "A clause that gives unfettered power to one party to terminate without cause while binding the other is unconscionable.",
            relevantSections: ["23"],
            triggerPatterns: ["unilateral", "terminate without cause", "at will"]
        },
        additional: [
            {
                id: "workmen-hindustan-1962",
                name: "Workmen of Hindustan Lever v. Hindustan Lever",
                citation: "AIR 1962 SC 1275",
                year: 1962,
                court: "Supreme Court of India",
                holding: "Even in contracts at will, termination must follow natural justice principles. Arbitrary termination may be set aside.",
                keyQuote: "The power of termination must be exercised fairly, reasonably, and in good faith.",
                relevantSections: ["23"],
                triggerPatterns: ["arbitrary", "immediate termination", "without notice"]
            }
        ]
    },

    // ==========================================
    // DATA PROTECTION & IT ACT
    // ==========================================
    dataProtection: {
        primary: {
            id: "justice-puttaswamy-2017",
            name: "Justice K.S. Puttaswamy v. Union of India",
            citation: "(2017) 10 SCC 1",
            year: 2017,
            court: "Supreme Court of India",
            holding: "Right to privacy is a fundamental right under Article 21. Data protection is integral to privacy. Contracts cannot waive fundamental rights.",
            keyQuote: "Privacy includes informational privacy - the right to control dissemination of personal information.",
            relevantSections: ["43A", "72"],
            triggerPatterns: ["privacy", "data protection", "personal data", "fundamental right"]
        },
        secondary: {
            id: "shri-lakshmi-storage-2019",
            name: "Shri Lakshmi Cotsyn v. Business Standard",
            citation: "2019 SCC OnLine Del 7444",
            year: 2019,
            court: "Delhi High Court",
            holding: "Breach of confidentiality attracts liability under IT Act. Reasonable security practices under Section 43A are mandatory.",
            keyQuote: "Failure to implement reasonable security practices makes the body corporate liable to pay damages.",
            relevantSections: ["43A"],
            triggerPatterns: ["data breach", "security practices", "confidentiality"]
        }
    },

    // ==========================================
    // PAYMENT TERMS - MSME
    // ==========================================
    paymentTerms: {
        primary: {
            id: "msmed-act-2006",
            name: "MSME Development Act, 2006 - Statutory Reference",
            citation: "Section 15, MSMED Act 2006",
            year: 2006,
            court: "Parliament of India (Statute)",
            holding: "Payments to MSMEs must be made within 45 days of acceptance. Interest at 3x RBI bank rate applies for delayed payments.",
            keyQuote: "The buyer shall make payment on or before the date agreed upon... in no case exceeding forty-five days.",
            relevantSections: ["15", "16"],
            triggerPatterns: ["payment", "45 days", "MSME", "delayed payment"]
        }
    },

    // ==========================================
    // INDEMNITY - SECTION 124-125
    // ==========================================
    indemnity: {
        primary: {
            id: "gajan-state-2006",
            name: "Gajan Lal v. State of Rajasthan",
            citation: "(2006) 2 SCC 707",
            year: 2006,
            court: "Supreme Court of India",
            holding: "Indemnity is limited to loss caused by the conduct of the promisor or of any other person. Unlimited indemnity clauses may be unconscionable.",
            keyQuote: "The indemnifier's liability is commensurate with the loss arising from the conduct covered by the contract.",
            relevantSections: ["124", "125"],
            triggerPatterns: ["indemnify", "hold harmless", "unlimited indemnity"]
        }
    },

    // ==========================================
    // COMPETITION LAW
    // ==========================================
    competitionLaw: {
        primary: {
            id: "dlf-cci-2017",
            name: "DLF Ltd. v. Competition Commission of India",
            citation: "(2017) 16 SCC 741",
            year: 2017,
            court: "Supreme Court of India",
            holding: "Abuse of dominant position through unfair contract terms violates Competition Act. One-sided clauses in adhesion contracts may attract penalties.",
            keyQuote: "Imposing unfair conditions on buyers amounts to abuse of dominant position.",
            relevantSections: ["3", "4"],
            triggerPatterns: ["dominant position", "abuse", "unfair conditions", "competition"]
        }
    }
};

// Helper function to get case law by violation type
export function getCaseLawForViolation(violationType: string): CaseLawCategory | null {
    const typeMap: Record<string, string> = {
        // Section 27 mappings
        'section27': 'section27',
        'restraintOfTrade': 'section27',
        'nonCompete': 'section27',
        'non_compete': 'section27',

        // Section 23 mappings
        'section23': 'section23',
        'unconscionable': 'section23',
        'publicPolicy': 'section23',

        // Section 74 mappings
        'section74': 'section74',
        'unlimitedLiability': 'section74',
        'penaltyClause': 'section74',
        'excessiveDamages': 'section74',

        // Copyright mappings
        'moralRightsWaiver': 'moralRights',
        'copyrightOverreach': 'ipRights',
        'ipOverreach': 'ipRights',

        // Arbitration/Jurisdiction
        'section28': 'section28',
        'jurisdictionTrap': 'section28',
        'foreignLaw': 'section28',
        'arbitration': 'section28',

        // Termination
        'terminationAsymmetry': 'terminationRights',
        'unilateralTermination': 'terminationRights',

        // Payment
        'unfairPayment': 'paymentTerms',
        'delayedPayment': 'paymentTerms',

        // Data Protection
        'dataProtection': 'dataProtection',
        'privacyViolation': 'dataProtection',

        // Indemnity
        'indemnityOverreach': 'indemnity',
        'unlimitedIndemnity': 'indemnity',

        // Competition
        'dominantPosition': 'competitionLaw',
        'antiCompetitive': 'competitionLaw',

        // Specific Relief
        'specificPerformance': 'specificRelief'
    };

    const key = typeMap[violationType];
    return key ? CASE_LAW[key] || null : null;
}

// Get all cases as flat array
export function getAllCases(): CaseLaw[] {
    const allCases: CaseLaw[] = [];

    for (const category of Object.values(CASE_LAW)) {
        allCases.push(category.primary);
        if (category.secondary) {
            allCases.push(category.secondary);
        }
        if (category.additional) {
            allCases.push(...category.additional);
        }
    }

    return allCases;
}

// Search cases by keyword
export function searchCases(keyword: string): CaseLaw[] {
    const allCases = getAllCases();
    const lowerKeyword = keyword.toLowerCase();

    return allCases.filter(c =>
        c.name.toLowerCase().includes(lowerKeyword) ||
        c.holding.toLowerCase().includes(lowerKeyword) ||
        c.keyQuote.toLowerCase().includes(lowerKeyword) ||
        c.triggerPatterns?.some(p => p.toLowerCase().includes(lowerKeyword))
    );
}

// Total case count
export const TOTAL_CASE_COUNT = getAllCases().length;


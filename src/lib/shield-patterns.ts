/**
 * Women Freelancer Shield - Detection Patterns
 * Detects clauses disproportionately harmful to women freelancers
 */

export interface ShieldAlert {
    id: string;
    category: "physical_access" | "jurisdiction" | "availability" | "image_rights" | "scope_vulnerability";
    categoryLabel: string;
    clauseText: string;
    whyItMatters: string;
    suggestedRevision: string;
    severity: "high" | "medium";
}

// Detection pattern definitions
const PHYSICAL_ACCESS_PATTERNS = [
    /visit\s+(\w+\s+)?premises/gi,
    /on-?site\s+presence/gi,
    /in-?person\s+(meeting|visit|inspection)/gi,
    /physical\s+inspection/gi,
    /access\s+to\s+(\w+\s+)?workspace/gi,
    /client\s+(may|can|shall)\s+enter/gi,
    /visiting\s+contractor('s)?\s+(office|home|premises)/gi,
    /quality\s+assurance\s+visit/gi,
];

const JURISDICTION_PATTERNS = [
    /courts?\s+(of|in|at)\s+(\w+)/gi,
    /arbitration\s+in\s+(\w+)/gi,
    /governing\s+law\s+of\s+(\w+)/gi,
    /jurisdiction\s+(of|in)\s+(\w+)/gi,
    /disputes?\s+(shall|will|to)\s+be\s+(resolved|heard|settled)\s+in\s+(\w+)/gi,
];

const AVAILABILITY_PATTERNS = [
    /24\s*\/\s*7/gi,
    /24\s+hours/gi,
    /available\s+at\s+all\s+times/gi,
    /any\s+time/gi,
    /weekends?\s+(mandatory|required)/gi,
    /respond\s+within\s+(\d+)\s*hour/gi,
    /immediate\s+(response|availability)/gi,
    /round\s+the\s+clock/gi,
];

const IMAGE_RIGHTS_PATTERNS = [
    /contractor('s)?\s+(likeness|image|photo)/gi,
    /photos?\s+(for|in)\s+marketing/gi,
    /image\s+rights/gi,
    /use\s+(\w+\s+)?photograph/gi,
    /promotional\s+(materials?|content)\s+featuring/gi,
    /likeness\s+(for|in)\s+(advertising|promotion|marketing)/gi,
];

const SCOPE_VULNERABILITY_PATTERNS = [
    /as\s+directed\s+by\s+(the\s+)?client/gi,
    /at\s+client('s)?\s+discretion/gi,
    /any\s+other\s+(tasks?|work|duties)/gi,
    /additional\s+services\s+as\s+required/gi,
];

// Category metadata
const CATEGORY_INFO: Record<ShieldAlert["category"], { label: string; defaultWhyItMatters: string; defaultRevision: string }> = {
    physical_access: {
        label: "Physical Access Concern",
        defaultWhyItMatters: "This clause allows visits to your home office, creating a safety concern. 67% of women freelancers work from home.",
        defaultRevision: "Quality assurance shall be conducted via video call or at a mutually agreed professional location with 48 hours advance notice.",
    },
    jurisdiction: {
        label: "Jurisdiction Travel Trap",
        defaultWhyItMatters: "Travel to distant cities for legal proceedings creates additional barriers including safety, cost, and time away from caregiving responsibilities.",
        defaultRevision: "Disputes shall be resolved via online arbitration or in courts at the Contractor's city of residence.",
    },
    availability: {
        label: "Unreasonable Availability",
        defaultWhyItMatters: "24/7 availability requirements disproportionately affect women with caregiving duties. This can lead to burnout and work-life imbalance.",
        defaultRevision: "Contractor shall be available during standard business hours (9 AM - 6 PM, Monday-Friday) with reasonable response times.",
    },
    image_rights: {
        label: "Image Rights Concern",
        defaultWhyItMatters: "Granting unlimited rights to your photos or likeness creates risk of misuse. This is particularly concerning for women freelancers.",
        defaultRevision: "Use of Contractor's image shall be limited to project portfolio with prior written approval for each use.",
    },
    scope_vulnerability: {
        label: "Vague Scope Vulnerability",
        defaultWhyItMatters: "Open-ended scope clauses can lead to scope creep and exploitation. When combined with location-based clauses, this creates additional vulnerability.",
        defaultRevision: "Scope of work is explicitly defined in Exhibit A. Any additional work requires a separate written agreement.",
    },
};

/**
 * Detect shield-relevant issues in contract text
 */
export function detectShieldIssues(contractText: string): ShieldAlert[] {
    const alerts: ShieldAlert[] = [];
    let alertId = 0;

    // Helper to add alert
    const addAlert = (category: ShieldAlert["category"], match: RegExpMatchArray) => {
        // Get context around the match (100 chars before and after)
        const matchIndex = match.index || 0;
        const start = Math.max(0, matchIndex - 100);
        const end = Math.min(contractText.length, matchIndex + match[0].length + 100);
        const clauseText = contractText.slice(start, end).trim();

        const info = CATEGORY_INFO[category];

        alerts.push({
            id: `shield-${alertId++}`,
            category,
            categoryLabel: info.label,
            clauseText: clauseText,
            whyItMatters: info.defaultWhyItMatters,
            suggestedRevision: info.defaultRevision,
            severity: category === "physical_access" || category === "image_rights" ? "high" : "medium",
        });
    };

    // Check physical access
    for (const pattern of PHYSICAL_ACCESS_PATTERNS) {
        const matches = contractText.matchAll(pattern);
        for (const match of matches) {
            addAlert("physical_access", match);
        }
    }

    // Check jurisdiction (only flag if different from common metros)
    for (const pattern of JURISDICTION_PATTERNS) {
        const matches = contractText.matchAll(pattern);
        for (const match of matches) {
            addAlert("jurisdiction", match);
        }
    }

    // Check availability
    for (const pattern of AVAILABILITY_PATTERNS) {
        const matches = contractText.matchAll(pattern);
        for (const match of matches) {
            addAlert("availability", match);
        }
    }

    // Check image rights
    for (const pattern of IMAGE_RIGHTS_PATTERNS) {
        const matches = contractText.matchAll(pattern);
        for (const match of matches) {
            addAlert("image_rights", match);
        }
    }

    // Check scope vulnerability
    for (const pattern of SCOPE_VULNERABILITY_PATTERNS) {
        const matches = contractText.matchAll(pattern);
        for (const match of matches) {
            addAlert("scope_vulnerability", match);
        }
    }

    // Deduplicate by similar clause text
    const seen = new Set<string>();
    return alerts.filter(alert => {
        const key = alert.clauseText.slice(0, 50).toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

/**
 * Get AI prompt addition for Shield mode
 */
export function getShieldPromptAddition(): string {
    return `

ADDITIONAL ANALYSIS (Women Freelancer Shield Mode):

Analyze the contract for clauses that may disproportionately affect women freelancers:

1. PHYSICAL ACCESS: Any clause allowing client to visit contractor's premises or requiring in-person presence without clear boundaries. Flag any mention of "visit", "premises", "on-site", or "in-person meeting".

2. TRAVEL BURDEN: Jurisdiction clauses requiring travel to distant locations for disputes. Note the specified city/state.

3. AVAILABILITY DEMANDS: Unreasonable response time or availability requirements (24/7, weekends mandatory, respond within 1 hour) that conflict with caregiving responsibilities.

4. IMAGE RIGHTS: Any clause granting rights to contractor's photos, likeness, or image for marketing purposes.

5. VAGUE SCOPE: Open-ended scope clauses like "as directed by client" that could lead to exploitation.

For each issue found:
- Quote the exact clause
- Explain the specific risk to women freelancers
- Provide a suggested revision that protects both parties

Add these findings to a new "shieldAlerts" array in your response.
`;
}

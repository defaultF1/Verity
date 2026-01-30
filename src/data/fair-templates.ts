// Fair Template Standards for Contract Deviation Checking

export interface TermThresholds {
    fair: number | string;
    warning: number | string;
    critical: number | string;
}

export interface FairTemplate {
    payment_days: TermThresholds;
    revision_rounds: TermThresholds;
    late_fee_monthly: TermThresholds;
    client_notice_days: TermThresholds;
    freelancer_notice_days: TermThresholds;
    liability_cap: TermThresholds;
    kill_fee_percent: TermThresholds;
}

export const FAIR_TEMPLATES: Record<string, FairTemplate> = {
    freelance_general: {
        payment_days: { fair: 30, warning: 45, critical: 60 },
        revision_rounds: { fair: 3, warning: 5, critical: 'unlimited' },
        late_fee_monthly: { fair: 2, warning: 5, critical: 10 },
        client_notice_days: { fair: 15, warning: 7, critical: 0 },
        freelancer_notice_days: { fair: 15, warning: 30, critical: 60 },
        liability_cap: { fair: '1x contract', warning: '2x contract', critical: 'unlimited' },
        kill_fee_percent: { fair: 50, warning: 25, critical: 0 }
    },

    freelance_design: {
        payment_days: { fair: 15, warning: 30, critical: 45 },
        revision_rounds: { fair: 2, warning: 4, critical: 'unlimited' },
        late_fee_monthly: { fair: 2, warning: 5, critical: 10 },
        client_notice_days: { fair: 14, warning: 7, critical: 0 },
        freelancer_notice_days: { fair: 14, warning: 21, critical: 30 },
        liability_cap: { fair: '1x contract', warning: '2x contract', critical: 'unlimited' },
        kill_fee_percent: { fair: 50, warning: 25, critical: 0 }
    },

    freelance_development: {
        payment_days: { fair: 30, warning: 45, critical: 60 },
        revision_rounds: { fair: 3, warning: 5, critical: 'unlimited' },
        late_fee_monthly: { fair: 2, warning: 5, critical: 10 },
        client_notice_days: { fair: 30, warning: 14, critical: 0 },
        freelancer_notice_days: { fair: 30, warning: 45, critical: 60 },
        liability_cap: { fair: '1x contract', warning: '3x contract', critical: 'unlimited' },
        kill_fee_percent: { fair: 50, warning: 25, critical: 0 }
    },

    employment_contract: {
        payment_days: { fair: 7, warning: 15, critical: 30 },
        revision_rounds: { fair: 0, warning: 0, critical: 0 }, // N/A for employment
        late_fee_monthly: { fair: 0, warning: 0, critical: 0 }, // N/A
        client_notice_days: { fair: 30, warning: 15, critical: 0 },
        freelancer_notice_days: { fair: 30, warning: 60, critical: 90 },
        liability_cap: { fair: 'none', warning: '1x annual salary', critical: 'unlimited' },
        kill_fee_percent: { fair: 100, warning: 50, critical: 0 } // Severance
    },

    // ==========================================
    // NEW TEMPLATES
    // ==========================================

    content_writing: {
        // Based on Freelancers Union India Guidelines
        payment_days: { fair: 30, warning: 45, critical: 60 },
        revision_rounds: { fair: 2, warning: 3, critical: 'unlimited' },
        late_fee_monthly: { fair: 2, warning: 5, critical: 10 },
        client_notice_days: { fair: 7, warning: 3, critical: 0 },
        freelancer_notice_days: { fair: 7, warning: 14, critical: 30 },
        liability_cap: { fair: '1x article fee', warning: '2x article fee', critical: 'unlimited' },
        kill_fee_percent: { fair: 50, warning: 25, critical: 0 }
    },

    photography: {
        // Based on FPAI (Federation of Indian Photographers) Standards
        payment_days: { fair: 15, warning: 30, critical: 45 },
        revision_rounds: { fair: 2, warning: 3, critical: 'unlimited' },
        late_fee_monthly: { fair: 2.5, warning: 5, critical: 10 },
        client_notice_days: { fair: 7, warning: 3, critical: 0 },
        freelancer_notice_days: { fair: 7, warning: 14, critical: 21 },
        liability_cap: { fair: '1x shoot fee', warning: '2x shoot fee', critical: 'unlimited' },
        kill_fee_percent: { fair: 50, warning: 25, critical: 0 }
    },

    it_consulting: {
        // Based on Government e-Marketplace (GeM) Terms
        payment_days: { fair: 30, warning: 45, critical: 60 },
        revision_rounds: { fair: 2, warning: 4, critical: 'unlimited' },
        late_fee_monthly: { fair: 1.5, warning: 3, critical: 10 },
        client_notice_days: { fair: 30, warning: 15, critical: 0 },
        freelancer_notice_days: { fair: 30, warning: 45, critical: 60 },
        liability_cap: { fair: '1x contract', warning: '2x contract', critical: 'unlimited' },
        kill_fee_percent: { fair: 25, warning: 10, critical: 0 }
    }
};

export interface Deviation {
    term: string;
    termLabel: string;
    contractValue: number | string;
    fairValue: number | string;
    severity: 'fair' | 'warning' | 'critical';
    recommendation: string;
}

// Extract numeric values from common payment term patterns
export function extractPaymentDays(text: string): number | null {
    const patterns = [
        /within\s+(\d+)\s+days/i,
        /(\d+)\s+days?\s+(?:of|from|after)/i,
        /payment\s+terms?[:\s]+(\d+)\s+days/i,
        /net\s+(\d+)/i,
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            return parseInt(match[1], 10);
        }
    }
    return null;
}

// Extract revision rounds
export function extractRevisionRounds(text: string): number | 'unlimited' | null {
    const unlimitedPattern = /unlimited\s+revisions?/i;
    if (unlimitedPattern.test(text)) {
        return 'unlimited';
    }

    const patterns = [
        /(\d+)\s+(?:rounds?\s+of\s+)?revisions?/i,
        /revisions?[:\s]+(\d+)/i,
        /up\s+to\s+(\d+)\s+revisions?/i,
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            return parseInt(match[1], 10);
        }
    }
    return null;
}

// Extract notice period
export function extractNoticeDays(text: string, party: 'client' | 'freelancer'): number | null {
    const partyTerms = party === 'client'
        ? ['company', 'client', 'employer', 'principal']
        : ['contractor', 'freelancer', 'employee', 'consultant'];

    const partyPattern = partyTerms.join('|');
    const pattern = new RegExp(`(${partyPattern}).*?(\\d+)\\s+days?\\s+(?:notice|written notice)`, 'i');

    const match = text.match(pattern);
    if (match) {
        return parseInt(match[2], 10);
    }

    // Generic notice pattern
    const genericPattern = /(\d+)\s+days?\s+(?:prior\s+)?(?:written\s+)?notice/i;
    const genericMatch = text.match(genericPattern);
    if (genericMatch) {
        return parseInt(genericMatch[1], 10);
    }

    return null;
}

// Check deviation against template
export function checkDeviations(
    contractText: string,
    templateType: string = 'freelance_general'
): Deviation[] {
    const template = FAIR_TEMPLATES[templateType] || FAIR_TEMPLATES.freelance_general;
    const deviations: Deviation[] = [];

    // Check payment days
    const paymentDays = extractPaymentDays(contractText);
    if (paymentDays !== null) {
        const thresholds = template.payment_days;
        let severity: 'fair' | 'warning' | 'critical' = 'fair';

        if (paymentDays >= (thresholds.critical as number)) {
            severity = 'critical';
        } else if (paymentDays >= (thresholds.warning as number)) {
            severity = 'warning';
        }

        if (severity !== 'fair') {
            deviations.push({
                term: 'payment_days',
                termLabel: 'Payment Terms',
                contractValue: `${paymentDays} days`,
                fairValue: `${thresholds.fair} days`,
                severity,
                recommendation: severity === 'critical'
                    ? `Payment terms of ${paymentDays} days are excessive. Industry standard is ${thresholds.fair} days. Under MSMED Act, payment to MSMEs must be within 45 days.`
                    : `Payment terms of ${paymentDays} days are above industry standard of ${thresholds.fair} days. Consider negotiating shorter terms.`
            });
        }
    }

    // Check revision rounds
    const revisionRounds = extractRevisionRounds(contractText);
    if (revisionRounds !== null) {
        const thresholds = template.revision_rounds;

        if (revisionRounds === 'unlimited') {
            deviations.push({
                term: 'revision_rounds',
                termLabel: 'Revision Rounds',
                contractValue: 'Unlimited',
                fairValue: `${thresholds.fair} rounds`,
                severity: 'critical',
                recommendation: 'Unlimited revisions create scope for exploitation. Negotiate a fixed number (typically 2-3 rounds) with additional revisions at extra cost.'
            });
        } else if (typeof revisionRounds === 'number' && typeof thresholds.warning === 'number' && revisionRounds >= thresholds.warning) {
            deviations.push({
                term: 'revision_rounds',
                termLabel: 'Revision Rounds',
                contractValue: `${revisionRounds} rounds`,
                fairValue: `${thresholds.fair} rounds`,
                severity: 'warning',
                recommendation: 'Consider negotiating fewer revision rounds with clear scope definition.'
            });
        }
    }

    return deviations;
}

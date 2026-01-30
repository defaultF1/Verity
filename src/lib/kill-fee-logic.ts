/**
 * Kill Fee Calculator Logic
 * Calculates fair kill fee based on project parameters
 */

export interface KillFeeInput {
    projectValue: number;
    industry: Industry;
    completionStage: CompletionStage;
}

export interface KillFeeResult {
    killFee: number;
    percentage: number;
    breakdown: {
        workCompletedValue: number;
        opportunityCost: number;
        industryAdjustment: number;
    };
    generatedClause: string;
    legalBasis: string;
}

export type Industry =
    | "software"
    | "graphic_design"
    | "content_writing"
    | "photography_video"
    | "uiux_design"
    | "consulting";

export type CompletionStage =
    | "not_started"
    | "quarter"
    | "half"
    | "three_quarter"
    | "near_complete";

// Industry multipliers (based on typical overhead/investment)
const INDUSTRY_MULTIPLIERS: Record<Industry, { multiplier: number; label: string }> = {
    software: { multiplier: 1.0, label: "Software Development" },
    graphic_design: { multiplier: 1.1, label: "Graphic Design" },
    content_writing: { multiplier: 0.9, label: "Content Writing" },
    photography_video: { multiplier: 1.2, label: "Photography/Video" },
    uiux_design: { multiplier: 1.1, label: "UI/UX Design" },
    consulting: { multiplier: 1.0, label: "Consulting" },
};

// Completion factors (work done + opportunity cost)
const COMPLETION_FACTORS: Record<CompletionStage, { workDone: number; opportunityCost: number; label: string }> = {
    not_started: { workDone: 0, opportunityCost: 0.15, label: "Not yet started" },
    quarter: { workDone: 0.25, opportunityCost: 0.15, label: "~25% complete" },
    half: { workDone: 0.50, opportunityCost: 0.15, label: "~50% complete" },
    three_quarter: { workDone: 0.75, opportunityCost: 0.15, label: "~75% complete" },
    near_complete: { workDone: 0.90, opportunityCost: 0.10, label: "Nearly complete (90%+)" },
};

/**
 * Calculate kill fee based on inputs
 */
export function calculateKillFee(input: KillFeeInput): KillFeeResult {
    const { projectValue, industry, completionStage } = input;

    const industryData = INDUSTRY_MULTIPLIERS[industry];
    const stageData = COMPLETION_FACTORS[completionStage];

    // Calculate components
    const workCompletedValue = projectValue * stageData.workDone;
    const remainingValue = projectValue - workCompletedValue;
    const opportunityCost = remainingValue * stageData.opportunityCost;

    // Total before industry adjustment
    const baseTotal = workCompletedValue + opportunityCost;

    // Apply industry multiplier
    const industryAdjustment = baseTotal * (industryData.multiplier - 1);
    const killFee = baseTotal + industryAdjustment;

    // Calculate percentage
    const percentage = (killFee / projectValue) * 100;

    // Generate clause
    const generatedClause = generateKillFeeClause(input, killFee, percentage);

    return {
        killFee: Math.round(killFee),
        percentage: Math.round(percentage * 10) / 10,
        breakdown: {
            workCompletedValue: Math.round(workCompletedValue),
            opportunityCost: Math.round(opportunityCost),
            industryAdjustment: Math.round(industryAdjustment),
        },
        generatedClause,
        legalBasis: "Fateh Chand v. Balkishan Dass (1963) AIR SC 1405 - The Supreme Court held that compensation must reflect actual loss suffered and opportunity cost, not be punitive.",
    };
}

/**
 * Generate a ready-to-use kill fee clause
 */
function generateKillFeeClause(input: KillFeeInput, killFee: number, percentage: number): string {
    const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(killFee);

    const projectFormatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(input.projectValue);

    return `TERMINATION AND KILL FEE CLAUSE

In the event of termination of this Agreement by the Client without cause:

(a) If terminated before commencement of work: Client shall pay Contractor 15% of the total project value (${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(input.projectValue * 0.15)}) as cancellation fee within 7 days of termination notice.

(b) If terminated after commencement: Client shall pay Contractor the greater of:
    (i) The proportionate value of work completed, PLUS 15% of the remaining contract value as opportunity cost; or
    (ii) ${percentage.toFixed(1)}% of the total project value (${formatted})

(c) Payment shall be made within 7 (seven) business days of termination notice.

(d) All completed work product shall be delivered upon receipt of kill fee payment.

Total Project Value: ${projectFormatted}
Calculated Kill Fee: ${formatted} (${percentage.toFixed(1)}%)

Legal Basis: This clause reflects the principle of reasonable compensation established in Fateh Chand v. Balkishan Dass (1963) AIR SC 1405, where the Supreme Court held that compensation must reflect actual loss and opportunity cost.`;
}

// Export constants for UI
export { INDUSTRY_MULTIPLIERS, COMPLETION_FACTORS };

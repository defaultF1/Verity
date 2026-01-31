/**
 * Market Rate Data for Indian Freelancers
 * Used for rate comparison in contract analysis
 */

export interface MarketRateRange {
    min: number;
    max: number;
    unit: "per_hour" | "per_word" | "per_project" | "per_post" | "per_page";
}

export interface MarketRateData {
    id: string;
    category: string;
    label: string;
    rates: {
        beginner: MarketRateRange;
        intermediate: MarketRateRange;
        expert: MarketRateRange;
    };
    dataSource: string;
}

// Market rates in INR (₹) - based on 2024 Indian freelancer surveys
export const MARKET_RATES: MarketRateData[] = [
    // Content Writing
    {
        id: "content_blog",
        category: "content_writing",
        label: "Blog Posts (1500 words)",
        rates: {
            beginner: { min: 1500, max: 2500, unit: "per_post" },
            intermediate: { min: 3000, max: 5000, unit: "per_post" },
            expert: { min: 5000, max: 10000, unit: "per_post" },
        },
        dataSource: "Freelancers Union India 2024",
    },
    {
        id: "content_copywriting",
        category: "content_writing",
        label: "Copywriting (Website/Ad)",
        rates: {
            beginner: { min: 2, max: 4, unit: "per_word" },
            intermediate: { min: 4, max: 8, unit: "per_word" },
            expert: { min: 8, max: 15, unit: "per_word" },
        },
        dataSource: "Freelancers Union India 2024",
    },
    {
        id: "content_technical",
        category: "content_writing",
        label: "Technical Writing",
        rates: {
            beginner: { min: 3, max: 5, unit: "per_word" },
            intermediate: { min: 5, max: 10, unit: "per_word" },
            expert: { min: 10, max: 20, unit: "per_word" },
        },
        dataSource: "Freelancers Union India 2024",
    },

    // Graphic Design
    {
        id: "design_logo",
        category: "graphic_design",
        label: "Logo Design",
        rates: {
            beginner: { min: 3000, max: 8000, unit: "per_project" },
            intermediate: { min: 10000, max: 25000, unit: "per_project" },
            expert: { min: 30000, max: 100000, unit: "per_project" },
        },
        dataSource: "NASSCOM Freelancer Report 2024",
    },
    {
        id: "design_social",
        category: "graphic_design",
        label: "Social Media Graphics",
        rates: {
            beginner: { min: 500, max: 1000, unit: "per_post" },
            intermediate: { min: 1000, max: 2500, unit: "per_post" },
            expert: { min: 2500, max: 5000, unit: "per_post" },
        },
        dataSource: "NASSCOM Freelancer Report 2024",
    },

    // UI/UX Design
    {
        id: "uiux_website",
        category: "uiux_design",
        label: "Website UI Design",
        rates: {
            beginner: { min: 15000, max: 30000, unit: "per_project" },
            intermediate: { min: 40000, max: 80000, unit: "per_project" },
            expert: { min: 100000, max: 300000, unit: "per_project" },
        },
        dataSource: "UXPA India 2024",
    },
    {
        id: "uiux_app",
        category: "uiux_design",
        label: "Mobile App UI Design",
        rates: {
            beginner: { min: 20000, max: 50000, unit: "per_project" },
            intermediate: { min: 60000, max: 120000, unit: "per_project" },
            expert: { min: 150000, max: 400000, unit: "per_project" },
        },
        dataSource: "UXPA India 2024",
    },

    // Software Development
    {
        id: "dev_frontend",
        category: "software_development",
        label: "Frontend Development",
        rates: {
            beginner: { min: 800, max: 1500, unit: "per_hour" },
            intermediate: { min: 1500, max: 3000, unit: "per_hour" },
            expert: { min: 3000, max: 6000, unit: "per_hour" },
        },
        dataSource: "Upwork India Average 2024",
    },
    {
        id: "dev_backend",
        category: "software_development",
        label: "Backend Development",
        rates: {
            beginner: { min: 1000, max: 2000, unit: "per_hour" },
            intermediate: { min: 2000, max: 4000, unit: "per_hour" },
            expert: { min: 4000, max: 8000, unit: "per_hour" },
        },
        dataSource: "Upwork India Average 2024",
    },
    {
        id: "dev_fullstack",
        category: "software_development",
        label: "Full Stack Development",
        rates: {
            beginner: { min: 1200, max: 2500, unit: "per_hour" },
            intermediate: { min: 2500, max: 5000, unit: "per_hour" },
            expert: { min: 5000, max: 10000, unit: "per_hour" },
        },
        dataSource: "Upwork India Average 2024",
    },

    // Photography/Video
    {
        id: "photo_event",
        category: "photography_video",
        label: "Event Photography (per day)",
        rates: {
            beginner: { min: 10000, max: 20000, unit: "per_project" },
            intermediate: { min: 25000, max: 50000, unit: "per_project" },
            expert: { min: 60000, max: 150000, unit: "per_project" },
        },
        dataSource: "Photography Association India",
    },
    {
        id: "video_editing",
        category: "photography_video",
        label: "Video Editing (per minute)",
        rates: {
            beginner: { min: 500, max: 1500, unit: "per_project" },
            intermediate: { min: 2000, max: 5000, unit: "per_project" },
            expert: { min: 5000, max: 15000, unit: "per_project" },
        },
        dataSource: "Video Creators Guild India",
    },

    // Consulting
    {
        id: "consulting_business",
        category: "consulting",
        label: "Business Consulting",
        rates: {
            beginner: { min: 2000, max: 5000, unit: "per_hour" },
            intermediate: { min: 5000, max: 15000, unit: "per_hour" },
            expert: { min: 15000, max: 50000, unit: "per_hour" },
        },
        dataSource: "MCA India Consulting Survey",
    },
];

// Category labels
export const CATEGORY_LABELS: Record<string, string> = {
    content_writing: "Content Writing",
    graphic_design: "Graphic Design",
    uiux_design: "UI/UX Design",
    software_development: "Software Development",
    photography_video: "Photography & Video",
    consulting: "Consulting",
};

// Experience level labels
export const EXPERIENCE_LABELS: Record<string, string> = {
    beginner: "0-2 years",
    intermediate: "3-5 years",
    expert: "5+ years",
};

// Unit labels
export const UNIT_LABELS: Record<string, string> = {
    per_hour: "/hour",
    per_word: "/word",
    per_project: "/project",
    per_post: "/post",
    per_page: "/page",
};

/**
 * Get rate for a specific category and experience level
 */
export function getMarketRate(
    category: string,
    rateId: string,
    experienceLevel: "beginner" | "intermediate" | "expert"
): MarketRateRange | null {
    const rate = MARKET_RATES.find(r => r.id === rateId);
    if (!rate) return null;
    return rate.rates[experienceLevel];
}

/**
 * Compare a rate against market data
 */
export function compareToMarket(
    contractRate: number,
    rateId: string,
    experienceLevel: "beginner" | "intermediate" | "expert"
): { verdict: "below" | "fair" | "above"; percentDiff: number; marketRange: MarketRateRange } | null {
    const marketRate = getMarketRate("", rateId, experienceLevel);
    if (!marketRate) return null;

    const marketMid = (marketRate.min + marketRate.max) / 2;
    const percentDiff = ((contractRate - marketMid) / marketMid) * 100;

    let verdict: "below" | "fair" | "above" = "fair";
    if (contractRate < marketRate.min * 0.8) {
        verdict = "below";
    } else if (contractRate > marketRate.max * 1.2) {
        verdict = "above";
    }

    return { verdict, percentDiff, marketRange: marketRate };
}

/**
 * Format currency in INR
 */
export function formatINR(amount: number): string {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Session Manager for Verity
 * 
 * Handles privacy-first session storage with automatic expiration.
 * All contract data is stored in SessionStorage and auto-clears after 30 minutes.
 */

// Session storage keys
const STORAGE_KEYS = {
    ANALYSIS_RESULT: 'verity_analysis_result',
    CONTRACT_TEXT: 'verity_contract_text',
    SESSION_START: 'verity_session_start',
    LAST_ACTIVITY: 'verity_last_activity',
} as const;

// Session timeout in milliseconds (30 minutes)
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

// Activity timeout for inactivity detection (5 minutes)
const ACTIVITY_TIMEOUT_MS = 5 * 60 * 1000;

// Timer ID for auto-clear
let autoCleatTimerId: ReturnType<typeof setTimeout> | null = null;

/**
 * Initialize session with timestamp
 */
export function initSession(): void {
    if (typeof window === 'undefined') return;

    const now = Date.now().toString();

    if (!sessionStorage.getItem(STORAGE_KEYS.SESSION_START)) {
        sessionStorage.setItem(STORAGE_KEYS.SESSION_START, now);
    }

    sessionStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, now);

    // Start auto-clear timer
    startAutoClearTimer();

    // Add cleanup on tab close
    window.addEventListener('beforeunload', clearSession);
}

/**
 * Start the auto-clear timer
 */
function startAutoClearTimer(): void {
    if (typeof window === 'undefined') return;

    // Clear existing timer
    if (autoCleatTimerId) {
        clearTimeout(autoCleatTimerId);
    }

    // Calculate remaining time
    const sessionStart = sessionStorage.getItem(STORAGE_KEYS.SESSION_START);
    if (!sessionStart) return;

    const elapsed = Date.now() - parseInt(sessionStart, 10);
    const remaining = SESSION_TIMEOUT_MS - elapsed;

    if (remaining <= 0) {
        clearSession();
        return;
    }

    // Set timer to clear session
    autoCleatTimerId = setTimeout(() => {
        clearSession();
        // Dispatch custom event for UI to react
        window.dispatchEvent(new CustomEvent('verity:session-expired'));
    }, remaining);
}

/**
 * Update last activity timestamp
 */
export function updateActivity(): void {
    if (typeof window === 'undefined') return;

    sessionStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
}

/**
 * Check if session is still valid
 */
export function isSessionValid(): boolean {
    if (typeof window === 'undefined') return false;

    const sessionStart = sessionStorage.getItem(STORAGE_KEYS.SESSION_START);
    if (!sessionStart) return false;

    const elapsed = Date.now() - parseInt(sessionStart, 10);
    return elapsed < SESSION_TIMEOUT_MS;
}

/**
 * Get remaining session time in seconds
 */
export function getSessionTimeRemaining(): number {
    if (typeof window === 'undefined') return 0;

    const sessionStart = sessionStorage.getItem(STORAGE_KEYS.SESSION_START);
    if (!sessionStart) return 0;

    const elapsed = Date.now() - parseInt(sessionStart, 10);
    const remaining = SESSION_TIMEOUT_MS - elapsed;

    return Math.max(0, Math.floor(remaining / 1000));
}

/**
 * Format remaining time as MM:SS
 */
export function formatTimeRemaining(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Store analysis result in session
 */
export function storeAnalysisResult(result: unknown): void {
    if (typeof window === 'undefined') return;

    updateActivity();
    sessionStorage.setItem(STORAGE_KEYS.ANALYSIS_RESULT, JSON.stringify(result));
}

/**
 * Get stored analysis result
 */
export function getAnalysisResult<T>(): T | null {
    if (typeof window === 'undefined') return null;

    if (!isSessionValid()) {
        clearSession();
        return null;
    }

    const stored = sessionStorage.getItem(STORAGE_KEYS.ANALYSIS_RESULT);
    if (!stored) return null;

    try {
        return JSON.parse(stored) as T;
    } catch {
        return null;
    }
}

/**
 * Store contract text (anonymized)
 */
export function storeContractText(text: string): void {
    if (typeof window === 'undefined') return;

    updateActivity();
    sessionStorage.setItem(STORAGE_KEYS.CONTRACT_TEXT, text);
}

/**
 * Get stored contract text
 */
export function getContractText(): string | null {
    if (typeof window === 'undefined') return null;

    if (!isSessionValid()) {
        clearSession();
        return null;
    }

    return sessionStorage.getItem(STORAGE_KEYS.CONTRACT_TEXT);
}

/**
 * Clear all session data
 */
export function clearSession(): void {
    if (typeof window === 'undefined') return;

    // Clear timer
    if (autoCleatTimerId) {
        clearTimeout(autoCleatTimerId);
        autoCleatTimerId = null;
    }

    // Clear all Verity-related storage
    Object.values(STORAGE_KEYS).forEach(key => {
        sessionStorage.removeItem(key);
    });

    // Also clear any other potential data
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key?.startsWith('verity_')) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(key => sessionStorage.removeItem(key));
}

/**
 * Check if user has been inactive
 */
export function isUserInactive(): boolean {
    if (typeof window === 'undefined') return false;

    const lastActivity = sessionStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY);
    if (!lastActivity) return false;

    const elapsed = Date.now() - parseInt(lastActivity, 10);
    return elapsed > ACTIVITY_TIMEOUT_MS;
}

/**
 * React hook helper - use inside useEffect
 */
export function setupSessionManager(): () => void {
    initSession();

    // Return cleanup function
    return () => {
        if (autoCleatTimerId) {
            clearTimeout(autoCleatTimerId);
        }
        window.removeEventListener('beforeunload', clearSession);
    };
}

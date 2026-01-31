# 🛡️ Verity Implementation Plan & Technical Spec

## 📋 Current Status
All core features (Phases 1-7) have been implemented:

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Foundation (Disclaimer, Demo Contract) | ✅ Complete |
| 2 | Visual Impact (Risk Score Animation) | ✅ Complete |
| 3 | Clause Analysis (Extractor, Highlight) | ✅ Complete |
| 4 | VOID Stamp | ✅ Complete |
| 5 | Legal Depth (Case Law, Citations) | ✅ Complete |
| 6 | Email Generator | ✅ Complete |
| 7 | Contract Fixer | ✅ Complete |
| 8 | Reports & Settings | ✅ Complete |
| 9 | Privacy & PII Redaction | ✅ Complete |
| 10 | Litigation Simulation | ✅ Complete |
| 11 | Indic Language Support | ✅ Complete |
| 12 | Market Rate Comparison | ✅ Complete |

---

## 📊 Phase 8: Reports & Settings (Remaining Work)

### 8.1 Reports Page
**File:** `app/reports/page.tsx`

**Objective:** View history of analyzed contracts.

**Data Source:** Mock data + LocalStorage (for persisted demo state).

**Components to Create:**
| Component | Path | Description |
|-----------|------|-------------|
| ReportsTable | `components/reports/reports-table.tsx` | Table with Date, Contract Name, Risk Score, Violations, Status |
| StatusBadge | `components/reports/status-badge.tsx` | Visual indicator (Critical/Medium/Low) |
| ActionMenu | `components/reports/action-menu.tsx` | Download PDF, View Details, Delete |

**UI Mockup:**
```
+--------------------------------------------------------------+
| 📊 REPORTS                                     [+ New Scan]  |
+--------------------------------------------------------------+
| Date        | Contract Name      | Risk | Issues | Actions   |
|-------------|-------------------|------|--------|-----------|
| Jan 30, 2026| freelance-nda.pdf | 78   | 5      | ⋮ Menu    |
| Jan 29, 2026| client-msa.docx   | 45   | 2      | ⋮ Menu    |
+--------------------------------------------------------------+
```

---

### 8.2 Settings Page
**File:** `app/settings/page.tsx`

**Objective:** User preferences and API configuration.

**Components to Create:**
| Component | Path | Description |
|-----------|------|-------------|
| APIKeyForm | `components/settings/api-key-form.tsx` | Input for Anthropic API key (saves to localStorage) |
| ProfileSection | `components/settings/profile-section.tsx` | Display current user info |
| DataManagement | `components/settings/data-management.tsx` | "Clear History" button |

**UI Mockup:**
```
+--------------------------------------------------------------+
| ⚙️ SETTINGS                                                  |
+--------------------------------------------------------------+
| � API Configuration                                         |
| ┌──────────────────────────────────────────────────────────┐ |
| │ Anthropic API Key: [sk-ant-•••••••••••••••] [Save]       │ |
| │ Status: ✅ Connected                                      │ |
| └──────────────────────────────────────────────────────────┘ |
|                                                              |
| 👤 Profile                                                   |
| ┌──────────────────────────────────────────────────────────┐ |
| │ Name: Guest User                                         │ |
| │ Role: Freelancer                                         │ |
| └──────────────────────────────────────────────────────────┘ |
|                                                              |
| 🗑️ Data Management                                           |
| ┌──────────────────────────────────────────────────────────┐ |
| │ [Clear All History]  [Reset Settings]                    │ |
| └──────────────────────────────────────────────────────────┘ |
+--------------------------------------------------------------+
```

---

### 8.3 Navigation Integration
**File:** `components/dashboard/dashboard-nav.tsx` (Already configured)

The navigation already has routes defined:
- `/reports` → Reports Page (requires auth)
- `/settings` → Settings Page (requires auth)

**No changes needed** to navigation; just need to create the actual pages.

---

## ✅ Verification Plan

### Automated Verification
```bash
# Build check (ensures no TypeScript errors)
npm run build
```

### Manual Verification
1. **Reports Page:**
   - Navigate to `/reports` after logging in
   - Verify table displays mock data
   - Test "Download PDF" button (should trigger download)
   - Test "Delete" action (should remove row)

2. **Settings Page:**
   - Navigate to `/settings` after logging in
   - Enter a test API key and click Save
   - Refresh page and verify key persists
   - Click "Clear All History" and verify localStorage is cleared

---

## 🔒 Phase 9: Privacy & PII Redaction

### 9.1 Client-Side PII Redactor
**File:** `lib/pii-redactor.ts` (New)

**Objective:** Redact sensitive information BEFORE sending to API.

**Regex Patterns:**
| Pattern Type | Regex | Replacement |
|--------------|-------|-------------|
| PAN Card | `[A-Z]{5}[0-9]{4}[A-Z]{1}` | `<REDACTED_PAN>` |
| Aadhaar | `\d{4}\s\d{4}\s\d{4}` | `<REDACTED_AADHAAR>` |
| Phone | `\+91\d{10}` | `<REDACTED_PHONE>` |
| Email | `[\w.-]+@[\w.-]+\.\w+` | `<REDACTED_EMAIL>` |

**Integration:**
- Call `redactPII(contractText)` in `app/analyze/page.tsx` before API call.

### 9.2 Server-Side AI Prompt Update
**File:** `app/api/analyze/route.ts`

**Status:** ✅ Already implemented (PRIVACY & ANONYMIZATION PROTOCOL added to system prompt).

---

## ⚖️ Phase 10: Litigation Simulation (Predict Outcome)

### 10.1 Backend API
**File:** `app/api/predict-outcome/route.ts` (New)

**Objective:** AI-powered court case prediction.

**Interface:**
```typescript
interface SimulationResult {
  outcome: "VOID" | "VALID" | "RISKY";
  confidenceScore: number;
  courtPath: string[];
  timeline: string;
  legalCosts: { min: number; max: number; currency: "INR" };
  settlementEstimation: string;
  keyPrecedent: { caseName: string; year: number; rulingSummary: string };
  riskProfile: { repeatOffender: boolean; judgeView: string };
}
```

### 10.2 Frontend Components
| Component | Path | Description |
|-----------|------|-------------|
| SimulationCard | `components/simulation/simulation-card.tsx` | Main card with outcome badge & confidence meter |
| CourtPath | `components/simulation/court-path.tsx` | Visual timeline: Lower Court → High Court → SC |
| SimulationModal | `components/simulation/simulation-modal.tsx` | Modal wrapper for triggering simulation |

### 10.3 Integration
- Add "Simulate Court Case" button to `components/violation-card.tsx`.
- On click, call `/api/predict-outcome` and display `SimulationModal`.

---

## ✅ Verification Plan (Updated)

### Automated
```bash
npm run build
```

### Manual Verification

**Phase 9 (Privacy):**
1. Upload a contract containing a PAN number (e.g., `ABCDE1234F`).
2. Verify the Results page shows `<REDACTED_PAN>` instead of the actual number.

**Phase 10 (Simulation):**
1. Go to Results page with a Section 27 violation.
2. Click "Simulate Court Case" button.
3. Verify:
   - Outcome shows "VOID" with >90% confidence.
   - Timeline shows "18-24 months".
   - Cost range shows "₹3-8 Lakhs".
   - Precedent cites "Percept D'Mark v. Zaheer Khan".

---

## 👤 Phase 13: Profile Transition & Logout

### 13.1 Dashboard Navigation Updates
**File:** `components/dashboard/dashboard-nav.tsx`

**Objective:** Implement a dropdown for authenticated users and ensure guest interactions lead to authentication.

**Changes:**
- Add `useState` for dropdown visibility.
- Implement a "Logout" button inside the dropdown.
- Ensure the "Login" block (Guest state) triggers the `LoginModal`.
- Update styles to match user-provided screenshots (GUEST vs FREELANCER).

### 13.2 Authentication Enhancements
**File:** `components/login-modal.tsx`

**Objective:** Add registration support as requested.

**Changes:**
- Add a toggle state (`isSignUp`) to switch between Login and Register views.
- Update UI to handle email/password entry for the "register part".

## ✅ Verification Plan (Updated)

### Manual Verification

**Phase 13 (Profile & Auth):**
1. **Guest State:** Verify clicking the user block opens the `LoginModal`.
2. **Login/Register:** Verify the modal supports switching between "Sign In" and "Sign Up".
3. **Authenticated State:** Verify the profile block shows the user's name and "FREELANCER" role.
4. **Dropdown:** Verify clicking/hovering the profile block shows a "Logout" option.
5. **Logout:** Verify clicking "Logout" clears the session and returns the UI to "GUEST" state.


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
| 8 | Reports & Settings | 🔄 Pending |

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

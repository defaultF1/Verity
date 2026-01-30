# 🔒 Verity Data Privacy & Usage Specification

---

## 🛡️ Tier 1: Anonymous Usage (Free Tier)

> **"Upload → Analyze → Download → Done"**

| Aspect | Policy |
|--------|--------|
| **Access** | No registration required. Open to all. |
| **Personal Data** | ❌ Zero stored |
| **Browser Fingerprint** | ✅ Hash of UserAgent + IP (rate limiting only) |
| **Timestamp** | ✅ Session expiry |
| **Contract Metadata** | ✅ Risk Score, Violation Count (never content) |

---

## 👤 Tier 2: Registered User (History & Signatures)

> **"Only if user CHOOSES to create an account"**

### Data We Collect

| Field | Required? | Why | Privacy Level |
|-------|-----------|-----|---------------|
| Email | ✅ Yes | Login, notifications | Encrypted |
| Full Name | ❌ Optional | For email signatures | Encrypted |
| User Type | ✅ Yes | Customize experience | Plain text |
| Industry | ❌ Optional | Better template matching | Plain text |

### Data We NEVER Ask

| Field | Status |
|-------|--------|
| Phone Number | ❌ NEVER |
| Aadhaar / PAN | ❌ NEVER |
| Physical Address | ❌ NEVER |
| Date of Birth | ❌ NEVER |

---

## 🧠 Tier 3: Contract Analysis Protocol

> **"What the AI needs to know vs. what it forgets"**

### During Contract Upload

| Field | Source | Processing |
|-------|--------|------------|
| Contract Text | User upload | Anonymized client-side |
| Names/Parties | Extracted from contract | → "Party A", "Party B" |
| Amounts/Dates | Extracted from contract | → `<AMOUNT_1>`, `<DATE_1>` |
| PII Detected (PAN/Aadhaar) | Auto-detected | → `<REDACTED>` |

### PII Redaction Patterns

```regex
PAN Card:   [A-Z]{5}[0-9]{4}[A-Z]{1}
Aadhaar:    \d{4}\s\d{4}\s\d{4}
Phone:      \+91\d{10}
```

---

## 📜 Compliance Statement

This architecture ensures **GDPR/DPDP Act** alignment by practicing:
- **Data Minimization**
- **Privacy by Design**

> Users own their documents; Verity acts only as a **transient processor** for Tier 1.

---

## 🏗️ Implementation Plan

### Phase 1: Client-Side (Frontend)

| Task | File | Status |
|------|------|--------|
| Remove forced login on CTAs | `hero-section.tsx`, `header.tsx`, `feature-grid.tsx` | ✅ Done |
| Add PII redaction before upload | `lib/pii-redactor.ts` (New) | 🔲 Pending |

### Phase 2: Server-Side (API)

| Task | File | Status |
|------|------|--------|
| Add redaction instruction to AI prompt | `api/analyze/route.ts` | ✅ Done |
| Anonymize party names in logs | `api/analyze/route.ts` | ✅ Done |
| Never log full contract text | All API routes | ✅ Verified |

### Phase 3: Storage (If Tier 2 Enabled)

| Task | File | Status |
|------|------|--------|
| Encrypt email/name fields | `contexts/auth-context.tsx` | 🔲 Pending |
| Add "Delete My Data" button | `app/settings/page.tsx` | 🔲 Pending |

---

### ✅ Verification Checklist

- [ ] Anonymous user can analyze without login
- [ ] PAN/Aadhaar numbers are replaced with `<REDACTED>` in results
- [ ] No PII appears in server logs
- [ ] "Clear All Data" removes localStorage completely

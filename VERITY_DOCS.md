# 🛡️ Verity: India's First AI-Powered Bilingual Contract Guard

## 🌟 Overview
**Verity** is a state-of-the-art legal-tech platform specifically designed for the Indian freelance economy. It empowers freelancers to analyze, negotiate, and protect themselves against predatory contracts using advanced AI and localized legal intelligence.

---

## 🎯 The Problem Verity Solves
Freelancers in India often face significant legal hurdles:
- **Legal Complexity**: Traditional legal advice is expensive and inaccessible for small-ticket contracts.
- **Predatory Clauses**: Many contracts contain "restraint of trade" or "unlimited liability" clauses that are technically void under the Indian Contract Act but used to intimidate.
- **Language Barriers**: Legal jargon is difficult to parse, especially for those more comfortable in regional languages like Hindi.
- **Payment Insecurity**: Lack of kill fees or late payment penalties often leaves freelancers unpaid.
- **Litigation Fear**: Small freelancers avoid claiming their rights due to fear of long-drawn Indian court cases.

---

## 🚀 Key Features: Mechanics & Impact

### 1. Bilingual AI Contract Analysis
*   **What it does**: Extracts and summarizes complex legal clauses into plain English and Hindi.
*   **How it works**: 
    - Incoming contract text is fed to a specialized Claude 3.5 Sonnet prompt.
    - The AI identifies key clauses (Payment, Liability, IP) and generates dual-language summaries.
    - An animated "Risk Score" meter (0-100) is calculated based on the severity of detected violations.

### 2. Legal Intelligence & "VOID" Detection
*   **What it does**: Identifies illegal clauses (Section 27) and applies a visual "VOID" warning.
*   **How it works**: 
    - The engine specifically looks for "restraint of trade" and "unlimited liability" patterns.
    - If a violation is found, the UI applies a red **VOID** stamp overlay.
    - It automatically fetches relevant Indian case law citations (e.g., *Percept D'Mark v. Zaheer Khan*) to give the freelancer legal leverage.

### 3. Women Freelancer Shield Mode
*   **What it does**: Detects safety risks, harassment clauses, and predatory patterns targeting women.
*   **How it works**: 
    - When enabled, the AI uses a secondary "Shield Pattern" set to scan for specific red flags like "late-night work requirements" or "safety liability waivers."
    - It provides purple-branded "Shield Alerts" that offer advice on how to reject these clauses safely.

### 4. Kill Fee Calculator
*   **What it does**: Helps freelancers calculate and negotiate a fair termination fee.
*   **How it works**: 
    - The system detects if a "Kill Fee" clause is missing.
    - Users input their project rate and percentage of work completed.
    - The calculator applies industry-standard formulas to suggest a fair kill fee amount to request in negotiations.

### 5. Negotiation Simulator
*   **What it does**: An AI sandbox where users practice responding to clients about predatory clauses.
*   **How it works**: 
    - A specialized AI agent assumes the role of a "Client."
    - The user types their response; the AI provides feedback on whether the response was "Too Aggressive," "Too Passive," or "Perfectly Professional."
    - It generates real-time suggestions to improve the user's bargaining position.

### 6. Client-Side PII Redactor
*   **What it does**: Protects user privacy by scrubbing sensitive data.
*   **How it works**: 
    - **Step 1**: Locally runs a series of Regex patterns to detect PAN, Aadhaar, Phone, and Email.
    - **Step 2**: Replaces these with `<REDACTED>` tags *before* the text leaves the browser.
    - **Step 3**: Ensures zero sensitive data is stored on external AI servers.

### 7. Smart Utilities (Fixer & Email)
*   **What it does**: Provides actionable follow-up tools to fix the contract.
*   **How it works**: 
    - **Contract Fixer**: The AI generates a rewritten, fair-to-freelancer version of any detected violation.
    - **Email Generator**: Templates a professional request to the client, citing specific reasons why a clause needs to be changed.

### 8. Litigation Outcome Prediction
*   **What it does**: Simulates the results of a hypothetical court battle.
*   **How it works**: 
    - The AI analyzes the strength of the contract and the detected violations.
    - It predicts a **Confidence Score**, **Estimated Time** (months), and **Legal Costs** (INR) based on recent Indian judicial trends.

---

## 💻 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS (Custom HSL palette: deep blacks, premium browns, and sharp accents)
- **Icons**: Lucide React & Material Symbols
- **State**: React Context API (`AuthContext`, `LanguageContext`)

### Backend & AI
- **Runtime**: Node.js (Next.js Edge Functions)
- **AI Engine**: Anthropic Claude 3.5 Sonnet (Optimized system prompts for Indian Contract Act)
- **Persistence**: LocalStorage (Privacy-first design)

---

## 🛠️ Implementation Status: Real vs. Mock

| Feature | Status | Implementation Detail |
|---------|--------|-----------------------|
| **AI Contract Analysis** | 🟢 **REAL** | Live Anthropic API integration. |
| **Bilingual Logic** | 🟢 **REAL** | Real-time AI-generated Hindi translations. |
| **Negotiation Sim** | 🟢 **REAL** | Interactive AI chat agent. |
| **PII Redaction** | 🟢 **REAL** | Local Regex-based scrubbers. |
| **Persistence** | 🟡 **SEMI-REAL** | Uses LocalStorage; no centralized database for privacy. |
| **Email Sending** | 🔴 **MOCK** | Copies drafted text to clipboard (UI only). |
| **Payment/Subs** | 🔴 **MOCK** | Static tiers for demo purposes. |
| **Court Prediction** | 🟢 **REAL** | Simulated predictions based on real legal logic. |

---

## �️ Trust & Security
- **No-Log Policy**: Verity does not maintain a database of your documents.
- **Local-First**: Analysis results and identity data reside primarily in your browser.
- **Anonymized Processing**: The "Privacy First" protocol ensures AI never sees your personal IDs.

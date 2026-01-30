# ⚖️ Feature Spec: Predict Your Case Outcome (Litigation Simulation)

## 🎯 Goal
To provide users with a realistic, AI-driven prediction of what would happen if they fought a specific clause in court, moving beyond "illegal" to "expensive and time-consuming".

## 🏗️ Technical Implementation

### 1. Backend: `app/api/predict-outcome/route.ts`
We will create a new API endpoint that uses Claude 3.5 Sonnet with a specialized "Indian Judge/Legal Strategist" persona.

**Input:**
- Contract Clause Text
- Violation Type (e.g., "Section 27 - Non-Compete")

**Prompt Strategy:**
> "You are an expert Indian Legal Strategist and retired Judge.
> Analyze the following clause violation: {violation} in the context of Indian Law.
> Predict the litigation outcome with 90%+ accuracy based on precedents like 'Percept D'Mark v. Zaheer Khan'.
> Output valid JSON only."

**Output JSON Structure:**
```typescript
interface SimulationResult {
  outcome: "VOID" | "VALID" | "RISKY";
  confidenceScore: number; // 0-100
  courtPath: string[]; // e.g., ["Bombay High Court", "Supreme Court"]
  timeline: string; // e.g., "18-24 months"
  legalCosts: {
    min: number;
    max: number;
    currency: "INR";
  };
  settlementEstimation: string; // e.g., "₹1.5-4 lakhs in your favor"
  keyPrecedent: {
    caseName: string;
    year: number;
    rulingSummary: string;
  };
  riskProfile: {
    repeatOffender: boolean; // Mock logic based on keywords
    judgeView: string; // "Why Judges Love/Hate This"
  };
}
```

### 2. Frontend: `components/simulation`

#### `simulation-card.tsx`
- **Visuals:** Dark mode card with "Supreme Court Simulation" header.
- **Outcome Badge:** Large "VOID" stamp or "VALID" badge.
- **Confidence Meter:** Circular progress bar showing AI confidence.
- **Court Timeline:** A simple horizontal step-indicator showing the path from Lower Court → High Court → Supreme Court.

### 3. Integration
- Add a "Simulate Court Case" button to the existing `ViolationCard`.
- When clicked, open a Modal or expand a section showing the `SimulationResult`.

## ✅ Verification Plan

### Automated Tests
- `npm run build` to ensure type safety of the new interfaces.

### Manual Verification
1.  **Trigger Simulation:**
    - Go to Results page.
    - Click "Simulate Outcome" on a Critical Violation.
2.  **Verify Output:**
    - Check if "VOID" is displayed with high confidence (>90%) for Non-Competes.
    - Verify "Percept D'Mark" is cited as precedent.
    - Check if Cost Range is reasonable (₹3-8 Lakhs).

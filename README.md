# 🛡️ Verity: The AI Legal Sentinel for India

> **"Legalese is designed to obscure. We are designed to reveal."**

![License](https://img.shields.io/badge/License-MIT-blue.svg) ![React](https://img.shields.io/badge/React-18-cyan) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![Privacy](https://img.shields.io/badge/Privacy-100%25-green)

## 📋 Overview
**Verity** is a privacy-first web application designed to protect Indian freelancers, startups, and MSMEs from predatory contracts. Unlike generic AI tools that cite US law, Verity is grounded specifically in the **Indian Contract Act, 1872**.

It parses PDF or image-based contracts using OCR, identifies illegal clauses (such as **Section 27 Restraint of Trade**), and translates complex legal jargon into plain "ELI5" English—all within the browser.

## ✨ Key Features
* **🇮🇳 India-First Intelligence:** Specifically trained to flag violations of Indian statutes like Section 23 (Unlawful Object) and Section 27 (Void Agreements).
* **🔒 Privacy by Design:** Uses a "Zero Data Retention" architecture. Contracts are processed in-memory and auto-deleted; no sensitive data is stored on our servers.
* **⚡ Instant Analysis:** Delivers a comprehensive Risk Score (0-100) and fair negotiation tips in under 30 seconds.
* **👁️ Universal Parsing:** Supports digital PDFs via `PDF.js` and scanned images via `Tesseract.js` (OCR).

## 🛠️ Tech Stack
* **Frontend:** React 18, TypeScript, Tailwind CSS, Framer Motion.
* **AI Engine:** Google Gemini 1.5 Flash (via Free Tier API).
* **Document Processing:** PDF.js, Tesseract.js.
* **Tooling:** Vite, ESLint, Prettier.

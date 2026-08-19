# Phase 4: Multilingual & Accessibility Audit Report

This document records the architectural details, implementation specifications, and testing verification results for Phase 4 of the Civic Action Engine.

---

## 1. Multilingual MVP Framework

The system natively supports three languages:
1. **English (en)**
2. **Telugu (te - తెలుగు)**
3. **Hindi (hi - हिन्दी)**

### Authoritative Source Preservation Rule
To preserve legal validity, official quotes (e.g. Model Tenancy Act sections) are retained in English inside the supporting sources panel. Dynamic AI interpretations, summaries, next steps, and user-facing UI controls are fully localized.

### Session Persistence
The chosen language is persisted in the top-level application state (`lang`) and correctly transmitted across all user actions. Resetting or transitioning modules preserves the selected language.

### API Localization Contracts
Client payloads transmit the active language:
- `POST /api/route`: `{ text, lang }`
- `POST /api/rights/analyze`: `{ text, lang }`

The backend leverages a map-and-localize pattern:
1. Localized input query keywords are mapped to English vector representations.
2. The English database index is queried.
3. The resulting grounded source data is formatted and the inferences are translated back into Hindi or Telugu prior to delivery.

---

## 2. Web Speech Synthesis

A play-back speech widget is integrated inside the Rights Navigator analysis view.

### Playback Rules
- Reading excludes official raw URLs or lengthy official quotes to avoid auditory fatigue.
- It translates sections cleanly into natural flow.

### Fallback Voice Profiling
If the client browser lacks native Telugu (`te-IN`) or Hindi (`hi-IN`) voice engines, it automatically detects the mismatch and falls back safely to default regional English profiles.
System cancels overlapping voices during resets or language toggles using `window.speechSynthesis.cancel()`.

---

## 3. WCAG Accessibility Outlines

To comply with accessibility standards, all input elements, buttons, quick prompts, and text fields in `frontend/src/App.jsx` have been updated with high-visibility visible focus outlines:
```css
focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-900
```
This guarantees keyboard navigation capability for visually impaired citizens.

---

## 4. Testing Verification Results

A 17-case regression test matrix was executed successfully using `node tests/api_sanity_check.js`.

### Test Summary
- **Total Test Cases Run**: 17
- **Grounded Mappings**: Tenant Disputes, Wage Complaints, Consumer Refunds, Police Misconduct, Sanitation, and Roads
- **Safe Fallback**: Out-of-scope queries mapped to safe fallback cards with Telugu/Hindi translation overrides.
- **Pass Rate**: 100% (17/17 tests passing)

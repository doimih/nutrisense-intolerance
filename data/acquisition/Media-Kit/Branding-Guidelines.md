# NutriAID — Branding Guidelines

**FILE PATH:** NutriAID-Acquisition-Portal/Media-Kit/Branding-Guidelines.pdf  
**DOWNLOAD LINK:** https://nutriaid.com/acquisition/download?file=Branding-Guidelines.pdf  
**Classification:** Confidential — Acquisition Reference

---

## Overview

These guidelines define the visual and verbal identity of the NutriAID brand. All marketing materials, product interfaces, partner communications, and white-label deployments must adhere to these standards. The guidelines are designed to maintain consistency, professionalism, and trust — critical qualities for a health-adjacent AI product.

---

## Brand Principles

| Principle | Description |
|---|---|
| **Clarity** | Every communication must be immediately understandable. No jargon, no ambiguity. |
| **Trust** | The brand must feel safe. Users are sharing health data — the visual and verbal language must reflect that responsibility. |
| **Intelligence** | The brand communicates that NutriAID is smart, but not cold. Precise, but not clinical. |
| **Personalisation** | The brand centres the individual. Every message should feel like it was written for one person. |

---

## Logo

### Primary Logo

The NutriAID logo consists of:
- A stylised leaf icon (representing health, nature, personalisation)
- The wordmark "NutriAID" in Inter SemiBold

**Usage rules:**
- Always maintain the minimum clear space: equal to the height of the "N" in NutriAID on all sides
- Never stretch, rotate, or distort the logo
- Never place the logo on a background that reduces legibility
- Never alter the logo colours outside the approved variations below

### Approved Logo Variations

| Variation | Usage |
|---|---|
| Green icon + Dark wordmark | Primary: use on white or light grey backgrounds |
| White icon + White wordmark | Use on NutriAID Green or dark backgrounds |
| Dark icon + Dark wordmark (monochrome) | Use when colour printing is unavailable |
| Icon only (green) | App icons, favicons, social media profile images |

### Minimum Logo Size

- Digital: 120px wide minimum
- Print: 30mm wide minimum

---

## Colour System

### Primary Palette

| Colour Name | Hex Code | RGB | Usage |
|---|---|---|---|
| NutriAID Green | `#4CAF50` | 76, 175, 80 | Primary buttons, active states, highlights, icons |
| Carbon Black | `#1A1A1A` | 26, 26, 26 | Primary text, headings, nav backgrounds |
| Pure White | `#FFFFFF` | 255, 255, 255 | Page backgrounds, card surfaces, inverse text |

### Secondary Palette

| Colour Name | Hex Code | Usage |
|---|---|---|
| Soft Grey | `#F5F5F5` | Section backgrounds, alternating rows |
| Light Grey | `#E0E0E0` | Dividers, borders |
| Medium Grey | `#888888` | Subtext, placeholders, meta information |
| Light Green | `#E8F5E9` | Success states, badges, highlight backgrounds |
| Dark Green | `#388E3C` | Button hover states, emphasis |
| Error Red | `#D32F2F` | Error states, warnings |
| Warning Amber | `#F59E0B` | Caution badges, pending states |

### Colour Usage Rules

- Never use NutriAID Green as a background for large text areas (accessibility)
- Maintain minimum 4.5:1 contrast ratio for all body text (WCAG AA)
- Never use red for positive states or green for error states

---

## Typography

### Font Family

**NutriAID uses Inter exclusively across all digital surfaces.**

Inter is a free, open-source typeface designed for screen readability. It must be loaded from Google Fonts or self-hosted.

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
```

### Type Scale

| Element | Font | Weight | Size | Line Height |
|---|---|---|---|---|
| H1 — Page title | Inter | 700 (Bold) | 48px / 3rem | 1.2 |
| H2 — Section header | Inter | 700 (Bold) | 32px / 2rem | 1.3 |
| H3 — Card header | Inter | 600 (SemiBold) | 24px / 1.5rem | 1.4 |
| H4 — Sub-section | Inter | 600 (SemiBold) | 18px / 1.125rem | 1.4 |
| Body — Default | Inter | 400 (Regular) | 16px / 1rem | 1.7 |
| Small — Caption | Inter | 400 (Regular) | 14px / 0.875rem | 1.5 |
| Label — Badge | Inter | 500 (Medium) | 12px / 0.75rem | 1.4 |
| Code | JetBrains Mono | 400 (Regular) | 14px / 0.875rem | 1.6 |

### Typography Rules

- Never use bold for entire paragraphs — use it to emphasise 1–3 words maximum
- Never use italic except for citations or user-generated quotes
- Avoid text smaller than 12px in any interface element
- Line length: 60–75 characters per line for body copy

---

## Iconography

NutriAID uses **Lucide Icons** throughout the product interface.

```bash
npm install lucide-react
```

**Icon usage rules:**
- Always use icons at the standard sizes: 16px (small), 20px (medium), 24px (large)
- Never mix Lucide icons with icons from other libraries in the same interface
- Icons used in buttons must be accompanied by a text label (accessibility)
- Use `stroke-width={1.5}` for standard UI icons; `stroke-width={2}` for emphasis

**Commonly used icons:**
- `Sparkles` — AI features, GEO badge
- `Leaf` — brand icon, nutrition references
- `Shield` — safety, compliance
- `Download` — document downloads
- `ChevronRight` — navigation, expand
- `CheckCircle` — success states
- `AlertCircle` — warnings
- `X` — close, dismiss

---

## Spacing System

NutriAID uses an 8px base grid.

| Token | Value | Usage |
|---|---|---|
| space-1 | 4px | Micro gaps, icon padding |
| space-2 | 8px | Base unit, small gaps |
| space-3 | 12px | Compact element spacing |
| space-4 | 16px | Default element gap |
| space-6 | 24px | Section internal padding |
| space-8 | 32px | Card padding |
| space-12 | 48px | Section separation |
| space-16 | 64px | Major section breaks |
| space-24 | 96px | Hero padding |

---

## Component Patterns

### Buttons

```
Primary CTA:    NutriAID Green background (#4CAF50), white text, 8px border-radius
Secondary:      Transparent background, NutriAID Green border + text
Destructive:    White background, Error Red border + text
Disabled:       Light Grey background, Medium Grey text
```

### Cards

```
Background:     White (#FFFFFF)
Border:         1px solid #E0E0E0
Border-radius:  12px
Shadow:         0 1px 3px rgba(0,0,0,0.08)
Padding:        24–32px
```

### Badges

```
Success:        Light Green (#E8F5E9) background, Dark Green (#388E3C) text
Warning:        Amber (#FEF3C7) background, Amber text (#92400E)
Info:           Light Blue background, Blue text
Confidential:   Amber (#FEF3C7) background, amber text, lock icon
```

---

## Tone of Voice

### Do

- Use direct, confident language: "NutriAID enforces your intolerances."
- Use present tense: "The AI generates your meal plan." (not "will generate")
- Use "you" and "your" — personalise everything
- Use hedged language for health claims: "may help", "is associated with", "some users report"
- Keep sentences short: maximum 20 words per sentence in UI copy

### Don't

- Never use medical claims: "treats", "cures", "diagnoses", "prescribes"
- Never use absolute nutritional claims: "guarantees weight loss"
- Never use corporate jargon: "synergise", "leverage", "bandwidth" (in the HR sense)
- Never use all-caps for emphasis in body copy (use bold instead)
- Never use exclamation marks in UI text (they reduce perceived trustworthiness in health contexts)

---

## White-Label Deployment Guidelines

When deploying NutriAID under a partner or client brand:

1. Replace the logo with the client's logo in the admin panel settings
2. Replace `#4CAF50` with the client's primary brand colour (update in admin theme settings)
3. Update the platform name in Settings → Platform
4. Update all email sender name and from-address in Settings → Email
5. The "Powered by NutriAID" attribution in the footer is optional but appreciated

**What must not change in white-label deployments:**
- Medical disclaimer language (legal protection)
- Worker safety validation logic
- The GDPR-compliant session and data architecture

---

*NutriAID Acquisition Portal — Confidential — June 2026*

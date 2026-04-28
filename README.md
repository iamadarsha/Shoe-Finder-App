<div align="center">

# SoleMate

### AI running shoe finder for Indian runners

[![Live](https://img.shields.io/badge/Live-Demo-111?style=for-the-badge)](https://shoe-finder-app-gsdz.vercel.app/)
[![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react&logoColor=111)](#tech-stack)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?style=for-the-badge&logo=vite&logoColor=fff)](#tech-stack)
[![Gemini](https://img.shields.io/badge/Gemini-Recommendations-f59e0b?style=for-the-badge)](#product-surface)

</div>

---

## Recruiter Quick Scan

| Signal | Details |
|---|---|
| Product | AI recommendation app that matches runners to shoes based on goals, biomechanics, and budget |
| What it demonstrates | Consumer product UX, recommendation logic, data modeling, serverless APIs, and conversion-focused flows |
| Differentiator | Uses a curated 260-shoe database across 16 brands with India-focused pricing and shopping paths |
| Stack | React, TypeScript, Vite, Tailwind CSS, Gemini, Vercel serverless functions |

## Product Surface

- 5-step quiz that recommends the top shoes for a runner's profile
- Browse mode for all 260 shoes with search, filters, and sorting
- AI chat drawer for follow-up questions and fit clarification
- Expert score and product metadata inspired by runner review workflows
- Cheapest-price action routing users toward shopping research
- Typography-first design that avoids unreliable scraped product imagery

## Live Demo

Open the app: [shoe-finder-app-gsdz.vercel.app](https://shoe-finder-app-gsdz.vercel.app/)

## Brands Covered

Adidas, Anta, Asics, Brooks, Decathlon, Hoka, Mizuno, New Balance, Nike, On Running, Puma, Reebok, Saucony, Skechers, Under Armour, Xtep.

## Quick Start

```bash
npm install
echo "VITE_GEMINI_API_KEY=your_key" > .env.local
npm run dev
```

## Tech Stack

| Layer | Tooling |
|---|---|
| Frontend | React 18, TypeScript, Vite 6 |
| Styling | Tailwind CSS, custom theme tokens |
| AI | Google Gemini API |
| API | Vercel serverless functions |
| Data | Curated TypeScript shoe database |
| Testing | Vitest database checks |

## Verification

```bash
npm run build
npm run test
```

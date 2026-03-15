# SoleMate v2.0 — AI Shoe Finder 👟

> AI-powered running shoe recommender for the Indian market.
> 233 shoes · 15 brands · Gemini AI recommendations.

**Live:** [shoe-finder-app-gsdz.vercel.app](https://shoe-finder-app-gsdz.vercel.app/)

---

## What's New in v2.0

- **Full Redesign** — Premium dark theme inspired by kernel.sh. DM Sans + Figtree typography.
- **233-Shoe Database** — Every major running shoe available in India, parsed from curated spreadsheet with foam tech, plate info, pricing, and buy links.
- **5-Step AI Quiz** — Collects use case, experience, foot type, mileage, budget → Gemini picks top 5 from pre-filtered database.
- **Browse All Shoes** — RunRepeat-style catalog with search, brand/category/budget filters, and sorting.
- **AI Chat Drawer** — Free-form conversation with SoleMate AI about any shoe question.
- **Smart Filtering** — Shoes are pre-filtered in JavaScript before hitting the LLM to prevent hallucinations.
- **India-First** — All prices in ₹ INR. Buy links to Amazon.in, Flipkart, and official brand stores.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Bundler | Vite 6 |
| AI | Google Gemini 2.0 Flash |
| Styling | Tailwind CSS 3.4 |
| Deployment | Vercel |
| Database | 233-shoe TypeScript array (no external DB) |

## Screens

1. **Landing Page** — Hero with animated gradient orbs, brand bar, CTA
2. **Quiz Flow** — 5 animated steps with progress bar
3. **Results Page** — Top 5 AI recommendations with match scores, tech specs, buy links
4. **Browse Page** — Full 233-shoe catalog with filters and search
5. **Chat Drawer** — Slide-in Gemini chat panel

## Setup

```bash
# 1. Clone
git clone https://github.com/iamadarsha/Shoe-Finder-App.git
cd Shoe-Finder-App

# 2. Install
npm install

# 3. Set your Gemini API key
cp .env.local.example .env.local
# Edit .env.local and add your key from https://aistudio.google.com/apikey

# 4. Run
npm run dev
# Open http://localhost:5173
```

## Deploy to Vercel

```bash
git add .
git commit -m "feat: SoleMate v2.0 — full redesign, 233-shoe database, quiz, browse, chat"
git push origin main
```

Vercel auto-deploys from the main branch.

## File Structure

```
├── App.tsx                    # Main screen router
├── index.html                 # Entry HTML with Google Fonts
├── index.tsx                  # React entry point
├── types.ts                   # All TypeScript interfaces
├── components/
│   ├── LandingPage.tsx        # Hero screen
│   ├── QuizFlow.tsx           # 5-step preference quiz
│   ├── ResultsPage.tsx        # AI recommendation cards
│   ├── BrowsePage.tsx         # Full shoe catalog with filters
│   └── ChatDrawer.tsx         # Gemini chat panel
├── data/
│   └── shoe-database.ts       # 233 shoes with full metadata
├── services/
│   └── gemini.ts              # AI recommendation + chat logic
├── styles/
│   ├── globals.css            # Tailwind imports + base styles
│   └── theme.ts               # Design token constants
├── lib/
│   └── utils.ts               # cn() helper
├── tailwind.config.js
├── postcss.config.js
├── vite.config.ts
├── tsconfig.json
├── vercel.json                # SPA rewrite rule
└── package.json
```

## Brands in Database

Adidas · Anta · Asics · Brooks · Decathlon · Hoka · New Balance · Nike · On Running · Puma · Reebok · Saucony · Skechers · Under Armour · Xtep

## Credits

- Shoe data: Manually curated Indian running shoe comparison spreadsheet
- AI: Google Gemini 2.0 Flash
- Design: Inspired by kernel.sh, RunRepeat, Sole Review
- Built by Adarsha with AI-assisted development

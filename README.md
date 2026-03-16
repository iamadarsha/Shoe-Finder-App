# SoleMate — AI Shoe Finder 👟

260 running shoes · 16 brands · AI-powered for India

Live: https://shoe-finder-app-gsdz.vercel.app/

## Features

- 5-step quiz -> AI matches top 5 shoes from 260-shoe database
- Expert review scores (RunRepeat/SoleReview-style)
- Google Shopping "Find Cheapest Price" for every shoe
- Browse all 260 shoes with search, filters, sorting
- AI chat for follow-up questions
- No shoe images - pure data-driven, typography-rich design
- Prices verified from Nike.in, Asics.co.in, Adidas.co.in

## Tech Stack

- React 18 + TypeScript + Vite 6 + Tailwind CSS
- Google Gemini 3.1 Flash Lite (500 req/day free)
- Vercel serverless API routes
- 260-shoe database with verified INR prices

## Brands

Adidas · Anta · Asics · Brooks · Decathlon · Hoka · Mizuno · New Balance · Nike · On Running · Puma · Reebok · Saucony · Skechers · Under Armour · Xtep

## Setup

```bash
npm install
echo "VITE_GEMINI_API_KEY=your_key" > .env.local
npm run dev
```

# CreditCardAI

Transparent, algorithmic credit card recommendations for the Indian market.

## Stack

This project runs on Lovable's fixed stack:

- React 19 + TypeScript
- TanStack Start (file-based routing, SSR) + Vite 7
- Tailwind CSS v4 (design tokens in `src/styles.css`)
- shadcn/ui + Lucide icons
- Motion (Framer Motion) for animation
- Recharts for charts
- React Hook Form + Zod for the multi-step form

## What's included

| Route | Purpose |
| --- | --- |
| `/` | Premium landing page: hero, features, testimonials, pricing, FAQ |
| `/profile` | Four-step spending profile form (persisted in the browser) |
| `/recommendations` | Top 3 matches with match scores and reasons, plus full ranking |
| `/cards` | Instant search with bank / fee / reward type / income / score / travel / cashback filters |
| `/cards/$cardId` | Card detail: visual, benefits, benefit strength, eligibility, fees, pros & cons, apply |
| `/compare` | Side-by-side comparison table of up to 4 cards |
| `/dashboard` | Spend pie chart, match-score bar chart, KPIs, bookmarked cards |

## Recommendation engine

`src/lib/recommend.ts` is fully deterministic — no randomness. Every card gets a weighted score:

| Signal | Weight |
| --- | --- |
| Spend alignment (category strengths vs. your spend mix) | 40 |
| Reward economics (annual value net of effective fee) | 20 |
| Eligibility fit (income, credit score, employment) | 15 |
| Fee comfort (effective fee vs. your ceiling) | 12 |
| Preferred benefits | 8 |
| Reward type match | 5 |

Cards you already own are penalised. Each result carries plain-English `reasons` and `warnings`.

## Data

`src/data/cards.ts` holds 14 popular Indian cards (HDFC, Axis, ICICI, SBI Card, Amex, HSBC,
IDFC FIRST, Kotak, AU SFB) with fees, reward rates, eligibility and per-category benefit scores.

## Local development

```bash
bun install   # or npm install
bun dev       # http://localhost:8080
```

## Data persistence

The spending profile and bookmarks are stored in the browser (`localStorage`). No accounts and no
backend are required. Adding accounts, saved recommendation history and an admin panel means
enabling Lovable Cloud (Postgres + auth + server functions) — that is the next step, not Clerk /
Prisma / Neon, which are not part of this stack.

## Deployment

Publish from the Lovable editor. Vercel-specific config is not used.

## Screenshots

- Landing page: _placeholder_
- Recommendations: _placeholder_
- Dashboard: _placeholder_

> Informational only. Not financial advice; verify terms with the issuer before applying.

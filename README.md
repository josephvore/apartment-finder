# Apartment Finder

A local-first decision dashboard for comparing, ranking, and choosing between apartment options. Built around an initial Salt Lake City dataset of 10 buildings, but designed to take arbitrary apartments.

## Features

- **Dashboard** — card + table views with filters (rent, status, tag, pet-friendly), sort (rank, score, rent, total cost, name), inline rank reordering, status badges, red-flag warnings.
- **Apartment detail / edit** — full profile including pros/cons/red flags/unknowns/dealbreakers/nice-to-haves/follow-up questions; pet policy; fees; amenities; reviews; sources; tour info; comments (general / tour / question / concern / decision / follow-up).
- **Add apartment** — same form as edit, blank.
- **Scoring system** — 8 weighted categories (value, location, unit quality, amenities, commute, fees, risk, personal preference); adjustable weights in Settings.
- **Side-by-side comparison** — pick any number of apartments; compares every field including derived metrics ($/sqft, all-in monthly, move-in cost) and all 8 score categories.
- **Cost calculator** — confirmed vs. estimated breakdown per apartment.
- **Decision assistant** — best overall (weighted), best value ($/sqft), best location, best amenities, lowest monthly, highest risk; needs-more-research; likely-eliminate; aggregated red flags.
- **Export**
  - Polished **PDF report** (landscape comparison table + per-apartment profiles + rankings & reasoning + research notes).
  - **Google Docs–friendly table** — one-click clipboard copy of styled HTML that pastes into Docs as a real table.
  - **CSV** + **JSON** downloads.
  - **JSON import** in Settings.

## Persistence

Browser **localStorage**, key `apartment-finder:v1`. The seed data loads on first visit. All edits, comments, weight changes, and new apartments persist across reloads on the same browser/device. Use Settings → Download backup JSON to export, and Settings → Import to restore (handy for syncing between devices).

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start   # production build
```

Node 20+ recommended (developed against Node 22).

## Tech stack

- Next.js 16 (App Router, Turbopack)
- TypeScript (strict)
- Tailwind CSS v4
- React 19
- `@react-pdf/renderer` for the PDF report (client-only, dynamically imported)
- UUID for stable IDs

## Project structure

```
src/
  app/
    layout.tsx, page.tsx                  # Dashboard (/)
    apartments/
      new/page.tsx                        # Add apartment (/apartments/new)
      [id]/page.tsx                       # Detail (/apartments/:id)
      [id]/edit/page.tsx                  # Edit (/apartments/:id/edit)
    compare/page.tsx                      # Side-by-side comparison
    calc/page.tsx                         # Cost calculator
    decision/page.tsx                     # Decision assistant
    export/page.tsx                       # PDF / clipboard / CSV / JSON
    settings/page.tsx                     # Weights + import/export
  components/
    NavBar.tsx, ui.tsx, ListField.tsx,
    ApartmentForm.tsx, PdfReport.tsx
  lib/
    types.ts        # Apartment / Scores / Sources / Comments / Fees / etc.
    store.tsx       # React Context + localStorage hydration
    scoring.ts      # weightedScore, totalMonthlyCost, moveInCost, costPerSqFt, bestBy, …
    export.ts       # CSV + Google Docs HTML + clipboard helpers
    seed.ts         # Initial 10-apartment SLC dataset
```

## Data model

See `src/lib/types.ts`. Every apartment carries:

- Identity + status + rank
- Rent (and optional range), unit type, sqft, availability, lease terms
- Structured fees (application, admin, deposit, parking, petDeposit, petFee, petRent, other)
- Utilities (included / tenant-paid / monthly estimate)
- Parking (available / covered / cost / notes)
- Pet policy (allowed, species, max pets, weight limit, breed restrictions, amenities, notes)
- Amenities (free-form tags)
- Evaluation: pros / cons / red flags / unknowns / dealbreakers / nice-to-haves / follow-up questions
- Scores (1–10) in 8 categories
- Tour info + contact
- Review summary (rating, count, source, praise, complaints)
- Sources (URL + type + dateAccessed + notes + confidence)
- Comments (categorized + timestamped)
- Confidence + missingData fields for transparency

## Seeded dataset

10 SLC apartments researched against official sites, RentCafe, Apartments.com, ApartmentList, ApartmentRatings, Yelp, Birdeye, HotPads as of 2026-05-26. Each apartment carries source URLs and an explicit `confidence` field. Notable verified findings:

- **Gateway 505** has **no on-site parking** (FAQ-confirmed) — major caveat.
- **Crossing at 9th** is brand new (built 2025), 205 units, dog park + pet wash, 12 weeks free promo.
- **The Morton** confirmed $125/mo covered parking + $500 deposit + $45 app.
- **Post District** uses third-party PetScreening for pet fees + has 50 lb weight cap.
- **Seasons at Library Square** has tiered pet rent and $40/mo mandatory trash valet.

See each apartment's Sources tab for the underlying citations.

## Adjusting scoring

Defaults: Value 25%, Location 20%, Unit Quality 15%, Amenities 10%, Commute 10%, Fees 10%, Risk 5%, Personal Preference 5%.

Sliders in Settings let you change weights; weights are normalized when scores are computed (you don't have to make them sum to 100). The Decision page and the PDF reflect the current weights immediately.

## Limitations / assumptions

- Pricing and availability are snapshots and shift weekly — verify with leasing offices before applying.
- Utility estimates are tenant-entered approximations.
- Some pet weight/breed lists and admin fees are not publicly disclosed; those fields are marked in each apartment's `missingData`.
- localStorage is per-browser. Use JSON export/import to move data between devices.
- The PDF runs entirely in the browser; large datasets may take a few seconds to render.

## Deployment

Any Next.js host works. Easiest path: push to GitHub, import the repo in Vercel, deploy with defaults. No environment variables needed.

## Add to the seed permanently

Edit `src/lib/seed.ts` and use the `make({ ... })` helper. After editing, users can pick up the new data by clicking Settings → Reset to seeded data (this clears their local edits, so warn first).

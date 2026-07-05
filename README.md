# WOT Scam Meter (MVP)

A minimal Next.js app for uploading **World of Tanks** replay files and crowd-assessing potential scam-like events.

## Features

- Upload `.wotreplay` files
- Store replay metadata (filename, size, upload timestamp)
- Replay case list (newest first)
- Replay detail page with:
  - vote/assessment categories:
    - WG server lag
    - Shell disappeared
    - Player cheating
  - optional comment submission
  - aggregated vote totals per category
  - recent comments feed
- Basic duplicate rapid-submission protection (same client fingerprint + same category + same replay within 60s)

## Tech stack

- Next.js (App Router) + TypeScript
- Prisma + SQLite
- Zod validation
- Local filesystem storage for uploaded files (swappable via storage abstraction)

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create environment file:

   ```bash
   cp .env.example .env
   ```

3. Run Prisma migration and generate client:

   ```bash
   npm run prisma:migrate
   ```

4. Start dev server:

   ```bash
   npm run dev
   ```

5. Open `http://localhost:3000`

## Environment variables

See `.env.example`:

- `DATABASE_URL` – SQLite database URL for Prisma
- `UPLOAD_DIR` – absolute or relative directory for uploaded replay files

## Scripts

- `npm run dev` – run development server
- `npm run build` – build production app
- `npm run start` – start production app
- `npm run lint` – run ESLint
- `npm run prisma:migrate` – apply migrations in local development
- `npm run prisma:generate` – generate Prisma client

## MVP limitations

- Anonymous submissions only (no auth/user accounts)
- Local filesystem storage (not distributed/cloud-ready yet)
- Lightweight anti-spam only (not a full abuse-prevention system)
- Replay binary content is validated by extension/content type checks only

## Follow-up recommendations

- Add authentication and reputation/weighting for voters
- Move replay storage to object storage (e.g., S3-compatible)
- Add replay parsing/inspection to improve validation
- Add moderation workflow and abuse reporting

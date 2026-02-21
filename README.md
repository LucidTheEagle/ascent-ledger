# 🦅 ASCENT LEDGER

> *Most people think they are living. They are surviving the fog.*

![Status: Beta Live](https://img.shields.io/badge/Status-Beta_Live-22c55e?style=for-the-badge)
![Version: 0.1.0](https://img.shields.io/badge/Version-0.1.0-6366f1?style=for-the-badge)
![Stack: Next.js 16](https://img.shields.io/badge/Stack-Next.js_16-000000?style=for-the-badge&logo=next.js)
![License: Private](https://img.shields.io/badge/License-Private-334155?style=for-the-badge)

---

## The Origin

I built this from a deep and honest place.

I was alone with my thoughts, sitting with something I could not shake — the belief that every person on this earth is called to something higher. A purpose. A reason they exist beyond the daily grind. And most people never reach it. Not because they are not capable, but because they cannot see through the fog they are living in.

The fog is not depression. The fog is not failure. The fog is the state of surviving life and calling it living. Going through the motions. Staying in the job that is slowly draining you. Telling yourself "this is fine" when something deeper in you knows it is not. The fog is what happens when you stop ascending and start just... existing.

I looked around and saw people — smart, capable, driven people — completely lost in it. Some of them knew it. And those who did had nobody to talk to about it, or the people they could talk to were too far away, too busy, too caught in their own fog.

So I built Ascent Ledger.

Not a journaling app. Not a task manager. A diagnostic system. A weekly reckoning. A mirror that shows you not where you have been, but where your trajectory is actually pointing — and whether that direction is up.

Because I believe this: when you start serving your higher calling, clarity follows. Not the other way around. You do not wait for clarity to act. You act, and the fog lifts.

There is more to this OS than what is here. This is the MVP. The foundation. The base camp.

The summit is ahead.

---

## What It Does

Ascent Ledger gives you two systems depending on where you are right now.

### 🦅 Ascent Mode — For those ready to climb

You log your week. Not tasks. Not feelings. The actual leverage you built, the insight you gained, the opportunities you created. Once a week. That is the discipline.

The AI reads it, identifies the patterns you cannot see yourself, and generates a **Fog Check** — a direct assessment of where your thinking is clouded, where your actions are misaligned, and what the next move is. No corporate filler. No generic advice. Direct signal.

Your progress is tracked on the **Ascent Tracker** — a visual timeline of your climb, streak by streak, week by week. You see momentum, or you see the truth that you have stopped moving.

### 🛡️ Recovery Mode — For those in the fog right now

Some people are not ready to climb. They are drowning. Toxic environment. Burnout. Financial panic. Imposter syndrome crushing them.

Recovery Mode is not weakness. It is triage.

You identify what is burning, commit to what you will cut, and name the one person who can give you oxygen. The system locks you in for 14 days — not to trap you, but to protect you from making vision-level decisions while you are in survival mode.

Your **Oxygen Gauge** tracks your stability week by week. Your **Escape Velocity** shows you how close you are to being ready to ascend again. When the system says you are ready, you transition — and you earn it.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Database | PostgreSQL via Supabase + Prisma ORM |
| Authentication | Supabase Auth (SSR, cookie-based, RLS) |
| AI Engine | Groq API (LLM inference for Fog Check) |
| Graph Layer | FalkorDB (pattern detection across logs) |
| Rate Limiting | Upstash Redis (sliding window) |
| UI | Tailwind CSS v4, Framer Motion, Aceternity UI |
| Monitoring | Sentry (errors) + PostHog (analytics) |
| Deployment | Vercel |

---

## Local Setup

### Prerequisites
- Node.js 20+
- npm
- A Supabase project
- A Groq API key
- An Upstash Redis database

### 1. Clone and install

```bash
git clone https://github.com/LucidTheEagle/ascent-ledger.git
cd ascent-ledger
npm install
```

### 2. Environment variables

Create `.env.local` in the root:

```env
# Database
DATABASE_URL="postgresql://[user]:[password]@[host]:6543/postgres?pgbouncer=true&connect_timeout=10"
DIRECT_URL="postgresql://[user]:[password]@[host]:5432/postgres?connect_timeout=15"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[project].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."

# AI
GROQ_API_KEY="gsk_..."

# Infrastructure
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Monitoring
NEXT_PUBLIC_SENTRY_DSN="https://..."
NEXT_PUBLIC_POSTHOG_KEY="phc_..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Initialize the database

```bash
npx prisma generate
npx prisma db push
```

### 4. Run

```bash
npm run dev
```

Open `http://localhost:3000`.

---

## Deployment

Deployed on Vercel. Push to `main` triggers production build.

Prisma client is generated automatically via `postinstall` before each build.

Ensure all environment variables are set in Vercel → Settings → Environment Variables before deploying.

---

## Project Structure

```
ascent-ledger/
├── app/                    # Next.js App Router pages and API routes
├── components/             # UI components (dashboard, landing, tokens, ui)
├── lib/                    # Core logic (AI, graph, services, Supabase, Prisma)
├── hooks/                  # React hooks (useReducedMotion, useLazyLoad)
├── prisma/                 # Database schema
├── docs/                   # Architecture decisions and debug journeys
└── public/                 # Static assets
```

---

## Status

**Beta — February 2026**

Five pilots. Weekly logging. Fog Checks running. Watching the data.

Sprint 7 will expand based on what the first users teach us.

---

## The Principle

Movement is not progress.

You can be busy every day of your life and never ascend. Ascent Ledger exists to make the difference visible — between the weeks where you built leverage and the weeks where you just survived.

One log. One week. One step up.

*From Fog to Light. From Motion to Progress.*

---

*Built by Lucid the Eagle — 2026*
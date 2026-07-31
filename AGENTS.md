# Nirapod — Antigravity Task Prompts (rate-limit-safe, one task at a time)

## How this works

1. Before opening Antigravity, manually add two files to your repo (zero AI tokens spent):
   - `AGENTS.md` at repo root (section 1 below) — Antigravity auto-loads this every session
   - `docs/ARCHITECTURE.md` — paste the full architecture doc from earlier in this chat (schema, AI prompt contracts, API list)
2. Commit + push those two files first, before running any task.
3. Paste **Task 0**, let it finish, review the diff, then paste **Task 1**, and so on.
4. Never paste two tasks in one message — that's what blows your quota. One task = one session = one commit.
5. If Antigravity is close to its quota mid-task, stop, commit whatever compiles, and resume the same task fresh next session — `AGENTS.md` means it re-orients itself instantly instead of re-reading everything.

---

## 1. `AGENTS.md` (create this once, commit it, never re-paste it)

```markdown
# Nirapod — Agent Context

Citizen safety + hazard reporting platform for Dhaka. Hackathon prototype, 7-8hr build.

## Stack (do not deviate)
Next.js 15 App Router + TypeScript, Tailwind + shadcn/ui, Supabase (Postgres/PostGIS,
Auth, Storage, Realtime), Leaflet.js + free OSM tiles (no paid map keys), Gemini API
for AI features, deployed on Render.

## Reference
Full DB schema, API list, and exact AI prompt contracts live in `docs/ARCHITECTURE.md`.
Read it before starting any task that touches schema, API, or AI calls.

## Env vars (already set in .env.local and Render dashboard — never hardcode)
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
GEMINI_API_KEY

## Conventions
- Server-side Supabase calls use the service role client; client-side uses the anon client.
- All async UI actions must have loading + error states.
- Bilingual: every user-facing string goes through the i18n dictionary (en.json/bn.json),
  never hardcoded text in components.
- Keep API routes thin — logic in lib/.

## Deployment
Render web service, auto-deploys on push to `main`. Start command: `next start -p $PORT`.
Do not change the start command or the app won't bind correctly on Render.

## Out of scope — do not build unless explicitly asked
Separate logins per department, password reset/2FA, microservices, a second backend
service, paid map APIs, duplicate detection, route-avoidance routing, notifications,
trust scores.

## Git
After every task: `git add -A && git commit -m "<short task summary>" && git push origin main`.
```

---

## 2. Render setup (one-time, manual — 5 minutes, do this before Task 0)

1. Push your empty repo to GitHub.
2. Render dashboard → New → Web Service → connect the repo.
3. Environment: **Node**. Build command: `npm install && npm run build`. Start command: `next start -p $PORT`.
4. Add the four env vars from `AGENTS.md` in Render's dashboard (Environment tab) — `NEXT_PUBLIC_*` ones must be set **before** the first build, since Next.js bakes them in at build time.
5. Enable auto-deploy on push to `main` (default). Every task's git push from here on redeploys automatically.
6. Note for demo day: Render's free tier sleeps after inactivity → open your URL ~10 min before you present to warm it up, don't rely on the first request being fast.

---

## 3. Task Prompts

Your template kept, with two additions: a pointer to `AGENTS.md`/`ARCHITECTURE.md` instead of restating context, and a git push step baked into "before stopping" so Render deploys automatically.

### Task 0 — Bootstrap
```
You are a Senior Staff Software Engineer.
Read AGENTS.md and docs/ARCHITECTURE.md before starting.
Your job is to complete ONLY the task below.

TASK:
Scaffold a Next.js 15 App Router + TypeScript project. Configure Tailwind + shadcn/ui.
Add Supabase browser + server clients per AGENTS.md env vars. Add a minimal i18n setup
(en.json, bn.json) with a language toggle in the nav, persisted via cookie. Set
package.json "start" script to `next start -p $PORT`. Add a root health-check route.

Rules:
- Do not modify unrelated code.
- Reuse existing code.
- Follow the existing architecture.
- Write production-quality code.
- Keep the project buildable.

Before stopping:
1. Verify every requirement is implemented.
2. Run the application.
3. Fix all compile errors.
4. Fix all dependency/import errors.
5. Confirm `npm run build` succeeds.
6. git add -A && git commit -m "bootstrap: scaffold + supabase + i18n" && git push origin main

Do NOT explain your reasoning. Do NOT generate long summaries.
When finished, respond ONLY with: READY FOR GIT
If something cannot be completed, explain ONLY the blocking issue in one sentence.
```

### Task 1 — Database & types
```
You are a Senior Staff Software Engineer.
Read AGENTS.md and docs/ARCHITECTURE.md section 5 before starting.

TASK:
Create supabase/schema.sql matching docs/ARCHITECTURE.md section 5 exactly (profiles,
reports, verifications, sos_alerts, PostGIS trigger). Generate matching TypeScript
types in lib/types.ts. Add lib/supabase/queries.ts with typed CRUD helpers per table.

Rules:
- Do not modify unrelated code.
- Reuse existing code.
- Follow the existing architecture.
- Write production-quality code.
- Keep the project buildable.

Before stopping:
1. Verify every requirement is implemented.
2. Run the application.
3. Fix all compile/type errors.
4. Fix all dependency/import errors.
5. git add -A && git commit -m "db: schema + types + query helpers" && git push origin main

Do NOT explain your reasoning. Do NOT generate long summaries.
When finished, respond ONLY with: READY FOR GIT
If something cannot be completed, explain ONLY the blocking issue in one sentence.
```

### Task 2 — Auth
```
You are a Senior Staff Software Engineer.
Read AGENTS.md before starting.

TASK:
Implement Supabase Auth signup/login/logout for two roles: citizen and authority
(authority has an optional department field: city_corporation | disaster_management |
police). Add middleware protecting authority-only routes. Add a role-aware nav bar.

Rules:
- Do not modify unrelated code.
- Reuse existing code.
- Follow the existing architecture.
- Write production-quality code.
- Keep the project buildable.

Before stopping:
1. Verify every requirement is implemented.
2. Run the application, test signup/login for both roles.
3. Fix all compile/runtime/auth errors.
4. git add -A && git commit -m "auth: citizen/authority roles" && git push origin main

Do NOT explain your reasoning. Do NOT generate long summaries.
When finished, respond ONLY with: READY FOR GIT
If something cannot be completed, explain ONLY the blocking issue in one sentence.
```

### Task 3 — Report creation + seed data
```
You are a Senior Staff Software Engineer.
Read AGENTS.md and docs/ARCHITECTURE.md before starting.

TASK:
Build the report creation form: category select, description, photo upload to
Supabase Storage bucket "reports", GPS via browser Geolocation API with manual
lat/lng fallback inputs. On submit, insert into reports with status "received".
Add scripts/seed.ts inserting 15-20 demo reports across real Dhaka coordinates
(Dhanmondi, Mirpur, Uttara, Gulshan, Mohammadpur, Farmgate), varied categories/times.

Rules:
- Do not modify unrelated code.
- Reuse existing code.
- Follow the existing architecture.
- Write production-quality code.
- Keep the project buildable.

Before stopping:
1. Verify every requirement is implemented.
2. Run the app and the seed script.
3. Fix all compile/runtime/API/storage errors.
4. git add -A && git commit -m "reports: creation form + seed data" && git push origin main

Do NOT explain your reasoning. Do NOT generate long summaries.
When finished, respond ONLY with: READY FOR GIT
If something cannot be completed, explain ONLY the blocking issue in one sentence.
```

### Task 4 — Map + report detail
```
You are a Senior Staff Software Engineer.
Read AGENTS.md before starting.

TASK:
Build the map page: Leaflet + OpenStreetMap tiles, pins from GET /api/reports.
Clicking a pin opens a popup linking to a report detail page showing all fields.

Rules:
- Do not modify unrelated code.
- Reuse existing code.
- Follow the existing architecture.
- Write production-quality code.
- Keep the project buildable.

Before stopping:
1. Verify every requirement is implemented.
2. Run the application, confirm pins render from seeded data.
3. Fix all compile/runtime/API errors.
4. git add -A && git commit -m "map: leaflet view + report detail page" && git push origin main

Do NOT explain your reasoning. Do NOT generate long summaries.
When finished, respond ONLY with: READY FOR GIT
If something cannot be completed, explain ONLY the blocking issue in one sentence.
```

### Task 5 — Authority dashboard + verification
```
You are a Senior Staff Software Engineer.
Read AGENTS.md before starting.

TASK:
Build /authority dashboard: table of reports filterable by department/status/category,
with a status-update control (received/verified/in_progress/resolved). Add confirm/
dispute buttons on the citizen report detail page updating confirm_count/dispute_count
via POST /api/reports/[id]/verify.

Rules:
- Do not modify unrelated code.
- Reuse existing code.
- Follow the existing architecture.
- Write production-quality code.
- Keep the project buildable.

Before stopping:
1. Verify every requirement is implemented.
2. Run the application, test filtering and status updates.
3. Fix all compile/runtime/API errors.
4. git add -A && git commit -m "authority: dashboard + community verification" && git push origin main

Do NOT explain your reasoning. Do NOT generate long summaries.
When finished, respond ONLY with: READY FOR GIT
If something cannot be completed, explain ONLY the blocking issue in one sentence.
```

### Task 6 — AI classification pipeline (highest priority feature)
```
You are a Senior Staff Software Engineer.
Read AGENTS.md and docs/ARCHITECTURE.md section 7.1 before starting.

TASK:
On report creation, call the Gemini API using the exact prompt contract in
docs/ARCHITECTURE.md section 7.1. Store severity, category, target_department,
ai_summary_en, ai_summary_bn, ai_is_valid on the report row. Show a "🤖 AI-verified"
badge on report cards and detail pages with category/severity/department. Add a 5s
timeout with a rule-based fallback classifier if the API call fails or times out.

Rules:
- Do not modify unrelated code.
- Reuse existing code.
- Follow the existing architecture.
- Write production-quality code.
- Keep the project buildable.

Before stopping:
1. Verify every requirement is implemented.
2. Run the app, submit a test report, confirm the badge appears.
3. Fix all compile/runtime/API errors, including Gemini call failures.
4. git add -A && git commit -m "ai: classification + routing pipeline" && git push origin main

Do NOT explain your reasoning. Do NOT generate long summaries.
When finished, respond ONLY with: READY FOR GIT
If something cannot be completed, explain ONLY the blocking issue in one sentence.
```

### Task 7 — SOS + Realtime
```
You are a Senior Staff Software Engineer.
Read AGENTS.md before starting.

TASK:
Add an SOS button on the citizen view that captures current location and inserts a
row into sos_alerts. Add a Supabase Realtime subscription on the authority dashboard
showing a live pulsing marker when a new sos_alerts row appears. Add a tel:999 button
next to SOS as a fallback.

Rules:
- Do not modify unrelated code.
- Reuse existing code.
- Follow the existing architecture.
- Write production-quality code.
- Keep the project buildable.

Before stopping:
1. Verify every requirement is implemented.
2. Run the app, trigger SOS, confirm the realtime ping appears on the dashboard.
3. Fix all compile/runtime/realtime errors.
4. git add -A && git commit -m "sos: button + realtime alert + 999 fallback" && git push origin main

Do NOT explain your reasoning. Do NOT generate long summaries.
When finished, respond ONLY with: READY FOR GIT
If something cannot be completed, explain ONLY the blocking issue in one sentence.
```

### Task 8 — AI risk heatmap
```
You are a Senior Staff Software Engineer.
Read AGENTS.md and docs/ARCHITECTURE.md section 7.2 before starting.

TASK:
Implement the grid-based risk score aggregation described in docs/ARCHITECTURE.md
section 7.2 as GET /api/hotspots (deterministic formula, no live LLM call). Render
results as color-coded circle overlays on the map (green/amber/red by risk_score).

Rules:
- Do not modify unrelated code.
- Reuse existing code.
- Follow the existing architecture.
- Write production-quality code.
- Keep the project buildable.

Before stopping:
1. Verify every requirement is implemented.
2. Run the app, confirm heatmap renders over seeded data.
3. Fix all compile/runtime/API errors.
4. git add -A && git commit -m "ai: risk heatmap overlay" && git push origin main

Do NOT explain your reasoning. Do NOT generate long summaries.
When finished, respond ONLY with: READY FOR GIT
If something cannot be completed, explain ONLY the blocking issue in one sentence.
```

### Task 9 — AI authority summary
```
You are a Senior Staff Software Engineer.
Read AGENTS.md and docs/ARCHITECTURE.md section 7.3 before starting.

TASK:
Add a "Generate Briefing" button on the authority dashboard that sends the currently
filtered reports to Gemini and displays the returned summary + prioritized action
list per docs/ARCHITECTURE.md section 7.3.

Rules:
- Do not modify unrelated code.
- Reuse existing code.
- Follow the existing architecture.
- Write production-quality code.
- Keep the project buildable.

Before stopping:
1. Verify every requirement is implemented.
2. Run the app, confirm the briefing generates correctly.
3. Fix all compile/runtime/API errors.
4. git add -A && git commit -m "ai: authority briefing summary" && git push origin main

Do NOT explain your reasoning. Do NOT generate long summaries.
When finished, respond ONLY with: READY FOR GIT
If something cannot be completed, explain ONLY the blocking issue in one sentence.
```

### Task 10 — Polish + production build check
```
You are a Senior Staff Software Engineer.
Read AGENTS.md before starting.

TASK:
Add loading and error states to every async action across the app. Do a mobile
responsive pass on all pages. Confirm the Bangla/English toggle covers all UI added
in tasks 1-9. Confirm `npm run build` succeeds with no warnings that break runtime.

Rules:
- Do not modify unrelated code.
- Reuse existing code.
- Follow the existing architecture.
- Write production-quality code.
- Keep the project buildable.

Before stopping:
1. Verify every requirement is implemented.
2. Run the application end to end on mobile viewport.
3. Fix all compile/runtime/build errors.
4. git add -A && git commit -m "polish: loading states, responsive, i18n coverage" && git push origin main

Do NOT explain your reasoning. Do NOT generate long summaries.
When finished, respond ONLY with: READY FOR GIT
If something cannot be completed, explain ONLY the blocking issue in one sentence.
```

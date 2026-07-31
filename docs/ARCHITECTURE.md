# NIRAPOD — Citizen Safety Platform
### Architecture, AI Pipeline & Build Plan for IIEC Innovation Competition 2026 (Problem 2)

*Written as a Principal Architect handoff document — everything you need before you write a single line of code, plus a ready-to-paste prompt for Antigravity.*

---

## 0. Definition of Done (don't forget these — they're graded)

- [ ] Working prototype: hotspot map + hazard reporting flow + SOS feature, all functional
- [ ] Short technical write-up: architecture, data flow, how reports reach authorities
- [ ] 3–8 min demo video / live walkthrough
- [ ] Backup demo video recorded **before** you leave the venue, in case live wifi/API dies mid-pitch

Teams lose points not because the code was bad, but because they forgot the write-up or ran out of time to record backup video. Build these into your hour-by-hour plan, not as an afterthought.

---

## 1. The Concept

**Name:** Nirapod (নিরাপদ — "Safe" in Bangla)
**Tagline:** *"Know the risk before you take the step."*

Why a Bangla name and Bangla-first UI matter: this is being judged in Dhaka, by Bangladeshi judges, about a Bangladeshi problem. A bilingual (Bangla/English toggle) UI costs you almost nothing to build — static JSON dictionaries — and is a disproportionately large "judge friendliness" and "emotional impact" win. Do this early; don't let it fall off as a stretch goal.

**One-liner for judges:** *Nirapod turns scattered citizen reports of crime and infrastructure hazards into a live, AI-verified risk map — routing every report to the right authority in seconds, and giving Dhaka's commuters a way to see danger before they walk into it.*

---

## 2. Strategic Positioning (why this beats a literal reading of the brief)

The brief asks for 8 features. In 7–8 hours with a 1–3 person team, building all 8 shallowly loses to building 4–5 deeply, because:

1. **Judging priority #1 is AI integration.** A visible, reliable AI feature beats three flaky ones. Pick the AI features that are (a) highly visible in the UI, (b) deterministic enough not to break live, (c) fast (<3s) so the demo doesn't stall.
2. **"They do not reward the biggest codebase"** (your own guide, section 6). Resist scope creep — see section 9 ("what NOT to build") below.
3. **Localize hard.** Bangla UI, real Dhaka neighborhoods in your seed data, and the real national emergency number (**999** — Bangladesh's toll-free police/fire/ambulance hotline) as a one-tap fallback on your SOS button. These are cheap, authentic, and judges notice them immediately.

---

## 3. Final Tech Stack (deviates from the guide's suggestion — reasoning below)

| Layer | Choice | Why |
|---|---|---|
| Frontend + Backend | **Next.js 15 (App Router) + TypeScript**, single repo | One deployable app, no separate FastAPI service to stand up/host under time pressure. Route Handlers / Server Actions do all your "backend" work. |
| UI | Tailwind CSS + shadcn/ui | Fast to build polished, consistent UI without custom CSS work. |
| Map | **Leaflet.js + free OpenStreetMap tiles** | Zero API key setup, zero billing risk mid-demo, huge amount of copy-paste-able examples for a time crunch. (Upgrade to MapLibre GL only if you have spare time — not before core features work.) |
| Database | **Supabase Postgres + PostGIS** | Free hosted Postgres with geospatial queries (`ST_DWithin`, clustering) out of the box. Saves you from standing up your own DB server. |
| Auth | **Supabase Auth** (email/password or magic link) | Don't build custom auth — "perfect authentication" is explicitly on the guide's "what NOT to build" list. |
| Storage | **Supabase Storage** | Hazard photo uploads, one line of SDK code. |
| Realtime | **Supabase Realtime** | Postgres change subscriptions — powers the live SOS ping on the authority dashboard with almost no custom websocket code. |
| AI | **Google Gemini API** (multimodal — vision + text) | Since you're building in Antigravity (Google's agentic IDE), staying in the Gemini ecosystem keeps your API key story and docs consistent. Used for hazard classification, routing, summarization, duplicate checks. |
| Deploy | **Vercel** | Push-to-deploy, no DevOps overhead. Deploy on hour 1, not hour 7 — you want a live URL working the whole day, not a scramble at 5:45. |

**Why not the guide's FastAPI/Django + separate backend suggestion?** That's the right call for a multi-week project. For a solo/2-3 person team with 7–8 hours, every extra service (separate backend, separate deploy, separate auth system) is time you're not spending on the AI features that are actually weighted highest. Collapse the stack.

---

## 4. Roles (simplified from the brief's 5 actors)

The brief lists Citizen, Authority, Disaster Management, Police, Moderator. Building 5 separate login experiences in 8 hours is exactly the kind of "complex admin panel" the guide tells you to avoid. Collapse to **2 roles**, differentiated by a field:

- **Citizen** — reports hazards/crime, views the map, verifies others' reports, can trigger SOS
- **Authority** — one login type, with a `department` field (`city_corporation` | `disaster_management` | `police`) that filters their dashboard. This still visually demonstrates "routing to the right authority" without building three separate portals.

---

## 5. Database Schema (Supabase / Postgres + PostGIS)

```sql
-- Enable PostGIS once, in Supabase SQL editor
create extension if not exists postgis;

create table profiles (
  id uuid primary key references auth.users(id),
  full_name text,
  phone text,
  role text check (role in ('citizen','authority')) not null default 'citizen',
  department text check (department in ('city_corporation','disaster_management','police')),
  trust_score int default 100,
  created_at timestamptz default now()
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references profiles(id),
  report_type text check (report_type in ('crime','hazard')) not null,
  category text not null, -- robbery, snatching, manhole, road_damage, drain, fire_risk, other
  description text,
  photo_url text,
  lat double precision not null,
  lng double precision not null,
  location geography(Point,4326),
  severity text check (severity in ('low','medium','high')),      -- AI-generated
  ai_is_valid boolean default true,                                 -- AI spam/fake filter
  ai_summary_en text,
  ai_summary_bn text,
  target_department text check (target_department in ('city_corporation','disaster_management','police')),
  status text check (status in ('received','verified','in_progress','resolved','rejected')) default 'received',
  duplicate_of uuid references reports(id),
  confirm_count int default 0,
  dispute_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table verifications (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references reports(id),
  user_id uuid references profiles(id),
  vote_type text check (vote_type in ('confirm','dispute')),
  created_at timestamptz default now(),
  unique(report_id, user_id)
);

create table sos_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  lat double precision,
  lng double precision,
  status text check (status in ('active','acknowledged','resolved')) default 'active',
  created_at timestamptz default now(),
  resolved_at timestamptz
);

-- Trigger to auto-populate the geography column from lat/lng
create or replace function set_location() returns trigger as $$
begin
  new.location := ST_SetSRID(ST_MakePoint(new.lng, new.lat), 4326);
  return new;
end;
$$ language plpgsql;

create trigger reports_set_location before insert or update on reports
for each row execute function set_location();
```

---

## 6. API Surface (Next.js Route Handlers)

| Endpoint | Purpose |
|---|---|
| `POST /api/reports` | Create report → uploads photo → runs AI classification pipeline → saves |
| `GET /api/reports?bbox=&type=&status=&department=` | List/filter reports for map + dashboard |
| `GET /api/reports/[id]` | Report detail |
| `PATCH /api/reports/[id]` | Authority updates status |
| `POST /api/reports/[id]/verify` | Citizen confirm/dispute |
| `POST /api/sos` | Trigger SOS → insert row → Realtime broadcasts to authority dashboard |
| `PATCH /api/sos/[id]` | Authority acknowledges/resolves SOS |
| `GET /api/hotspots` | Grid-aggregated risk scores for heatmap layer |
| `POST /api/authority/summary` | Batch AI summary of filtered reports for a department |

Auth itself needs no custom endpoints — call the Supabase client SDK directly from the frontend.

---

## 7. The AI Pipeline (this is what wins the hackathon — build this deeply, not broadly)

Build exactly these three AI features well. Everything else is P2/stretch (section 8).

### 7.1 AI Hazard Classification & Auto-Routing (P0 — the headline feature)

On every report submission, send the photo + description to Gemini's multimodal endpoint with a strict JSON-only response contract:

```
You are a public-safety triage assistant for a civic-reporting app in Dhaka, Bangladesh.
You are given a photo and a citizen's text description of a hazard or crime location.
Return ONLY valid JSON, no markdown, in this exact schema:
{
  "is_valid_report": boolean,
  "category": "robbery" | "snatching" | "manhole" | "road_damage" | "drain" | "fire_risk" | "other",
  "severity": "low" | "medium" | "high",
  "target_department": "city_corporation" | "disaster_management" | "police",
  "summary_en": string (<= 25 words),
  "summary_bn": string (<= 25 words, in Bangla)
}
Routing rules: manholes/road damage/drains -> city_corporation, unless severity is
high with immediate injury risk -> disaster_management. Robbery/snatching/crime -> police.
If the photo does not clearly show a real hazard (blurry, unrelated, meme, duplicate
stock image), set is_valid_report to false.
```

Surface the AI's decision **visibly** in the UI as a badge on every report card:
`🤖 AI-verified · Road Hazard · High severity · Routed to City Corporation`

This single visible badge is your strongest, cheapest proof of "AI Integration" to a judge glancing at your screen — make it unmissable, not buried in a log.

### 7.2 AI Risk Heatmap (P1)

Don't make this a raw LLM call per request — that's slow and non-deterministic. Instead:

1. Aggregate reports into ~150m grid cells (round lat/lng, or use `ST_ClusterDBSCAN`)
2. Compute `risk_score = Σ weight(category) × severity_multiplier × e^(-days_since/30)` per cell — crime-type reports weighted higher than infrastructure ones, since this is a personal-safety-first product
3. Render as color-coded circles on the Leaflet map (green → amber → red)
4. Optional AI touch: one Gemini text call per top-5 cell generates a hover caption, e.g. *"5 snatching reports here in the last 2 weeks, mostly after 8pm"* — cheap, fast, and reads as intelligent without being a live-demo risk

### 7.3 AI Authority Summarization (P1)

A "Generate Briefing" button on the authority dashboard batches the currently filtered reports and asks Gemini for a short paragraph + prioritized action list — this single feature signals "enterprise thinking" to judges far more than another CRUD screen would.

### 7.4 Duplicate/Fake Report Detection (P2 — only if time remains)

Geo-proximity (within ~150m) + same category + within 14 days → one Gemini text call: *"Do these two descriptions refer to the same incident? Answer yes or no."* If yes, increment `confirm_count` on the existing report instead of creating a new one.

### 7.5 Safe Route Advisory (P2 — stretch, keep it simple)

Full route-avoidance routing (OSRM with a custom cost function) is a multi-hour rabbit hole — don't build it live. Instead: fetch hotspots within a corridor of the straight-line route and generate one narrative sentence, e.g. *"Avoid Mirpur Road near X between 8–10pm — 5 incidents reported this month; consider Y instead."* Same wow-factor, a fraction of the engineering risk.

---

## 8. Feature Prioritization

**P0 — must work for any demo to make sense**
- Supabase auth (citizen/authority)
- Report creation: photo + GPS + description + category
- Map view with pins (Leaflet + OSM)
- Report detail view
- Authority dashboard: list/filter, update status
- AI classification & routing pipeline, visible badge
- Bangla/English toggle

**P1 — build if P0 is solid before ~2:30pm**
- SOS button + Supabase Realtime live ping to authority dashboard + `tel:999` quick-dial fallback
- Community verification (confirm/dispute)
- AI risk heatmap
- AI authority summarization

**P2 — only with time to spare**
- Duplicate detection & merge
- Safe route narrative advisory
- Notifications
- Trust score / gamification
- Resolution status timeline view

**Explicitly not building** (per the guide's own "what NOT to build" + hackathon judgment): separate logins per department, admin role management, production-grade auth (password reset flows, 2FA), microservices, perfect edge-case handling, real production deployment/infra.

---

## 9. Hour-by-Hour Roadmap (mapped to the actual event timeline)

| Time | Focus |
|---|---|
| 8:30–9:00 | Registration. Nothing technical — but this is when you should already have Supabase project, Gemini API key, and GitHub repo created (see pre-hackathon checklist below). |
| 9:00–9:45 | Antigravity Phase 0: scaffold Next.js repo, wire Supabase client, run schema SQL, deploy an empty shell to Vercel immediately so your pipeline is proven end-to-end on hour one, not hour seven. |
| 9:45–11:00 | Antigravity Phase 1: auth flow, report creation form (photo upload + GPS capture), map view rendering real pins, report detail page. Seed ~15–20 dummy reports across real Dhaka coordinates (Dhanmondi, Mirpur, Uttara, Gulshan, Mohammadpur, Farmgate) so the map looks alive from the start. |
| 11:00–11:30 | Buffer. Rehearse a 60-second "here's our working functional slice" for the Phase-1 evaluators — a populated map + working CRUD, even pre-AI, satisfies "full-stack functionality." |
| **11:30** | **Phase-1 evaluation** |
| 11:30–1:00 | Authority dashboard (list/filter/status update), community verification, Bangla/English toggle. |
| 1:00–2:30 | AI classification pipeline wired in end-to-end; visible AI badge in the UI. This is the single highest-leverage block of the day — protect this time slot. |
| 2:30–3:15 | SOS button + Realtime live ping + 999 quick-dial fallback. |
| 3:15–3:30 | Buffer. Rehearse for Phase-2 evaluators. |
| **3:30** | **Phase-2 evaluation** |
| 3:30–4:30 | AI risk heatmap. |
| 4:30–5:15 | AI authority summarization, polish, mobile responsiveness, loading/error states, seed final demo dataset. |
| 5:15–5:45 | Full run-through, record the required backup demo video, write the required short technical write-up. |
| 5:45–6:00 | Submission buffer. |
| after 6:00 | Live presentation |

---

## 10. Demo Script (60–90 seconds, since Live Presentation is explicitly graded)

1. **Hook (10s):** Open on the live heatmap over real Dhaka streets — *"Every day, thousands of Dhaka commuters walk into danger with zero warning — a missing manhole cover, a snatching hotspot nobody told them about."*
2. **Problem (10s):** One line grounding it in reality — reports rarely reach the right authority in an organized way, so hazards stay unfixed for months.
3. **Live flow (60s):**
   - Submit a hazard photo as a citizen → AI badge appears instantly, classified and routed
   - Cut to authority dashboard → the report has already arrived, correctly filtered by department
   - Hit SOS on the citizen device → watch it ping live on the authority screen
   - Pan to the heatmap → hover a red zone to show the AI-generated caption
4. **Impact close (10s):** Tie back to who it protects — commuters, women, children, the elderly — and the 999 integration as a bridge to Bangladesh's existing emergency infrastructure, not a replacement for it.
5. **Tech flex (one sentence):** *"Every report goes from photo to AI-classified, routed, and live on an authority's screen in under three seconds."*

---

## 11. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Geolocation permission denied in the demo room | Manual lat/lng fallback input; pre-test on the actual demo device beforehand |
| Gemini API latency or rate limit during the live demo | Add a 3–5s timeout with a rule-based fallback classification; pre-warm one request before you go on stage |
| Venue wifi dies mid-pitch | The required backup demo video isn't just a deliverable — it's your insurance policy. Record it as if the live demo might fail. |
| Map tiles rate-limited | Free OSM tiles via Leaflet avoid the billing-key failure mode entirely |

---

## 12. Pre-Hackathon Checklist (do this before 9:00 — it doesn't count against your clock)

- [ ] Create Supabase project, enable the PostGIS extension, save project URL + anon key + service role key
- [ ] Get a Gemini API key from Google AI Studio
- [ ] Install/update Antigravity, Node.js, and your package manager
- [ ] Create an empty GitHub repo
- [ ] Jot down 15–20 real Dhaka-area coordinates for seed data
- [ ] If team of 2–3: split roles now (e.g., one owns frontend/map, one owns backend/schema/AI pipeline, one owns demo data + pitch + write-up) so nobody is idle waiting on hour 1

---

## 13. The Antigravity Build Prompt

Paste this directly into Antigravity. It's written so the agent works in **phases and stops for your review between them** — this is deliberate: letting an agentic tool run the entire build unsupervised under time pressure is how hackathon teams end up debugging a half-broken 2,000-line diff at hour 6. Controlled increments are faster in aggregate than one giant autonomous run.

```
ROLE
You are a senior full-stack engineer building a hackathon prototype called
"Nirapod" — a citizen safety and hazard-reporting platform for Dhaka,
Bangladesh. You have 7-8 hours total. Prioritize working end-to-end slices
over completeness. Judging weights AI integration highest, then full-stack
functionality, then innovation, then UI/UX, then live presentation.

STACK (do not deviate without asking me)
- Next.js 15, App Router, TypeScript, Tailwind CSS, shadcn/ui
- Supabase (Postgres + PostGIS, Auth, Storage, Realtime)
- Leaflet.js with free OpenStreetMap tiles (no paid map API keys)
- Google Gemini API (multimodal) for AI features
- Deploy target: Vercel

ENV VARS I WILL PROVIDE
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GEMINI_API_KEY

DATABASE
Use exactly this schema (I will run it myself in the Supabase SQL editor —
just scaffold the TypeScript types and client queries to match it):

[paste the SQL from section 5 of the architecture doc here]

WORK IN PHASES. After each phase, stop, summarize what you built, list any
assumptions you made, and wait for my go-ahead before starting the next phase.

PHASE 0 — Scaffold
- Create the Next.js app with the stack above
- Wire up the Supabase client (browser + server)
- Add a minimal Bangla/English string dictionary and a language toggle
  component (start with just a handful of key strings — nav, buttons, headers)
- Deploy an empty shell to Vercel so we have a live URL from hour one

PHASE 1 — Core CRUD (P0)
- Supabase Auth: signup/login, with a `role` field (citizen | authority) and
  optional `department` field for authority accounts
- Report creation form: photo upload to Supabase Storage, GPS capture via
  the browser Geolocation API (with a manual lat/lng fallback input),
  description, category dropdown
- Map view (Leaflet + OSM) rendering report pins from the database
- Report detail page
- Authority dashboard: list/filter reports by department/status, update status
- Seed script or SQL to insert ~15-20 realistic demo reports across real
  Dhaka neighborhoods (Dhanmondi, Mirpur, Uttara, Gulshan, Mohammadpur,
  Farmgate) with varied categories and timestamps

PHASE 2 — AI Classification Pipeline (P0, highest priority feature)
- On report submission, call the Gemini API with the photo + description
  using this exact prompt contract, returning strict JSON:
  [paste the prompt from section 7.1 of the architecture doc here]
- Store the AI output on the report row (severity, category, target
  department, summaries, is_valid flag)
- Add a visible "🤖 AI-verified" badge component on report cards showing
  category, severity, and routed department
- Add a timeout + simple rule-based fallback classification in case the
  Gemini call fails or is slow, so a live demo never hard-stalls

PHASE 3 — SOS + Realtime (P1)
- SOS button on the citizen view: captures current location, inserts an
  `sos_alerts` row
- Supabase Realtime subscription on the authority dashboard that shows a
  live pulsing marker the instant a new SOS row is inserted
- A `tel:999` quick-dial button next to the SOS button as a real-world
  emergency-service fallback

PHASE 4 — AI Risk Heatmap + Authority Summary (P1)
- Grid-aggregate reports into ~150m cells, compute a risk score using
  recency decay and severity/category weighting (formula in section 7.2 of
  the architecture doc — do NOT make this a live LLM call, keep it
  deterministic and fast)
- Render as a color-coded circle overlay on the map
- "Generate Briefing" button on the authority dashboard that sends the
  currently filtered reports to Gemini for a short summary + prioritized
  action list

PHASE 5 — Polish
- Mobile responsiveness pass
- Loading and error states on every async action
- Final check of the Bangla/English toggle across all new UI added since
  Phase 0

DO NOT BUILD (out of scope for this hackathon, flag if I ask for these)
- Separate login portals per department
- Password reset / 2FA / production-grade auth flows
- Microservices or a separate backend service
- Duplicate detection, safe-route routing, notifications, or trust scores
  unless I explicitly ask after Phase 5 is done and we have time left
- Any paid map API — Leaflet + OSM only

At the end of every phase, also flag anything that's fragile enough to risk
breaking during a live demo, so I can decide whether to harden it or cut it.
```

---

### Final note

The single biggest lever in this document isn't a feature — it's discipline: build the AI classification badge deeply and visibly rather than spreading the same hours across all six AI opportunities in the brief shallowly. A judge remembers the moment they watched a photo turn into a routed, AI-labeled report in three seconds far more than a feature checklist.

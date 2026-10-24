# CampusCast — Implementation Phase Plan

Phased development roadmap, completed features, and verification status for CampusCast built with Firebase Cloud Functions (v2 Blaze Plan), Cloud Firestore NoSQL (`onSnapshot`), Next.js 14, and Cloudflare Pages.

---

## Phase 0 — Monorepo & Infrastructure Setup [COMPLETED]
- [x] Monorepo workspace structure setup (`packages/shared`, `functions`, `display`, `admin`).
- [x] Shared TypeScript domain models ([`packages/shared/src/types.ts`](file:///d:/Projects/CampusCast/packages/shared/src/types.ts)) and parser ([`packages/shared/src/parsing.ts`](file:///d:/Projects/CampusCast/packages/shared/src/parsing.ts)).
- [x] Strict Firebase security rules baseline ([`firestore.rules`](file:///d:/Projects/CampusCast/firestore.rules) with `allow write: if false;`).

---

## Phase 1 — Ingestion Webhook & Display Client [COMPLETED]
- [x] Ingestion Cloud Function `whatsappWebhook` with `X-Hub-Signature-256` HMAC SHA-256 validation.
- [x] Phone authorization lookup + silent drop policy for unauthorized senders.
- [x] Next.js 14 hallway display app ([`display/`](file:///d:/Projects/CampusCast/display)) configured for hardware kiosk deployment.
- [x] Live Firestore `onSnapshot` streaming listener and offline reconnecting indicator (`🟡 Reconnecting...`).
- [x] Automated browser subagent verification tests on `http://localhost:3000`.

---

## Phase 2 — Admin Command Center & Roster Control [COMPLETED]
- [x] Admin web app ([`admin/`](file:///d:/Projects/CampusCast/admin)) with Roster management (add/suspend faculty).
- [x] Display Screen registry and real-time heartbeat telemetry status (`screenHeartbeat`).
- [x] Searchable Notice History and force-expire controls.
- [x] Security & Audit event log UI.

---

## Phase 3 — Priority, Scheduler & Media Attachments [COMPLETED]
- [x] `#urgent` parsing → red alert notice styling with pulse glow animation (`#EF4444`).
- [x] `#schedule` parsing → scheduled status notices.
- [x] GCP Cloud Scheduler + 1-minute cron Cloud Function `scheduledNoticeManager`.
- [x] Image/PDF media attachment handling and inline card rendering.
- [x] Multi-department student notice feeds across ECE, CSE, AIML, MECH, CIVIL, EEE display routes.

---

## Phase 4 — Multi-Department Pilot & Hardware Rollout [COMPLETED]
- [x] Multi-department display routes (`/display?dept=ECE`, `/display?dept=CSE`, etc.).
- [x] Zero-Hardware Smart TV direct browser deployment configuration.
- [x] Single-command monorepo build scripts (`npm run build:display`, `npm run build:admin`, `npm run build`).
- [x] Hardware kiosk setup and operational runbooks ([`Docs/OPERATIONAL_RUNBOOKS.md`](file:///d:/Projects/CampusCast/Docs/OPERATIONAL_RUNBOOKS.md)).

---

## Phase 5 — Communication Operating System Redesign [COMPLETED]
- [x] Brand Kit implementation: **`Poppins`** typography & master color palette (`#111111`, `#2563EB`, `#60A5FA`, `#22C55E`, `#F3F4F6`, `#EF4444`).
- [x] Department scope branding themes (`ECE`: Orange, `CSE`: Blue, `AIML`: Purple, `MECH`: Red, `CIVIL`: Green, `EEE`: Amber).
- [x] 5 Display Modes: Mode 1 Hero View (80% screen + QR Code), Mode 2 News Ticker, Mode 3 Emergency Override (`#DC2626`), Mode 4 Event Carousel, Mode 5 Split Screen.
- [x] Admin Command Center: Sidebar Navigation, Dashboard metric cards, Live Screen Map, Kanban Notice Lifecycle (`Scheduled`, `Active`, `Expired`), 5-step Notice Wizard, Screen Wall grid, Analytics Module, and PIN Emergency Authorization (`9482`).
- [x] Vertical layout scrolling (`overflow-y: auto`, `min-height: 100vh;`) across all pages.

---

## Phase 6 — Advanced Management Pipeline & Presentation Readiness [COMPLETED]
- [x] In-Place Notice Editing Modal for Kanban and Table views (headline, body, department scope, category, media URLs, priority, status, event date/time).
- [x] Multi-Criteria Filtering Toolbar (4-dimensional filters: department scope, category, media attachment, real-time search with instant reset).
- [x] Real-time 20-second screen heartbeat telemetry engine maintaining active `Online` statuses.
- [x] Notice Lifecycle action controls (instant Activate, Expire, Delete, and Approve).
- [x] Production build validation (`npm run build`) and Firestore seed script (`npm run seed:notices`).
- [x] Comprehensive 27-slide PPT presentation draft ([`Docs/PRESENTATION_DRAFT.md`](file:///d:/Projects/CampusCast/Docs/PRESENTATION_DRAFT.md)).

---

## Phase 7 — Enterprise Security Hardening & WhatsApp Editing [COMPLETED]
- [x] Cryptographic Webhook Signatures: HMAC-SHA1 (`X-Twilio-Signature`) and HMAC-SHA256 (`X-Hub-Signature-256`) with constant-time buffer comparison.
- [x] Cloud Firestore Security Rules: Immutable append-only `audit_log` (`allow update, delete: if false;`) and strict schema write validation.
- [x] XSS Neutralization: URI sanitization with `getSafeUrl()` protecting Smart TV displays from `javascript:` attacks.
- [x] PII Privacy Protection: Phone masking (`maskPhoneNumber()`) across logs and admin interfaces.
- [x] In-Place WhatsApp Notice Editing: Edit headline, faculty author attribution (`authorName`), media attachments, category, and scope for WhatsApp hotline submissions.
- [x] Persistent System Settings: Browser `localStorage` persistence (`campuscast_settings`), cross-tab `BroadcastChannel` synchronization, and "Reset to Defaults" restoration.

---

## Phase 7 — Production Deployment & Cloud Infrastructure [COMPLETED]
- [x] Vercel Edge Deployment: Display Kiosk ([`https://campus-cast-display.vercel.app`](https://campus-cast-display.vercel.app)) live with responsive corridor browser layouts.
- [x] Vercel Edge Deployment: Admin Command Center ([`https://campus-cast-admin.vercel.app`](https://campus-cast-admin.vercel.app)) live with 8 operational modules.
- [x] Monorepo Shared Package Optimization: Configured `@campuscast/shared` direct TypeScript source exports and Next.js SWC transpilation for zero-config CI/CD builds.
- [x] Cloud Security Baseline: Deployed and verified production `firestore.rules` on `campuscast-mitece` enforcing serverless-only database writes.
- [x] Hardware Runbook Validation: Verified live corridor display routes (`/display/ece`, `/display/cse`, `/display/aiml`, etc.) and all-campus telemetry.

---

## Phase 8 — Zero-Cost Serverless Ingestion & Twilio Sandbox Pipeline [IN PROGRESS]
- [ ] Vercel Serverless Webhook Handler: Implement `admin/src/app/api/webhook/twilio/route.ts` with phone auth, tag parsing, and Firestore write integration.
- [ ] Vercel Automated Lifecycle Scheduler: Implement `admin/src/app/api/scheduler/route.ts` and configure `admin/vercel.json` 60-second cron job.
- [ ] Twilio WhatsApp Sandbox Gateway: Configure public Twilio sandbox endpoint to forward inbound mobile notices to the Vercel handler.
- [ ] Live Mobile-to-TV Verification: Perform end-to-end publish test from mobile phone WhatsApp to physical display screen with automated confirmation reply.

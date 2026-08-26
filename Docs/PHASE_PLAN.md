# CampusCast — Implementation Phase Plan

Phased development roadmap for building CampusCast with Firebase Cloud Functions (v2 Blaze Plan), Cloud Firestore NoSQL (`onSnapshot`), and Cloudflare Pages.

---

## Phase 0 — Monorepo & Infrastructure Setup [COMPLETED]
- [x] Workspace monorepo setup (`packages/shared`, `functions`, `apps/display`, `apps/admin`).
- [x] Shared TypeScript domain models (`types.ts`) and parser implementation (`parsing.ts`).
- [x] Strict Firebase security rules (`firestore.rules` with `allow write: if false;`).

## Phase 1 — Ingestion Webhook & Display Client [COMPLETED]
- [x] Ingestion Cloud Function `whatsappWebhook` with `X-Hub-Signature-256` HMAC validation.
- [x] Phone authorization lookup + silent drop for unauthorized senders.
- [x] Next.js 14 hallway display app (`apps/display`) configured for Cloudflare Pages deployment.
- [x] Live Firestore `onSnapshot` listener and offline reconnecting indicator (`🟡 Reconnecting...`).
- [x] Live browser subagent verification test on `http://localhost:3000`.

## Phase 2 — Admin Portal & Roster Control [COMPLETED]
- [x] Admin web app (`apps/admin`) with Roster management (add/suspend faculty).
- [x] Display Screen registry and real-time heartbeat telemetry status (`screenHeartbeat`).
- [x] Searchable Notice History and force-expire controls.
- [x] Security & Audit event log UI.

## Phase 3 — Priority, Scheduler & Media Attachments [COMPLETED]
- [x] `#urgent` parsing → red alert notice styling with glow animation (`#E5484D`).
- [x] `#schedule` parsing → scheduled status notices.
- [x] GCP Cloud Scheduler + 1-minute cron Cloud Function `scheduledNoticeManager`.
- [x] Image/PDF media attachment handling and inline card rendering.
- [x] Student-focused notice feeds across ECE, CSE, MECH display routes.

## Phase 4 — Multi-Department Pilot & Cloudflare Pages Rollout [IN PROGRESS]
- [x] Multi-department display routes (`ECE`, `CSE`, `MECH`, `CIVIL`, `EEE`).
- [x] Production build deployment configuration for Cloudflare Pages.
- [ ] End-to-end live testing with real WhatsApp Business production credentials.
- [ ] Hallway hardware display kiosk deployment.

## Phase 5 — System Hardening & Maintenance
- [ ] Inbound Webhook rate limiting per sender.
- [ ] Operational runbooks and telemetry monitoring.

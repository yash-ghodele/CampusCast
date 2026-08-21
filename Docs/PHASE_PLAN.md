# CampusCast — Implementation Phase Plan

Phased development roadmap prioritizing a working end-to-end publishing loop (WhatsApp → Function → Firestore → Display) before feature expansion.

---

## Phase 0 — Monorepo & Infrastructure Setup [COMPLETED]
- [x] Repository monorepo setup (`packages/shared`, `functions`, `apps/display`, `apps/admin`).
- [x] Shared TypeScript domain models and parser implementation.
- [x] Deploy strict `firestore.rules` (zero client writes) and `storage.rules`.
- [x] Firebase emulator configuration (`firebase.json`).

## Phase 1 — Ingestion Webhook & Display Client [COMPLETED]
- [x] Ingestion function `whatsappWebhook` with `X-Hub-Signature-256` HMAC validation.
- [x] Phone authorization lookup + silent drop for unauthorized senders.
- [x] WhatsApp confirmation reply dispatch.
- [x] Next.js 14 hallway display app (`apps/display`) with dark theme (`#0B1220` background).
- [x] Live Firestore `onSnapshot` listener and offline reconnect indicator.
- [x] Live browser subagent verification test on `http://localhost:3000`.

## Phase 2 — Admin Portal & Roster Control [COMPLETED]
- [x] Admin web app (`apps/admin`) with Roster management (add/suspend faculty).
- [x] Display Screen registry and real-time heartbeat telemetry status.
- [x] Searchable Notice History and force-expire controls.
- [x] Security & Audit event log UI.

## Phase 3 — Priority, Scheduler & Media Attachments [COMPLETED]
- [x] `#urgent` parsing → red alert notice styling with glow animation.
- [x] `#schedule` parsing → scheduled status notices.
- [x] Cron Cloud Function `scheduledNoticeManager` running every minute.
- [x] Image/PDF media attachment handling and inline card rendering.
- [x] Student-focused notice feeds across ECE, CSE, MECH display routes.

## Phase 4 — Multi-Department Pilot Rollout [IN PROGRESS]
- [x] Multi-department display routes (`ECE`, `CSE`, `MECH`, `CIVIL`, `EEE`).
- [ ] End-to-end live testing with real WhatsApp Business sandbox number.
- [ ] Hallway hardware display kiosk deployment.

## Phase 5 — System Hardening & Maintenance
- [ ] Rate limiting on inbound webhook.
- [ ] Operational runbooks and monitoring.

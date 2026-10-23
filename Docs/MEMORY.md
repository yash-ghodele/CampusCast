# CampusCast — Project Memory & Architectural Decision Log

This document preserves key architectural decisions, design rationales, and historic milestones for CampusCast.

---

## 1. Core Architecture Summary

- **Messaging**: Meta WhatsApp Business Cloud API.
- **Backend Compute**: Firebase Cloud Functions (v2 Node.js / TypeScript) on the **Firebase Blaze Plan** (pay-as-you-go, unlocking outbound HTTPS to Meta Graph API).
- **Database**: Cloud Firestore (NoSQL) with real-time `onSnapshot` streaming listeners.
- **Frontend Hosting**: Cloudflare Pages (unlimited free bandwidth for Next.js display and admin apps).
- **Workspace Layout**: Monorepo layout with top-level [`display/`](file:///d:/Projects/CampusCast/display) (Kiosk Display) and [`admin/`](file:///d:/Projects/CampusCast/admin) (Admin Command Center).
- **Hardware Model**: **Zero External Hardware**. Any Smart TV (Android TV, webOS, Tizen OS, Fire TV) opens display URLs directly in its built-in browser.
- **Security Policy**: Enforces zero client-side writes in [`firestore.rules`](file:///d:/Projects/CampusCast/firestore.rules) (`allow write: if false;`).

---

## 2. Decision Log (Architectural Decision Records)

| Date | Decision | Rationale |
|---|---|---|
| **2026-08-21** | Selected Firebase Cloud Functions + Firestore NoSQL | Cost efficiency + simplicity for low, bursty campus notice traffic. |
| **2026-08-22** | Verified live display client via automated browser tests at `http://localhost:3000` | Confirmed multi-department notice rendering, clock tick, and reconnect status indicators. |
| **2026-08-26** | Confirmed Firebase Blaze Plan + Cloudflare Pages architecture | Blaze Plan unlocks Meta Graph API replies; Cloudflare Pages provides unlimited edge frontend bandwidth. |
| **2026-08-26** | Adopted Zero-Hardware Smart TV Direct Browser Model | Eliminates Raspberry Pi / Mini-PC hardware costs, Linux OS scripts, and HDMI power bricks. |
| **2026-09-27** | Refactored Workspace Directory Layout (`display/` & `admin/`) | Promoted `apps/display` and `apps/admin` to top-level project directories to simplify workspace scripts. |
| **2026-09-27** | Configured Layout Accessibility & Vertical Overflow Scrolling | Enabled `min-height: 100vh;` and `overflow-y: auto` across all views to ensure smooth scrolling when content exceeds viewport height. |
| **2026-09-27** | Connected Live Firebase Project (`campuscast-mitece`) | Provisioned `.firebaserc`, populated `display/.env.local`, and linked Firebase Firestore `onSnapshot` client SDK. |
| **2026-09-27** | Completed E2E System Testing & Generated Audit Report | Validated Notice Wizard, Emergency Override, Audit Trail, and Dual-Sync (Firestore + BroadcastChannel) across Admin and Display apps. |
| **2026-09-27** | Converted Admin Tabs to 8 Standalone App Router Pages | Created dedicated Next.js App Router routes (`/`, `/notices`, `/displays`, `/departments`, `/users`, `/analytics`, `/audit`, `/settings`) to eliminate tab state reset on refresh. |
| **2026-09-27** | Implemented Cloud Firestore Cross-Port & TV Telemetry | Bridged Admin (`:3001`) and TV Displays (`:3000`) via Firestore `onSnapshot` listeners and 30-second screen heartbeat telemetry with `HH:MM:SS` uptime formatting. |
| **2026-09-27** | Resolved Notice Scope (`ALL`) & Stale Cache Issues | Upgraded Firestore queries to `where('departmentId', 'in', [deptCode, 'ALL'])` and added real-time expiration filtering to auto-clear deleted/expired notices. |
| **2026-09-27** | Added Media Fallbacks & Brand Kit v2 404 Pages | Integrated image `onError` full-typography fallbacks in `NoticeCard.tsx` and custom light-theme `not-found.tsx` with `/logo-transparent.png`. |
| **2026-09-27** | Completed Comprehensive Production Readiness Audit | Verified 0 build errors across all 4 monorepo packages, updated `firestore.rules`, and prepared pre-flight hardware runbooks. |
| **2026-10-04** | Implemented In-Place Notice Editing Modal | Built comprehensive in-place edit modal for Kanban and Table views with Firestore sync and audit logging. |
| **2026-10-04** | Added Multi-Criteria Notice Filtering Toolbar | Added 4-dimensional filter engine (scope, category, media type, live search, reset) with view persistence. |
| **2026-10-04** | Upgraded Screen Heartbeat Telemetry Engine | Upgraded to 20s continuous telemetry maintaining active `🟢 Online` status across all hallway displays. |
| **2026-10-04** | Generated Presentation Draft & Synced All Documentation | Created 27-slide standalone presentation draft ([`Docs/PRESENTATION_DRAFT.md`](file:///d:/Projects/CampusCast/Docs/PRESENTATION_DRAFT.md)) and synchronized architecture, user guide, and phase plan docs. |
| **2026-10-05** | Configured Shared Package Direct TypeScript Source Exports | Updated `packages/shared/package.json` entry points to `./src/index.ts` to allow Next.js SWC `transpilePackages` to transpile shared models in memory on Vercel edge builds without pre-compiled `dist/`. |
| **2026-10-05** | Deployed Firestore Security Rules to Production | Released `firestore.rules` (deny-all client write policy) to live Firebase project `campuscast-mitece`. |
| **2026-10-05** | Completed Production Deployment on Vercel | Successfully deployed both `campuscast-display` ([`https://campus-cast-display.vercel.app`](https://campus-cast-display.vercel.app)) and `campuscast-admin` ([`https://campus-cast-admin.vercel.app`](https://campus-cast-admin.vercel.app)) with live Firestore connectivity. |
| **2026-10-24** | Adopted Vercel Serverless Route Handlers & Twilio Sandbox Pipeline | Formulated zero-cost backend architecture moving webhook ingestion and 60s lifecycle cron from Firebase Blaze to Vercel Route Handlers (`/api/webhook/twilio`, `/api/scheduler`) and Twilio WhatsApp Sandbox for academic evaluation testing. |



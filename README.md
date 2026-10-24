# CampusCast — WhatsApp-Driven Campus Communication Operating System

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Blaze_Plan-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Meta WhatsApp API](https://img.shields.io/badge/Meta-WhatsApp_Cloud_API-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://developers.facebook.com/docs/whatsapp/cloud-api)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://pages.cloudflare.com/)
[![GitHub Repository](https://img.shields.io/badge/GitHub-yash--ghodele%2FCampusCast-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/yash-ghodele/CampusCast.git)

> **YOUR CAMPUS. YOUR VOICE.**  
> *The campus-wide communication operating system that updates physical hallway screens the moment an authorized faculty member hits send on WhatsApp.*

CampusCast bridges the gap between everyday messaging tools and physical campus signage. Instead of forcing faculty to navigate complex web admin portals, CampusCast turns **WhatsApp** into an authenticated publishing interface, supported by a modern **Campus Communication Command Center** and high-impact **Smart TV Display Modes**.

---

## 🚀 Live Production Deployments

| Component | Production URL | Description |
|---|---|---|
| **Smart TV Display Kiosk** | [https://campus-cast-display.vercel.app/](https://campus-cast-display.vercel.app/) | Live Hallway Kiosk & Department Corridor Displays |
| **Admin Command Center** | [https://campus-cast-admin.vercel.app/](https://campus-cast-admin.vercel.app/) | 8-Module Administrative Console & Screen Wall |
| **ECE Corridor Display** | [`/display/ece`](https://campus-cast-display.vercel.app/display/ece) | Electronics & Communication corridor kiosk |
| **CSE Corridor Display** | [`/display/cse`](https://campus-cast-display.vercel.app/display/cse) | Computer Science corridor kiosk |
| **AIML Corridor Display** | [`/display/aiml`](https://campus-cast-display.vercel.app/display/aiml) | AI & Machine Learning corridor kiosk |
| **All-Screens Matrix** | [`/display/all`](https://campus-cast-display.vercel.app/display/all) | 6-department live status grid & telemetry |

---

## 📺 Zero-Hardware Smart TV Model & Display Modes

No Raspberry Pi, Mini-PC, HDMI dongles, or external media player boxes are required! Any Smart TV (Android TV, LG webOS, Samsung Tizen OS, Amazon Fire TV) opens the display URL (`https://campus-cast-display.vercel.app/display/ece` or local `http://<server-ip>:3000/display/ece`) directly in its native web browser.

### 6 Display Experience Modes:
1. **Adaptive Smart Multi-Media View (Default View)**: Automatically arranges notices into high-impact visual spotlight posters (7-column visual media), official circular cards (with instant QR code links for PDFs), and typographic bulletin feeds.
2. **Mode 1: Hero Notice View**: 80% screen footprint hero card with title, description, category badges (`EXAM`, `PLACEMENT`, `EVENT`, `URGENT`, `ACHIEVEMENT`), date/time chips (`📅 05 Oct 2026`, `⏰ 10:00 AM`), and interactive WhatsApp QR code snippet (`Scan QR for details`). Auto-rotates every 10 seconds.
3. **Mode 2: News Ticker Marquee**: Always-visible 48px bottom scrolling ticker bar for secondary announcements and live notice counters.
4. **Mode 3: Emergency Override View**: High-contrast full-screen red background (`#DC2626`) for `priority == 'urgent'`, displaying bold emergency headlines and issuer signatures.
5. **Mode 4: Event Carousel View**: Auto-sliding poster images and PDF previews (`mediaUrl` / `mediaType`).
6. **Mode 5: All Screens Matrix View (`/display/all`)**: 6-tile grid overview rendering real-time notice feeds across all campus departments (`ECE`, `CSE`, `AIML`, `MECH`, `CIVIL`, `EEE`).

---

## 🎨 Department Branding Themes

| Department | Theme Color | Primary Hex | Badge Preview |
|---|---|---|---|
| **ECE** | Vibrant Orange | `#F97316` | Orange Badge |
| **CSE** | Royal Blue | `#2563EB` | Blue Badge |
| **AIML** | Deep Purple | `#8B5CF6` | Purple Badge |
| **MECH** | Crimson Red | `#EF4444` | Red Badge |
| **CIVIL** | Emerald Green | `#22C55E` | Green Badge |
| **EEE** | Caution Amber | `#F59E0B` | Amber Badge |

---

## 💻 Admin Communication Command Center ([`admin/`](file:///d:/Projects/CampusCast/admin))

The Admin Portal is architected using **8 dedicated standalone Next.js App Router pages** (zero in-memory tab state resets on browser refresh):
- **Dashboard ([`/`](file:///d:/Projects/CampusCast/admin/src/app/page.tsx))**: Metric Overview Cards, Live Screen Map Grid (`Online 6/6` with `HH:MM:SS` active uptime via Firestore heartbeats), Recent Activity Stream.
- **Notice Management ([`/notices`](file:///d:/Projects/CampusCast/admin/src/app/notices/page.tsx))**: Visual notice lifecycle Kanban columns (`Scheduled`, `Active`, `Expired`), **In-Place Notice Editing Modal** (with full support for editing WhatsApp hotline notices, author attribution, and attachments), **Multi-Criteria Filter Toolbar** (Department scopes, category pills, media filters, `📱 WhatsApp Submissions` filter, and realtime search), and Notice Creation Wizard.
- **Display Control & Screen Wall ([`/displays`](file:///d:/Projects/CampusCast/admin/src/app/displays/page.tsx))**: Real-time Smart TV telemetry monitoring (`1080p`, `lastSeenAt`), live screen status, and PIN-protected Force Emergency Broadcasts (Master PIN: `9482`, configurable in Settings).
- **Department Scope Registry ([`/departments`](file:///d:/Projects/CampusCast/admin/src/app/departments/page.tsx))**: Visual theme registry, active notice counters, and direct TV kiosk launcher links.
- **Faculty Roster ([`/users`](file:///d:/Projects/CampusCast/admin/src/app/users/page.tsx))**: Faculty onboarding, WhatsApp phone authorization, role badges (`Super Admin` -> `HOD` -> `Faculty`), and status toggles.
- **Analytics & Engagement ([`/analytics`](file:///d:/Projects/CampusCast/admin/src/app/analytics/page.tsx))**: Category breakdowns, department notice distribution, and top faculty contributor rankings.
- **Security Audit Center ([`/audit`](file:///d:/Projects/CampusCast/admin/src/app/audit/page.tsx))**: Searchable compliance ledger of publishes, edits, deletions, unauthorized attempts, and emergency overrides.
- **System Settings ([`/settings`](file:///d:/Projects/CampusCast/admin/src/app/settings/page.tsx))**: Persistent configuration (`localStorage` + `BroadcastChannel`), Master Emergency PIN management (`9482`), screen offline timeout thresholds, rotation delays, and **Reset to Defaults** restoration.

---

## 🛡️ Enterprise-Grade Security Hardening (20-Point Remediated)

CampusCast is engineered to university and enterprise security compliance standards:
- **HMAC Webhook Cryptographic Verification**: Inbound WhatsApp webhooks are validated using HMAC-SHA1 (`X-Twilio-Signature`) and HMAC-SHA256 (`X-Hub-Signature-256`) with constant-time buffer comparison to prevent timing attacks.
- **Append-Only Immutable Audit Log**: Cloud Firestore security rules strictly prohibit client updates or deletions (`allow update, delete: if false;`) on the `audit_log` collection.
- **Strict URI XSS Sanitization**: All media URLs are processed via `getSafeUrl()` to neutralize `javascript:`, `data:`, and `vbscript:` injection vectors.
- **PII Masking & Silent Drop**: Phone numbers in compliance logs and UI views are masked (`+91 ••••• ••210`). Unregistered senders are silently dropped to prevent telephone probing.
- **Protected Cron Scheduler**: Endpoint `/api/scheduler` is guarded against unauthorized invocation via `CRON_SECRET` and `x-vercel-cron` header verification.
- **Dynamic Security PIN**: Replaced legacy static PINs with a hardened master emergency PIN (`9482`), centrally managed and verifiable with fail-safe fallback.

---

## 📘 Documentation Index

- [**`Docs/AUDIT_REPORT.md`**](file:///d:/Projects/CampusCast/Docs/AUDIT_REPORT.md): Complete System Testing, E2E Verification & 20-Point Security Remediation Report (36/36 Routes OK, 98 Links OK, 77 Buttons OK).
- [**`Docs/DEPLOYMENT_GUIDE.md`**](file:///d:/Projects/CampusCast/Docs/DEPLOYMENT_GUIDE.md): Complete Production Deployment Guide for Vercel, Cloudflare Pages, Firebase, and Smart TV setup.
- [**`Docs/USER_GUIDE.md`**](file:///d:/Projects/CampusCast/Docs/USER_GUIDE.md): Quick Start User Guide for non-technical faculty & commercial leadership handbook.
- [**`Docs/DESIGN_v2.md`**](file:///d:/Projects/CampusCast/Docs/DESIGN_v2.md): Official Brand Kit v2, logo system, palette tokens, and signage UI specifications.
- [**`Docs/SYSTEM_ARCHITECTURE_GUIDE.md`**](file:///d:/Projects/CampusCast/Docs/SYSTEM_ARCHITECTURE_GUIDE.md): Master system overview, sequence diagrams, & App Flows for Display Modes 1-5 and Admin Command Center.
- [**`Docs/OPERATIONAL_RUNBOOKS.md`**](file:///d:/Projects/CampusCast/Docs/OPERATIONAL_RUNBOOKS.md): Smart TV direct browser setup & IT runbooks.
- [**`Docs/PRD.md`**](file:///d:/Projects/CampusCast/Docs/PRD.md): Product requirements & functional SLAs.
- [**`Docs/ARCHITECTURE.md`**](file:///d:/Projects/CampusCast/Docs/ARCHITECTURE.md): Technical architecture & NoSQL Firestore document schemas.
- [**`Docs/STORAGE_RULES.md`**](file:///d:/Projects/CampusCast/Docs/STORAGE_RULES.md): Security rules baseline (`firestore.rules` deny-all client writes).
- [**`Docs/PHASE_PLAN.md`**](file:///d:/Projects/CampusCast/Docs/PHASE_PLAN.md): Implementation roadmap.
- [**`Docs/MEMORY.md`**](file:///d:/Projects/CampusCast/Docs/MEMORY.md): Project memory & decision log.
- [**`Docs/ABSTRACT.md`**](file:///d:/Projects/CampusCast/Docs/ABSTRACT.md): Project abstract & problem statement.
- [**`Docs/TECH_STACK_RATIONALE.md`**](file:///d:/Projects/CampusCast/Docs/TECH_STACK_RATIONALE.md): Technology selection justifications.
- [**`Docs/PRESENTATION_DRAFT.md`**](file:///d:/Projects/CampusCast/Docs/PRESENTATION_DRAFT.md): PPT-ready presentation draft (27 standalone slides covering all project aspects).
- [**`Docs/ZERO_COST_INGESTION_PLAN.md`**](file:///d:/Projects/CampusCast/Docs/ZERO_COST_INGESTION_PLAN.md): Complete plan for zero-cost Vercel Route Handlers and Twilio WhatsApp Sandbox integration.

---

## 👤 Author & Repository Info

- **Project Lead**: Yash Ghodele
- **Role**: Executive Head (BotBuddies) · Event Head (ECESA)
- **Institution**: MIT College of Engineering
- **GitHub Repository**: [https://github.com/yash-ghodele/CampusCast.git](https://github.com/yash-ghodele/CampusCast.git)

---
*CampusCast © 2026 — Released under the MIT License.*

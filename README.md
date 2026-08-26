# CampusCast — WhatsApp-Driven Real-Time Digital Notice Board Network

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Blaze_Plan-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Meta WhatsApp API](https://img.shields.io/badge/Meta-WhatsApp_Cloud_API-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://developers.facebook.com/docs/whatsapp/cloud-api)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://pages.cloudflare.com/)
[![GitHub Repository](https://img.shields.io/badge/GitHub-yash--ghodele%2FCampusCast-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/yash-ghodele/CampusCast.git)

> **The notice board that publishes itself the moment an authorized faculty member hits send.**

CampusCast bridges the gap between everyday messaging tools and physical campus signage. Instead of forcing faculty to navigate complex web admin portals or mobile apps, CampusCast turns **WhatsApp** into an authenticated publishing interface. 

A single WhatsApp message sent by an authorized faculty member is authenticated by phone identity, parsed, routed by department, and pushed instantaneously to hallway LCD display screens via real-time Cloud Firestore `onSnapshot` streaming.

---

## 📺 Zero-Hardware Smart TV Model

No Raspberry Pi, Mini-PC, HDMI dongles, or external media player boxes are required! Any Smart TV (Android TV, LG webOS, Samsung Tizen OS, Amazon Fire TV) opens the display URL (`http://<server-ip>/display/[deptId]`) directly in its native web browser.

---

## 📘 Documentation Index

- [**`Docs/OPERATIONAL_RUNBOOKS.md`**](file:///d:/Projects/CampusCast/Docs/OPERATIONAL_RUNBOOKS.md): Smart TV Direct Browser setup guide & IT runbooks.
- [**`Docs/PRD.md`**](file:///d:/Projects/CampusCast/Docs/PRD.md): Product requirements & functional SLAs.
- [**`Docs/ARCHITECTURE.md`**](file:///d:/Projects/CampusCast/Docs/ARCHITECTURE.md): Technical architecture & NoSQL document schemas.
- [**`Docs/DESIGN.md`**](file:///d:/Projects/CampusCast/Docs/DESIGN.md): Display visual design system & hallway kiosk UX.
- [**`Docs/STORAGE_RULES.md`**](file:///d:/Projects/CampusCast/Docs/STORAGE_RULES.md): Security rules baseline (`firestore.rules` deny-all client writes).
- [**`Docs/PHASE_PLAN.md`**](file:///d:/Projects/CampusCast/Docs/PHASE_PLAN.md): 5-Phase implementation roadmap.
- [**`Docs/MEMORY.md`**](file:///d:/Projects/CampusCast/Docs/MEMORY.md): Project memory & decision log.

---

## 🚀 Key Features & Capabilities

- 📱 **Zero-Learning-Curve Publishing**: Faculty publish text, images, or PDFs using their existing WhatsApp app without password logins or separate apps.
- ⚡ **Real-Time Distribution**: Hallway LCD screens listen via Firestore [`onSnapshot`](file:///d:/Projects/CampusCast/apps/display/src/lib/firebase.ts#L48-L86) listeners, rendering notices live in $<5$ seconds.
- 🚨 **Urgent Priority Tagging**: `#urgent` messages trigger high-contrast red alert borders (`#E5484D`), warning badges, and subtle pulse glow animations.
- 🕒 **Automated Notice Scheduling**: `#schedule DD-MM-YYYY HH:mm` queues announcements to activate automatically at future dates.
- 🏷️ **Department-Aware Routing**: Prefixes like `ECE:` or assigned faculty home departments route notices to specific hallway display screens (`ECE`, `CSE`, `MECH`, `CIVIL`, `EEE`).
- 🛡️ **Strict Security & Silent Drop**: Webhook payloads are HMAC SHA-256 verified (`X-Hub-Signature-256`). Unauthorized phone numbers are silently dropped and logged to `audit_log` without replying to prevent number probing.
- 🔒 **Zero Client-Side Writes**: Enforced in [`firestore.rules`](file:///d:/Projects/CampusCast/firestore.rules) (`allow write: if false;`). All database updates run through backend Cloud Functions.
- 🟡 **Offline Display Resilience**: If network connectivity drops, display kiosks retain the last rendered notices and present a subtle `🟡 Reconnecting...` footer indicator. Screens **never go blank**.
- 📊 **Admin Portal**: Next.js 14 management portal for faculty roster onboarding, screen telemetry heartbeats, notice control, and audit logs.

---

## 👤 Author & Repository Info

- **Project Lead**: Yash Ghodele
- **Role**: Executive Head (BotBuddies) · Event Head (ECESA)
- **Institution**: MIT College of Engineering
- **GitHub Repository**: [https://github.com/yash-ghodele/CampusCast.git](https://github.com/yash-ghodele/CampusCast.git)

---
*CampusCast © 2026 — Released under the MIT License.*

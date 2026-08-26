# CampusCast — Project Memory & Decision Log

## 1. Core Architecture Summary
- **Messaging**: Meta WhatsApp Business Cloud API.
- **Backend Compute**: Firebase Cloud Functions (v2 Node.js / TypeScript) on the **Firebase Blaze Plan** (pay-as-you-go, unlocking outbound HTTPS to Meta Graph API).
- **Database**: Cloud Firestore (NoSQL) with real-time `onSnapshot` streaming listeners.
- **Frontend Hosting**: Cloudflare Pages (unlimited free bandwidth for Next.js display and admin apps).
- **Hardware Kiosk Model**: **Zero External Hardware**. Any Smart TV (Android TV, webOS, Tizen OS, Fire TV) opens display URLs directly in its built-in browser.
- **Security**: Enforces zero client-side writes in `firestore.rules` (`allow write: if false;`).

## 2. Decision Log
| Date | Decision | Rationale |
|---|---|---|
| 2026-08-21 | Selected Firebase Cloud Functions + Firestore NoSQL | Cost + infra simplicity for low, bursty traffic |
| 2026-08-22 | Verified live display client via automated browser subagent tests at `http://localhost:3000` | Verified multi-department student notice displays, clock tick, and reconnect status indicators |
| 2026-08-26 | Confirmed Firebase Blaze Plan + NoSQL Firestore (`onSnapshot`) + Cloudflare Pages architecture | Blaze Plan unlocks Meta Graph API replies; Cloudflare Pages provides unlimited frontend bandwidth |
| 2026-08-26 | Adopted Zero-Hardware Smart TV Direct Browser Model | Eliminates Raspberry Pi / Mini-PC hardware costs, Linux OS scripts, and HDMI power bricks |

# CampusCast — Technology Stack & Architectural Rationale

This document outlines the technical justifications behind selecting each core component of the CampusCast stack.

---

## 1. Architectural Justifications

- **Meta WhatsApp Business Cloud API**: Adopted to eliminate faculty onboarding friction. Faculty publish announcements directly from their existing WhatsApp mobile app without password logins or separate dashboard training. Sender identity is authenticated via E.164 phone numbers.
- **Next.js 14 App Router (React 18 & Tailwind CSS)**: Powers both the Hallway Display Kiosk ([`display/`](file:///d:/Projects/CampusCast/display)) and Administrative Command Center ([`admin/`](file:///d:/Projects/CampusCast/admin)). Offers fast static route compilation, server components, Poppins typography styling, and responsive layout scaling.
- **Firebase Cloud Functions (v2 Node.js - Blaze Plan)**: Serverless compute providing instant HTTP webhook ingestion and cron scheduling. The **Firebase Blaze Plan** (pay-as-you-go) unlocks outbound HTTPS requests to Meta's Graph API for confirmation replies.
- **Cloud Firestore (NoSQL)**: Real-time `onSnapshot` streaming listeners push notice updates to Smart TV screens in $<5$ seconds without client-side polling loops or websocket server infrastructure overhead.
- **Cloudflare Pages**: Global edge hosting for Next.js frontend web applications providing 100% free unlimited bandwidth for 24/7 hallway display screens.
- **Zero-Hardware Smart TV Model**: Kiosks run inside any Smart TV's native web browser (Android TV, LG webOS, Samsung Tizen OS, Fire TV). Eliminates Raspberry Pi / Mini-PC hardware procurement, OS maintenance, and HDMI cabling.
- **Strict Security Rules ([`firestore.rules`](file:///d:/Projects/CampusCast/firestore.rules))**: Global `allow write: if false;` policy guarantees that web clients cannot mutate database state. All updates execute exclusively through Firebase Admin SDK in serverless backends.

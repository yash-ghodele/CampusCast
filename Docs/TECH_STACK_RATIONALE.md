# CampusCast — Technology Stack & Architectural Rationale

This document outlines the technical justifications behind selecting each core component of the CampusCast stack.

---

## 1. Architectural Justifications

- **Dual WhatsApp Ingestion Gateway (Twilio Sandbox & Meta Cloud API)**: Adopted to provide zero-friction faculty onboarding and rapid evaluation testing. Twilio's WhatsApp Sandbox enables instant live mobile texting for academic reviews with zero business verification delays or credit card requirements, while Meta WhatsApp Cloud API serves long-term institutional deployments. Sender identity is authenticated via E.164 phone numbers.
- **Next.js 14 App Router & Vercel Serverless Route Handlers**: Powers the Hallway Display Kiosk ([`display/`](file:///d:/Projects/CampusCast/display)), Administrative Command Center ([`admin/`](file:///d:/Projects/CampusCast/admin)), and serverless webhook/scheduler API endpoints (`/api/webhook/twilio`, `/api/scheduler`). Operates 100% free with unrestricted outbound HTTPS, eliminating Firebase Blaze plan requirements.
- **Firebase Cloud Functions (v2 Node.js - Alternative)**: Standalone serverless compute option for Firebase-native deployments on the Blaze Plan.
- **Cloud Firestore (NoSQL)**: Real-time `onSnapshot` streaming listeners push notice updates to Smart TV screens in $<5$ seconds without client-side polling loops or websocket server infrastructure overhead.
- **Vercel Edge & Cloudflare Pages**: Global edge hosting for Next.js frontend web applications providing continuous high-availability, instant atomic deployments, and low-latency edge delivery for 24/7 hallway display screens.
- **Vercel Cron Jobs**: Zero-cost automated lifecycle execution triggering notice status transitions (scheduled $\rightarrow$ active $\rightarrow$ expired) every 60 seconds without dedicated VM instances.
- **Zero-Hardware Smart TV Model**: Kiosks run inside any Smart TV's native web browser (Android TV, LG webOS, Samsung Tizen OS, Fire TV). Eliminates Raspberry Pi / Mini-PC hardware procurement, OS maintenance, and HDMI cabling.
- **Strict Security Rules ([`firestore.rules`](file:///d:/Projects/CampusCast/firestore.rules))**: Global `allow write: if false;` policy guarantees that web clients cannot mutate database state. All updates execute exclusively through Firebase Admin SDK in serverless backends.

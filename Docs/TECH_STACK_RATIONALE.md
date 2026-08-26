# CampusCast — Technology Stack & Tooling Rationale

## 1. Architectural Justifications
- **Meta WhatsApp Cloud API**: Adopted for zero faculty learning curve and identity verification via E.164 phone numbers.
- **Firebase Cloud Functions (v2 Blaze Plan)**: Serverless compute unlocking outbound HTTPS requests to Meta Graph API for confirmation replies.
- **Cloud Firestore (NoSQL)**: Real-time `onSnapshot` streaming listeners providing instant updates without client polling.
- **Cloudflare Pages**: Frontend hosting for Next.js 14 apps with unlimited free bandwidth for 24/7 kiosk screens.
- **Strict Security Rules (`firestore.rules`)**: Enforces zero client-side writes (`allow write: if false;`).

# CampusCast — Technology Stack & Tooling Rationale

This document provides a technical justification for every framework, database, API, and tool selected for the **CampusCast** platform. It outlines the engineering tradeoffs, architectural advantages, cost considerations, and security benefits that governed each choice.

---

## 1. Summary of Technology Choices

| Architectural Layer | Technology Selected | Primary Engineering Rationale |
|---|---|---|
| **Messaging Ingestion** | Meta WhatsApp Business Cloud API | Adoption through familiarity; zero learning curve for faculty; supports rich media (images, PDFs). |
| **Serverless Backend** | Firebase Cloud Functions (v2, Node.js) | Event-driven execution; zero idle server cost; native IAM integration with database and storage. |
| **Real-Time Data Store** | Cloud Firestore | Native `onSnapshot` real-time listeners; zero polling overhead for display screens; horizontal scalability. |
| **Media Asset Storage** | Firebase Cloud Storage | Decouples binary image/PDF uploads from database document metadata for high query speed. |
| **Display & Admin Web Apps**| Next.js 14 + React 18 + TypeScript | Modern SSR/SPA framework; fast rendering; strict type safety shared across frontends and backend. |
| **Visual Design System** | Vanilla CSS + Tailwind CSS | Full control over high-contrast dark theme (`#0B1220`), hallway distance typography, and urgent red alert styling. |
| **Security Enforcement** | Firestore Security Rules (`allow write: if false`) | Enforces **zero client-side writes**; guarantees all database mutations execute through serverless Admin SDK. |

---

## 2. Ingestion & Messaging Layer: Meta WhatsApp Cloud API

### Why WhatsApp Business Cloud API?
- **Adoption Through Familiarity**: The single biggest point of failure in previous digital signage initiatives is faculty habit change. Asking busy faculty members to log into a separate web dashboard, remember passwords, or download a proprietary app results in low adoption. WhatsApp is already integrated into faculty daily workflows.
- **Rich Media & Formatting**: Supports text announcements, priority tags (`#urgent`), scheduled dates (`#schedule`), event poster images (JPEG/PNG), and official circulars (PDF).
- **Verified Phone Identity**: WhatsApp messages naturally include the sender's E.164 phone number, enabling seamless identity verification without passwords.

### Tradeoffs vs. Alternatives
- **vs. Custom Web Publishing Portal**: A web portal introduces authentication friction (login prompts, password resets, UI navigation). Faculty avoid updating signage if it requires desktop access.
- **vs. SMS / GSM Hardware Modems**: SMS is limited to 160 plain text characters, cannot render poster images or PDFs, requires dedicated physical cellular SIM hardware at every screen, and incurs recurring SMS telco costs.
- **vs. Telegram API**: While Telegram has open API tools, WhatsApp is the dominant institutional messaging channel used daily by faculty and administration in our target deployment environment.

---

## 3. Serverless Backend Layer: Firebase Cloud Functions (v2, Node.js)

### Why Firebase Cloud Functions?
- **Event-Driven Execution**: Campus notice publishing is bursty and low-volume (a few dozen messages per day across campus). Cloud Functions execute only when a Meta webhook event arrives and scale down to zero when idle.
- **Zero Infrastructure Maintenance**: Serverless functions eliminate OS patching, server management, and load balancer configuration.
- **Unified Security Boundary**: Shared IAM project boundary with Firestore, Cloud Storage, and GCP Secret Manager.

### Tradeoffs vs. Alternatives
- **vs. Always-On Dedicated Server (Express on Railway / Render / AWS EC2)**: A persistent server incurs continuous 24/7 billing even during zero-traffic periods (overnight, weekends, academic breaks). Cloud Functions eliminate idle infrastructure costs.

---

## 4. Real-Time Data Layer: Cloud Firestore

### Why Cloud Firestore?
- **Real-Time Push Synchronization (`onSnapshot`)**: Department display screens run fullscreen kiosk browsers. Firestore's `onSnapshot` listener pushes database changes to display screens instantaneously.
- **Zero Polling Overhead**: Eliminates periodic HTTP polling (`setInterval(fetchNotices, 5000)`), reducing network bandwidth, display CPU usage, and server request loads.
- **Flexible Document Schema**: Native support for notice status lifecycles (`scheduled`, `active`, `expired`, `deleted`), arrays of department scopes, and audit logging.

### Tradeoffs vs. Alternatives
- **vs. Relational Databases (MySQL / PostgreSQL)**: Relational databases do not natively stream document state updates to browser clients. Achieving real-time display updates with SQL requires managing custom WebSocket connections (e.g. Socket.io) and scaling WebSocket connection servers.

---

## 5. Frontend Kiosk & Administration Layer: Next.js 14 & Tailwind CSS

### Why Next.js 14 & TypeScript?
- **Hallway Kiosk Performance**: Fast client hydration and optimized routing for department screens (`/display/ece`, `/display/cse`, `/display/mech`).
- **Unified Monorepo (`@campuscast/shared`)**: Shared TypeScript interfaces (`User`, `Notice`, `Screen`, `AuditLog`) prevent API contract drift between backend functions and frontend components.
- **Utility-First Styling (Tailwind CSS)**: Allows precise design of the dark visual theme (`#0B1220` display background, `#141C2E` notice cards, `#E5484D` urgent glow borders), ensuring hallway legibility at a distance of 10+ meters.

---

## 6. Security Architecture & Policy Tooling

### 1. `firestore.rules` (`allow write: if false;`)
- **Rationale**: Prevents malicious users or compromised browser clients from mutating database documents. Display screens and Admin portals only have read access; all database writes execute through the Firebase Admin SDK in Cloud Functions.

### 2. HMAC SHA-256 Webhook Verification (`X-Hub-Signature-256`)
- **Rationale**: Validates that inbound HTTP webhook requests originate from Meta's servers and have not been spoofed or modified by external attackers.

### 3. Silent Drop for Unauthorized Numbers
- **Rationale**: If an unregistered phone number sends a message, the system logs an `unauthorized_attempt` to `audit_log` and drops the request without replying. This prevents unauthorized users from probing registered faculty numbers.

# CampusCast — Product Requirements Document (PRD)

## 1. Executive Summary
CampusCast turns WhatsApp into the publishing interface for a real-time, department-scoped digital notice board network.

Faculty publish announcements by sending a plain WhatsApp text, image, or PDF to an institutional number. CampusCast authenticates the sender, parses priority (#urgent) and department tags (ECE:), writes the notice to Cloud Firestore (NoSQL), and instantaneously pushes updates to department hallway LCD display screens via real-time onSnapshot listeners.

- **Stack**: Firebase Cloud Functions v2 (Blaze Plan) + Cloud Firestore NoSQL + Cloudflare Pages Frontend Hosting.
- **Primary Goal**: <5s publish-to-display latency with zero adoption friction for faculty.

---

## 2. Key Architecture & Operational Choices
1. **Firebase Blaze Plan**: Unlocks outbound HTTP requests from Cloud Functions to Meta's WhatsApp Graph API for confirmation replies.
2. **NoSQL Firestore (onSnapshot)**: Real-time push listeners for display kiosks with zero polling overhead.
3. **Cloudflare Pages**: Hosts Next.js 14 frontend display and admin applications with unlimited free bandwidth.
4. **Firebase Security**: Enforces strict llow write: if false; security rules in irestore.rules.
5. **Silent Drops**: Unauthorized senders are recorded in udit_log and dropped silently without replying to prevent phone probing.

---

## 3. User Personas & Core Journeys
- **Faculty Publishers**: Send WhatsApp message -> Receive automated confirmation reply -> Notice live on screen.
- **Campus Students**: View high-contrast dark theme displays (#0B1220) with red alert cards for #urgent announcements.
- **HODs & Admins**: Manage faculty roster, screen telemetry heartbeats, notice histories, and audit logs via Next.js Admin Portal.

---

## 4. Non-Functional SLAs & Metrics
- **Publish-to-Display Latency**: <5 seconds p95.
- **Display Resilience**: If Wi-Fi drops, screens retain last-rendered state and display 🟡 Reconnecting... footer indicator. Screens **never go blank**.
- **Security Baseline**: 100% backend-only writes via Firebase Admin SDK.

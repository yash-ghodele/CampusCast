# CampusCast — Product Requirements Document (PRD)

## 1. Product Vision & Scope
CampusCast turns WhatsApp into the primary publishing interface for institutional announcements broadcasted across department Smart TV displays, coupled with a centralized **Campus Communication Operating System** for emergency management, Kanban notice lifecycles, and screen telemetry control.

- **Zero External Hardware Model**: Display screens run directly inside any Smart TV's built-in web browser (Android TV, LG webOS, Samsung Tizen OS, Amazon Fire TV) connected to campus Wi-Fi or Ethernet. **No Raspberry Pi, Mini-PC, or HDMI dongles required.**

---

## 2. User Personas & Experience Journeys

- **Faculty Publishers**: Send WhatsApp text messages, poster images (JPEG/PNG), or PDFs to publish announcements with zero dashboard learning curve.
- **Campus Students**: View hallway display screens featuring Poppins typography, Hero Notice cards, news ticker marquees, category badges (`EXAM`, `PLACEMENT`, `EVENT`, `URGENT`, `ACHIEVEMENT`), date/time chips, and interactive WhatsApp QR codes.
- **Department HODs & Admins**: Operate the Command Center to onboard faculty numbers, trigger PIN-authenticated emergency alerts (`1234`), manage notice Kanban boards, inspect screen walls, review analytics, and audit security logs.

---

## 3. Detailed Functional Requirements (FR)

### Ingestion & Authentication
- **FR1: WhatsApp Ingestion**: Ingest text messages, poster images (JPEG/PNG), and official circulars (PDF) sent by faculty via Meta WhatsApp Cloud API.
- **FR2: Sender Phone Authentication**: Authenticate senders strictly by their verified E.164 phone number registered in the active faculty roster (`users` collection).
- **FR3: HMAC Signature Integrity**: Reject all webhook payloads lacking a valid `X-Hub-Signature-256` HMAC header verified against the WhatsApp app secret.
- **FR4: Silent Drop Policy**: Record unauthorized publish attempts in `audit_log` and drop silently without sending a WhatsApp reply to prevent phone number probing.
- **FR5: Webhook Rate Limiting**: Enforce sliding window rate limiting (maximum 5 messages per minute per sender).

### Display Experience (Modes 1 – 5)
- **FR6: Mode 1 (Hero Notice View)**: Default view occupying 80% screen space with title, description, category badge, date/time chips, department badge, and QR code snippet. Auto-rotates every 10s.
- **FR7: Mode 2 (News Ticker Marquee)**: Continuous horizontal scrolling bottom ticker for secondary announcements.
- **FR8: Mode 3 (Emergency Override View)**: High-contrast full-screen red background (`#DC2626`) for `priority == 'urgent'`, hiding normal carousels.
- **FR9: Mode 4 (Event Carousel View)**: Auto-sliding poster images and PDF previews.
- **FR10: Mode 5 (Split Screen View)**: Event poster on left (7 cols), live notice feed on right (5 cols).
- **FR11: Department Scope Branding Themes**: Department theme color mapping (`ECE`: Orange, `CSE`: Blue, `AIML`: Purple, `MECH`: Red, `CIVIL`: Green, `EEE`: Amber).

### Admin Command Center
- **FR12: Notice Kanban Board**: Manage notice lifecycle across `Scheduled`, `Active`, and `Expired` columns with list toggle.
- **FR13: Notice Creation Wizard**: 5-step modal wizard (Type -> Content -> Audience -> Schedule -> TV Preview & Publish).
- **FR14: Display Control Center & Screen Wall**: Monitor screen telemetry heartbeats (`lastSeenAt`), resolution (`1080p`), and launch PIN-protected Force Broadcasts (`1234`).
- **FR15: Analytics Module**: Display notice distribution by department/category and top faculty contributor rankings.
- **FR16: Roster Management**: Onboard faculty numbers, assign department scopes, and toggle active/suspended status for instant emergency revocation.

---

## 4. Non-Functional Requirements (NFR)
- **NFR1: Publish Latency**: $<5$ seconds p95 latency from WhatsApp message send to display screen rendering.
- **NFR2: Display Availability & Resilience**: 99.9% uptime with offline local caching. Displays must never show full-page web error screens.
- **NFR3: Security Baseline**: Enforce 100% backend-only writes via serverless Admin SDK (`firestore.rules` enforces `allow write: if false;`).
- **NFR4: Layout Accessibility**: Support vertical scrolling (`overflow-y: auto`, `min-height: 100vh;`) across all pages whenever content exceeds viewport height.

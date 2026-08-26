# CampusCast — Product Requirements Document (PRD)

## 1. Product Vision & Scope
CampusCast turns WhatsApp into the primary publishing interface for institutional announcements broadcasted across department LCD screens.

- **Zero External Hardware Model**: Display screens run directly inside any Smart TV's built-in web browser (Android TV, webOS, Tizen OS, Fire TV) connected to campus Wi-Fi. **No Raspberry Pi, Mini-PC, or HDMI dongles required.**

## 2. User Personas
- **Faculty Publishers**: Send WhatsApp messages, images, or PDFs to publish announcements with zero dashboard learning curve.
- **Campus Students**: View hallway display screens with high-contrast, hallway-legible notices.
- **Department HODs & Admins**: Onboard faculty E.164 phone numbers, monitor screen telemetry heartbeats, search notice history, and inspect security audit logs.

## 3. Functional Requirements (FR)
- **FR1: WhatsApp Ingestion**: Ingest text messages, poster images (JPEG/PNG), and official circulars (PDF) sent by faculty via Meta WhatsApp Cloud API.
- **FR2: Sender Authentication**: Authenticate senders strictly by their verified E.164 phone number registered in the active faculty roster.
- **FR3: Department Routing**: Route notices to specific department screens using explicit code prefixes (e.g. `ECE:`) or assigned faculty home departments.
- **FR4: Priority Flagging**: Parse `#urgent` tags to render red alert styling (`#E5484D`) with pulse glow animations.
- **FR5: Automated Scheduling**: Parse `#schedule DD-MM-YYYY HH:mm` tags to queue announcements for automatic future publishing.
- **FR6: Silent Drop Policy**: Record unauthorized publish attempts in the audit log and drop silently without sending a WhatsApp reply to prevent phone number probing.
- **FR7: Real-Time Notice Streaming**: Push active notices to Smart TV hallway display screens instantaneously via real-time WebSocket listeners.
- **FR8: Administrative Control**: Web management portal to onboard faculty, monitor screen telemetry, force-expire notices, and view immutable audit logs.

## 4. Non-Functional Requirements (NFR)
- **NFR1: Publish Latency**: $<5$ seconds p95 latency from WhatsApp message send to display kiosk rendering.
- **NFR2: Display Resilience**: Retain last-rendered notices and show a `🟡 Reconnecting...` footer indicator on Wi-Fi drop. Screens **never go blank**.
- **NFR3: Security Baseline**: Enforce 100% backend-only writes via serverless Admin SDK (`allow write: if false;`).

# CampusCast — Product Requirements Document (PRD)

## 1. Summary
CampusCast is a WhatsApp-driven digital notice board system. Authorized faculty publish announcements by sending a WhatsApp message; the system authenticates, parses, routes, and displays them in real time on department LCD screens, replacing physical boards and scattered broadcast groups.

---

## 2. Target Users & Roles

| Role | Responsibilities & Capabilities |
|---|---|
| **Super Admin** | Manage institution departments, screen registrations, faculty roster, view security audit logs, revoke access. |
| **HOD** | Publish notices, manage department-specific settings, approve/override notices. |
| **Faculty** | Publish text, urgent alerts, scheduled notices, and media attachments to assigned departments via WhatsApp. |
| **Student / Viewer** | View real-time notices on hallway LCD displays (no account or login required). |

---

## 3. Key Functional Requirements

### 3.1 WhatsApp Ingestion & Parsing
- **FR1 (Publishing)**: Registered WhatsApp numbers send text, image, or PDF notices to the institutional WhatsApp Business number.
- **FR2 (Department Routing)**: Message resolves target department via `DEPT:` prefix or sender's assigned home department.
- **FR3 (Feedback Replies)**: Senders receive confirmation WhatsApp replies (e.g. `✅ Posted to ECE — visible now.`).
- **FR4 (Urgent Tagging)**: `#urgent` tag sets `priority: "urgent"` triggering red-alert styling on display screens.
- **FR5 (Scheduled Notices)**: `#schedule DD-MM-YYYY HH:mm` publishes the notice automatically at the specified time.
- **FR6 (Media Attachments)**: Image/PDF attachments are stored in Firebase Storage and rendered inline.

### 3.2 Authorization & Security
- **FR7 (Phone Identity & Silent Drop)**: Only numbers registered in `users` with `status: "active"` can publish; unauthorized senders are logged to `audit_log` and dropped silently without replying.
- **FR8 (Zero Client Writes)**: All database writes occur via Cloud Functions Admin SDK; client SDKs have zero write access to Firestore.

### 3.3 Displays & Resilience
- **FR9 (Real-time Display)**: Displays update via Firestore `onSnapshot` listeners with zero manual refreshes.
- **FR10 (Offline Fallback)**: Disconnected screens retain last-known-good state and show a `🟡 Reconnecting...` footer indicator. Displays NEVER go blank.

---

## 4. Non-Functional Requirements
- **Latency**: Publish-to-display time p95 < 5 seconds.
- **Security**: Signature verification (`X-Hub-Signature-256`) on all inbound webhooks.
- **Legibility**: Display body text minimum 28px at 1080p resolution.
- **Cost**: Serverless Cloud Functions to operate efficiently within free/low-tier limits.

## 5. Open Questions
- **Meta Business verification.** `PHASE_PLAN.md` Phase 4 still lists "end-to-end live testing with real WhatsApp Business sandbox number" as unchecked — still unresolved whether pilot can run on Meta's sandbox number or needs full Business verification first. This blocks knowing how early real testing with real faculty can start; track resolution here, not just in the phase plan checkbox.
- **Roster ownership.** Who operationally owns the "authorized numbers" list day to day — IT, the HOD office, or a CampusCast admin role — hasn't been decided. `apps/admin`'s Roster tab supports any of them; the org decision is separate from the build.
- **Display hardware.** Are departments expected to supply their own screen/mini-PC, or does CampusCast standardize on a reference device (e.g. Raspberry Pi + HDMI TV)? Relevant now that Phase 4 includes "hallway hardware display kiosk deployment."

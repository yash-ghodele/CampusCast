# CampusCast — Product Requirements Document

## 1. Summary
CampusCast is a WhatsApp-driven digital notice board system. Authorized faculty publish announcements by sending a WhatsApp message; the system authenticates, parses, routes, and displays them in real time on department LCD screens, replacing physical boards and scattered WhatsApp/Telegram broadcasts.

## 2. Problem
- Physical notice boards need manual updates and are easy to miss.
- WhatsApp/Telegram group announcements get buried in unrelated chatter.
- Urgent notices (cancellations, schedule shifts) don't reach students fast enough.
- Faculty avoid updating digital signage because it requires a login, a dashboard, or IT help.
- No single source of truth — a student checking three channels still might miss something.

## 3. Goals
1. Let any authorized faculty member publish a notice in under 10 seconds, using only WhatsApp.
2. Get a published notice on-screen within 5 seconds of send (p95).
3. Guarantee only verified numbers can publish (zero unauthorized notices).
4. Support department-scoped routing so one deployment serves the whole campus.
5. Keep the board always current — expired/cancelled notices disappear automatically.

## 4. Non-Goals (v1)
- Two-way chat or WhatsApp replies to students.
- Student-submitted notices.
- Native mobile app (web-based display client only).
- Cross-campus federation (single-institution deployment first).
- Payment/fee processing (fee *notices* only, not fee collection).

## 5. Users & Roles

| Role | Can do |
|---|---|
| **Super Admin** | Manage departments, screens, faculty roster, view all logs, revoke access |
| **HOD** | Everything Faculty can do, plus approve/override department notices |
| **Faculty** | Publish, edit-window-limited notices for their own department(s), attach media, schedule |
| **Student/Viewer** | View-only, via the display screen (no account/login required) |

## 6. Functional Requirements

### 6.1 Publishing
- FR1: A registered WhatsApp number can send a text, image, or PDF to the CampusCast Business number.
- FR2: The first line (or a `DEPT:` prefix) determines routing; unrouted messages default to the sender's home department and are flagged for confirmation.
- FR3: Sender receives a WhatsApp confirmation reply (✅ Posted to ECE) or an error reply (❌ Not authorized / ❌ Unknown department).
- FR4: `#urgent` tag sets priority=high and triggers red alert styling + optional audible chime on displays.
- FR5: `#schedule` with a date/time publishes the notice automatically at that timestamp instead of immediately.
- FR6: Media attachments (JPEG, PNG, PDF up to 10MB) are stored and rendered inline on the display.

### 6.2 Authorization
- FR7: Only numbers present in the `Users` collection with an active status can publish; all others are silently logged and ignored (no reply, to avoid confirming the number is being screened).
- FR8: Admins can add/remove/suspend faculty numbers without a deploy.
- FR9: Each faculty account is scoped to one or more departments; publishing outside scope requires HOD/Admin override.

### 6.3 Display
- FR10: Each department has one or more registered display clients (URL + department ID) running fullscreen in a browser.
- FR11: Displays update via a live Firestore listener — no polling, no manual refresh.
- FR12: Displays show: header (dept name, live clock/date), a rotating feed of active notices (most recent/highest priority first), and a footer.
- FR13: Notices past their expiry timestamp are removed from the active feed automatically (soft-deleted, retained in history).
- FR14: If connectivity drops, the display keeps showing the last-known state and shows a small "reconnecting" indicator rather than going blank.

### 6.4 History & Audit
- FR15: Every notice (including edited/deleted ones) is retained in a `NoticeHistory` collection for at least 1 academic year.
- FR16: Admins can see who published what, when, and to which department(s).

## 7. Non-Functional Requirements
- **Latency:** publish-to-display p95 < 5s, p99 < 15s.
- **Availability:** 99.5% uptime for the display-facing read path (Firestore's own SLA covers most of this).
- **Security:** webhook signature verification on every inbound Meta event; no unauthenticated writes to Firestore (all writes go through the backend, never client-side).
- **Cost:** stay within Meta's free-tier conversation limits where possible; avoid always-on compute (favor serverless functions over a persistent server where practical).
- **Data retention:** media files auto-archived after 90 days to cold storage; notice text retained indefinitely.
- **Accessibility:** display UI must remain legible at typical hallway viewing distance (min. 28px body text at 1080p).

## 8. Success Metrics
- % of notices published via CampusCast vs. legacy channels (target: 80%+ within one semester of a department's onboarding).
- Median time from "faculty decides to publish" to "on screen."
- Number of unauthorized publish attempts blocked (security health signal).
- Faculty-reported friction (qualitative, via a short survey after rollout).

## 9. Open Questions
- Do we need Meta Business verification / a paid WhatsApp Business number before pilot, or can we pilot on a sandbox number?
- Who owns the "authorized numbers" list operationally — IT, HOD office, or CampusCast admin?
- Should students be able to opt into a read-only WhatsApp broadcast list as a v1.5 feature, or does that reopen the "buried in group chat" problem this project exists to solve?
- Physical display hardware: are departments expected to provide their own screen/mini-PC, or does CampusCast standardize on a reference device (e.g., Raspberry Pi + HDMI TV)?

## 10. Changes from Original Concept
- Added explicit role hierarchy (Super Admin / HOD / Faculty) — the original spec had only Admin/Faculty/Student; HOD-level override is needed for departments with multiple faculty publishers to avoid conflicting notices.
- Added silent-ignore behavior for unauthorized senders (FR7) instead of no defined behavior — prevents number enumeration/probing.
- Added explicit soft-delete + audit history requirement, since "notice history" was listed as a feature but not specified.
- Added offline/reconnect behavior for displays (FR14) — the original architecture assumed always-on connectivity, which won't hold on campus Wi-Fi in practice.

# CampusCast — Phase Plan

Sequencing favors a real, working end-to-end path (one faculty number → one screen) before breadth (many departments, many features). Each phase should leave the system in a demoable state.

## Phase 0 — Foundations (setup, no user-facing behavior yet)
- Create Firebase project (Firestore, Storage, Functions, Auth, Hosting).
- Register a Meta WhatsApp Business sandbox number, configure webhook URL + verify token.
- Define and deploy Firestore security rules (deny-all client writes from day one — don't build features on open rules and lock them down later).
- Set up repo structure, TypeScript config shared between Functions and Next.js apps, CI lint/typecheck.
- **Exit criteria:** a test webhook call from Meta's sandbox reaches a Cloud Function and logs the payload.

## Phase 1 — MVP: one department, end to end
- Ingestion function: signature verification, hardcoded single-department routing, plain-text notices only, no media, no scheduling.
- Hardcoded authorized-numbers allowlist (real `users` collection comes in Phase 2).
- `notices` collection + basic Firestore doc shape.
- Single Next.js display client, one department, live via `onSnapshot`, dark theme per `DESIGN.md`.
- WhatsApp confirmation reply on success/failure.
- **Exit criteria:** a real WhatsApp message from a test phone shows up on the display screen within 5 seconds, with a confirmation reply.

## Phase 2 — Authorization & roles
- `users` collection with role (`super_admin` / `hod` / `faculty`) and department scope.
- Replace hardcoded allowlist with real lookup; silent-drop unauthorized senders (per `MEMORY.md` decision).
- `audit_log` writes for both successful publishes and unauthorized attempts.
- Minimal Admin app: Roster tab only (add/suspend faculty, assign department).
- **Exit criteria:** adding a faculty number via the Admin app lets them publish immediately; removing it blocks them immediately.

## Phase 3 — Priority, scheduling, expiry, media
- `#urgent` parsing → priority field → red-alert display styling.
- `#schedule` parsing → `scheduledAt` → scheduled-status notices.
- Scheduled Cloud Function: promote scheduled→active, active→expired.
- Media ingestion: download from Meta, re-upload to Cloud Storage, size/MIME validation, render on display.
- **Exit criteria:** a scheduled notice appears on-screen automatically at its target time with no human action; an expired notice disappears automatically; an image sent via WhatsApp renders on-screen.

## Phase 4 — Multi-department rollout
- `departments` and `screens` collections fully modeled; department-prefix routing (`DEPT:` parsing) replaces hardcoding.
- Screens tab in Admin app (register screen, get display URL, heartbeat/last-seen status).
- Reconnect/offline handling on display client (per `DESIGN.md` §5).
- Rate limiting on inbound webhook per sender.
- **Exit criteria:** at least 3 departments running simultaneously, each with its own screen(s), managed entirely through the Admin app — no manual Firestore console edits required.

## Phase 5 — Hardening & pilot readiness
- Full audit log UI in Admin app.
- Notice history search/filter.
- Load-test the webhook path for burst sends (e.g., start-of-semester announcement storms).
- Resolve Meta Business verification (move off sandbox number) if pilot requires it.
- Runbook: what to do if a screen goes dark, if the webhook stops receiving, if a faculty number is compromised.
- **Exit criteria:** ready for a live pilot in one real department for one real week, with an on-call owner and a rollback plan.

## Phase 6 — Post-pilot (deferred / stretch)
- Analytics dashboard (notices/day, department activity, screen uptime).
- Multilingual display rendering.
- Voice announcement engine.
- AI-assisted notice categorization.
- Mobile companion app (read-only).

## Notes on sequencing changes from the original plan
The original document listed "Additional Features" and "Future Enhancements" without a build order. This plan front-loads authorization (Phase 2) ahead of priority/scheduling/media (Phase 3) because publishing without any access control, even briefly, is a real risk once a real WhatsApp number is live and discoverable — it should not be deferred to "later." Multi-department support is pushed to Phase 4, after single-department reliability is proven, rather than being designed in from day one, since a working single-department loop is what makes the rest of the roadmap credible to stakeholders.

# CampusCast — Project Memory

Persistent context for anyone (human or AI agent) picking this project up. Read this before touching the codebase. Update it when a decision changes — this file should always reflect current reality, not history for its own sake (see §5 for where history lives instead).

## 1. What this project is
CampusCast turns WhatsApp into the publishing interface for a real-time, department-scoped digital notice board network. Faculty send a WhatsApp message → it's authenticated, parsed, and pushed to Firestore → department LCD screens update live via Firestore listeners. Full detail: `PRD.md`, `ARCHITECTURE.md`, `DESIGN.md`.

## 2. Key decisions locked in (don't relitigate without a reason)
- **Identity = phone number.** No separate login/password system for faculty. Their WhatsApp number *is* their credential. This is the whole point of the product (zero learning curve) — do not add an auth flow that requires faculty to do anything beyond messaging.
- **Ingestion = Firebase Cloud Functions, not a standalone server.** Chosen over Express-on-Railway for cost (bursty, low-volume traffic) and to keep everything in one Firebase project/IAM boundary. If this ever changes, update `ARCHITECTURE.md` §2.2 and this file together.
- **Firestore writes are backend-only.** Display and Admin clients only ever *read*. All writes go through Cloud Functions using the Admin SDK. Never relax Firestore security rules to allow client writes, even "temporarily" for testing — this is the core security boundary of the whole system.
- **Unauthorized senders get silently dropped, not told they're unauthorized.** Deliberate — an error reply would let someone probe which numbers are/aren't registered.
- **Dark theme for displays.** Chosen for hallway-lighting glare and always-on-screen eye strain, not just aesthetics.
- **Department is determined by message content (`DEPT:` prefix / first line), not by which phone number sent it.** One WhatsApp Business number serves the whole campus.

## 3. What's explicitly out of scope for now
See `PRD.md` §4 (Non-Goals). Most relevant to keep top-of-mind during implementation: no two-way chat, no native mobile app, single-institution only (no `campusId` partitioning yet).

## 4. Open questions still blocking full commitment
See `PRD.md` §9. The biggest one operationally: whether pilot can run on Meta's sandbox WhatsApp number or needs full Business verification first — this affects how early real testing with real faculty can start.

## 5. Where things live
- Requirements → `PRD.md`
- System design → `ARCHITECTURE.md`
- Visual/UX design → `DESIGN.md`
- Build sequencing → `PHASE_PLAN.md`
- Conventions/dev rules → `RULES.md`
- Decision history / changelog → append-only log below (newest last)

## 6. Decision log
| Date | Decision | Why |
|---|---|---|
| 2026-08-21 | Replaced standalone Express/Railway backend with Firebase Cloud Functions | Cost + infra simplicity for low, bursty traffic |
| 2026-08-21 | Added Admin web app as a defined surface | Roster/screen management can't live in a DB console past pilot |
| 2026-08-21 | Added role hierarchy: Super Admin / HOD / Faculty | Original Admin/Faculty split had no conflict-resolution path for multi-faculty departments |

## 7. Glossary
- **Notice** — a single published announcement, stored in `notices/{noticeId}`.
- **Department** — a scope for routing and screen assignment, not a phone-number-level distinction.
- **Screen** — a physical display client instance, registered to exactly one department.
- **Urgent** — priority tag (`#urgent`) triggering red styling and optional chime; does not bypass authorization.
- **Scheduled notice** — a notice with a future `scheduledAt`, promoted to active by the scheduler function, not by the display client.

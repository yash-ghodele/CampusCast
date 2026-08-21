# CampusCast — Rules

Conventions and hard constraints for anyone (human or AI agent) writing code in this repo. Rules marked **[HARD]** are non-negotiable — a PR/commit violating one should not merge regardless of how small the change looks.

## 1. Security rules
- **[HARD]** No client SDK (display app, admin app) ever writes to `notices`, `users`, `departments`, `screens`, or `audit_log`. All writes go through Cloud Functions using the Admin SDK. If you find yourself adding a Firestore write in a Next.js page/component, stop — that write belongs in a Function.
- **[HARD]** Every inbound webhook request is signature-verified (`X-Hub-Signature-256`) before any parsing or DB access. Reject with 403 on failure, log the attempt, do not process "just to see what it contains."
- **[HARD]** Unauthorized senders are logged and dropped, never sent an error reply (see `MEMORY.md` §2 for why).
- Secrets (Meta app secret, service account credentials, webhook verify token) live only in Firebase/GCP Secret Manager or environment config never committed to git. No secret ever appears in a client bundle.
- Media uploads are validated server-side for MIME type and size before storage, regardless of what the client/Meta claims the type is.

## 2. Data rules
- Notices are never hard-deleted. "Delete" means `status: "deleted"` + an `audit_log` entry. History retention is a product requirement (PRD FR15), not optional cleanup.
- Every write to `notices` that changes visible state (create, edit, expire, delete) gets a corresponding `audit_log` entry with actor, timestamp, and a diff/detail blob.
- Timestamps are always stored as Firestore `Timestamp` (server time), never client-supplied strings, to keep scheduling/expiry logic trustworthy.

## 3. Code conventions
- TypeScript everywhere (Functions, display app, admin app) — no implicit `any`, strict mode on.
- Shared types (Notice, User, Department, Screen shapes) live in a single shared package/folder imported by both Functions and the frontends — never redefine the same shape twice and let them drift.
- One Cloud Function per responsibility (ingestion, scheduler, heartbeat endpoint) rather than one monolithic function handling every trigger — keeps cold starts and IAM scope minimal.
- Display client components are presentation-only; all filtering/sorting logic (priority order, active-only) happens in the Firestore query, not client-side post-processing, so the display can't drift from what the query actually returns.

## 4. WhatsApp message parsing rules
- Parsing is intentionally forgiving on input, strict on confirmation. If a tag is malformed (e.g. a bad date in `#schedule`), don't silently drop the notice — reply with a specific correction request (see `DESIGN.md` §2) rather than failing silently or guessing.
- Department resolution order: explicit `DEPT:` prefix → sender's single home department (if they have exactly one) → ambiguous, ask for clarification via reply. Never auto-route a multi-department faculty member's untagged message without confirmation.
- `#urgent` and `#schedule` are the only two supported tags in v1. Do not add ad-hoc tags without updating `PRD.md` and this file together — undocumented parsing behavior is the fastest way to confuse faculty.

## 5. Display client rules
- Never render a full-screen error/blank state on connection loss — always fall back to last-known-good state (per `DESIGN.md` Principle 3). A blank screen looks broken; a stale screen with a small reconnect indicator does not.
- No client-side timers determine expiry — the server-side scheduler function is the single source of truth for what's active vs. expired. The display only ever reflects `status: "active"` from its query.

## 6. Git / workflow
- Branch per phase-plan item where practical (e.g. `phase2-roster-admin`), not per arbitrary feature name, so PRs map cleanly back to `PHASE_PLAN.md`.
- Commit messages: `<area>: <what changed>` — e.g. `ingestion: verify webhook signature before parsing`.
- Any change to a locked-in decision in `MEMORY.md` §2 requires updating `MEMORY.md` in the same PR, with the decision log (§6) appended, not overwritten.
- No feature ships past Phase 1 without its corresponding exit criteria (per `PHASE_PLAN.md`) demonstrably met.

## 7. Content moderation
- Faculty accounts are trusted publishers by design (identity = verified phone number), but media is still size/type validated and no executable/script content is ever rendered on a display, regardless of source.
- Profanity/content filtering is out of scope for v1 — the trust model is "only verified faculty can publish," not "content is automatically screened." If this changes, it needs a PRD update, not a quiet addition to the ingestion function.

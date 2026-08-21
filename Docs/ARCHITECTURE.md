# CampusCast — Architecture

## 1. High-Level Flow

```
Faculty WhatsApp
      │  (text / image / pdf)
      ▼
Meta WhatsApp Cloud API  ──────────────────────────────► (delivery receipts / confirmation replies)
      │  webhook (signed POST)
      ▼
Ingestion Function  (Cloud Function / lightweight Express service)
      │
      ├─ Verify webhook signature (X-Hub-Signature-256)
      ├─ Resolve sender → Users collection (auth check)
      ├─ Parse message → { department, priority, scheduledAt?, mediaRefs? }
      ├─ Store media (if any) → Cloud Storage
      └─ Write notice document → Firestore
      ▼
Firestore (source of truth)
      │  onSnapshot listeners (real-time, no polling)
      ▼
Display Web Clients (one per screen, department-scoped)
      ▼
LCD / Smart TV (fullscreen browser, kiosk mode)
```

## 2. Components

### 2.1 WhatsApp Layer (unchanged from original concept)
- Meta WhatsApp Business Cloud API.
- One CampusCast Business number for the whole institution (department is determined by routing logic, not by phone number, so one number scales to all departments).

### 2.2 Ingestion Service
**Recommendation: Firebase Cloud Functions (v2, Node.js) instead of a standalone Express server on Railway/Render.**
Rationale: the webhook is bursty and low-volume (a few dozen messages/day across a campus) — a persistent server is paying for idle time. Cloud Functions also removes a hop (no separate deploy target, same project as Firestore/Storage, same IAM boundary). Express/Node remains a valid fallback if the team wants a single codebase they can run locally without emulators, or if they later add a WebSocket/long-poll requirement functions don't fit well.

Responsibilities:
- **Signature verification** — reject anything not signed by Meta's app secret.
- **Auth check** — sender's WhatsApp number (E.164) looked up in `users`; if absent/suspended, log and drop silently.
- **Parsing** — first line / `DEPT:` prefix → department; `#urgent` → priority; `#schedule` block → scheduledAt; rest of body → content.
- **Media handling** — download from Meta's media endpoint (URLs expire fast), re-upload to Cloud Storage, store the permanent Storage path on the notice doc.
- **Write** — create the notice document in `notices/{noticeId}`; if `scheduledAt` is set and in the future, write with `status: "scheduled"` instead of `"active"`.
- **Reply** — send a WhatsApp confirmation/error message back via the Cloud API (fire-and-forget, doesn't block the write).

### 2.3 Scheduler
A scheduled Cloud Function (e.g. every 1 minute) promotes `status: "scheduled"` notices to `status: "active"` once `scheduledAt` has passed, and demotes `status: "active"` notices to `status: "expired"` once `expiresAt` has passed. Keeping this as a separate tick rather than client-side logic ensures expiry is enforced even if no display is currently connected.

### 2.4 Data Layer — Firestore

```
users/{userId}
  name: string
  phone: string          # E.164, unique
  role: "super_admin" | "hod" | "faculty"
  departments: string[]  # department ids this user can publish to
  status: "active" | "suspended"

departments/{deptId}
  name: string
  code: string            # e.g. "ECE"
  screens: string[]       # screen ids registered to this department

screens/{screenId}
  departmentId: string
  label: string            # e.g. "ECE Lab Corridor Display"
  lastSeenAt: timestamp    # heartbeat from display client

notices/{noticeId}
  departmentId: string
  content: string
  mediaUrl: string | null
  mediaType: "image" | "pdf" | null
  priority: "normal" | "urgent"
  status: "scheduled" | "active" | "expired" | "deleted"
  createdBy: userId
  createdAt: timestamp
  scheduledAt: timestamp | null
  expiresAt: timestamp | null

audit_log/{eventId}
  type: "publish" | "unauthorized_attempt" | "edit" | "delete"
  actorPhone: string
  detail: map
  timestamp: timestamp
```

Notes:
- `notices` is never hard-deleted — `status: "deleted"` + `audit_log` entry preserves history (FR15/FR16 in the PRD).
- Firestore security rules deny **all** client-side writes to `notices`, `users`, `departments` — only the Cloud Functions service account (using the Admin SDK, which bypasses rules) can write. Display clients and any future admin UI only ever read.

### 2.5 Display Client
- Next.js static-ish page per department (`/display/[deptId]`), deployed on Vercel.
- Subscribes to `notices` where `departmentId == deptId AND status == "active"`, ordered by priority then createdAt.
- Renders fullscreen, auto-rotates if more notices than fit on one screen.
- Heartbeat: writes `lastSeenAt` to its `screens` doc every 60s via a thin authenticated endpoint (not direct Firestore write) — lets Admins see which screens are offline.
- Reconnect handling: on listener error, keep last rendered state, show a small corner indicator, retry with backoff.

### 2.6 Admin Surface (new — not in the original concept)
A minimal authenticated web app (Firebase Auth) for Super Admins/HODs to:
- Add/suspend faculty numbers and assign departments.
- Register new screens and get their display URL.
- View audit log and unauthorized-attempt log.
- Manually edit/pull a notice (for the rare case a phone-based correction isn't practical).
This wasn't specified in the original document but is required to satisfy FR8/FR16 — without it, every roster change requires a database console, which won't scale past the first pilot department.

## 3. Technology Stack

| Layer | Choice | Notes |
|---|---|---|
| Messaging | WhatsApp Business Cloud API (Meta) | unchanged |
| Ingestion | Firebase Cloud Functions (Node.js/TypeScript) | replaces standalone Express server |
| Database | Firestore | unchanged |
| Media storage | Firebase Cloud Storage | unchanged, made explicit |
| Display frontend | Next.js + TypeScript + Tailwind | unchanged |
| Admin frontend | Next.js + TypeScript + Tailwind, Firebase Auth | new |
| Hosting (frontends) | Vercel | unchanged |
| Hosting (functions) | Firebase (Blaze plan) | replaces Railway/Render |
| Scheduling | Firebase Scheduled Functions (Cloud Scheduler) | new, formalizes "auto expiry"/"scheduled notice" features |

## 4. Security
- Webhook signature verification is mandatory, not optional — reject unsigned/mis-signed payloads with 403 before any parsing.
- Firestore rules: `allow read: if true` only on `notices` (active only, via a query the rules can validate) and `screens` (for heartbeat); everything else denied to client SDKs.
- Rate limiting: a sender who exceeds N messages/minute is throttled (protects against a compromised or misused faculty number spamming a display).
- Media content: images/PDFs are size-capped and MIME-type validated server-side before storage; no executable content is ever rendered.
- Secrets (Meta app secret, service account keys) live in Firebase/GCP secret manager, never in client bundles.

## 5. Scalability
- Firestore + Cloud Functions scale horizontally by default; the bottleneck at campus scale is Meta's API rate limits, not this stack.
- Multi-department, multi-screen is native to the data model (department is a first-class collection; screens reference it) — no architectural change needed to onboard a new department, only new documents.
- Multi-campus (future) would need a `campusId` partition added to every collection; deferred per PRD non-goals.

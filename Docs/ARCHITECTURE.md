# CampusCast — Architecture Document

## 1. High-Level Flow

```
Faculty WhatsApp
      │  (text / image / pdf)
      ▼
Meta WhatsApp Cloud API  ──────────────────────────────► (delivery receipts / confirmation replies)
      │  webhook (signed POST)
      ▼
Ingestion Function (Firebase Cloud Function v2)
      │
      ├─ Verify webhook signature (X-Hub-Signature-256)
      ├─ Resolve sender → Users collection (auth check; silent drop if unauthorized)
      ├─ Parse message → { departmentCode, priority, scheduledAt?, content }
      ├─ Store media (if present) → Firebase Cloud Storage
      └─ Write notice document → Firestore (via Admin SDK)
      ▼
Firestore (source of truth)
      │  onSnapshot listeners (real-time, zero polling)
      ▼
Display Web Clients (Next.js 14, department-scoped)
      ▼
LCD / Smart TV (Fullscreen Kiosk Mode)
```

---

## 2. Directory & Monorepo Structure

```
d:\Projects\CampusCast\
├── Docs/                           # Documentation (PRD, Architecture, Design, etc.)
│   ├── ABSTRACT.md
│   ├── ARCHITECTURE.md
│   ├── DESIGN.md
│   ├── MEMORY.md
│   ├── PHASE_PLAN.md
│   ├── PRD.md
│   └── RULES.md
├── packages/
│   └── shared/                     # Shared TypeScript interfaces & validators
│       └── src/
│           ├── types.ts            # User, Notice, Department, Screen, AuditLog
│           ├── parsing.ts          # WhatsApp message parser (#urgent, #schedule, DEPT:)
│           ├── parsing.test.ts     # Parser unit tests
│           └── index.ts
├── functions/                      # Firebase Cloud Functions (v2 Node.js / TypeScript)
│   ├── src/
│   │   ├── index.ts                # Function exports
│   │   ├── webhook.ts              # WhatsApp Webhook (X-Hub-Signature-256, ingestion)
│   │   ├── scheduler.ts            # Cron scheduler (promote scheduled -> active -> expired)
│   │   └── heartbeat.ts            # Display client heartbeat API endpoint
│   ├── package.json
│   └── tsconfig.json
├── apps/
│   ├── display/                    # Next.js 14 Display Web Client (Fullscreen Kiosk)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── page.tsx        # Department display selector directory
│   │   │   │   └── display/[deptId]/page.tsx # Department live notice feed
│   │   │   ├── components/         # Header, Footer, NoticeCard
│   │   │   └── lib/firebase.ts     # Firestore snapshot listener with reconnect handling
│   │   ├── package.json
│   │   └── tailwind.config.js      # Dark theme palette (#0B1220 background)
│   └── admin/                      # Next.js 14 Admin Web Portal
│       ├── src/
│       │   └── app/page.tsx        # Roster, Screens, Notices, Security Audit tabs
│       └── package.json
├── firebase.json                   # Firebase configuration (Functions, Firestore, Storage, Hosting)
├── firestore.rules                 # Strict security rules (Deny ALL client-side writes)
├── storage.rules                  # Storage rules for media assets
└── package.json                    # Workspace root scripts & npm workspaces setup
```

---

## 3. Core Components

### 3.1 WhatsApp Layer
- Meta WhatsApp Business Cloud API.
- Single CampusCast Business phone number serving all departments institution-wide.

### 3.2 Ingestion Cloud Function (`functions/src/webhook.ts`)
- **Signature verification**: Validates `X-Hub-Signature-256` header against Meta app secret.
- **Authorization check**: Sender's E.164 phone number looked up in `users` collection.
  - If absent or suspended: Logged to `audit_log` with `type: 'unauthorized_attempt'` and dropped silently (no reply sent).
- **Parsing**: Resolves `#urgent` priority, `#schedule` dates, and `DEPT:` prefix or single assigned home department.
- **Write**: Creates notice document in `notices/{noticeId}` via Firebase Admin SDK.
- **Reply**: Sends WhatsApp confirmation or error reply via Meta Graph API.

### 3.3 Scheduler Cloud Function (`functions/src/scheduler.ts`)
Runs every 1 minute via Cloud Scheduler:
- Promotes `status: "scheduled"` notices to `"active"` once `scheduledAt <= now`.
- Demotes `status: "active"` notices to `"expired"` once `expiresAt <= now`.

### 3.4 Data Layer — Firestore Collections

```
users/{userId}
  name: string
  phone: string          # E.164 format (+91...), unique
  role: "super_admin" | "hod" | "faculty"
  departments: string[]  # Department codes this user can publish to
  status: "active" | "suspended"

departments/{deptId}
  name: string
  code: string            # e.g. "ECE", "CSE"
  screens: string[]       # Registered screen IDs

screens/{screenId}
  departmentId: string
  label: string            # e.g. "ECE Main Hallway Screen"
  lastSeenAt: number       # Heartbeat timestamp in ms

notices/{noticeId}
  departmentId: string
  content: string
  mediaUrl: string | null
  mediaType: "image" | "pdf" | null
  priority: "normal" | "urgent"
  status: "scheduled" | "active" | "expired" | "deleted"
  createdBy: string        # Sender phone or user ID
  createdAt: number        # Server epoch ms — see note below
  scheduledAt: number | null
  expiresAt: number | null

audit_log/{eventId}
  type: "publish" | "unauthorized_attempt" | "edit" | "delete"
  actorPhone: string
  detail: map
  timestamp: number         # Server epoch ms — see note below
```

**Timestamp rule [HARD]:** every `number`-typed timestamp above is set **inside a Cloud Function** using `Date.now()` (or `admin.firestore.Timestamp.now().toMillis()`) at write time — never accepted from a client, from Meta's payload, or from any value a WhatsApp message could influence. `scheduledAt` is the one exception: it's *parsed* from the faculty member's `#schedule` message, but it's still validated and normalized server-side (rejecting past-dated or malformed values with an error reply) before being stored. This matters because `scheduledNoticeManager` compares `scheduledAt <= now` and `expiresAt <= now` against its own server clock — if any of these fields were ever set by a source outside the Functions runtime, clock drift or a spoofed value could cause a notice to promote/expire at the wrong time.

---

## 4. Technology Stack

| Layer | Choice | Notes |
|---|---|---|
| Messaging | WhatsApp Business Cloud API (Meta) | Institutional channel |
| Ingestion | Firebase Cloud Functions (v2 Node.js / TypeScript) | Event-driven serverless |
| Database | Firestore | Real-time source of truth |
| Media Storage | Firebase Cloud Storage | Uploaded via Cloud Functions |
| Display Client | Next.js 14 + React 18 + Tailwind CSS | Hallway display app |
| Admin Portal | Next.js 14 + React 18 + Tailwind CSS | Roster & telemetry dashboard |
| Security | Firestore Rules (`allow write: if false;`) | Zero client-side writes |

---

## 5. Security & Scalability
- **Webhook Signature Validation**: Mandatory `X-Hub-Signature-256` HMAC check on every request.
- **Strict Firestore Rules**: All writes strictly disallowed from client SDKs (`allow write: if false`).
- **Silent Drop**: Prevents phone number probing by remaining silent to unauthorized senders.
- **Horizontal Scale**: Serverless functions and Firestore real-time listeners scale automatically with institution demand.

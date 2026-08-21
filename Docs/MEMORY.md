# CampusCast — Project Memory

Persistent context for human developers and AI agents working on CampusCast. Read this before touching the codebase. Update it whenever progress is made or a decision changes so the AI retains complete context without re-analyzing the workspace.

---

## 1. What This Project Is
CampusCast turns WhatsApp into the publishing interface for a real-time, department-scoped digital notice board network. 
- Faculty send a WhatsApp message → Meta Cloud API triggers `whatsappWebhook` Cloud Function.
- Function validates HMAC signature (`X-Hub-Signature-256`), authorizes sender phone against `users`, parses tags (`#urgent`, `#schedule`, `DEPT:`), and writes notice to Firestore (`notices`).
- Department LCD screens (`apps/display`) subscribe to Firestore live listeners (`onSnapshot`) and display notices instantaneously.
- Admins manage faculty roster, screen telemetry, and audit logs via `apps/admin`.

---

## 2. Implementation Progress & Current Status (August 2026)

### Scaffolding & Shared Core (`packages/shared`)
- [x] Monorepo workspace initialized (`packages/shared`, `functions`, `apps/display`, `apps/admin`).
- [x] TypeScript interfaces defined for `User`, `Department`, `Screen`, `Notice`, `AuditLog`, `ParsedNoticeMessage` ([`types.ts`](file:///d:/Projects/CampusCast/packages/shared/src/types.ts)).
- [x] WhatsApp message parser implemented for `#urgent`, `#schedule`, and `DEPT:` prefixes ([`parsing.ts`](file:///d:/Projects/CampusCast/packages/shared/src/parsing.ts)).
- [x] Unit test suite covering parser edge cases ([`parsing.test.ts`](file:///d:/Projects/CampusCast/packages/shared/src/parsing.test.ts)).

### Database & Storage Security Rules
- [x] `firestore.rules` deployed: **Strict zero client-side writes** (`allow write: if false;`). All writes go strictly through Firebase Admin SDK in Cloud Functions.
- [x] `storage.rules` deployed: Public read for notice media attachments, zero client-side uploads.

### Backend Cloud Functions (`functions`)
- [x] `whatsappWebhook`: HTTPS function for Meta GET verification and POST ingestion.
  - HMAC SHA-256 signature verification.
  - Phone authorization lookup.
  - Silent drop + `audit_log` record for unauthorized senders (no WhatsApp reply sent).
  - Notice doc creation in Firestore + audit logging.
  - WhatsApp confirmation reply dispatch.
- [x] `scheduledNoticeManager`: Cron ticker function running every 1 minute promoting `scheduled` -> `active` and demoting `active` -> `expired`.
- [x] `screenHeartbeat`: Telemetry API endpoint updating `screens/{screenId}.lastSeenAt`.

### Frontends (`apps/display` & `apps/admin`)
- [x] `apps/display`: Next.js 14 hallway display app (`/display/[deptId]`).
  - 1080p hallway layout, Inter font, custom dark theme (`#0B1220` background).
  - Urgent notice red border cards (`#E5484D`) with pulse glow animation.
  - Offline resilience: Keeps last-rendered state, shows `🟡 Reconnecting...` footer dot on connection drop.
  - Auto-scroll / card pagination every 8 seconds for multi-notice overflow.
- [x] `apps/admin`: Next.js 14 management dashboard (`/`).
  - Roster Tab: Add authorized faculty numbers, set department scope, toggle active/suspended status.
  - Screens Tab: Display screen registry and real-time heartbeat status.
  - Notice Control Tab: Search history and force-expire notices.
  - Security Audit Tab: Immutable record of publications and blocked unauthorized attempts.

---

## 3. Key Decisions Locked In (Non-Negotiable)
1. **Identity = Phone Number**: No password/login system for faculty. Their WhatsApp number is their verified credential.
2. **Backend-Only Writes**: Display & Admin clients ONLY read. All writes go through Cloud Functions using the Admin SDK.
3. **Silent Drop for Unauthorized Senders**: Unauthorized senders are logged to `audit_log` and dropped without replying, preventing phone probing.
4. **Dark Theme Displays**: Designed for hallway glare reduction, eye strain, and OLED power efficiency (`#0B1220` background, `#141C2E` cards).
5. **Offline Resilience**: Display clients never go blank or render full-screen errors on connection loss; they retain last-known-good state.

---

## 4. Repository Directory Structure
```
CampusCast/
├── Docs/
│   ├── ABSTRACT.md
│   ├── ARCHITECTURE.md
│   ├── DESIGN.md
│   ├── MEMORY.md
│   ├── PHASE_PLAN.md
│   ├── PRD.md
│   └── RULES.md
├── packages/
│   └── shared/               # Shared TypeScript types, parser & unit tests
├── functions/                # Firebase Cloud Functions (webhook, scheduler, heartbeat)
├── apps/
│   ├── display/              # Next.js 14 display web client
│   └── admin/                # Next.js 14 admin management portal
├── firestore.rules           # Firestore security rules (deny client writes)
├── storage.rules             # Storage security rules
├── firebase.json             # Firebase emulator & deployment config
└── package.json              # Monorepo root package.json
```

---

## 5. Decision Log
| Date | Decision | Why |
|---|---|---|
| 2026-08-21 | Replaced standalone Express/Railway backend with Firebase Cloud Functions | Cost + infra simplicity for low, bursty traffic |
| 2026-08-21 | Added Admin web app as a defined surface | Roster/screen management can't live in a DB console past pilot |
| 2026-08-21 | Added role hierarchy: Super Admin / HOD / Faculty | Original Admin/Faculty split had no conflict-resolution path |
| 2026-08-21 | Bootstrapped workspace, shared types, functions, display, admin apps | Complete end-to-end foundation setup |

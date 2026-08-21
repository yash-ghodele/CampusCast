# CampusCast — Development Rules & Constraints

Conventions and non-negotiable boundaries for developers and AI coding assistants working in this repository. Rules marked **[HARD]** must never be violated.

---

## 1. Security & Authorization Rules
- **[HARD]** **No Client-Side Writes**: Display clients and Admin web apps ONLY read from Firestore. All writes (create, update, delete, audit) must execute through Cloud Functions using the Firebase Admin SDK.
- **[HARD]** **Webhook Signature Verification**: Every inbound Meta webhook request must be signature-verified (`X-Hub-Signature-256`) against the app secret before processing. Invalid signatures MUST return 403 Forbidden.
- **[HARD]** **Silent Drop for Unauthorized Senders**: Unauthorized or suspended senders are logged to `audit_log` with `type: 'unauthorized_attempt'` and silently dropped. Never send an error reply to unauthorized numbers.
- **[HARD]** **Secrets Management**: WhatsApp access tokens, app secrets, and service accounts live strictly in environment secrets (`process.env`), never committed to source control or exposed in client bundles.

---

## 2. Parsing & Messaging Rules
- **Forgiving Parser**: Parsing must forgive spacing, casing, and tag order.
- **Supported Tags in v1**: `#urgent`, `#schedule`, and `DEPT:` prefix. Do not add ad-hoc undocumented parsing tags.
- **Department Ambiguity**: If a multi-department faculty member sends a message without a department tag, reply asking for department clarification.

---

## 3. Display Client Rules
- **[HARD]** **Never Go Blank**: On connection failure or listener drop, display clients MUST retain last-known-good rendered state and show a `🟡 Reconnecting...` indicator. Never render full-page error screens.
- **No Client Expiry Timers**: Expiry and scheduling are managed strictly backend-side by `scheduledNoticeManager`. Displays only render notices where `status: "active"`.
- **Hallway Legibility**: Body typography must maintain minimum 28px font size at 1080p reference screen layout.

---

## 4. Code & Architecture Rules
- **TypeScript Strict Mode**: Shared types live in `packages/shared/src/types.ts`. Never duplicate type definitions across packages.
- **Git Commits**: Use semantic commit formatting: `<component>: <description>` (e.g. `functions: verify webhook signature before processing`).

## 5. Content Moderation
- **Out of scope for v1.** The trust model is "only a verified, registered phone number can publish" — not "content is automatically screened." Media is still size/MIME-validated and no executable content is ever rendered (see §1), but there is no profanity, harassment, or misuse filtering on message text or images.
- If this changes, it needs a `PRD.md` update first, not a quiet addition inside `webhook.ts`. The reason to gate it behind a PRD change: filtering has false-positive/false-negative tradeoffs and a review/appeal path that affect faculty trust in the system — that's a product decision, not an implementation detail.

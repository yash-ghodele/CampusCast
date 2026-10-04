# CampusCast — Technical Architecture & Schemas

This document details the system architecture, sequence flows, infrastructure layer mapping, and NoSQL Firestore document schemas for CampusCast.

---

## 1. System Sequence Diagrams

### 1.1 Inbound WhatsApp Webhook & Display Sync Flow

```mermaid
sequenceDiagram
    autonumber
    actor Faculty as Authorized Faculty Member (WhatsApp)
    participant Meta as Meta WhatsApp Cloud API
    participant Webhook as Cloud Function (whatsappWebhook)
    participant DB as Cloud Firestore (NoSQL)
    participant Cron as Cloud Function (scheduledNoticeManager)
    participant Display as Display App (display/)
    participant Admin as Admin Command Center (admin/)

    Faculty->>Meta: Send WhatsApp message (e.g. "#urgent #exam ECE: Midterm exam on Monday")
    Meta->>Webhook: Inbound Webhook POST (signed with X-Hub-Signature-256)
    
    rect rgb(20, 30, 50)
        Note over Webhook: 1. HMAC SHA-256 Signature Verification<br/>2. Phone Auth Lookup in `users`<br/>3. Parse Tags (#urgent, #exam, #schedule, DEPT:)
    end

    alt Sender is Unauthorized
        Webhook->>DB: Add document to `audit_log` (type: unauthorized_attempt)
        Note over Webhook: Silent Drop (No WhatsApp reply sent)
    else Sender is Authorized
        Webhook->>DB: Add document to `notices` (status: active/scheduled)
        Webhook->>DB: Add document to `audit_log` (type: publish)
        Webhook-->>Meta: Outbound POST to Graph API ("✅ Posted to ECE")
        Meta-->>Faculty: Deliver WhatsApp Confirmation Reply
    end

    loop Firestore Realtime Stream (onSnapshot)
        DB-->>Display: Push active notice collection updates
        Display->>Display: Render Mode 1 Hero notice card or Mode 3 Emergency Override
    end

    loop Every 1 Minute Cron Ticker
        Cron->>DB: Promote scheduled notices (scheduledAt <= now) -> active
        Cron->>DB: Expire old active notices (expiresAt <= now) -> expired
    end

    Admin->>DB: Read Roster, Screen telemetry, Notice history, & Audit logs
```

---

## 2. Infrastructure Layer Mapping (Zero External Hardware Model)

| Layer | Technology | Operational Function |
|---|---|---|
| **Messaging Ingestion** | Meta WhatsApp Business Cloud API | Webhook payload delivery; outbound confirmation replies. |
| **Serverless Compute** | Firebase Cloud Functions (v2 Node.js) | HMAC SHA-256 validation, phone auth lookup, tag parsing, DB writes. |
| **Billing Plan** | Firebase Blaze Plan (Pay-as-you-go) | Unlocks outbound HTTPS calls to Meta Graph API (`graph.facebook.com`). |
| **Database** | Cloud Firestore (NoSQL) | Notice document storage with native `onSnapshot` streaming listeners. |
| **Frontend Hosting** | Cloudflare Pages | Hosts Next.js 14 display kiosk ([`display/`](file:///d:/Projects/CampusCast/display)) & admin portal ([`admin/`](file:///d:/Projects/CampusCast/admin)). |
| **Display Client** | Smart TV Built-in Web Browser | Direct browser access (`http://<ip>:3000/display?dept=ECE`). **No Pi or Mini-PC required.** |

---

## 3. NoSQL Firestore Schema Specifications

Defined in shared TypeScript contracts at [`packages/shared/src/types.ts`](file:///d:/Projects/CampusCast/packages/shared/src/types.ts).

### Collection: `users/{userId}`
```typescript
interface User {
  id: string;
  name: string;
  phone: string;         // E.164 format e.g. "+919876543210" (Primary Identity)
  role: 'super_admin' | 'hod' | 'faculty';
  departments: string[]; // e.g. ["ECE", "CSE"]
  status: 'active' | 'suspended';
}
```

### Collection: `departments/{deptId}`
```typescript
interface Department {
  id: string;
  name: string;          // e.g. "Electronics & Communication Engineering"
  code: string;          // e.g. "ECE"
  screens: string[];     // Array of registered screen IDs
}
```

### Collection: `screens/{screenId}`
```typescript
interface Screen {
  id: string;
  departmentId: string;  // Foreign key linking screen to department scope
  label: string;         // Human-readable location e.g. "ECE Corridor Smart TV"
  lastSeenAt: number | null; // UNIX timestamp in ms (Updated by heartbeat)
}
```

### Collection: `notices/{noticeId}`
```typescript
type NoticeCategory = 'announcement' | 'event' | 'placement' | 'exam' | 'emergency' | 'achievement';
type NoticePriority = 'normal' | 'urgent';
type NoticeStatus = 'scheduled' | 'active' | 'expired' | 'deleted';

interface Notice {
  id: string;
  departmentId: string;  // Target department code e.g. "ECE" or "ALL"
  title?: string;        // Headline title
  category?: NoticeCategory; // Notice category
  content: string;       // Body text content
  eventDate?: string;    // Formatted event date string e.g. "05 Oct 2026"
  eventTime?: string;    // Formatted event time string e.g. "10:00 AM"
  qrCodeUrl?: string;    // Target QR code link for WhatsApp view
  mediaUrl: string | null;
  mediaType: 'image' | 'pdf' | null;
  priority: NoticePriority; // 'urgent' triggers red alert styling
  status: NoticeStatus;
  createdBy: string;     // Sender phone number or admin identity
  createdAt: number;     // UNIX timestamp in ms
  scheduledAt: number | null;
  expiresAt: number | null;
}
```

### Collection: `audit_log/{logId}`
```typescript
interface AuditLog {
  id: string;
  type: 'publish' | 'unauthorized_attempt' | 'edit' | 'delete' | 'emergency_broadcast';
  actorPhone: string;
  detail: Record<string, any>;
  timestamp: number;
}
```

---

## 4. Security Rules & Data Mutability Invariants

- **Write Operations**: Controlled via [`firestore.rules`](file:///d:/Projects/CampusCast/firestore.rules). In production, notice creation, deletion, and screen telemetry heartbeats write directly to Cloud Firestore (`notices`, `screens`, `audit_log`) and via Cloud Functions (`functions/src/webhook.ts`, `functions/src/heartbeat.ts`).
- **Read Operations**:
  - `notices`: Streamed in real-time via `onSnapshot` queries filtered by department scope (`where('departmentId', 'in', [deptCode, 'ALL'])`).
  - `screens`: Hardware display telemetry updated every 30s and monitored live on the Admin Screen Wall.
  - `departments`: Publicly readable for scope registries and theme tokens.
  - `users` & `audit_log`: Faculty identity roster and compliance action ledger.
- **Offline Fallback Sync**: Display kiosks implement dual-sync persistence (`localStorage` fallback cache + live Firestore WebSocket) ensuring uninterrupted screen rotation during temporary campus Wi-Fi outages.

---

## 5. Smart TV Corridor Display Modes Specification

The CampusCast Smart TV Kiosk client dynamically adapts its viewport layout based on active notice payloads, priority levels, and department scope:

| Display Mode | Mode Key | Architecture & Rendering Pipeline | Trigger Conditions |
| :--- | :--- | :--- | :--- |
| **Adaptive Smart Blocks** | `auto` *(Default)* | Partitions notices by media type into optimal multi-column blocks: visual posters (images/PDFs) on prominent cards and structured text bulletins in side columns. | Default presentation mode on department corridor kiosks (`/display/[deptId]`). |
| **Hero View** | `hero` *(Mode 1)* | Fullscreen spotlight view rendering high-impact headline typography, category badges, event dates, and QR codes with a 10-second auto-carousel. | Single notice emphasis or low-density publishing periods. |
| **News Ticker Marquee** | `news_ticker` *(Mode 2)* | 48px fixed bottom banner running an infinite CSS marquee loop with live notice counter and connectivity indicator. | Continuously running across all corridor displays. |
| **Emergency Override** | `emergency` *(Mode 3)* | Fullscreen high-visibility red alert mode taking immediate priority over all normal displays with pulse animation and audio cue support. | Triggered by PIN-authorized admin broadcast or `priority: 'urgent'` notices. |
| **Split Screen View** | `split` *(Mode 5)* | Dual-pane layout rendering visual media posters on the left viewport (55% width) and structured bulleted notice text on the right (45% width). | Activated for mixed multimedia payloads with long descriptive text. |
| **All Screens Matrix View** | `ALL` scope | Multi-screen 6-tile grid (`ECE`, `CSE`, `AIML`, `MECH`, `CIVIL`, `EEE`) showing real-time active notice streams and hardware telemetry. | Rendered on central campus directory screens (`/display` or `/display/all`). |

---

## 6. Admin Command Center Architecture & Management Pipeline

The CampusCast Admin Command Center ([`apps/admin`](file:///d:/Projects/CampusCast/admin)) provides comprehensive operational control over digital hallway displays and campus notice lifecycles:

### 6.1 In-Place Notice Editing & Lifecycle Management
- **Full In-Place Editing Modal**: Allows administrators to modify any Active, Scheduled, or Archived notice without creating duplicate entries.
- **Editable Metadata**: Headline Title, Full Body Content, Target Department Scope (`ALL`, `ECE`, `CSE`, `AIML`, `MECH`, `CIVIL`, `EEE`), Category (`announcement`, `exam`, `placement`, `event`, `achievement`, `emergency`), Media Attachment URLs (with auto-detection), Priority (`normal`, `urgent`), Broadcast Status (`active`, `scheduled`, `expired`), and Event Date/Time.
- **Audit Logging**: Every edit automatically writes an immutable audit record to Firestore `audit_log` (`type: 'edit'`) capturing the actor, timestamp, and modification payload.

### 6.2 Multi-Criteria Notice Filtering System
- **Department Scope Selector**: Instant scope filtering across all 6 departments and institution-wide broadcasts.
- **Category Filter Pills**: Filter by notice type (`Announcement`, `Exam`, `Placement`, `Event`, `Achievement`, `Emergency`).
- **Media Attachment Selector**: Filter notices by media capability (`All Media`, `With Image`, `With PDF`, `Text Only`).
- **Real-time Query Search**: Sub-string search across titles, descriptions, sender identities, and department scopes with a one-click **Reset** control.
- **Dual-View Support**: Full filtering parity across both visual **Kanban Columns** and structured **Table List Views**.

### 6.3 Hardware Telemetry & Screen Wall
- **Live Stream Listeners**: Real-time Firestore `screens` collection subscriptions rendering live connection statuses and uptime clocks.
- **Continuous Heartbeat Engine**: 20-second telemetry polling maintains active `Online` status indicators across all registered hallway displays.
- **Emergency Broadcast Override**: PIN-protected modal (`PIN: 1234`) triggers an immediate high-visibility red banner across all corridor screens with zero latency.




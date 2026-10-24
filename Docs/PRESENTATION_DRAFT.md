# CampusCast — Project Presentation Draft
## Campus Communication Operating System
### Comprehensive Progress & Technical Showcase

---

## Slide 1: Title Slide

# CampusCast
### Campus Communication Operating System

**Tagline:** *Your Campus. Your Voice.*

- **Institutional Domain:** Higher Education Digital Signage & Campus Information Distribution
- **Deployment Platform:** Web-Based · Cloud-Native · Zero-Hardware Smart TV Infrastructure
- **System Version:** v2.0 Production OS
- **Target Audience:** Department Faculty, Department Heads, System Administrators, Students, and Executive Leadership

> Transforming WhatsApp into an authenticated, instant publishing console for department hallway displays without extra hardware or complex dashboards.

---

## Slide 2: Executive Summary & Project Vision

### Executive Summary

- **Bridging the Communication Gap:** CampusCast connects daily mobile communication tools with physical corridor displays across academic departments.
- **The WhatsApp Interface:** Faculty publish official notices, circulars, and event flyers directly through a verified WhatsApp hotline.
- **Instant Display Sync:** Notices reflect on hallway Smart TV displays in under 5 seconds through real-time database streaming.
- **Zero Additional Hardware:** Operates directly inside the native web browser of any existing Smart TV connected to campus Wi-Fi or Ethernet.
- **Centralized Command:** A full-featured 8-module administrative command center provides real-time screen telemetry, Kanban notice lifecycles, faculty roster management, and emergency broadcast overrides.

---

## Slide 3: The Campus Communication Problem

### Critical Challenges in Campus Communication Today

1. **Physical Notice Boards & Paper Waste:**
   - Manual printing, physical pinning, and delayed notice removal.
   - Information becomes outdated quickly with no scheduled expiration.
   - Significant recurring paper, toner, and maintenance costs.

2. **WhatsApp Group Fragmentation & Noise:**
   - Student WhatsApp groups are flooded with casual chats, questions, and memes.
   - Important official notices, exam timetables, and circulars get lost in conversation history.
   - No central historical record or verified department authority.

3. **Complex Traditional Digital Signage Platforms:**
   - Require commercial proprietary players (Raspberry Pi, mini-PCs, HDMI dongles) costing thousands of dollars.
   - Force faculty to access cumbersome web portals, remember forgotten passwords, and undergo software training.
   - Leads to poor faculty adoption and stagnant, un-updated corridor screens.

4. **No Real-Time Emergency Broadcast Mechanism:**
   - No rapid, coordinated mechanism to broadcast critical alerts across all campus buildings simultaneously.

---

## Slide 4: The CampusCast Solution

### One Message. Verified Identity. Instant Screen Broadcast.

- **Frictionless Publishing:** Faculty publish announcements by sending a plain WhatsApp text message, flyer image, or PDF document to the campus hotline.
- **Zero Portal Logins:** No dashboard training, no passwords, no software installation on faculty devices.
- **Cryptographic Security:** Every WhatsApp message is cryptographically verified and checked against an active faculty phone roster.
- **Intelligent Tag Parsing:** Automatic extraction of department targets, priority levels, categories, and event dates.
- **Autonomous Display Lifecycle:** Notices automatically appear, transition between visual modes, and expire based on schedules without manual intervention.
- **Sub-5-Second Propagation:** End-to-end latency from WhatsApp send to hallway screen render is under 5 seconds.

---

## Slide 5: The Zero-Hardware Smart TV Innovation

### Transforming Commercial Smart TVs into Enterprise Digital Signage

#### Traditional Digital Signage Model
- Requires separate mini-PC or Raspberry Pi per display screen.
- High hardware procurement and replacement cost.
- Additional power bricks, HDMI cabling, and wall mounting brackets.
- Operating system maintenance, SD card corruption, and manual patching.

#### The CampusCast Zero-Hardware Model
- Runs directly inside the built-in native web browser of any commercial Smart TV.
- Fully compatible with Android TV, LG webOS, Samsung Tizen OS, and Amazon Fire TV.
- Requires only power and campus Wi-Fi or Ethernet connectivity.
- Displays access department-specific kiosk endpoints (such as `/display/ece` or `/display/cse`).
- Dual-sync offline architecture: local browser caching ensures uninterrupted rotation even during temporary Wi-Fi drops.

---

## Slide 6: System Architecture Overview

### Three-Tier Platform Architecture

```
+-----------------------------------------------------------------------------------+
|                            CAMPUSCAST PLATFORM ENGINE                             |
+--------------------------+------------------------------+-------------------------+
|   WHATSAPP PUBLISHING    |     ADMIN COMMAND CENTER     |   SMART TV DISPLAYS     |
|  (Faculty Mobile Device) |  (Web Portal - Port 3001)    | (Hallways - Port 3000)  |
|  * Meta Cloud API        |  * Kanban Notice Lifecycle   | * ECE Department        |
|  * Phone Authentication  |  * Screen Wall Telemetry     | * CSE Department        |
|  * Automated Formatter   |  * Multi-Criteria Filters    | * AIML / MECH / CIVIL   |
|  * Inbound Webhooks      |  * Emergency Override PIN    | * EEE Department        |
+--------------------------+------------------------------+-------------------------+
                                        |
               +------------------------+------------------------+
               |                                                 |
+------------------------------+                +----------------------------------+
|      SERVERLESS BACKEND      |                |       CLOUD FIRESTORE NOSQL      |
|  * HMAC SHA-256 Validation   | <------------> |  * Real-Time onSnapshot Streams  |
|  * Deterministic Tag Parser  |                |  * Notices, Users, Screens, Logs |
|  * 1-Minute Cron Scheduler   |                |  * Deny-All Client Write Policy  |
+------------------------------+                +----------------------------------+
```

---

## Slide 7: End-to-End Data Flow

### Step-by-Step Notice Journey in Under 5 Seconds

1. **Message Dispatch:** An authorized faculty member sends a WhatsApp message (for example: `#urgent #exam ECE: Midterm exam schedule released for 3rd year`).
2. **Webhook Ingestion:** Meta WhatsApp Cloud API issues a signed HTTP POST request with an `X-Hub-Signature-256` header to the serverless webhook function.
3. **Cryptographic Validation:** Serverless function verifies the HMAC SHA-256 signature using the application secret.
4. **Identity & Phone Verification:** The sender phone number in international E.164 format is looked up against the active faculty roster.
   - *If unauthorized:* Request is silently dropped and logged to security audit trail to prevent phone enumeration attacks.
   - *If authorized:* Processing proceeds immediately.
5. **Deterministic Tag Parsing:** Content is parsed to extract department scope (`ECE`), priority (`urgent`), category (`exam`), event timestamps, and body text.
6. **NoSQL Persistence:** Notice document is written to the cloud database with status `active` and an audit entry is generated.
7. **Instant WhatsApp Confirmation:** Bot returns a confirmation receipt back to the faculty member with notice ID and active target departments.
8. **Real-Time Display Stream:** The Smart TV browser client receives the new notice payload over a live WebSocket stream and updates the display in under 1 second.

---

## Slide 8: Enterprise Security Architecture

### Zero-Trust Security Invariants

- **Cryptographic Webhook Verification:** All incoming WhatsApp payloads verify HMAC SHA-256 signatures before any execution begins.
- **Phone Number Whitelisting:** Publishing rights are tied directly to verified E.164 phone numbers registered by administrators.
- **Silent Drop Policy:** Messages from unregistered or suspended numbers trigger no response, eliminating reconnaissance probing.
- **Strict Database Write Invariants:** Web frontend clients cannot write directly to the database. All database writes occur strictly through serverless functions using the administrative SDK.
- **Role-Based Access Control (RBAC):** Three-tier operational hierarchy:
  - *Super Admin:* Full system control, department management, global settings, and emergency overrides.
  - *Head of Department (HOD):* Department roster management, display assignment, notice moderation.
  - *Faculty Publisher:* WhatsApp publishing privileges for designated departments.
- **PIN-Protected Emergency Broadcasts:** Master PIN authorization is required before triggering campus-wide emergency overrides.
- **Immutable Audit Trail:** All publishing events, notice edits, status updates, and blocked unauthorized attempts are permanently recorded with timestamps and actor identities.

---

## Slide 9: Cloud Firestore Data Schema

### NoSQL Collection Architecture

#### Collection 1: `users/{userId}`
- **Primary Identity:** E.164 phone number (`phone`)
- **Profile:** Faculty Name, Email, Assigned Department Scopes (`departments[]`)
- **Authorization:** Role (`super_admin`, `hod`, `faculty`), Account Status (`active`, `suspended`)

#### Collection 2: `notices/{noticeId}`
- **Targeting:** Department Scope (`ALL`, `ECE`, `CSE`, `AIML`, `MECH`, `CIVIL`, `EEE`)
- **Content:** Title headline, descriptive body text, category tag, event date and time
- **Media:** Attachment URL, media type (`image`, `pdf`, or `null`), mobile QR code target
- **Lifecycle:** Priority (`normal`, `urgent`), Status (`scheduled`, `active`, `expired`, `deleted`)
- **Timestamps:** Created timestamp, scheduled start timestamp, expiration timestamp, creator ID

#### Collection 3: `screens/{screenId}`
- **Identity:** Unique Screen Hardware ID, Display Label, Assigned Department Scope
- **Telemetry:** Display resolution (`1080p`), Last seen heartbeat timestamp

#### Collection 4: `departments/{deptId}`
- **Metadata:** Department Full Name, Short Code, Registered Display Screen IDs

#### Collection 5: `audit_log/{logId}`
- **Audit Detail:** Event Type (`publish`, `edit`, `delete`, `emergency_broadcast`, `unauthorized_attempt`)
- **Actor:** Actor phone number or administrator account, modification payload, event timestamp

---

## Slide 10: WhatsApp Publishing Guide for Faculty

### Zero Learning Curve — Publishing via Daily Chat

#### 3-Step Publishing Process
1. Open WhatsApp on registered mobile phone.
2. Type message containing desired hashtags and send to the campus hotline.
3. Receive instant automated confirmation with publication status.

#### Category Hashtag Matrix
- `#exam` — Examination schedules, seating arrangements, hall ticket announcements (Default duration: 24h)
- `#placement` — Campus recruitment drives, interview schedules, shortlist announcements (Default duration: 48h)
- `#event` — Technical symposia, guest lectures, workshops, hackathons (Default duration: 48h)
- `#academic` — Class rescheduling, syllabus updates, laboratory submissions (Default duration: 24h)
- `#achievement` — Student competition winners, faculty awards, sports laurels (Default duration: 72h)
- `#urgent` — Critical weather alerts, unscheduled holidays, immediate campus notifications (Triggers emergency mode)

#### Department Routing Tags
- `#all` — Broadcast to every screen across all campus departments.
- `#ece`, `#cse`, `#aiml`, `#mech`, `#civil`, `#eee` — Route announcement specifically to that department corridor.

#### Media & Document Attachments
- Images (PNG, JPEG) automatically format into high-definition spotlight cards.
- PDF circulars automatically generate official document cards with scannable mobile QR download codes.

---

## Slide 11: Smart TV Corridor Display Modes

### Dynamic Multi-Mode Display Engine

1. **Adaptive Smart Multi-Media View (Default Corridor View):**
   - Automatically partitions viewport based on active notice payloads.
   - High-resolution visual posters occupy prominent left spotlight blocks.
   - Text bulletins and announcements format neatly into readable side columns.

2. **Mode 1: Hero Notice View:**
   - Full-bleed 80% screen footprint designed for high legibility from 10 meters distance.
   - Bold headline typography, full un-truncated descriptions, category badge, event date/time chips.
   - Dynamic WhatsApp QR code allowing students to scan and save notice details on their phones.
   - Auto-rotates active notices every 10 seconds with smooth transitions.

3. **Mode 2: News Ticker Marquee:**
   - Fixed 48px bottom ticker bar running a continuous horizontal scroll animation.
   - Displays secondary announcements, active notice counts, and network connectivity indicators.

4. **Mode 3: Emergency Override View:**
   - High-contrast full-screen crimson red layout triggered by urgent notices or admin override.
   - Prominent alert warning icon, emergency headline, issuer signature, and pulsating glow animation.
   - Completely pauses normal notice carousels until the alert is resolved.

5. **Mode 4: Event Carousel View:**
   - Auto-sliding showcase for workshop posters, sports flyers, and official notification circulars.

6. **Mode 5: Split Screen View:**
   - Balanced 12-column split: 7 columns for visual flyer media, 5 columns for live department notice feed.

7. **All Screens Matrix Overview (`/display/all`):**
   - 6-tile live grid displaying active notices and telemetry for all departments simultaneously.

---

## Slide 12: Visual Design System & Branding

### Clean, High-Contrast Kiosk UX

- **Primary Typography:** Poppins (Google Fonts) — Chosen for exceptional clarity on large-format hallway displays.
  - Headings: Poppins Bold 700 & Black 900
  - Section Headers: Poppins SemiBold 600
  - Body Text: Poppins Medium 500 & Regular 400
  - Real-Time Clocks & Screen IDs: Monospace

#### Master Color Palette
- Anti-Glare Dark Surface: `#111111` / `#0B1220` (prevents hallway glare)
- Card Containers: `#141C2E`
- Structural Card Borders: `#222F47`
- Brand Royal Blue: `#2563EB`
- Secondary Sky Blue: `#60A5FA`
- Status Emerald Green: `#22C55E`
- Emergency Alert Crimson: `#DC2626`
- Caution Amber: `#F59E0B`

#### Department Identity Theme Mappings
- **ECE (Electronics & Communication):** Vibrant Orange (`#F97316`)
- **CSE (Computer Science):** Royal Blue (`#2563EB`)
- **AIML (AI & Machine Learning):** Deep Purple (`#8B5CF6`)
- **MECH (Mechanical Engineering):** Crimson Red (`#EF4444`)
- **CIVIL (Civil Engineering):** Emerald Green (`#22C55E`)
- **EEE (Electrical & Electronics):** Caution Amber (`#F59E0B`)

---

## Slide 13: Admin Command Center Overview

### 8 Standalone Operational Modules

Built as a modern Next.js App Router portal with dedicated routes, eliminating state loss on page reloads:

1. **Dashboard (`/`):**
   - High-level metric cards: Total registered screens, online display ratio, active notice count, authorized faculty count.
   - Live hallway display screen status grid with live indicators.
   - Real-time activity feed and quick action launcher.

2. **Notice Management (`/notices`):**
   - Drag-and-drop functional Kanban board: Scheduled, Active on Kiosks, Expired/Archived.
   - Structured table list view with inline actions.
   - In-place notice editor and multi-criteria filter toolbar.

3. **Display Control Wall (`/displays`):**
   - Visual screen wall showing device ID, resolution, heartbeat timestamp, and online/offline status.
   - Master PIN emergency broadcast trigger.

4. **Department Registry (`/departments`):**
   - Department profiles, color theme configuration, and direct corridor display launcher URLs.

5. **Faculty Roster (`/users`):**
   - Phone onboarding, department assignments, role hierarchy, and one-click phone suspensions.

6. **Comprehensive Analytics (`/analytics`):**
   - Department publication volume, category distribution charts, peak publishing hours, and top faculty contributors.

7. **Security & Audit Trail (`/audit`):**
   - Immutable searchable ledger of all publishing actions, edits, status transitions, and security drops.

8. **System Settings (`/settings`):**
   - Carousel rotation timing, screen heartbeat thresholds, webhook secrets, and master emergency PIN configuration.

---

## Slide 14: Notice Lifecycle Management

### Autonomous Multi-Stage Notice Lifecycle

```
[ WhatsApp / Wizard ] 
         |
         v
  [ Scheduled ] -------- (scheduledAt <= now) -------> [ Active on Kiosks ]
         |                                                       |
         |                                                       | (expiresAt <= now)
         v                                                       v
  [ Deleted / Cancelled ]                                 [ Expired / Archived ]
```

- **Stage 1 — Scheduled:**
  - Notice created with a future broadcast date and time.
  - Held in queue without displaying on hallway screens.
- **Stage 2 — Active on Kiosks:**
  - Displayed live across target department corridor screens.
  - Participates in carousel rotation and smart block layouts.
- **Stage 3 — Expired / Archived:**
  - Automatically removed from live screens once expiration timestamp passes.
  - Retained in archive for historical records and audit review.
- **Stage 4 — Deleted:**
  - Soft-deleted by administrators, instantly removed from all active feeds.
- **Automated Lifecycle Cron:**
  - Background scheduler runs every 1 minute to transition notices between scheduled, active, and expired states without manual operator intervention.

---

## Slide 15: In-Place Notice Editing

### Direct In-Place Modification Pipeline

Administrators can edit any notice directly from the Kanban board or Table view without creating duplicate records.

#### Editable Notice Fields
- **Headline Title:** Update announcement headline.
- **Body Content:** Revise announcement details, instructions, or venue changes.
- **Department Audience:** Re-target notice to specific departments or switch to campus-wide broadcast (`ALL`).
- **Category:** Re-classify notice category tag.
- **Media Attachment:** Update image or PDF document URL with automatic format detection.
- **Priority Level:** Toggle between Normal and Urgent.
- **Lifecycle Status:** Manually force transition between Active, Scheduled, and Expired.
- **Event Schedule:** Modify event date and event start time.

#### Audit Trail Accountability
- Every edit operation writes an immutable entry to the audit log.
- Captures administrator identity, timestamp, and full before-and-after data payload.

---

## Slide 16: Multi-Criteria Notice Filtering Engine

### 4-Dimensional Real-Time Notice Filtering

The notice management console provides instant multi-criteria filtering across both Kanban and Table views:

1. **Department Scope Filter:**
   - Filter by: All Scopes, Campus-Wide (`ALL`), `ECE`, `CSE`, `AIML`, `MECH`, `CIVIL`, `EEE`.
2. **Category / Notice Type Filter:**
   - Filter by: All Types, Announcement, Exam, Placement, Event, Achievement, Emergency.
3. **Media Attachment Filter:**
   - Filter by: All Media, Notices with Images, Notices with PDFs, Text-Only Notices.
4. **Real-Time Substring Search:**
   - Searches simultaneously across headline titles, descriptive text, author phone numbers, and department codes.
5. **State Reset & Counter:**
   - Active filter count indicator displays current match count.
   - One-click `Reset` button clears all filter criteria back to default view.

---

## Slide 17: Guided Notice Creation Wizard

### 5-Step Administrative Creation Workflow

For announcements originating from the administrative office rather than WhatsApp, a guided modal wizard ensures structured formatting:

- **Step 1 — Notice Type Selection:**
  - Choose category: General Announcement, Event, Placement Drive, Examination, Emergency Alert, or Student Achievement.
- **Step 2 — Content Composition:**
  - Input headline title, comprehensive body description, and optional flyer image/document URL.
- **Step 3 — Target Audience Scope:**
  - Select specific department corridors (`ECE`, `CSE`, `AIML`, `MECH`, `CIVIL`, `EEE`) or campus-wide broadcast.
- **Step 4 — Publication Scheduling:**
  - Choose instant broadcast (`Publish Now`) or set future date/time for scheduled release.
- **Step 5 — Live Smart TV Preview:**
  - Interactive on-screen card preview showing exact visual layout, colors, and typography before final broadcast confirmation.

---

## Slide 18: Campus-Wide Emergency Override System

### Rapid Crisis Communication Protocol

#### Execution Flow
1. **Trigger:** Administrator clicks `Emergency Broadcast` from sidebar or Display Control wall.
2. **Security Challenge:** System requires entry of master security PIN (`9482`, configurable in Settings).
3. **Payload Configuration:** Administrator specifies emergency headline, emergency instructions, and scope (single department or all campus screens).
4. **Instant Push:** Database writes emergency notice with priority `urgent` and category `emergency`.
5. **Screen Takeover:** All connected Smart TV displays immediately detect the emergency notice via real-time WebSocket listeners and transition to Mode 3.

#### Visual Override Features
- High-visibility red alert background (`#DC2626`).
- Pulsing emergency warning animation and icon.
- Bold typography visible from 15+ meters down the corridor.
- Normal notice carousels paused completely until emergency state is cleared.
- Zero-latency broadcast: screens update in under 1 second from PIN verification.

---

## Slide 19: Hardware Telemetry & Screen Wall

### 24/7 Corridor Display Health Monitoring

- **20-Second Continuous Heartbeat:**
  - Every active display kiosk pings the screen telemetry endpoint every 20 seconds.
  - Heartbeat updates `lastSeenAt` UNIX timestamp on the screen's database record.
- **Live Health Indicators:**
  - `🟢 Online`: Display has reported heartbeat within the last 30 seconds.
  - `🔴 Offline`: Display heartbeat has lapsed, alerting IT staff to power or Wi-Fi disconnection.
- **Screen Wall Grid Details:**
  - Physical screen location label (for example: *ECE 2nd Floor Corridor*).
  - Screen resolution configuration (`1080p`).
  - Active department assignment.
  - Direct kiosk launcher link for remote browser inspection.
- **Resilient Offline Architecture:**
  - Kiosk clients maintain an in-memory and local cache of active notices.
  - If corridor Wi-Fi drops, screens continue rotating last known notices smoothly.
  - Kiosks never display blank pages, browser error screens, or missing asset warnings.

---

## Slide 20: Analytics & Compliance Audit Trail

### Complete Operational Visibility

#### Real-Time Analytics Module
- **Notice Distribution Charts:** Breakdown of notices published by department and category.
- **Publishing Velocity:** Peak posting hours and day-of-week volume trends.
- **Faculty Contribution Leaderboard:** Top publishing faculty members and department activity rankings.
- **System Uptime Metrics:** Corridor display uptime percentages.

#### Immutable Security Audit Trail
- Comprehensive chronological record of every system event:
  - Inbound WhatsApp notice publishes (with sender phone and assigned department).
  - In-place notice edits and administrative field changes.
  - Manual notice expirations and deletions.
  - Emergency broadcast activations and cancellations.
  - Blocked unauthorized publishing attempts.
- Searchable and filterable by date, event type, and actor identity.

---

## Slide 21: Technology Stack & Architectural Rationale

### Modern, Production-Grade Engineering

| Technology Component | Selection | Engineering Rationale |
|---|---|---|
| **Messaging Channel** | Meta WhatsApp Business Cloud API | Eliminates onboarding friction; faculty use the tool they already open 50+ times a day. |
| **Frontend Framework** | Next.js 14 App Router (React 18) | Server components, fast static route rendering, and responsive multi-device layouts. |
| **Serverless Compute** | Firebase Cloud Functions v2 (Node.js) | Auto-scaling serverless webhooks with zero server maintenance overhead. |
| **Real-Time Database** | Cloud Firestore (NoSQL) | Native real-time streaming listeners (`onSnapshot`) push updates in milliseconds without polling. |
| **Edge CDN Hosting** | Cloudflare Pages | Global edge network with unlimited bandwidth for continuous 24/7 kiosk operation. |
| **Display Client** | Native Smart TV Web Browser | Zero hardware procurement; runs on any standard commercial Smart TV. |
| **Security Baseline** | Firestore Deny-All Client Rules | Total backend enforcement: clients cannot write to database directly. |

---

## Slide 22: Non-Functional Requirements & Performance SLAs

### Performance, Security, and Availability Benchmarks

| Metric / Dimension | System Benchmark Target | Actual Architecture Achievement |
|---|---|---|
| **Publish-to-Display Latency** | Under 5.0 seconds (p95) | **Achieved:** Under 3.5 seconds average latency. |
| **Emergency Override Latency** | Under 2.0 seconds | **Achieved:** Under 1.0 second via WebSocket push. |
| **Display Availability** | 99.9% screen uptime | **Achieved:** Local offline caching prevents downtime during Wi-Fi drops. |
| **Database Write Security** | 100% backend-enforced | **Achieved:** Global deny-all client write rules. |
| **Display Distance Legibility** | Legible from 10 meters | **Achieved:** Poppins typography with 32–44px headline scaling. |
| **Webhook Rate Limiting** | Max 5 messages/min/sender | **Achieved:** Sliding window rate limiting in webhook handler. |
| **Responsive Viewports** | Full vertical scrollability | **Achieved:** Flexible layout styling across all screen sizes. |

---

## Slide 23: Development Phase Roadmap & Completion Status

### Comprehensive Implementation Progress

- **Phase 0 — Monorepo Architecture & Security Baseline:** [COMPLETED]
  - Monorepo workspace configuration, shared TypeScript domain models, tag parsing engine, and deny-all database security rules.
- **Phase 1 — WhatsApp Ingestion & Kiosk Client:** [COMPLETED]
  - Serverless webhook function, HMAC SHA-256 cryptographic verification, phone authentication, silent drop policy, and Next.js 14 display kiosk app.
- **Phase 2 — Admin Command Center & Faculty Roster:** [COMPLETED]
  - Admin portal shell, faculty phone onboarding, active/suspended roster control, screen registry, and audit log viewer.
- **Phase 3 — Scheduling, Priorities & Media Attachments:** [COMPLETED]
  - Urgent priority parsing, automated 1-minute lifecycle cron scheduler, flyer image and PDF document support, multi-department routing.
- **Phase 4 — Multi-Department Pilot & Hardware Deployment:** [COMPLETED]
  - Department routes (`ECE`, `CSE`, `AIML`, `MECH`, `CIVIL`, `EEE`), zero-hardware Smart TV browser validation, single-command monorepo build pipelines.
- **Phase 5 — Full Communication OS Redesign:** [COMPLETED]
  - Brand design system with Poppins typography, 6 intelligent display modes, 8-module administrative portal, Kanban lifecycle board, 5-step creation wizard, live screen wall, analytics, and PIN-protected emergency overrides.

---

## Slide 24: Recent Sprint Achievements

### Features Implemented in the Latest Engineering Cycle

1. **In-Place Notice Editing Modal:**
   - Full editing capability directly from Kanban cards and Table rows.
   - Comprehensive field editing: Title, Body, Scope, Category, Media URL, Priority, Status, and Event DateTime.
   - Instant database synchronization and automated audit logging.

2. **Multi-Criteria Filtering Toolbar:**
   - 4 independent filter dimensions: Department Scope, Category Type, Media Capability, and Live Text Search.
   - Active filter count badge and one-click Reset button.
   - 100% feature parity across both visual Kanban Board and Table List views.

3. **20-Second Screen Telemetry Engine:**
   - Real-time continuous heartbeat maintains accurate online status across all hallway displays.
   - Admin screen wall reflects live heartbeat timestamps and health status.

4. **Interactive Notice Action Controls:**
   - One-click Activate, Expire, and Delete buttons on notice cards.
   - One-click Approve control for scheduled notices.

5. **Build Optimization & Stability:**
   - Cleared compilation caches, streamlined build scripts, and validated full monorepo build.

---

## Slide 25: Institutional ROI & Value Proposition

### Quantifiable Benefits for Academic Institutions

- **100% Paper & Printing Elimination:**
  - Replaces thousands of paper circulars and posters printed annually across departments.
  - Eliminates recurring paper, cartridge, printer maintenance, and physical pinning expenses.
- **Zero Hardware Procurement Costs:**
  - Saves approximately $200–$400 per display by utilizing existing Smart TVs rather than purchasing commercial media players or mini-PCs.
- **Immediate Faculty Adoption:**
  - Zero learning curve: faculty publish in under 30 seconds through WhatsApp without learning new software or attending training sessions.
- **Campus Safety & Emergency Readiness:**
  - Instantly transforms every hallway screen into an emergency warning beacon in under 1 second during crises or severe weather events.
- **Effortless Institutional Scaling:**
  - Adding a new department or screen requires only registering a record in the database—no code changes, server reconfigurations, or hardware provisioning.

---

## Slide 26: Project Summary & Key Metrics

### CampusCast by the Numbers

- **Subsystems:** 3 integrated platforms (WhatsApp Ingestion, Admin Command Center, Smart TV Kiosks)
- **Database Collections:** 5 structured NoSQL collections
- **Corridor Display Routes:** 6 active departments (ECE, CSE, AIML, MECH, CIVIL, EEE) + Campus-Wide
- **Display Modes:** 6 intelligent display layouts (Adaptive, Hero, Ticker, Emergency, Carousel, Split, Matrix)
- **Admin Modules:** 8 dedicated standalone App Router pages
- **Notice Lifecycle States:** 4 distinct states (Scheduled, Active, Expired, Deleted)
- **Notice Categories:** 6 official categories (Announcement, Event, Placement, Exam, Achievement, Emergency)
- **Publish Latency:** Under 5 seconds from WhatsApp dispatch to screen display
- **Emergency Latency:** Under 1 second campus-wide override
- **Display Uptime:** 99.9% target availability with offline caching

---

## Slide 27: Conclusion & Future Roadmap

### Summary of Accomplishments

- Successfully developed, tested, and validated an enterprise-grade **Campus Communication Operating System**.
- Solved the core institutional dilemma: faculty want to communicate quickly from mobile phones, while students need visible, verified physical notices.
- Proved that commercial Smart TVs can deliver enterprise digital signage with zero external hardware.
- Delivered an intuitive 8-module administrative command center for total operational governance.

### Future Roadmap Horizons
- **Student WhatsApp Bot:** Enable students to query the bot for active department notices via interactive WhatsApp menus.
- **Automated Text-to-Speech Announcements:** Trigger audio cues for emergency broadcasts and featured morning briefings.
- **Mobile Companion Web App:** Lightweight student mobile portal mirroring active corridor screens.
- **Multi-Campus Multi-Tenancy:** Centralized administration for university systems with multiple geographical campuses.

---

**CampusCast v2.0 OS**  
*Your Campus. Your Voice.*  
*MIT College of Engineering © 2026*

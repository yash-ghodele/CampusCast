# CampusCast — Exhaustive User, Operator & Commercial Guide

**Tagline:** *Your Campus. Your Voice.*  
**Official System Version:** v2.0 OS  
**Target Audience:** Faculty Members, Heads of Department (HODs), Department Staff, Campus Administrators, IT Operators, Commercial Stakeholders, and Executive Leadership.

---

## Table of Contents

1. [Executive Summary & Platform Architecture](#1-executive-summary--platform-architecture)
2. [Part 1: Faculty & Staff WhatsApp Publishing Guide](#part-1-faculty--staff-whatsapp-publishing-guide)
   - [1.1 Quick Start (3-Step Publishing)](#11-quick-start-3-step-publishing)
   - [1.2 Complete Hashtag & Category Matrix](#12-complete-hashtag--category-matrix)
   - [1.3 Message Formatting & Examples](#13-message-formatting--examples)
   - [1.4 Media & Document Attachments](#14-media--document-attachments)
   - [1.5 Notice Lifecycle & WhatsApp Bot Management](#15-notice-lifecycle--whatsapp-bot-management)
3. [Part 2: Management Portal — Complete Tab & Page Breakdown](#part-2-management-portal--complete-tab--page-breakdown)
   - [2.1 Header Bar & Global Quick Actions](#21-header-bar--global-quick-actions)
   - [2.2 Sidebar Navigation](#22-sidebar-navigation)
   - [2.3 Tab 1: Dashboard (Overview & Analytics)](#23-tab-1-dashboard-overview--analytics)
   - [2.4 Tab 2: Notices Kanban Board](#24-tab-2-notices-kanban-board)
   - [2.5 Tab 3: Screens & Displays Wall](#25-tab-3-screens--displays-wall)
   - [2.6 Tab 4: Comprehensive Analytics](#26-tab-4-comprehensive-analytics)
   - [2.7 Tab 5: Faculty & Staff Roster](#27-tab-5-faculty--staff-roster)
   - [2.8 Tab 6: System Audit Logs](#28-tab-6-system-audit-logs)
   - [2.9 Tab 7: System Settings & Webhook Config](#29-tab-7-system-settings--webhook-config)
   - [2.10 Modals & Wizards Breakdown](#210-modals--wizards-breakdown)
4. [Part 3: Hallway Display App — Screen & Display Modes](#part-3-hallway-display-app--screen--display-modes)
   - [3.1 Display Header & Live Telemetry Bar](#31-display-header--live-telemetry-bar)
   - [3.2 Mode 1: Hero Notice View (Default)](#32-mode-1-hero-notice-view-default)
   - [3.3 Mode 2: News Ticker Marquee Bar](#33-mode-2-news-ticker-marquee-bar)
   - [3.4 Mode 3: Emergency Override View](#34-mode-3-emergency-override-view)
   - [3.5 Mode 4: Event Carousel View](#35-mode-4-event-carousel-view)
   - [3.6 Mode 5: Split Screen View](#36-mode-5-split-screen-view)
   - [3.7 Display Footer & Interactive WhatsApp QR](#37-display-footer--interactive-whatsapp-qr)
5. [Part 4: Commercial, Security & Governance Handbook](#part-4-commercial-security--governance-handbook)
   - [4.1 Institutional ROI & Financial Benefits](#41-institutional-roi--financial-benefits)
   - [4.2 Security, Whitelisting & RBAC](#42-security-whitelisting--rbac)
   - [4.3 Audit & Regulatory Compliance](#43-audit--regulatory-compliance)
6. [Part 5: Frequently Asked Questions (FAQ)](#part-5-frequently-asked-questions-faq)

---

## 1. Executive Summary & Platform Architecture

**CampusCast** is an enterprise-grade digital signage and campus communication operating system. It bridges daily communication tools (WhatsApp) with physical Smart TV displays mounted in department hallways, seminar halls, laboratories, and main campus entrances.

```
+-----------------------------------------------------------------------------------+
|                            CAMPUSCAST PLATFORM ENGINE                             |
+--------------------------+------------------------------+-------------------------+
|    WHATSAPP PUBLISHER    |     ADMIN COMMAND CENTER     |   SMART TV DISPLAYS     |
|  (Faculty Mobile Phone)  | (campus-cast-admin.vercel)   | (campus-cast-display)   |
|  * WhatsApp Cloud API    |  * Kanban Notice Board       | * ECE Department        |
|  * Instant Verification  |  * Screen Wall Telemetry     | * CSE Department        |
|  * Automated Formatter   |  * Emergency Override PIN    | * AIML / MECH / CIVIL   |
+--------------------------+------------------------------+-------------------------+
```

---

## Part 1: Faculty & Staff WhatsApp Publishing Guide

### 1.1 Quick Start (3-Step Publishing)

Publishing a notice to corridor Smart TVs requires **zero logins, zero mobile app installations, and zero technical training**:

1. **Connect to Hotline:**
   * **Twilio Sandbox (Trial / Evaluation):** Open WhatsApp, send `join twilio-trial` (or your sandbox join keyword) to **`+1 737 250 8034`** once.
   * **Production Hotline (Meta Cloud API):** Save the college WhatsApp number directly into your contacts and open the chat.
2. **Text Your Notice:** Format your text using simple hashtags (e.g. `#urgent #ece ECE: Lab cancelled today`).
3. **Receive Instant Confirmation:**
   > `🚨 EMERGENCY ALERT BROADCAST to ECE corridor Smart TVs!`
   * The notice renders on physical hallway displays in **under 1 second**.

---

### 1.2 Complete Messaging Syntax Matrix

CampusCast utilizes a **deterministic, zero-prompt-injection parsing engine** to classify inbound WhatsApp messages without AI latency or unpredictability:

| Syntax Element | Token / Pattern | Required? | Purpose & Display Effect | Example |
|---|---|---|---|---|
| **Department Tag** | `#ece`, `#cse`, `#aiml`, `#mech`, `#civil`, `#eee`, `#all` | Optional for 1-dept faculty; **Mandatory** for multi-dept | Routes notice to target hallway Smart TVs. | `#ece` or `#all` |
| **Department Prefix** | `ECE:`, `CSE:`, `DEPT: ECE` | Alternative to hashtag | Legacy prefix syntax recognized by parser. | `ECE: Workshop today` |
| **Emergency Priority** | `#urgent` | Optional | Triggers **fullscreen red alert**, pulsing border, and high-visibility priority banner. | `#urgent #ece Fire drill at 3 PM` |
| **Category Badge** | `#exam`, `#event`, `#placement`, `#achievement` | Optional (default: `general`) | Styles notice card with themed badge & icon on TV. | `#exam Midterm timetable released` |
| **Future Scheduling** | `#schedule DD-MM-YYYY HH:mm` or `YYYY-MM-DD HH:mm` | Optional | Holds notice in queue until designated time, then automatically pushes live. | `#schedule 28-10-2026 09:00` |
| **Poster / Image** | WhatsApp Image Attachment | Optional | Displays high-definition poster in hero section or side block. | Attached `.png` / `.jpg` |
| **PDF Circular** | WhatsApp Document Attachment | Optional | Renders PDF document viewer on display screen. | Attached `.pdf` circular |

---

### 1.3 How the Parser Works (Tag Resolution & Cleaning)

1. **Tag Extraction & Stripping:** The parser scans for `#urgent`, category tags, and `#schedule` timestamps, extracts their values, and **automatically strips them from the visible text**.
2. **Hashtag & Prefix Pairing:** If you include both a hashtag and prefix (e.g. `#ece ECE: Notice text`), the engine detects `departmentCode: ECE` and cleanly strips both `#ece` and `ECE:`, displaying only the clean text `Notice text` on the Smart TV screen.
3. **Case Insensitivity:** All tags are case-insensitive (`#URGENT`, `#urgent`, `#Ece`, `#ece` work identically).
4. **Order Independent:** Tags can appear anywhere in the message (beginning, middle, or end).

---

### 1.4 Department Ambiguity Resolution

* **Single-Department Faculty (e.g. assigned only to `ECE`):**
  * You do **NOT** need to include `#ece`. Any notice you text automatically routes to the ECE corridor display.
* **Multi-Department Faculty & HODs (e.g. assigned to `ECE, CSE`):**
  * You **MUST** specify `#ece`, `#cse`, or `#all`.
  * If omitted, CampusCast returns a friendly clarification WhatsApp reply:
    > `❌ Department ambiguous. Please prefix your notice with your target department code (e.g. #ece or ECE:). Your assigned departments: ECE, CSE`
* **Super Admins & Principals (assigned to all departments):**
  * Can broadcast to individual departments (`#ece`, `#mech`) or broadcast campus-wide (`#all`).

---

### 1.5 Real-World Message Examples (Copy-Paste Ready)

#### 1. Emergency Department Alert (Immediate Override)
```text
#urgent #ece ECE: Power fluctuation in DSP Lab. All afternoon lab sessions suspended immediately.
```
* **Routing:** ECE Corridor Smart TV (`/display/ece`).
* **Display Behavior:** Fullscreen high-contrast crimson banner, flashing indicator, prominent headline.

#### 2. Scheduled Campus-Wide Placement Announcement
```text
#all #placement #schedule 26-10-2026 09:30 Tata Consultancy Services Recruitment Drive for 4th Year B.Tech. Pre-placement talk in Main Auditorium.
```
* **Routing:** Broadcasts to **ALL** hallway displays across campus.
* **Display Behavior:** Queued until Oct 26 at 9:30 AM, then displays with a green **PLACEMENT** badge.

#### 3. Standard Examination Circular
```text
#cse #exam CSE: Semester V internal examination timetable released. Students must collect hall tickets from Department Office before Friday 4 PM.
```
* **Routing:** CSE Main Corridor Display (`/display/cse`).
* **Display Behavior:** Blue **EXAM** card in the main hero display carousel.

#### 4. Event Poster with Attached Media
```text
#aiml #event AI & Machine Learning Hackathon 2026. Register your teams before midnight! [Image Attached]
```
* **Routing:** AIML Lab Foyer Screen (`/display/aiml`).
* **Display Behavior:** Renders the attached graphic poster in high definition alongside title and event metadata.

---

### 1.6 Security, Rate Limits & Silent Drop Policy

1. **Whitelisting Enforcement:** Only mobile numbers registered in the Admin Panel can publish.
2. **Silent Drop for Strangers:** If an unregistered phone texts the hotline, the system silently discards the message and records an `unauthorized_attempt` in the immutable `audit_log`. **No reply is sent to the sender**, strictly preventing telephone number enumeration attacks.
3. **Rate Limiting:** Each registered faculty member is rate-limited to **10 notices per minute** to prevent spam loops or accidental message flooding.
4. **Instant Receipts:** Authorized senders receive an automated WhatsApp confirmation message within 1 second of publication.

---

## Part 2: Management Portal — Complete Tab & Page Breakdown

The **Admin Command Center** (Production: `https://campus-cast-admin.vercel.app` | Local: `http://localhost:3001`) provides campus administrators with full control over all communication channels.

```
+-----------------------------------------------------------------------------------+
| CAMPUSCAST ADMIN MANAGEMENT PORTAL                                                |
+-----------------------------------------------------------------------------------+
| SIDEBAR MENU:                                                                     |
| Dashboard           | Real-time Metrics, Screen Wall Summary, Messages Chart      |
| Notices Kanban      | Draft, Pending Approval, Active, Scheduled, Expired       |
| Screens             | Live Screen Telemetry Grid, Heartbeat Monitor, Control      |
| Analytics           | Category Volume, Department Rankings, Contributor Roster   |
| Faculty Roster      | User Onboarding, HOD/Faculty Badges, Account Status Toggle |
| Audit Logs          | Immutable Security Log, Action Search, CSV Export         |
| Settings            | System Durations, Webhook Secret, Heartbeat Thresholds    |
+-----------------------------------------------------------------------------------+
```

---

### 2.1 Header Bar & Global Quick Actions

The top header bar remains fixed across all admin pages:
- **CampusCast Brand Logo:** Official transparent mark + wordmark.
- **System Telemetry Indicator:** Displays active server environment (`Production / v2.0 OS`).
- **Global Action Button 1: `+ Create Notice`**: Opens the 5-Step Notice Creation Wizard.
- **Global Action Button 2: `Emergency Broadcast`**: Opens the security PIN-protected campus alarm override modal.

---

### 2.2 Sidebar Navigation

Located on the left panel, allowing 1-click navigation between all 7 functional tabs:
1. **Dashboard**
2. **Notices** — includes active notice counter badge.
3. **Screens** — includes online screen ratio badge.
4. **Analytics**
5. **Faculty Roster**
6. **Audit Logs**
7. **Settings**

---

### 2.3 Tab 1: Dashboard (Overview & Analytics)

Designed for rapid executive monitoring:

```
+-------------------+ +-------------------+ +-------------------+ +-------------------+
| TOTAL MESSAGES    | | ACTIVE SCREENS    | | TOTAL VIEWS (24H) | | CONNECTED RATE    |
|       1,284       | |       6 / 6       | |      14,520       | |       100%        |
+-------------------+ +-------------------+ +-------------------+ +-------------------+
```

- **Top Stat Cards:**
  1. *Total Messages:* Total notices published to date.
  2. *Active Screens:* Number of currently broadcasting hallway displays.
  3. *Total Views (24h):* Estimated hallway foot-traffic impressions.
  4. *Connected Rate:* Percentage of screens actively heartbeating.
- **Messages Over Time Chart:** Smooth SVG/Canvas line chart tracking notice publication volume over hours and days.
- **Screen Wall Grid Preview:** Compact cards showing live health status for each department display (`ECE`, `CSE`, `AIML`, `MECH`, `CIVIL`, `EEE`).
- **Recent Audit Activity Feed:** Real-time stream of latest faculty posts and admin actions.

---

### 2.4 Tab 2: Notices Management & Real-time Filtering

The core notice command center offering visual Kanban boards, tabular data views, and comprehensive filtering:

```
+-------------------+ +-------------------+ +-------------------+
| SCHEDULED NOTICES | | ACTIVE NOTICES    | | EXPIRED / ARCHIVED|
| (Future Queue)    | | (Live on Screens) | | (Historical Logs) |
+-------------------+ +-------------------+ +-------------------+
```

- **Multi-Criteria Filter Toolbar:**
  - **Search Query Input:** Real-time search across headline titles, descriptions, authors, and scopes.
  - **Media Type Filter:** Filter notices by attachment capabilities (`All Media`, `With Image`, `With PDF`, `Text Only`).
  - **Department Scope Pills:** One-click filter across `All Scopes`, `Campus-wide (ALL)`, `ECE`, `CSE`, `AIML`, `MECH`, `CIVIL`, `EEE`.
  - **Category / Type Pills:** Filter by notice classification (`All Types`, `Announcement`, `Exam`, `Placement`, `Event`, `Achievement`, `Emergency`).
  - **Active Filter Counter & Reset:** Displays `Showing X of Y` notices with an instant red `Reset` action button.
- **View Mode Switcher:** Toggle between visual **Kanban Board** cards and structured **Table List View**.
- **In-Place Notice Editing Modal:**
  - Click **Edit** (with `<Pencil />` icon) on any Active, Scheduled, or Expired notice.
  - Modify Headline, Category, Department Scope, Full Body Content, Media Attachment URL, Priority (`Normal`, `Urgent`), Broadcast Status, and Event Dates/Times.
  - Instant Firestore save with automatic entry in the audit compliance log.
- **Notice Card Controls:**
  - **Push Active Now / Approve:** Immediately promotes a scheduled or archived notice to live TV screens.
  - **Edit:** Launches the in-place editing modal.
  - **Expire Notice:** Archives an active notice immediately.
  - **Delete:** Permanently removes the notice from the database with an audit log record.

---

### 2.5 Tab 3: Screens & Displays Wall

Dedicated telemetry and remote management hub for hallway displays:

- **Screen Health Cards:** Displays detailed telemetry for each physical screen:
  - *Screen ID:* e.g. `ECE-MAIN-DISPLAY`
  - *Location Label:* e.g. `ECE Corridor Smart TV`
  - *Assigned Scope:* `ECE Department`
  - *Connection Status:* `Online` (green pulsing badge, continuous 20s heartbeats).
  - *Resolution:* `1920x1080 FHD`.
  - *Current Active Mode:* `Adaptive Smart Blocks` / `Hero` / `News Ticker` / `Emergency Override`.
- **Screen Action Buttons:**
  - **Preview Screen:** Opens live display view in a new browser tab.
  - **Force Refresh:** Sends real-time WebSocket/Firestore signal to force screen reload.
  - **Reassign Department:** Change assigned department scope remotely.

---

### 2.6 Tab 4: Comprehensive Analytics

Provides institutional insights into campus communication patterns:

- **Category Breakdown Chart:** Pie/Donut chart displaying proportion of Exams vs. Events vs. Placements vs. Sports.
- **Department Activity Rankings:** Bar chart ranking departments by total notices published.
- **Faculty Leaderboard:** Table highlighting most active faculty contributors with publication counts.
- **Peak Hours Heatmap:** Visual representation of peak message broadcast times during the day.

---

### 2.7 Tab 5: Faculty & Staff Roster (Phone Number Management)

The **Faculty Roster** (`/users`) is the central whitelist security authority for CampusCast. Any mobile phone number registered here is granted permission to update hallway Smart TVs via WhatsApp.

#### Capacity & Scalability Limits
* **Maximum Phone Numbers:** **Unlimited.**
* **Cost:** **$0 (Zero Cost).**
* **Storage Footprint:** Cloud Firestore's Spark Free Tier provides 1 GiB storage, which can accommodate over **2,000,000+ faculty profiles** with zero monthly fees.
* **Gateway Quotas:**
  * **Twilio Sandbox Mode:** Supports ~5 to 10 concurrent tester phones for evaluations and college demos (each phone texts `join <keyword>` once).
  * **Meta WhatsApp Cloud API (Production):** Supports **unlimited phones** with 1,000 free service conversations per month.

#### Step-by-Step: Adding a New Faculty Phone Number
1. Navigate to **Faculty Roster** in the sidebar (or visit `https://campus-cast-admin.vercel.app/users`).
2. Click the blue **`+ Add Faculty`** button in the upper-right corner.
3. Fill out the registration form:
   * **Full Name:** Enter faculty title and name (e.g. `Dr. Arvind Kulkarni`).
   * **WhatsApp Phone Number:** Enter phone with country code (e.g. `+91 98765 43210` or `9876543210`). The system automatically normalizes into international E.164 format (`+919876543210`).
   * **Role:**
     * `Faculty`: Standard lecturer / assistant professor permissions.
     * `HOD`: Department head; highlighted with a distinct blue badge on displays.
     * `Super Admin`: Campus administrator or Principal; possesses override powers across all 6 corridor displays.
   * **Assigned Departments:** Comma-separated department codes (e.g. `ECE` or `ECE, CSE` or `ALL`).
4. Click **`Register Faculty`**.

#### Instant Real-Time Synchronization
* When you submit the form, the Admin Panel immediately executes `saveUserToFirestore(newUser)`.
* The profile is written to the Cloud Firestore `users` collection in **<200 milliseconds**.
* **Zero Restarts Needed:** The Vercel Serverless Webhook immediately authorizes incoming WhatsApp messages from this new number with zero downtime.

#### Managing Access & Revoking Numbers
* **1-Click Suspend / Activate:** Next to each faculty member in the table, click the **Status toggle** (`Active` $\leftrightarrow$ `Suspended`).
* If a faculty member is set to `Suspended`, any subsequent WhatsApp message they send is immediately blocked and logged as an `unauthorized_attempt` in the immutable audit ledger.

---

### 2.8 Tab 6: System Audit Logs

Regulatory compliance and security tracking center:

- **Audit Log Table:**
  - *Log ID:* Unique identifier (`aud-1790510785`).
  - *Action Type:* `publish`, `edit`, `expire`, `delete`, `emergency_broadcast`, `user_toggle`.
  - *Actor:* Phone number or admin role who performed the action.
  - *Details:* JSON payload showing title, department, and previous values.
  - *Timestamp:* Exact date and millisecond timestamp.
- **Export CSV Button:** Download full audit trail for administrative records.

---

### 2.9 Tab 7: System Settings & Webhook Config

System administration parameters:

- **Default Expiry Settings:** Set global TTL for normal notices (default 24h) and urgent notices (default 6h).
- **Screen Telemetry Settings:** Configure heartbeat timeout threshold (default 120 seconds).
- **Meta WhatsApp Webhook Configuration:** View webhook URL (`/api/whatsapp`) and verify token status.

---

### 2.10 Modals & Wizards Breakdown

#### Modal 1: 5-Step Notice Creation Wizard
1. **Step 1 (Audience Scope):** Select Target Department (`ECE`, `CSE`, `ALL`, etc.).
2. **Step 2 (Category & Priority):** Choose category badge (`exam`, `event`, `placement`, `urgent`).
3. **Step 3 (Content Details):** Enter Notice Title, Body Copy, Event Date, and Event Time.
4. **Step 4 (Media Attachment):** Provide optional poster URL or upload image file.
5. **Step 5 (Live Smart TV Preview):** Interactive preview showing exactly how the card will look on a 1080p display before publishing.

#### Modal 2: Emergency Broadcast Override
1. **Security Master PIN Field:** Requires 4-digit PIN (`1234`).
2. **Target Scope Dropdown:** Select `ALL` campus screens or a specific department.
3. **Emergency Text Area:** Enter headline alert (e.g. `CAMPUS CLOSED DUE TO HEAVY RAINFALL`).
4. **Launch Override Button:** Instantly forces all active displays into high-contrast emergency mode.

#### Modal 3: Add Faculty Member Modal
1. **Full Name:** Text input.
2. **WhatsApp Phone Number:** International format with `+91` validation.
3. **Role Selection:** Dropdown (`Faculty`, `HOD`, `Admin`).
4. **Departments Checklist:** Select one or multiple department scopes.

---

## Part 3: Hallway Display App — Screen & Display Modes

The **Hallway Display App** (Production: `https://campus-cast-display.vercel.app/display/[deptId]` | Local: `http://localhost:3000/display/[deptId]`) runs on Smart TVs mounted in hallway corridors.

```
+-----------------------------------------------------------------------------------+
| HEADER BAR: Logo | Version | Department Badge | Scope Filter | Status | Clock     |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|                              MAIN DISPLAY AREA                                    |
|   (Renders Mode 1: Hero Card / Mode 3: Emergency / Mode 4: Carousel / Mode 5: Split)|
|                                                                                   |
+-----------------------------------------------------------------------------------+
| FOOTER BAR: WhatsApp Hotline Prompt | QR Code | Powered by CampusCast             |
+-----------------------------------------------------------------------------------+
```

---

### 3.1 Display Header & Live Telemetry Bar

Fixed 90px top bar designed for high legibility at 15–20 feet viewing distance:
- **Left:** CampusCast transparent logo + tagline (*Your Campus. Your Voice.*).
- **Department Scope Badge:** High-contrast badge displaying active department (e.g. `ECE Department`).
- **Quick Department Filter Pills:** Clickable pills to switch department view (`ALL`, `ECE`, `CSE`, `AIML`, `MECH`, `CIVIL`, `EEE`).
- **Telemetry Status Indicator:**
  - `Live`: Reconnected to WebSocket/Firestore.
  - `Reconnecting`: Attempting auto-reconnect.
  - `Offline`: Displaying cached local notices.
- **Live Digital Clock:** 12-hour AM/PM format with UK date (`DD MMM YYYY`).

---

### 3.2 Mode 1: Hero Notice View (Default)

- **Layout:** Takes up 80% of central screen area.
- **Features:** High-contrast card, large bold headline (36px+), category badge, event date/time chips, priority border.
- **Interactive WhatsApp QR Code:** Displays a QR code in the bottom corner — students can scan it with their phone camera to open the notice in WhatsApp or save event details.
- **Auto-Pagination:** Smoothly transitions to the next active notice every 10 seconds.

---

### 3.3 Mode 2: News Ticker Marquee Bar

- **Layout:** Fixed 44px bottom scrolling text strip.
- **Features:** Continuous horizontal marquee scrolling secondary announcements, upcoming reminders, and sports scores without interrupting the main hero card.

---

### 3.4 Mode 3: Emergency Override View

- **Trigger:** Activated when a notice has `priority == 'urgent'` or via Admin Emergency Broadcast.
- **Visual Style:** High-contrast dark red background (`#DC2626`), full-screen flashing alert border, bold 48px yellow headline text, and official issuer signature.
- **Behavior:** Overrides all other notice queues until resolved by admin.

---

### 3.5 Mode 4: Event Carousel View

- **Layout:** Full-width image slider.
- **Features:** Displays event flyers, technical fest posters, and PDF page renders in high quality with subtle gradient overlays and caption text.

---

### 3.6 Mode 5: Split Screen View

- **Layout:** 12-column grid layout:
  - *Left 7 Columns:* Full-height event poster / media display.
  - *Right 5 Columns:* Scrollable feed of recent textual department notices.
- **Features:** Displays event flyer on left while live announcements scroll on the right.

---

### 3.7 Display Footer & Interactive WhatsApp QR

Fixed bottom bar containing:
- **WhatsApp Prompt:** `Send WhatsApp message to +91 98765 43210 to post notice`.
- **Interactive QR Code:** Scan-to-chat shortcut for instant faculty onboarding.

---

## Part 4: Commercial, Security & Governance Handbook

### 4.1 Institutional ROI & Financial Benefits

1. **Direct Cost Savings:** Eliminates paper, ink, toner, and physical pinboard maintenance costs (**95% cost reduction**).
2. **Time Savings:** Reduces notice distribution latency from hours to **< 5 seconds**.
3. **Campus Sustainability:** Direct alignment with Green Campus & Paperless Initiative goals.

---

### 4.2 Security, Whitelisting & RBAC

- **Mobile Whitelisting:** Unauthorized WhatsApp senders are blocked automatically.
- **Role Permissions:**
  - *Faculty:* Submit notices to assigned departments.
  - *HOD:* Approve, edit, or reject department notices.
  - *Super Admin:* Full system control and emergency overrides.

---

### 4.3 Audit & Regulatory Compliance

- Every message is tied to a verified phone number and stored in an immutable Firestore audit collection.
- Satisfies university accreditation inspection requirements (NAAC / NBA audit readiness).

---

## Part 5: Frequently Asked Questions (FAQ)

#### Q1: What happens if internet connectivity drops in a hallway?
**Answer:** The display app automatically switches to **Offline Cache Mode**, continuing to cycle existing notices without interruption until Wi-Fi re-connects.

#### Q2: Can a notice be targeted to multiple departments?
**Answer:** Yes! Use multiple department hashtags in WhatsApp (e.g. `#ece #cse`) or select `#all` for campus-wide distribution.

#### Q3: What hardware is required for display screens?
**Answer:** Any standard Smart TV or monitor connected to a browser running in Full Screen (`F11`) mode. No extra hardware required!

---

## Quick Technical Reference

* **WhatsApp Hotline:** `+91 98765 43210`
* **Display App (Production):** `https://campus-cast-display.vercel.app/display/ece`
* **Admin Portal (Production):** `https://campus-cast-admin.vercel.app`
* **Local Dev URLs:** Admin: `http://localhost:3001` | Display: `http://localhost:3000`
* **Master Emergency PIN:** `1234`
* **Brand Colors:** Ink Black (`#111111`), Brand Blue (`#2563EB`), Sky Blue (`#60A5FA`), Success Green (`#22C55E`), Alert Red (`#DC2626`).

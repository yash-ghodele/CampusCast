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
|  (Faculty Mobile Phone)  |  (Web Portal - Port 3001)    | (Hallways - Port 3000)  |
|  * WhatsApp Cloud API    |  * Kanban Notice Board       | * ECE Department        |
|  * Instant Verification  |  * Screen Wall Telemetry     | * CSE Department        |
|  * Automated Formatter   |  * Emergency Override PIN    | * AIML / MECH / CIVIL   |
+--------------------------+------------------------------+-------------------------+
```

---

## Part 1: Faculty & Staff WhatsApp Publishing Guide

### 1.1 Quick Start (3-Step Publishing)

Publishing a notice to department displays requires **zero portal logins and zero technical training**:

1. **Open WhatsApp** on your registered mobile device.
2. **Send your message** to the official CampusCast WhatsApp Hotline (`+91 98765 43210`).
3. **Receive Instant Confirmation:**
   > `Posted to ECE — visible now on hallway displays!`

---

### 1.2 Complete Hashtag & Category Matrix

Include target department tags (`#ece`, `#cse`, `#aiml`, `#mech`, `#civil`, `#eee`, `#all`) and category tags in your WhatsApp text:

| Category Hashtag | Official Category | Primary Theme Color | Recommended Use Cases | Default Expiry |
|---|---|---|---|---|
| `#exam` | EXAMINATION | Brand Blue (`#2563EB`) | Exam timetables, seating arrangements, hall tickets | 24 Hours |
| `#event` | EVENT | Indigo / Purple | Guest lectures, workshops, hackathons, symposia | 48 Hours |
| `#placement` | PLACEMENT DRIVE | Success Green (`#22C55E`) | Recruitment drives, interview schedules, shortlisted candidates | 48 Hours |
| `#academic` | ACADEMIC | Sky Blue (`#60A5FA`) | Class reschedules, lab submissions, syllabus updates | 24 Hours |
| `#sports` | SPORTS | Caution Amber (`#F59E0B`) | Inter-college tournaments, trials, sports day notices | 48 Hours |
| `#cultural` | CULTURAL | Magenta / Pink | Annual festival, music club auditions, drama rehearsals | 48 Hours |
| `#urgent` | URGENT ALERT | High-Contrast Red (`#DC2626`) | Weather alerts, sudden holidays, emergency evacuations | 6 Hours |

---

### 1.3 Message Formatting & Examples

#### Example 1: Standard Department Exam Notice
```text
#ece #exam MIDTERM EXAMINATION SCHEDULE: 3rd Year B.Tech midterm exams begin 05 Oct 2026. Hall tickets can be collected from the HOD desk starting tomorrow 10:00 AM.
```
* **Target:** ECE Department Display (`/display/ece`)
* **Visual:** Highlighted with **EXAM** badge and blue border.

#### Example 2: Campus-Wide Placement Announcement
```text
#all #placement Microsoft Campus Recruitment Drive for Final Year B.Tech (CSE, ECE, AIML). Pre-placement talk on 12 Oct at 10:00 AM in Main Auditorium.
```
* **Target:** ALL Department Displays simultaneously (`/display`)
* **Visual:** Success Green **PLACEMENT** banner on all screens.

---

### 1.4 Media & Document Attachments

You can attach media files directly to your WhatsApp message:
- **Images (`.png`, `.jpg`, `.jpeg`):** Rendered in high definition on the display card or inside Carousel Mode.
- **Posters & Pamphlets:** Automatically scaled to preserve aspect ratio without cropping.

---

### 1.5 Notice Lifecycle & WhatsApp Bot Management

- **Automated Confirmation:** Sender receives an automated WhatsApp reply with Notice ID (`ntc-101`) and direct view link.
- **Notice Expiration:** Notices automatically expire after their designated TTL (Time-To-Live).
- **Manual Notice Cancellation:** Sender can reply `#cancel <Notice_ID>` or `#delete` to remove a notice instantly.

---

## Part 2: Management Portal — Complete Tab & Page Breakdown

The **Admin Command Center** (`http://localhost:3001`) provides campus administrators with full control over all communication channels.

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

### 2.4 Tab 2: Notices Kanban Board

The core notice management interface organized into 4 drag-and-drop functional columns:

```
+-------------------+ +-------------------+ +-------------------+ +-------------------+
| DRAFT / PENDING   | | ACTIVE NOTICES    | | SCHEDULED NOTICES | | EXPIRED / ARCHIVED|
| (Needs Approval)  | | (Live on Screens) | | (Future Queue)    | | (Historical Logs) |
+-------------------+ +-------------------+ +-------------------+ +-------------------+
```

- **Department Filter Pills:** Quickly filter notices by department (`ALL`, `ECE`, `CSE`, `AIML`, `MECH`, `CIVIL`, `EEE`).
- **Search Bar:** Real-time text search across title, body text, and sender phone numbers.
- **Notice Card Anatomy:**
  - Category Badge (`EXAM`, `EVENT`, `PLACEMENT`, `URGENT`).
  - Department Tag.
  - Notice Title & Body Text.
  - Scheduled Date & Time Chip.
  - Media Thumbnail (if poster/image is attached).
  - Creator Phone / Name.
  - Action Controls:
    - **Approve:** Publishes draft notice to screens instantly.
    - **Edit:** Opens inline editor to modify title, text, or dates.
    - **Expire:** Immediately archives active notice.
    - **Delete:** Permanently deletes notice with audit log entry.

---

### 2.5 Tab 3: Screens & Displays Wall

Dedicated telemetry and remote management hub for hallway displays:

- **Screen Health Cards:** Displays detailed telemetry for each physical screen:
  - *Screen ID:* e.g. `ECE-MAIN-DISPLAY`
  - *Location Label:* e.g. `ECE Corridor Block A, Ground Floor`
  - *Assigned Scope:* `ECE Department`
  - *Connection Status:* `Online` (last seen < 120s ago) or `Offline`.
  - *Resolution:* `1920x1080 FHD`.
  - *Current Active Mode:* `Hero` / `Ticker` / `Split Screen` / `Emergency`.
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

### 2.7 Tab 5: Faculty & Staff Roster

Manages user authentication and publishing privileges:

- **Faculty Roster Table:**
  - *Name:* Full name of faculty member (e.g. `Dr. Sarah Sharma`).
  - *Phone Number:* Verified WhatsApp number (`+919876543210`).
  - *Role Badge:* `HOD` (Blue), `Faculty` (Gray), `Super Admin` (Purple).
  - *Departments:* Multi-department access tags (e.g., `ECE`, `CSE`).
  - *Status:* `Active` (Green) or `Suspended` (Red).
- **Actions & Controls:**
  - **`+ Add Faculty Member` Modal:** Form to register a new phone number into the whitelist.
  - **Toggle Status:** 1-click button to suspend or reactivate publishing access.

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

The **Hallway Display App** (`http://localhost:3000/display/[deptId]`) runs on Smart TVs mounted in hallway corridors.

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
* **Display App URL:** `http://localhost:3000/display/ece`
* **Admin Portal URL:** `http://localhost:3001`
* **Master Emergency PIN:** `1234`
* **Brand Colors:** Ink Black (`#111111`), Brand Blue (`#2563EB`), Sky Blue (`#60A5FA`), Success Green (`#22C55E`), Alert Red (`#DC2626`).

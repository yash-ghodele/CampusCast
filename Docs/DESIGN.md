# CampusCast — Visual Design System & Kiosk UX Specifications

This document defines the brand identity, visual design tokens, typography specifications, department color themes, and UI component behaviors for both the **Smart TV Display App** ([`display/`](file:///d:/Projects/CampusCast/display)) and the **Campus Communication Command Center Admin Portal** ([`admin/`](file:///d:/Projects/CampusCast/admin)).

---

## 1. Brand Identity & Typography Specifications

- **Brand Name**: **CampusCast**
- **Tagline**: *"YOUR CAMPUS. YOUR VOICE."*
- **Primary Typography**: **`Poppins`** (Google Fonts — Modern • Clean • Readable)
  - Headings & Titles: `Poppins` Bold (700) / Black (900)
  - Section Headers: `Poppins` SemiBold (600)
  - Body Text: `Poppins` Medium (500) / Regular (400)
  - Monospace (Clocks & IDs): System Monospace font family (`font-mono`)

---

## 2. Master Color Tokens (Brand Kit)

| Token Name | Hex Code | Purpose & Usage |
|---|---|---|
| **Primary Onyx / Surface** | `#111111` / `#0B1220` | Anti-glare dark background surface for Smart TV kiosks & admin portal. |
| **Navy Slate Card** | `#141C2E` | Container background for notice cards, modals, and screen wall grid. |
| **Border Slate** | `#222F47` | Subtle structural border outlines for card boundaries. |
| **Royal Blue** | `#2563EB` | Primary brand accent for communication badges, wizard buttons, & active tabs. |
| **Sky Blue** | `#60A5FA` | Secondary accent for dates, clock icons, & department pills. |
| **Emerald Green** | `#22C55E` | Live status layer (`🟢 Live`), online screens, & successful actions. |
| **Light Neutral** | `#F3F4F6` | Off-white background accent for high-contrast hallway readability. |
| **Crimson Alert Red** | `#EF4444` / `#DC2626` | Emergency override background (`#DC2626`) & urgent priority borders. |
| **Caution Amber** | `#F59E0B` / `#D97706` | Scheduled notice pills & missed heartbeat warnings. |

---

## 3. Department Scope Branding Themes

Each department receives a distinct theme color for instant visual recognition across hallway display screens:

| Department | Short Code | Theme Color | Primary Hex | Badge Bg | Badge Text | Border Hex |
|---|---|---|---|---|---|---|
| **Electronics & Communication** | `ECE` | Vibrant Orange | `#F97316` | `#FFEDD5` | `#9A3412` | `#FB923C` |
| **Computer Science & Eng.** | `CSE` | Royal Blue | `#2563EB` | `#DBEAFE` | `#1E40AF` | `#60A5FA` |
| **AI & Machine Learning** | `AIML` | Deep Purple | `#8B5CF6` | `#EDE9FE` | `#5B21B6` | `#A78BFA` |
| **Mechanical Engineering** | `MECH` | Crimson Red | `#EF4444` | `#FEE2E2` | `#991B1B` | `#F87171` |
| **Civil Engineering** | `CIVIL` | Emerald Green | `#22C55E` | `#DCFCE7` | `#166534` | `#4ADE80` |
| **Electrical & Electronics** | `EEE` | Caution Amber | `#F59E0B` | `#FEF3C7` | `#92400E` | `#FBBF24` |

---

## 4. Display Modes & Kiosk UX Specifications ([`display/`](file:///d:/Projects/CampusCast/display))

### Mode 1: Hero Notice View (Default View)
- **Screen Footprint**: Occupies **80%** of screen viewport.
- **Visual Structure**:
  - Top: `FEATURED NOTICE` badge, category tag badge (`EXAM`, `PLACEMENT`, `EVENT`, `URGENT`, `ACHIEVEMENT`), and posted time (`Posted at 10:45 AM`).
  - Headline Title: `Poppins` Black font size 32px to 44px.
  - Body Text: `Poppins` Medium font size 24px to 28px for 10-meter hallway distance legibility.
  - Bottom Bar: Date chip (`📅 05 Oct 2026`), time chip (`⏰ 10:00 AM`), department badge, and interactive WhatsApp QR code snippet (`Scan QR for details`).
- **Auto Rotation**: Rotates featured notice cards every **10 seconds** with smooth keyframe transitions.

### Mode 2: News Ticker Marquee (Bottom Marquee)
- **Height**: Fixed 44px bottom ticker bar.
- **Behavior**: Continuous horizontal scrolling animation (`@keyframes marquee`, 25s loop duration).
- **Content**: Scrolls secondary announcements (`📢 Midterm Examination schedule released  •••  📢 Placement Drive by Infosys on Monday`).

### Mode 3: Emergency Override View
- **Trigger**: Activated automatically when `priority == 'urgent'` or `category == 'emergency'`.
- **Styling**: Entire screen transforms to full-bleed red background (`#DC2626`).
- **Elements**: `⚠️ URGENT CAMPUS ANNOUNCEMENT` header, large alert icon, bold headline, notice content, issuer signature (`- Principal Office / Campus Security`), and pulsing red glow (`urgent-glow`). Normal notice carousels are paused.

### Mode 4: Event Carousel View
- **Media Support**: PNG, JPEG, and PDF previews (`mediaUrl` / `mediaType`) centered inside constrained aspect bounds (`max-h-[350px]`).

### Mode 5: Split Screen View
- **Grid Layout**: 12-column responsive layout.
  - Left Side (7 columns): Featured Event Poster image.
  - Right Side (5 columns): Live announcement notice feed list.

---

## 5. Admin Command Center UX Specifications ([`admin/`](file:///d:/Projects/CampusCast/admin))

- **Sidebar Navigation**: Fixed 64-width sidebar (`#141C2E`) containing brand logo, 8 module navigation buttons, and an Emergency Override fast trigger button.
- **Notice Creation Wizard Modal (5 Steps)**:
  - Step 1: Select Announcement Category (`Announcement`, `Event`, `Placement`, `Exam`, `Emergency`, `Achievement`).
  - Step 2: Content (Headline Title, Description text, Media URL).
  - Step 3: Audience Scope (`ECE`, `CSE`, `AIML`, `MECH`, `CIVIL`, `EEE`, `ALL`).
  - Step 4: Publication Schedule (`Publish Now` or `Schedule for Later`).
  - Step 5: Smart TV Card Preview showing actual display formatting before broadcasting.
- **Display Control & Screen Wall Grid**: Cards for each physical screen displaying label, screen ID, resolution (`1080p`), heartbeat timestamp, online/offline status pill (`🟢 Online` / `🔴 Offline`), and copy display URL button.
- **Layout Accessibility & Overflow Scrolling**: Configured with standard CSS `min-height: 100vh;`, `overflow-y: auto`, and custom scrollbars (`::-webkit-scrollbar`) so all views scroll smoothly whenever content exceeds viewport height.

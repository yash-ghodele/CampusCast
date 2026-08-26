# CampusCast — Visual Design System & Kiosk UX

## 1. Display Kiosk Design Tokens
- **Background Surface**: Deep Slate Dark (`#0B1220`)
- **Card Background**: Navy Card Slate (`#141C2E`)
- **Primary Accent**: Electric Blue (`#3B82F6`)
- **Urgent Alert Accent**: Crimson Red (`#E5484D`)
- **Container Borders**: Dark Slate (`#222F47`)
- **Primary Typography**: Off-White (`#F5F7FA`)
- **Secondary Typography**: Slate Gray (`#8B96A8`)

## 2. Hallway Distance Legibility & Layout
- **Notice Body Font Size**: Minimum 28px font size for hallway viewing distance (10+ meters).
- **Urgent Priority Cards**: Feature thick 8px red left border (`#E5484D`), warning badge (`⚠️ URGENT ANNOUNCEMENT`), and CSS pulse glow animation (`urgent-glow`).
- **Header Component (90px)**: Department badge, department title, and live digital clock (`HH:mm:ss IST`).
- **Footer Component (48px)**: System attribution, active notice count pill, and telemetry status indicator dot (`Live` / `🟡 Reconnecting...`).
- **Card Auto-Scroll**: Smooth auto-scrolling triggers every 8 seconds if notice cards overflow viewport height.

## 3. Offline Resilience UX
- On Wi-Fi connection loss, display kiosks retain the last rendered notices and present a subtle `🟡 Reconnecting...` footer indicator. Screens **never go blank** or display full-page error screens.

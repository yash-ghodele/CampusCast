# CampusCast — Project Abstract

CampusCast bridges the gap between everyday messaging tools and physical campus signage by turning **WhatsApp** into an authenticated publishing interface for a real-time, department-scoped digital notice board network, supported by a central **Campus Communication Operating System**.

---

## Key Highlights

- **Problem Addressed**: Traditional physical notice boards require manual printing and paper posting; WhatsApp student groups suffer from noise and message fragmentation; existing commercial digital signage platforms force faculty to navigate complex web admin portals.
- **The Core Solution**: Authorized faculty members publish announcements by sending a plain WhatsApp text message, poster image (JPEG/PNG), or PDF circular to an institutional number. CampusCast authenticates the sender by phone identity, parses priority (`#urgent`), category (`#exam`, `#event`, `#placement`), and department tags (`ECE:`), writes the notice to Cloud Firestore (NoSQL), and pushes updates to department hallway Smart TV displays in real time.
- **Zero-Hardware Smart TV Model**: Kiosk displays run directly inside the native web browser of any Smart TV (Android TV, LG webOS, Samsung Tizen OS, Fire TV) connected to campus Wi-Fi. **No Raspberry Pi, Mini-PC, or HDMI dongles required.**
- **5 Display Modes**: Mode 1 Hero Notice View (80% screen space + WhatsApp QR Code), Mode 2 News Ticker Marquee, Mode 3 Emergency Override View (`#DC2626` red alert), Mode 4 Event Carousel, Mode 5 Split Screen View.
- **Administrative Command Center**: The centralized Admin Portal ([`admin/`](file:///d:/Projects/CampusCast/admin)) allows HODs and IT staff to onboard faculty numbers, trigger PIN-authenticated emergency alerts (`1234`), manage Kanban notice lifecycles (`Scheduled`, `Active`, `Expired`), inspect screen walls, analyze usage trends, and audit security logs.
- **Target SLA**: Under 5 seconds publish-to-display latency with zero adoption friction for faculty.

# CampusCast — Project Abstract

CampusCast bridges the gap between everyday messaging tools and physical campus signage by turning **WhatsApp** into an authenticated publishing interface for a real-time, department-scoped digital notice board network.

- **Problem Addressed**: Traditional physical notice boards require manual printing and paper posting; WhatsApp student groups suffer from noise and message fragmentation; existing commercial digital signage platforms force faculty to navigate complex web admin portals.
- **The Core Solution**: Faculty publish announcements by sending a plain WhatsApp text message, poster image, or PDF to an institutional number. CampusCast authenticates the sender by phone identity, parses priority (`#urgent`) and department tags (`ECE:`), writes the notice to Cloud Firestore (NoSQL), and pushes updates to department hallway LCD display screens in real time.
- **Target SLA**: Under 5 seconds publish-to-display latency with zero adoption friction for faculty.

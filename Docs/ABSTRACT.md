# Abstract

College campuses run on notices — lab cancellations, viva reschedules, placement drives, workshop alerts — but the channels carrying them are scattered, manual, and unreliable. A notice pinned to a board goes unseen; a message buried in a 300-member WhatsApp group goes unread; a display that needs a technician to update stops getting updated at all. The result is a communication gap that costs students real opportunities.

CampusCast closes that gap by turning the tool faculty already use every day — WhatsApp — into the publishing interface for a live, department-wide digital notice network. An authorized faculty member sends a message the same way they'd message a colleague; CampusCast authenticates the sender, parses and classifies the content, and pushes it in real time to every LCD display registered to that department, with zero manual upload and zero new software to learn.

The system is built on the WhatsApp Business Cloud API for ingestion, Firebase for real-time state and storage, and lightweight web clients for display rendering — a stack chosen for low operating cost and fast propagation rather than infrastructure complexity. Role-based authorization keeps publishing rights limited to verified numbers; priority tagging, scheduling, and auto-expiry keep the board current without manual cleanup; and department-scoped routing lets one deployment serve an entire campus.

CampusCast's core bet is adoption through familiarity: because the publishing surface is a messaging app faculty are already fluent in, the system removes the single biggest failure point of prior digital-signage efforts — the training and habit-change required to get people to actually use them.

# CampusCast — Design System & Visual Specification

## 1. Design Principles
1. **Zero Learning Curve for Publishers**: Senders publish via plain WhatsApp text messages. Optional tags (`#urgent`, `#schedule`, `DEPT:`) degrade gracefully.
2. **Hallway Legibility**: High-contrast typography, body font size minimum 28px at 1080p, visible from across a hallway corridor.
3. **Never Go Blank**: Connection drops display last-rendered state with a subtle reconnecting indicator.
4. **Focused Urgent Alerts**: Urgent notices feature a distinct red left-border, warning badge, and subtle glow animation without garish strobing.

---

## 2. Display Color Palette & Design System

| Token | Hex Value | Purpose |
|---|---|---|
| `--bg` | `#0B1220` | Display Background (dark theme, glare reduction) |
| `--card` | `#141C2E` | Notice Card Background |
| `--card-border` | `#222F47` | Subtle Card Borders |
| `--text-primary` | `#F5F7FA` | High-contrast notice text |
| `--text-secondary` | `#8B96A8` | Subtitles, timestamps, footers |
| `--accent-urgent` | `#E5484D` | Red border and alert badge for urgent notices |
| `--accent-normal` | `#3B82F6` | Blue department badge and normal left border |
| Font Family | `Inter, sans-serif` | Hallway typography system |

---

## 3. Display Layout (1920×1080 Reference)

```
┌──────────────────────────────────────────────────────────┐
│  ECE DEPARTMENT                          Fri, 21 Aug 2026 │
│  Electronics & Communication Engineering        14:32 IST │  ← Header (90px)
├──────────────────────────────────────────────────────────┤
│                                                            │
│   ⚠ URGENT ANNOUNCEMENT — Project Review shifted to 2 PM  │  ← Urgent Notice Card
│   Posted at 09:14 AM                                       │    (Red left-border)
│   ─────────────────────────────────────────────────────   │
│                                                            │
│   Microprocessor Lab cancelled today.                      │  ← Normal Notice Card
│   Posted at 08:30 AM                                       │    (Blue left-border)
│                                                            │
│   [ Attachment Media Image ]                               │  ← Image Notice Card
│                                                            │
├──────────────────────────────────────────────────────────┤
│  CampusCast • Live Signage           ● Live • 3 notices    │  ← Footer (48px)
└──────────────────────────────────────────────────────────┘
```

---

## 4. WhatsApp Message Examples & System Feedback

### Plain Notice
```
ECE: Microprocessor Lab cancelled today.
```
*System Feedback*: `✅ Posted to ECE — visible now.`

### Urgent Notice
```
#urgent ECE: Project Review shifted to 2 PM.
```
*System Feedback*: `✅ Posted to ECE — visible now.`

### Scheduled Notice
```
#schedule 20-09-2026 10:00 ECE: Workshop starts today.
```
*System Feedback*: `🕒 Scheduled for ECE on 20-09-2026, 10:00 AM.`

### Ambiguous / Error Notice
```
Project Review shifted to 2 PM.
```
*System Feedback*: `❌ Department ambiguous. Please prefix your message with your target department code (e.g. ECE:). Your assigned departments: ECE, CSE.`

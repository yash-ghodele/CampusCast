# CampusCast — Design

## 1. Design Principles
1. **Zero learning curve for publishers.** If it takes more than sending a normal WhatsApp text, it won't get adopted. Every optional feature (`#urgent`, `#schedule`) must degrade gracefully — a plain message with no tags is always valid.
2. **Legible from across a hallway.** The display is not a phone screen. Large type, high contrast, minimal simultaneous content.
3. **Never go blank.** A screen with stale information is a minor problem; a screen showing nothing looks broken and erodes trust in the whole system.
4. **Boring is good for urgent notices.** Alert styling should be unmistakable but not garish — red accent, not a strobing animation.

## 2. WhatsApp Message Design (publisher-facing)

### Plain notice
```
ECE:
Microprocessor Lab cancelled today.
```

### Urgent
```
#urgent
ECE:
Project Review shifted to 2 PM.
```

### Scheduled
```
#schedule 20-09-2026 10:00
ECE:
Workshop starts today.
```

### Confirmation replies (system → faculty)
- Success: `✅ Posted to ECE — visible now.`
- Success (scheduled): `🕒 Scheduled for ECE on 20-09-2026, 10:00 AM.`
- Error, bad department: `❌ "MECH" isn't a recognized department. Reply with one of: ECE, CSE, MECH-ENGG, CIVIL, EEE.`
- Error, unauthorized: *(no reply sent — see Architecture §4 rate-limit/silent-drop rationale)*

Design rationale: the confirmation message is the faculty member's only feedback loop. Without it, a typo'd department code silently fails and the faculty member assumes it worked. The error message must always suggest the fix, not just state the failure.

## 3. Display Screen Design

### Layout (1920×1080 reference)
```
┌──────────────────────────────────────────────────────────┐
│  ECE DEPARTMENT                          Fri, 21 Aug 2026 │
│  Electronics & Communication Engineering        14:32 IST │  ← Header, 90px
├──────────────────────────────────────────────────────────┤
│                                                            │
│   ⚠ URGENT — Project Review shifted to 2 PM               │  ← Priority notice,
│                                                            │    red left-border card
│   ─────────────────────────────────────────────────────   │
│                                                            │
│   Microprocessor Lab cancelled today.                      │  ← Normal notice card
│   Posted 09:14 AM                                          │
│                                                            │
│   [ workshop poster image, contained ]                     │  ← Media notice
│                                                            │
├──────────────────────────────────────────────────────────┤
│  Powered by CampusCast              ● 3 active notices     │  ← Footer, 48px
└──────────────────────────────────────────────────────────┘
```

- Notices render as stacked cards, most recent/highest priority at top.
- If content exceeds one screen, auto-scroll/paginate every 8s (configurable) rather than shrinking text.
- Urgent notices get a persistent red left-border + ⚠ icon; optional single audible chime on first appearance (mutable per-screen, default off in exam-hall-adjacent locations).
- Media (image/PDF-as-image) is shown `object-fit: contain` inside a bounded card — never full-bleed, so it can't visually take over the header/footer.

### Visual system
| Token | Value | Use |
|---|---|---|
| `--bg` | `#0B1220` | Display background (dark, reduces glare, better for always-on LCDs) |
| `--card` | `#141C2E` | Notice card background |
| `--text-primary` | `#F5F7FA` | Notice body |
| `--text-secondary` | `#8B96A8` | Timestamps, footer |
| `--accent-urgent` | `#E5484D` | Urgent border/icon |
| `--accent-normal` | `#3B82F6` | Department name, normal accents |
| Font | Inter (or system UI fallback) | Body min 28px, header 40px, at 1080p |

Rationale for a dark theme (not in original spec): LCDs running fullscreen for 8+ hours a day benefit from dark backgrounds for both glare/eye-strain in hallway lighting and marginal power savings on OLED-style panels; also gives urgent-red and standard-blue accents strong contrast without extra saturation.

## 4. Admin Web App (new surface — see Architecture §2.6)

Minimal, utilitarian, not public-facing:
- **Roster tab:** table of faculty numbers, department scope, status (active/suspended), add/edit/suspend actions.
- **Screens tab:** list of registered screens per department, last-heartbeat status (green/gray dot), "copy display URL" action.
- **Notices tab:** searchable history, filter by department/status/date, manual edit or force-expire.
- **Audit tab:** unauthorized attempts and admin actions, read-only.

No design system beyond consistent spacing/typography is needed here — this is an internal tool used by a handful of people, not a marketing surface.

## 5. Key User Flows

### Flow: Faculty publishes a notice
1. Faculty opens WhatsApp, sends message to CampusCast number (existing contact, no new app).
2. Receives confirmation reply within seconds.
3. Done — no login, no dashboard.

### Flow: Admin onboards a new faculty member
1. Admin opens Admin app → Roster → Add.
2. Enters name, phone, department scope, role.
3. Faculty member can publish immediately — no invite email, no password (identity = their WhatsApp number).

### Flow: Screen goes offline and recovers
1. Display client loses connection (Wi-Fi blip).
2. UI keeps last rendered notices, shows a small "reconnecting…" dot in the footer (no full-screen error state — see Design Principle 3).
3. On reconnect, listener resyncs; any missed expiries/new notices apply immediately.

## 6. Deviations from the original concept
- Added a dark visual theme; original spec didn't define one.
- Specified confirmation/error reply copy explicitly (original only implied it existed).
- Added the Admin web app as a real surface with defined tabs, since roster/screen management can't reasonably live only in a database console past the pilot stage.
- Defined auto-scroll/pagination behavior for screens with more active notices than fit — original spec didn't address overflow.

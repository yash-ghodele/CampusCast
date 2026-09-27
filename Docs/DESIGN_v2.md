# CampusCast — Design v2 (Brand Kit Integration)

This supersedes the visual language in `DESIGN.md` (v1) with the official brand kit — logo, palette, typography, tone. **UX flows and layout structure carry over unchanged** (the WhatsApp message design, screen layout skeleton, and admin tab structure from v1 are still correct); what changes here is color, type, and brand voice applied on top of them. Where the brand kit's own reference mockups conflict with a v1 decision, that conflict is called out explicitly rather than silently resolved — see §6.

## 1. Brand Identity

**Tagline:** *Your Campus. Your Voice.*

**About:** CampusCast is a real-time campus communication platform that lets students and staff send messages via WhatsApp and display them instantly on campus screens — fast, reliable, effective information sharing across campus.

**Brand essence (four pillars):**
1. **Instant Communication** — the message is live the moment it's sent.
2. **Campus Community** — built for the whole campus, not one department's IT team.
3. **Reliable & Trustworthy** — a board people can actually rely on.
4. **Wide Reach** — one number, every department.

**Brand personality:** Modern · Student-Centric · Reliable · Connected · Efficient · Inclusive

**Tone of voice:** Clear, Friendly, Informative, Approachable, Professional — never bureaucratic, never cutesy. A notice board that sounds like a helpful person, not a system.

**Core values:** Transparency · Accessibility · Inclusivity · Innovation · Timeliness · Community

**Keywords:** Broadcast · Campus · Community · Communication · Information · Real-time · Connection · Impact

## 2. Logo System

- **Primary Logo (Solid Background):** `Docs/assets/logo-main.png` (`CampusCast-Main.png`) — full wordmark + signal motif.
- **Transparent Logo (Wordmark + Mark):** `Docs/assets/logo-transparent.png` (`CampusCast-Main-Picsart-BackgroundRemover.png`) — transparent PNG for UI headers and cards.
- **Icon Only (Transparent Mark):** `Docs/assets/logo-icon-transparent.png` (`ChatGPT Image Aug 26, 2026, 06_52_42 PM-Picsart-BackgroundRemover.png`) — icon mark for navbars, favicons, app badges, and header avatars.

**Asset Copy Paths:**
- Documentation reference: `Docs/assets/`
- Admin App public assets: `admin/public/`
- Display App public assets: `display/public/`

**Usage rules:**
- Allowed: On light backgrounds — primary logo / transparent logo.
- Allowed: On dark backgrounds — inverse logo / transparent logo mark.
- Do not use: Never on busy/photographic backgrounds without a solid-color plate behind it — the mark needs flat contrast to read at a glance, which matters even more at hallway viewing distance than on a phone screen.
- Maintain clear space around the mark equal to the height of the speech-bubble tail; don't crowd it against edges or other UI elements.

## 3. Color System

| Token | Hex | Name | Usage |
|---|---|---|---|
| `--ink` | `#111111` | Ink Black | Primary text on light surfaces, primary logo |
| `--brand-blue` | `#2563EB` | Brand Blue | Primary accent — buttons, links, department names, active states |
| `--brand-blue-light` | `#60A5FA` | Sky Blue | Secondary accent — chart lines, hover states, lighter emphasis |
| `--success-green` | `#22C55E` | Success Green | Confirmation states, "posted successfully," success badges |
| `--surface-gray` | `#F3F4F6` | Neutral Gray | Page/card backgrounds, dividers, neutral surfaces |
| `--white` | `#FFFFFF` | White | Cards, panels, primary surface on light layouts |

**Usage guidance from the brand kit:** black for trust and clarity, blue for tech and communication, green for success and action, gray for neutral balance.

### 3.1 The one gap the brand kit doesn't cover: urgent alerts
There's no red or warning color in the official palette — it's a calm, trustworthy blue/green/gray system by design. But CampusCast's `#urgent` notices need a color that reads as "pay attention now" and is visually distinct from the brand's own blue. Proposed addition, **not** part of the official kit, needed for functional reasons:

| Token | Hex | Usage |
|---|---|---|
| `--alert-red` | `#DC2626` | Urgent notice border/badge only — never used decoratively, reserved entirely for `#urgent` styling |

This should go back to whoever owns the brand kit as a formal addition, not just adopted quietly here — flag it as an open item.

## 4. Typography

**Typeface:** Poppins — modern, clean, readable, geometric sans-serif. Replaces v1's Inter.

| Weight | Use |
|---|---|
| Bold | Headlines, department names, urgent notice text |
| SemiBold | Section headers, card titles, button labels |
| Medium | Body emphasis, timestamps |
| Regular | Body copy, secondary text |

**Sizing (carried over from v1's hallway-legibility research — still holds regardless of typeface):** body text minimum 28px at 1080p reference, headers around 40px. Poppins runs slightly wider than Inter at the same point size — re-check line lengths on the actual display layout rather than assuming a 1:1 swap.

## 5. Applying the brand system across CampusCast's surfaces

### 5.1 Admin Dashboard (light theme — matches the brand kit's own mockup exactly)
- White/`--surface-gray` background, card-based layout.
- Left sidebar navigation (Dashboard, Messages, Screens, Analytics, Settings).
- Top stat cards: Total Messages, Active Screens, Total Views — brand-blue numerals on white cards.
- "Messages Over Time" line chart in `--brand-blue` / `--brand-blue-light`.
- Recent Messages panel as a scrollable list.
- This direction is a straightforward brand-kit application — no open questions here.

### 5.2 WhatsApp confirmation UI
- CampusCast avatar = icon-only logo mark.
- Confirmation replies keep their existing copy (`✅ Posted to ECE — visible now.`) — the green checkmark now doubles as a nod to `--success-green`.

### 5.3 Digital Signage (the screen itself) — **this is where v1 and the brand kit disagree**
The brand kit's own "Digital Signage Preview" mockup shows a **light** background (soft gray/white with a blue headline and illustration) — not the dark navy theme v1 specified. That's a real conflict, not a cosmetic detail:

- **v1's dark theme** (`#0B1220` background) was a deliberate decision, recorded in `MEMORY.md`, based on two practical arguments: reduced glare on an always-on LCD in variable hallway lighting, and less eye strain over an 8+ hour display cycle.
- **The brand kit's light mockup** is more consistent with the brand identity (matches the admin dashboard, looks like "CampusCast" everywhere else) and tests well as a static image — but it wasn't validated against an actual hallway-mounted screen the way the dark-theme reasoning was.

**Recommendation: don't silently pick one.** Build both as real options and view them on the actual target hardware under real hallway lighting before locking this in:
- **Dark variant (brand-adapted):** `#0B1220` background retained, but swap the old `--accent-normal` (`#3B82F6`) for the brand's `--brand-blue` (`#2563EB`) and keep `--alert-red` for urgent. This keeps v1's glare/eye-strain reasoning intact while still reading as "on-brand."
- **Light variant (brand-native):** `--surface-gray`/white background, `--ink` body text, `--brand-blue` for department name and normal-priority accents, `--alert-red` border for urgent cards. This matches the brand kit's own preview exactly.

Whichever wins, the layout skeleton (header/notice-cards/footer, auto-pagination, media handling) from `DESIGN.md` v1 §3 doesn't change — only the color tokens do.

## 6. Visual style pillars (from brand kit, apply everywhere)
- **Digital & Modern**
- **Simple & Clear**
- **Fast & Real-time**
- **For the Entire Campus**

## 7. Open items this doc surfaces
1. **Urgent-alert red (`#DC2626`) needs sign-off** — it's a functional necessity not covered by the official kit.
2. **Dark vs. light signage theme needs a real hallway test**, not a decision made from a mockup — see §5.3.
3. **Poppins line-length re-check** on the actual 1920×1080 display layout before assuming the v1 sizing scale ports over cleanly.

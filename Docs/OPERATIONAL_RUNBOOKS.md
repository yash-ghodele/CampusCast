# CampusCast — Operational Runbooks & Smart TV Setup Guide

This document provides operational instructions for campus IT staff managing **CampusCast** digital notice displays.

---

## 1. Smart TV Direct Browser Kiosk Setup Guide (Zero-Hardware Model)

### Zero External Hardware Required
CampusCast is designed to run directly on **any Smart TV or Smart Screen** with a built-in web browser connected to campus Wi-Fi or Ethernet. **No Raspberry Pi, Mini-PC, HDMI dongles, or external media player boxes are needed.**

### Smart TV Setup Steps (Android TV, LG webOS, Samsung Tizen OS, Fire TV)
1. **Connect Smart TV to Campus Network**: Connect the Smart TV to campus Wi-Fi or Ethernet.
2. **Open Built-in Web Browser**: Launch the native browser app on the Smart TV (Chrome, Silk, Samsung Internet, or webOS browser).
3. **Navigate to Department Display URL**:
   - ECE Display: `http://<server-ip>:3000/display/ece`
   - CSE Display: `http://<server-ip>:3000/display/cse`
   - MECH Display: `http://<server-ip>:3000/display/mech`
   - CIVIL Display: `http://<server-ip>:3000/display/civil`
   - EEE Display: `http://<server-ip>:3000/display/eee`
4. **Enable Fullscreen Mode**: Tap the fullscreen button or press `F11` / remote fullscreen key.
5. **Set as Browser Home Page**: Set the URL as the browser's default startup page so the display opens automatically when the TV is turned on.

---

## 2. Display Screen Dark / Offline Troubleshooting Runbook

### Symptoms
- Corridor Smart TV shows `🟡 Reconnecting...` indicator in the footer or displays a network disconnected message.
- Admin Portal Displays tab highlights screen with `⚠️ Screen heartbeat missed for >5 minutes`.

### Resolution Steps
1. **Check Smart TV Wi-Fi Connection**: Open TV settings and verify campus Wi-Fi or Ethernet connectivity.
2. **Refresh Browser**: Press reload/refresh on the Smart TV remote control.
3. **Verify Server URL**: Confirm the host server or Cloudflare Pages URL is reachable from campus Wi-Fi.

---

## 3. Emergency Phone Number Revocation Runbook

### Scenario
A faculty member's phone is lost, stolen, or compromised, or unauthorized notices are being published.

### Resolution Steps (Instant Lockout)
1. Log into the **CampusCast Admin Portal** (`http://localhost:3001`).
2. Navigate to the **Faculty Roster** tab.
3. Locate the compromised WhatsApp phone number (e.g. `+919876543210`).
4. Click **Suspend**.
5. **Effect**: All subsequent inbound WhatsApp messages from this number are blocked at the webhook layer, recorded in `audit_log`, and **dropped silently** without broadcasting to Smart TV display screens.
6. Navigate to **Notice History** tab and click **Force Expire** on any unauthorized active notices.

---

## 4. Meta WhatsApp Webhook Outage & HMAC Signature Diagnosis

### Symptoms
- Faculty send WhatsApp messages, but receive no automated confirmation reply (`"✅ Posted to ECE"`) and notices do not update on screens.

### Diagnosis Steps
1. **Inspect Webhook Logs**: Review Cloud Functions logs for `whatsappWebhook`:
   ```bash
   firebase functions:log --only whatsappWebhook
   ```
2. **Check HMAC Signature**: If log shows `Rejected webhook request: Invalid X-Hub-Signature-256`, verify `WHATSAPP_APP_SECRET` in environment config matches Meta Developer Portal.
3. **Verify Meta Token Health**: Verify `WHATSAPP_ACCESS_TOKEN` is active and has not expired.

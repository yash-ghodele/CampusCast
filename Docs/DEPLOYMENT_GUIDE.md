# CampusCast — Production Deployment Guide (Cloudflare & Vercel)

This guide provides step-by-step instructions for deploying CampusCast to production using **Vercel** or **Cloudflare Pages** for frontend Next.js applications and **Firebase** for backend serverless compute and Cloud Firestore.

---

## Architecture Topology

```mermaid
graph TD
    subgraph Edge CDN [Frontend Hosting (Vercel / Cloudflare)]
        AdminApp["Admin Portal (admin.campus.edu)"]
        DisplayApp["Smart TV Display (display.campus.edu)"]
    end

    subgraph Firebase [Backend Cloud (campuscast-mitece)]
        Firestore[("Cloud Firestore")]
        FuncWebhook["Cloud Function: whatsappWebhook"]
        FuncScheduler["Cloud Function: scheduledNoticeManager"]
        FuncHeartbeat["Cloud Function: screenHeartbeat"]
    end

    subgraph Hardware [Physical Screens]
        TV["Hallway Smart TVs (LG, Samsung, Android TV)"]
    end

    AdminApp <-->|Real-time onSnapshot| Firestore
    DisplayApp <-->|Real-time onSnapshot| Firestore
    TV -->|Loads Display URL| DisplayApp
    TV -->|30s Telemetry Heartbeat| Firestore
    FuncWebhook -->|Writes Notices| Firestore
    FuncScheduler -->|Promotes & Expires| Firestore
```

---

## Section 1: Firebase Backend Deployment

Before deploying frontend applications, deploy Cloud Functions, Firestore Security Rules, and Storage Rules.

### 1.1 Authenticate & Select Project
```bash
# Login to Firebase CLI
firebase login

# Set active project
firebase use campuscast-mitece
```

### 1.2 Deploy Firestore Security Rules & Storage
```bash
# Deploy firestore.rules and storage.rules
firebase deploy --only firestore:rules,storage:rules
```

### 1.3 Configure Cloud Functions Secrets & Deploy
```bash
# Set secrets for Meta WhatsApp Cloud API / Twilio
firebase functions:secrets:set WHATSAPP_VERIFY_TOKEN="your_custom_verification_token"
firebase functions:secrets:set WHATSAPP_APP_SECRET="your_meta_app_secret"

# Deploy all serverless functions
firebase deploy --only functions
```

---

## Section 2: Deploying to Vercel (Recommended for Next.js 14)

Vercel natively supports Next.js 14 App Router and monorepo configurations. We will create two separate projects linked to the same GitHub repository (`yash-ghodele/CampusCast`).

---

### 2.1 Deploy Project A: Display Kiosk (`display.campus.edu`)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New Project"**.
2. Select your repository: `yash-ghodele/CampusCast`.
3. In the project setup screen, configure the following:
   * **Project Name:** `campuscast-display`
   * **Framework Preset:** `Next.js`
   * **Root Directory:** Click *Edit* and select **`display`**.
   * **Include files outside root directory in the Build Step:** Toggle **ON** (Required for `@campuscast/shared`).
4. **Environment Variables:** Add the following keys:
   | Variable Key | Value |
   |---|---|
   | `NEXT_PUBLIC_FIREBASE_API_KEY` | `your_api_key` |
   | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `campuscast-mitece.firebaseapp.com` |
   | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `campuscast-mitece` |
   | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `campuscast-mitece.appspot.com` |
   | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `your_sender_id` |
   | `NEXT_PUBLIC_FIREBASE_APP_ID` | `your_app_id` |
5. Click **Deploy**.
6. **Assign Custom Domain:**
   * Go to **Settings > Domains** and add `display.yourcampus.edu`.

---

### 2.2 Deploy Project B: Admin Command Center (`admin.campus.edu`)

1. In the Vercel Dashboard, click **"Add New Project"** again.
2. Select the same repository: `yash-ghodele/CampusCast`.
3. Configure project settings:
   * **Project Name:** `campuscast-admin`
   * **Framework Preset:** `Next.js`
   * **Root Directory:** Click *Edit* and select **`admin`**.
   * **Include files outside root directory in the Build Step:** Toggle **ON**.
4. **Environment Variables:**
   Add the identical `NEXT_PUBLIC_FIREBASE_*` credentials listed in Step 2.1.
5. Click **Deploy**.
6. **Assign Custom Domain:**
   * Go to **Settings > Domains** and add `admin.yourcampus.edu`.

---

## Section 3: Deploying to Cloudflare Pages

Cloudflare Pages provides unlimited bandwidth and edge caching for physical digital signage kiosks.

---

### 3.1 Deploy Project A: Display Kiosk

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/) and go to **Workers & Pages > Create application > Pages > Connect to Git**.
2. Select repository `yash-ghodele/CampusCast`.
3. Configure Build Settings:
   * **Project Name:** `campuscast-display`
   * **Framework Preset:** `Next.js`
   * **Build Command:** `npm run build:display`
   * **Build Output Directory:** `display/.next`
   * **Root Directory (Advanced):** `/` (Root of monorepo)
4. **Environment Variables:**
   * `NODE_VERSION`: `20.11.0`
   * Add all `NEXT_PUBLIC_FIREBASE_*` environment keys.
5. Click **Save and Deploy**.
6. **Custom Domain:** Go to **Custom Domains** and map `display.yourcampus.edu`.

---

### 3.2 Deploy Project B: Admin Command Center

1. In Cloudflare Pages, click **Create Application > Pages > Connect to Git**.
2. Select `yash-ghodele/CampusCast`.
3. Configure Build Settings:
   * **Project Name:** `campuscast-admin`
   * **Framework Preset:** `Next.js`
   * **Build Command:** `npm run build:admin`
   * **Build Output Directory:** `admin/.next`
   * **Root Directory (Advanced):** `/`
4. **Environment Variables:**
   * `NODE_VERSION`: `20.11.0`
   * Add all `NEXT_PUBLIC_FIREBASE_*` environment keys.
5. Click **Save and Deploy**.
6. **Custom Domain:** Map `admin.yourcampus.edu`.

---

## Section 4: Smart TV Hardware Setup (Hallway Screens)

No Raspberry Pi, Mini-PC, or external HDMI sticks are required.

### 4.1 Configuration by Smart TV Operating System

| Smart TV Platform | Supported Devices | Setup Instructions |
|---|---|---|
| **Android TV / Google TV** | Sony, Xiaomi, OnePlus, TCL | Open Chrome or TV Bro browser $\rightarrow$ Navigate to `https://display.yourcampus.edu/display/ece` $\rightarrow$ Press menu $\rightarrow$ Enable "Fullscreen / Kiosk Mode". |
| **LG webOS** | LG Commercial & Consumer TVs | Open built-in Web Browser $\rightarrow$ Enter URL $\rightarrow$ Press **Remote Green Button** for Fullscreen $\rightarrow$ In TV settings, disable "Auto Power Off (4 hours)". |
| **Samsung Tizen OS** | Samsung Commercial & Smart TVs | Open Samsung Internet $\rightarrow$ Enter URL $\rightarrow$ Click Zoom / Fullscreen icon $\rightarrow$ Set TV startup mode to "Last App / Browser". |
| **Amazon Fire TV** | Fire TV Stick, Fire TV Edition | Open Amazon Silk Browser $\rightarrow$ Enter URL $\rightarrow$ Press **Menu Button (3 lines)** $\rightarrow$ Select "Full Screen Mode". |

### 4.2 Hardware Checklist for IT Admins
- [ ] Connect TV to campus 5 GHz Wi-Fi or Ethernet.
- [ ] Set TV power setting: **Disable Sleep Timer / Eco Standby**.
- [ ] Set browser zoom level to **100%** (Display layout is optimized for standard 1080p and 4K displays).
- [ ] Check Admin Screen Wall at `https://admin.yourcampus.edu/displays` to confirm the screen displays **Online** with active telemetry heartbeats.

---

## Section 5: Post-Deployment Smoke Test & Verification

| # | Test Scenario | Execution Step | Expected Verification Result |
|---|---|---|---|
| **1** | **Admin Navigation** | Visit `admin.yourcampus.edu` and click tabs | Refreshing on `/notices` or `/displays` retains active route. |
| **2** | **Live Notice Creation** | Create a notice on `admin.yourcampus.edu/notices` | Notice appears within **<1 second** on `display.yourcampus.edu/display/ece`. |
| **3** | **Emergency Alert** | Trigger Emergency Override with PIN `1234` | All connected screens immediately transition to full-screen red emergency mode. |
| **4** | **Heartbeat Telemetry** | Open display kiosk URL | Admin Screen Wall registers display as `Online` and begins counting active `HH:MM:SS` uptime. |
| **5** | **Offline Wi-Fi Resilience** | Disconnect Wi-Fi on TV for 60 seconds | Screen continues rotating cached notices without blanking or showing error modals. |

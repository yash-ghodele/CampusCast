# CampusCast — Production Deployment Guide (Cloudflare & Vercel)

This guide provides step-by-step instructions for deploying CampusCast to production using **Vercel** or **Cloudflare Pages** for frontend Next.js applications and **Firebase** for backend serverless compute and Cloud Firestore.

---

## Architecture Topology

```mermaid
flowchart TD
    subgraph EdgeCDN ["Frontend Hosting (Vercel / Cloudflare)"]
        AdminApp["Admin Portal (campus-cast-admin.vercel.app)"]
        DisplayApp["Smart TV Display (campus-cast-display.vercel.app)"]
    end

    subgraph FirebaseBackend ["Backend Cloud (campuscast-mitece)"]
        Firestore[("Cloud Firestore")]
        FuncWebhook["Webhook: Twilio / Meta Ingestion"]
        FuncScheduler["Scheduler: 1-Min State Machine"]
        FuncHeartbeat["Screen Heartbeat Monitor"]
    end

    subgraph HardwareScreens ["Physical Screens"]
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

## Production Deployment Status

- **Smart TV Display Kiosk:** Deployed to Vercel at [https://campus-cast-display.vercel.app/](https://campus-cast-display.vercel.app/)
- **Admin Command Center:** Deployed to Vercel at [https://campus-cast-admin.vercel.app/](https://campus-cast-admin.vercel.app/)
- **Firestore Security Rules:** Deployed to production (`campuscast-mitece`) with client-side write deny-all policy.
- **Backend Cloud Functions:** Ready for deployment upon activating Firebase Blaze pay-as-you-go plan on `campuscast-mitece`.

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
# Deploy firestore.rules
firebase deploy --only firestore:rules
```
> **Status:** Deployed and verified on `campuscast-mitece`. Global `allow write: if false;` policy protects database collections against client mutations.

### 1.3 Configure Cloud Functions Secrets & Deploy
```bash
# Set secrets for Meta WhatsApp Cloud API / Twilio
firebase functions:secrets:set WHATSAPP_VERIFY_TOKEN="your_custom_verification_token"
firebase functions:secrets:set WHATSAPP_APP_SECRET="your_meta_app_secret"

# Deploy all serverless functions (Requires Blaze Plan for Artifact Registry & Cloud Build)
firebase deploy --only functions
```
> **Note on Blaze Plan:** Google Cloud Functions v2 requires enabling `artifactregistry.googleapis.com` and `cloudbuild.googleapis.com`, which requires upgrading the Firebase project to the **Blaze (pay-as-you-go)** plan at [Firebase Console Billing](https://console.firebase.google.com/project/campuscast-mitece/usage/details). Google offers a generous free tier of 2M invocations/month.

---

## Section 2: Deploying to Vercel (Production Architecture)

Vercel natively supports Next.js 14 App Router and monorepo configurations. Two separate projects are linked to the GitHub repository (`yash-ghodele/CampusCast`).

### Monorepo Shared Package Resolution
To enable seamless building on Vercel without requiring pre-built `dist/` binaries, [`packages/shared/package.json`](file:///d:/Projects/CampusCast/packages/shared/package.json) maps its main/module/exports directly to `./src/index.ts`. Both `display/next.config.mjs` and `admin/next.config.mjs` specify `transpilePackages: ['@campuscast/shared']`, allowing Next.js SWC to transpile the shared code in memory during build.

---

### 2.1 Project A: Display Kiosk (`campus-cast-display.vercel.app`)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New Project"**.
2. Select repository: `yash-ghodele/CampusCast`.
3. In the project setup screen, configure:
   * **Project Name:** `campus-cast-display`
   * **Framework Preset:** `Next.js`
   * **Root Directory:** Click *Edit* and select **`display`**.
   * **Include files outside root directory in the Build Step:** Toggle **ON** (Required for `@campuscast/shared`).
4. **Environment Variables:** Add the following keys from `.env.local`:
   | Variable Key | Value |
   |---|---|
   | `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyDUreGuw2jiFaHAlhjllUJ1h1IMVIonGKo` |
   | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `campuscast-mitece.firebaseapp.com` |
   | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `campuscast-mitece` |
   | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `campuscast-mitece.firebasestorage.app` |
   | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `950390430359` |
   | `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:950390430359:web:d4a738f951367c2f37a7d2` |
   | `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | `G-0ERS0CM30Y` |
5. Click **Deploy**.
6. **Live Production Endpoint:** [https://campus-cast-display.vercel.app/](https://campus-cast-display.vercel.app/)

---

### 2.2 Project B: Admin Command Center (`campus-cast-admin.vercel.app`)

1. In the Vercel Dashboard, click **"Add New Project"** again.
2. Select the same repository: `yash-ghodele/CampusCast`.
3. Configure project settings:
   * **Project Name:** `campus-cast-admin`
   * **Framework Preset:** `Next.js`
   * **Root Directory:** Click *Edit* and select **`admin`**.
   * **Include files outside root directory in the Build Step:** Toggle **ON**.
4. **Environment Variables:**
   Add the identical `NEXT_PUBLIC_FIREBASE_*` credentials listed in Step 2.1.
5. Click **Deploy**.
6. **Live Production Endpoint:** [https://campus-cast-admin.vercel.app/](https://campus-cast-admin.vercel.app/)

---

### 2.3 Zero-Cost Webhook Ingestion & Twilio WhatsApp Sandbox Setup

To bypass the Firebase Blaze plan requirement while retaining true real-time WhatsApp mobile publishing, the serverless webhook and scheduler run directly inside Vercel API Route Handlers:

#### A. Architecture & Endpoints
- **Twilio WhatsApp Webhook:** `POST https://campus-cast-admin.vercel.app/api/webhook/twilio`
- **Meta WhatsApp Cloud Webhook:** `GET/POST https://campus-cast-admin.vercel.app/api/webhook/meta`
- **Notice Lifecycle Cron Scheduler:** `GET https://campus-cast-admin.vercel.app/api/scheduler`

#### B. Free Twilio WhatsApp Sandbox Setup (3 Minutes)
1. Register a free account at [twilio.com](https://www.twilio.com/).
2. Navigate to **Messaging > Try it out > Send a WhatsApp message**.
3. Under **Sandbox Settings**, set:
   * **WHEN A MESSAGE COMES IN:** `https://campus-cast-admin.vercel.app/api/webhook/twilio`
   * **HTTP METHOD:** `POST`
4. Click **Save**.

#### C. Testing Live WhatsApp Publishing (For Faculty & Evaluators)
1. Senders open WhatsApp on their mobile device and text `join <your-sandbox-keyword>` to the Twilio number (e.g. `+1 415 523 8886`).
2. Once connected, publish any notice formatted with hashtags:
   ```text
   #urgent #exam ECE: Midterm exam schedule released for 3rd year
   ```
3. Twilio forwards the message to your Vercel route handler.
4. The route handler checks authorization, writes the notice to Firestore, and returns an instant TwiML confirmation receipt.
5. Connected corridor Smart TVs render the notice in **<1 second**.

#### D. Automated 60-Second Notice Lifecycle Cron (Vercel Cron Jobs)
Configure `admin/vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/scheduler",
      "schedule": "* * * * *"
    }
  ]
}
```
Vercel automatically triggers `/api/scheduler` every minute to transition scheduled notices to `active` and expire outdated notices at zero monetary cost.

---

## Section 3: Deploying to Cloudflare Pages (Alternative Edge Hosting)

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
| **Android TV / Google TV** | Sony, Xiaomi, OnePlus, TCL | Open Chrome or TV Bro browser $\rightarrow$ Navigate to `https://campus-cast-display.vercel.app/display/ece` $\rightarrow$ Press menu $\rightarrow$ Enable "Fullscreen / Kiosk Mode". |
| **LG webOS** | LG Commercial & Consumer TVs | Open built-in Web Browser $\rightarrow$ Enter URL $\rightarrow$ Press **Remote Green Button** for Fullscreen $\rightarrow$ In TV settings, disable "Auto Power Off (4 hours)". |
| **Samsung Tizen OS** | Samsung Commercial & Smart TVs | Open Samsung Internet $\rightarrow$ Enter URL $\rightarrow$ Click Zoom / Fullscreen icon $\rightarrow$ Set TV startup mode to "Last App / Browser". |
| **Amazon Fire TV** | Fire TV Stick, Fire TV Edition | Open Amazon Silk Browser $\rightarrow$ Enter URL $\rightarrow$ Press **Menu Button (3 lines)** $\rightarrow$ Select "Full Screen Mode". |

### 4.2 Hardware Checklist for IT Admins
- [ ] Connect TV to campus 5 GHz Wi-Fi or Ethernet.
- [ ] Set TV power setting: **Disable Sleep Timer / Eco Standby**.
- [ ] Set browser zoom level to **100%** (Display layout is optimized for standard 1080p and 4K displays).
- [ ] Check Admin Screen Wall at `https://campus-cast-admin.vercel.app/displays` to confirm the screen displays **Online** with active telemetry heartbeats.

---

## Section 5: Post-Deployment Smoke Test & Verification

| # | Test Scenario | Execution Step | Expected Verification Result |
|---|---|---|---|
| **1** | **Admin Navigation** | Visit `https://campus-cast-admin.vercel.app/` and click tabs | Refreshing on `/notices` or `/displays` retains active route. |
| **2** | **Live Notice Creation** | Create a notice on `https://campus-cast-admin.vercel.app/notices` | Notice appears within **<1 second** on `https://campus-cast-display.vercel.app/display/ece`. |
| **3** | **Emergency Alert** | Trigger Emergency Override with PIN `1234` | All connected screens immediately transition to full-screen red emergency mode. |
| **4** | **Heartbeat Telemetry** | Open display kiosk URL | Admin Screen Wall registers display as `Online` and begins counting active `HH:MM:SS` uptime. |
| **5** | **Offline Wi-Fi Resilience** | Disconnect Wi-Fi on TV for 60 seconds | Screen continues rotating cached notices without blanking or showing error modals. |

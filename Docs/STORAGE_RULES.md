# CampusCast — Security Policy & Access Rules

## 1. Firebase Security Rules (`firestore.rules`)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Global Security Baseline: Deny all client-side writes across all collections
    match /{document=**} {
      allow write: if false;
    }

    // Notices: Public read access for active notices
    match /notices/{noticeId} {
      allow read: if resource.data.status == 'active';
    }

    // Departments & Screens: Public read access for display kiosks
    match /departments/{deptId} { allow read: if true; }
    match /screens/{screenId} { allow read: if true; }

    // Users & Audit Log: Admin read-only access
    match /users/{userId} { allow read: if request.auth != null; }
    match /audit_log/{logId} { allow read: if request.auth != null; }
  }
}
```

## 2. Security Boundaries & Protection Policies
- **Backend-Only Writes**: Display & Admin clients ONLY read. All writes execute through Firebase Admin SDK in Cloud Functions.
- **HMAC SHA-256 Webhook Verification**: Inbound Meta requests verify `X-Hub-Signature-256` SHA-256 header against `WHATSAPP_APP_SECRET`.
- **Silent Drop Policy**: Unauthorized senders are logged to `audit_log` and dropped silently without replying to prevent phone number probing.

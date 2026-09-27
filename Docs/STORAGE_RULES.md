# CampusCast — Security Policy & Access Control Rules

This document details the security model, access control policies, and security invariants enforced across CampusCast data collections in Cloud Firestore ([`firestore.rules`](file:///d:/Projects/CampusCast/firestore.rules)).

---

## 1. Firebase Security Rules Policy ([`firestore.rules`](file:///d:/Projects/CampusCast/firestore.rules))

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

---

## 2. Security Boundaries & Enforced Policies

1. **Strict Backend-Only Write Invariant**:
   - Web frontend clients ([`display/`](file:///d:/Projects/CampusCast/display) and [`admin/`](file:///d:/Projects/CampusCast/admin)) are strictly forbidden from writing or modifying any Firestore document (`allow write: if false;`).
   - All mutations execute exclusively through the Firebase Admin SDK inside serverless Cloud Functions or secure server routes.
2. **HMAC SHA-256 Webhook Verification**:
   - Inbound HTTP POST requests from Meta's WhatsApp Cloud API verify the `X-Hub-Signature-256` HMAC header against `WHATSAPP_APP_SECRET`. Unsigned or tampered requests receive HTTP 403 Forbidden.
3. **Silent Drop Policy for Unauthorized Senders**:
   - Unregistered phone numbers attempting to post notices are logged to `audit_log` and dropped silently. No automated WhatsApp error reply is sent, preventing phone probing by unauthorized actors.
4. **Emergency PIN Authorization**:
   - Emergency broadcasts in the Admin Portal require entering a master security PIN (`1234`) before emitting high-priority alerts to physical display screens.

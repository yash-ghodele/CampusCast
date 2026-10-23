/**
 * @file scripts/test-local-pipeline.cjs
 * @description Comprehensive automated test runner for CampusCast local pipeline.
 * Tests display app, admin portal, Twilio webhook, Meta fallback, and Firestore sync.
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, orderBy, limit } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyDUreGuw2jiFaHAlhjllUJ1h1IMVIonGKo",
  authDomain: "campuscast-mitece.firebaseapp.com",
  projectId: "campuscast-mitece",
  storageBucket: "campuscast-mitece.firebasestorage.app",
  messagingSenderId: "950390430359",
  appId: "1:950390430359:web:d4a738f951367c2f37a7d2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const BASE_ADMIN = 'http://localhost:3001';
const BASE_DISPLAY = 'http://localhost:3000';

const PASS = '  \x1b[32m✔ PASS\x1b[0m';
const FAIL = '  \x1b[31m✖ FAIL\x1b[0m';
const INFO = '\x1b[36mℹ\x1b[0m';

async function testFetch(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();
  return { status: res.status, headers: res.headers, text };
}

async function runTests() {
  console.log('\n=============================================================');
  console.log('   CAMPUSCAST LOCAL END-TO-END VERIFICATION SUITE');
  console.log('=============================================================\n');

  let passed = 0;
  let total = 0;

  async function assertTest(name, fn) {
    total++;
    process.stdout.write(`[Test ${total}] ${name}... `);
    try {
      await fn();
      console.log(PASS);
      passed++;
    } catch (err) {
      console.log(FAIL);
      console.error(`      Error: ${err.message}`);
    }
  }

  // 1. Healthcheck: Smart TV Display App
  await assertTest('Smart TV Display App loads on http://localhost:3000', async () => {
    const res = await testFetch(`${BASE_DISPLAY}/display/ece`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!res.text.includes('ECE') && !res.text.includes('CampusCast') && !res.text.includes('<html')) {
      throw new Error('Display HTML does not contain expected markup');
    }
  });

  // 2. Healthcheck: Admin Command Center
  await assertTest('Admin Command Center loads on http://localhost:3001', async () => {
    const res = await testFetch(`${BASE_ADMIN}/`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  // 3. Healthcheck: Twilio Webhook GET Inspector
  await assertTest('Twilio Webhook endpoint GET inspector returns online status', async () => {
    const res = await testFetch(`${BASE_ADMIN}/api/webhook/twilio`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const json = JSON.parse(res.text);
    if (json.status !== 'online') throw new Error(`Expected status online, got ${json.status}`);
  });

  // 4. Healthcheck: Notice Lifecycle Scheduler GET
  await assertTest('Notice Lifecycle Scheduler GET executes and returns metrics', async () => {
    const res = await testFetch(`${BASE_ADMIN}/api/scheduler`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const json = JSON.parse(res.text);
    if (json.success !== true) throw new Error('Expected success: true');
  });

  // 5. Healthcheck: Meta Webhook Handshake
  await assertTest('Meta WhatsApp Webhook GET challenge handshake verification', async () => {
    const res = await testFetch(`${BASE_ADMIN}/api/webhook/meta?hub.mode=subscribe&hub.verify_token=campuscast_verify_token_123&hub.challenge=test_challenge_12345`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (res.text !== 'test_challenge_12345') throw new Error(`Expected challenge echo, got ${res.text}`);
  });

  // 6. Security Test: Unauthorized Sender Silent Drop
  await assertTest('Security Check: Unauthorized phone number silent drop (empty TwiML)', async () => {
    const params = new URLSearchParams();
    params.append('From', 'whatsapp:+19995550000');
    params.append('Body', 'Unauthorized test announcement');

    const res = await testFetch(`${BASE_ADMIN}/api/webhook/twilio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!res.text.includes('<Response></Response>')) {
      throw new Error(`Expected empty <Response></Response>, got: ${res.text}`);
    }
  });

  // 7. Standard Notice Publication
  const testNoticeText = `Automated Pipeline Test Notice [${Date.now()}]: Regular department update.`;
  await assertTest('Standard Notice Ingestion from Authorized Faculty (Dr. Ramesh Sharma)', async () => {
    const params = new URLSearchParams();
    params.append('From', 'whatsapp:+919876543210');
    params.append('Body', `ECE: ${testNoticeText}`);

    const res = await testFetch(`${BASE_ADMIN}/api/webhook/twilio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!res.text.includes('Notice posted to ECE')) {
      throw new Error(`Expected confirmation message, got: ${res.text}`);
    }

    // Verify in Firestore
    const q = query(
      collection(db, 'notices'),
      where('createdBy', '==', '+919876543210')
    );
    const snap = await getDocs(q);
    if (snap.empty) throw new Error('Notice document was not found in Firestore');
    const sortedDocs = snap.docs.map(d => d.data()).sort((a, b) => b.createdAt - a.createdAt);
    const docData = sortedDocs[0];
    if (docData.departmentId !== 'ECE') throw new Error(`Expected departmentId ECE, got ${docData.departmentId}`);
  });

  // 8. Emergency Red Alert Override
  const emergencyText = `ALERT [${Date.now()}]: Power fluctuation detected. Shutdown lab equipment immediately.`;
  await assertTest('Emergency Notice Ingestion (#urgent) triggers Mode 3 Red Alert payload', async () => {
    const params = new URLSearchParams();
    params.append('From', 'whatsapp:+919876543211'); // Prof. Ananya Roy (CSE)
    params.append('Body', `#urgent CSE: ${emergencyText}`);

    const res = await testFetch(`${BASE_ADMIN}/api/webhook/twilio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!res.text.includes('EMERGENCY ALERT BROADCAST')) {
      throw new Error(`Expected emergency alert confirmation, got: ${res.text}`);
    }

    // Verify in Firestore
    const q = query(
      collection(db, 'notices'),
      where('createdBy', '==', '+919876543211')
    );
    const snap = await getDocs(q);
    if (snap.empty) throw new Error('Emergency notice was not found in Firestore');
    const sortedDocs = snap.docs.map(d => d.data()).sort((a, b) => b.createdAt - a.createdAt);
    const docData = sortedDocs[0];
    if (docData.priority !== 'urgent') throw new Error(`Expected priority 'urgent', got ${docData.priority}`);
    if (docData.category !== 'emergency') throw new Error(`Expected category 'emergency', got ${docData.category}`);
  });

  // 9. Department Ambiguity Detection
  await assertTest('Ambiguity Detection: Multi-department faculty without prefix prompts for department', async () => {
    const params = new URLSearchParams();
    params.append('From', 'whatsapp:+919876543213'); // Prof. Sunita Verma (ECE & CSE)
    params.append('Body', 'General announcement without specifying department prefix.');

    const res = await testFetch(`${BASE_ADMIN}/api/webhook/twilio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!res.text.includes('Department ambiguous')) {
      throw new Error(`Expected ambiguity warning, got: ${res.text}`);
    }
  });

  // 10. Audit Log Compliance Recording
  await assertTest('Audit Log Verification: Confirms publish action saved in audit_log collection', async () => {
    const q = query(
      collection(db, 'audit_log'),
      where('actorPhone', '==', '+919876543211')
    );
    const snap = await getDocs(q);
    if (snap.empty) throw new Error('No audit log record found for publisher');
    const sortedLogs = snap.docs.map(d => d.data()).sort((a, b) => b.timestamp - a.timestamp);
    const logData = sortedLogs[0];
    if (logData.type !== 'publish') throw new Error(`Expected type 'publish', got ${logData.type}`);
  });

  console.log('\n-------------------------------------------------------------');
  console.log(`Results: ${passed}/${total} Tests Passed (${Math.round((passed / total) * 100)}%)`);
  console.log('-------------------------------------------------------------\n');

  if (passed === total) {
    console.log('🎉 ALL LOCAL PIPELINE TESTS PASSED SUCCESSFULLY!\n');
    process.exit(0);
  } else {
    console.error('❌ SOME TESTS FAILED.\n');
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test suite crashed:', err);
  process.exit(1);
});

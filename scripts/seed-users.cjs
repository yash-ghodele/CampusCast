/**
 * @file scripts/seed-users.cjs
 * @description Cloud Firestore Database Seeding Script for Authorized Faculty Roster.
 * 
 * Populates test faculty accounts with valid international phone numbers (+91),
 * departmental bindings, and administrative privilege roles for end-to-end webhook verification.
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

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

const SEED_USERS = [
  {
    id: 'usr-ece-sharma',
    name: 'Dr. Ramesh Sharma',
    email: 'ramesh.sharma@mit.asia',
    phone: '+919876543210',
    role: 'faculty',
    departments: ['ECE'],
    status: 'active',
  },
  {
    id: 'usr-cse-roy',
    name: 'Prof. Ananya Roy',
    email: 'ananya.roy@mit.asia',
    phone: '+919876543211',
    role: 'hod',
    departments: ['CSE'],
    status: 'active',
  },
  {
    id: 'usr-aiml-malhotra',
    name: 'Dr. Vikram Malhotra',
    email: 'vikram.malhotra@mit.asia',
    phone: '+919876543212',
    role: 'faculty',
    departments: ['AIML'],
    status: 'active',
  },
  {
    id: 'usr-multi-verma',
    name: 'Prof. Sunita Verma',
    email: 'sunita.verma@mit.asia',
    phone: '+919876543213',
    role: 'faculty',
    departments: ['ECE', 'CSE'],
    status: 'active',
  },
  {
    id: 'usr-admin-master',
    name: 'Principal / Chief Admin',
    email: 'principal@mit.asia',
    phone: '+919876543200',
    role: 'super_admin',
    departments: ['ECE', 'CSE', 'AIML', 'MECH', 'CIVIL', 'EEE'],
    status: 'active',
  },
];

async function seed() {
  console.log(`Seeding ${SEED_USERS.length} authorized faculty members into Cloud Firestore...`);
  for (const user of SEED_USERS) {
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, user, { merge: true });
    console.log(`  ✓ Seeded User: ${user.name} (${user.phone}) -> [${user.departments.join(', ')}]`);
  }
  console.log('✅ Faculty roster seeding complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});

/**
 * @file scripts/seed-users.cjs
 * @description Cloud Firestore & Firebase Auth Database Seeding Script for Authorized Faculty Roster.
 * 
 * Populates institutional faculty accounts with @mit.asia domain, passwords,
 * departmental bindings, and administrative privilege roles.
 * Registers accounts in Firebase Authentication and stores user credentials in Cloud Firestore.
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');

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
const auth = getAuth(app);

const SEED_USERS = [
  {
    id: 'usr-superadmin-yash',
    name: 'Yash Ghodele',
    email: 'yash.ghodele@mit.asia',
    password: 'MitAsia@admin2026',
    phone: '+917666168561',
    role: 'super_admin',
    departments: ['ECE', 'CSE', 'AIML', 'MECH', 'CIVIL', 'EEE'],
    status: 'active',
    registeredAt: 1724284800000,
  },
  {
    id: 'usr-superadmin-yash-direct',
    name: 'Yash Ghodele',
    email: 'ghodeleyash2004@gmail.com',
    password: 'MitAsia@admin2026',
    phone: '+917666168561',
    role: 'super_admin',
    departments: ['ECE', 'CSE', 'AIML', 'MECH', 'CIVIL', 'EEE'],
    status: 'active',
    registeredAt: 1724284800000,
  },
  {
    id: 'usr-admin-master',
    name: 'Principal / Chief Admin',
    email: 'principal@mit.asia',
    password: 'MitAsia@admin2026',
    phone: '+919876543200',
    role: 'super_admin',
    departments: ['ECE', 'CSE', 'AIML', 'MECH', 'CIVIL', 'EEE'],
    status: 'active',
    registeredAt: 1724284800000,
  },
  {
    id: 'usr-ece-sharma',
    name: 'Dr. Ramesh Sharma',
    email: 'ramesh.sharma@mit.asia',
    password: 'MitAsia@sharma123',
    phone: '+919876543210',
    role: 'faculty',
    departments: ['ECE'],
    status: 'active',
    registeredAt: 1724284800000,
  },
  {
    id: 'usr-cse-roy',
    name: 'Prof. Ananya Roy',
    email: 'ananya.roy@mit.asia',
    password: 'MitAsia@roy123',
    phone: '+919876543211',
    role: 'hod',
    departments: ['CSE'],
    status: 'active',
    registeredAt: 1724284800000,
  },
  {
    id: 'usr-aiml-malhotra',
    name: 'Dr. Vikram Malhotra',
    email: 'vikram.malhotra@mit.asia',
    password: 'MitAsia@malhotra123',
    phone: '+919876543212',
    role: 'faculty',
    departments: ['AIML'],
    status: 'active',
    registeredAt: 1724284800000,
  },
  {
    id: 'usr-multi-verma',
    name: 'Prof. Sunita Verma',
    email: 'sunita.verma@mit.asia',
    password: 'MitAsia@verma123',
    phone: '+919876543213',
    role: 'faculty',
    departments: ['ECE', 'CSE'],
    status: 'active',
    registeredAt: 1724284800000,
  },
  {
    id: 'usr-mech-patil',
    name: 'Prof. Rajesh Patil',
    email: 'rajesh.patil@mit.asia',
    password: 'MitAsia@patil123',
    phone: '+919876543214',
    role: 'hod',
    departments: ['MECH'],
    status: 'active',
    registeredAt: 1724284800000,
  },
  {
    id: 'usr-civil-kulkarni',
    name: 'Dr. Neha Kulkarni',
    email: 'neha.kulkarni@mit.asia',
    password: 'MitAsia@kulkarni123',
    phone: '+919876543215',
    role: 'hod',
    departments: ['CIVIL'],
    status: 'active',
    registeredAt: 1724284800000,
  },
  {
    id: 'usr-eee-joshi',
    name: 'Prof. Amit Joshi',
    email: 'amit.joshi@mit.asia',
    password: 'MitAsia@joshi123',
    phone: '+919876543216',
    role: 'hod',
    departments: ['EEE'],
    status: 'active',
    registeredAt: 1724284800000,
  },
  {
    id: 'usr-pending-mehta',
    name: 'Dr. Priya Mehta',
    email: 'priya.mehta@mit.asia',
    password: 'MitAsia@mehta123',
    phone: '+919876543217',
    role: 'faculty',
    departments: [],
    status: 'pending',
    requestedDepartment: 'AIML',
    registeredAt: 1724284800000,
  },
];

const SEED_DEPARTMENTS = [
  { id: 'ECE', code: 'ECE', name: 'Electronics & Communication Engineering', screens: ['ECE-MAIN-DISPLAY'], hodUserId: 'usr-ece-sharma', hodName: 'Dr. Ramesh Sharma' },
  { id: 'CSE', code: 'CSE', name: 'Computer Science & Engineering', screens: ['CSE-LAB-DISPLAY'], hodUserId: 'usr-cse-roy', hodName: 'Prof. Ananya Roy' },
  { id: 'AIML', code: 'AIML', name: 'Artificial Intelligence & Machine Learning', screens: ['AIML-FOYER-DISPLAY'], hodUserId: 'usr-aiml-malhotra', hodName: 'Dr. Vikram Malhotra' },
  { id: 'MECH', code: 'MECH', name: 'Mechanical Engineering', screens: ['MECH-HALL-DISPLAY'], hodUserId: 'usr-mech-patil', hodName: 'Prof. Rajesh Patil' },
  { id: 'CIVIL', code: 'CIVIL', name: 'Civil Engineering', screens: ['CIVIL-DEPT-DISPLAY'], hodUserId: 'usr-civil-kulkarni', hodName: 'Dr. Neha Kulkarni' },
  { id: 'EEE', code: 'EEE', name: 'Electrical & Electronics Engineering', screens: ['EEE-POWER-DISPLAY'], hodUserId: 'usr-eee-joshi', hodName: 'Prof. Amit Joshi' },
];

async function seed() {
  console.log(`Starting comprehensive seed for ${SEED_USERS.length} institutional faculty accounts...`);

  // 1. Seed Cloud Firestore users collection
  for (const user of SEED_USERS) {
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, user, { merge: true });
    console.log(`  [Firestore OK] ${user.name} (${user.email}) -> Role: ${user.role}, Depts: [${user.departments.join(', ') || 'Pending'}]`);

    // 2. Register account in Firebase Authentication Email/Password
    try {
      await createUserWithEmailAndPassword(auth, user.email, user.password);
      console.log(`  [Firebase Auth Created] ${user.email}`);
    } catch (authErr) {
      if (authErr.code === 'auth/email-already-in-use') {
        console.log(`  [Firebase Auth Exists] ${user.email} (already registered)`);
      } else {
        console.warn(`  [Firebase Auth Warning] ${user.email}: ${authErr.message}`);
      }
    }
  }

  // 3. Seed Cloud Firestore departments collection
  console.log('Seeding departments configuration...');
  for (const dept of SEED_DEPARTMENTS) {
    const deptRef = doc(db, 'departments', dept.id);
    await setDoc(deptRef, dept, { merge: true });
    console.log(`  [Dept OK] ${dept.code} -> HOD: ${dept.hodName}`);
  }

  console.log('\nFaculty roster and Firebase Auth seeding completed successfully.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding execution failed:', err);
  process.exit(1);
});

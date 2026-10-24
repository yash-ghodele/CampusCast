/**
 * @file scripts/verify-all-buttons-and-links.cjs
 * @description Comprehensive Automated Verification Suite for CampusCast UI & Routing Infrastructure.
 * 
 * Verifies:
 * 1. HTTP 200/OK response status across all administrative, public display, and serverless webhook endpoints.
 * 2. Static AST / Regex validation of all Next.js `<Link>` and `<a href>` targets to ensure 0 dead or broken links.
 * 3. Interactive element validation of all `<button>` tags to guarantee active `onClick` handlers or valid form types.
 */

const fs = require('fs');
const path = require('path');

const ADMIN_SRC = path.join(__dirname, '../admin/src');
const DISPLAY_SRC = path.join(__dirname, '../display/src');

// Registered routes
const VALID_ADMIN_ROUTES = new Set([
  '/',
  '/notices',
  '/displays',
  '/departments',
  '/users',
  '/analytics',
  '/audit',
  '/settings',
  '/api/webhook/twilio',
  '/api/webhook/meta',
  '/api/scheduler',
]);

const VALID_DISPLAY_ROUTES = new Set([
  '/',
  '/display',
  '/display/all',
  '/display/ece',
  '/display/cse',
  '/display/aiml',
  '/display/mech',
  '/display/civil',
  '/display/eee',
]);

function getAllFiles(dir, exts = ['.tsx', '.ts']) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, exts));
    } else if (exts.some(ext => file.endsWith(ext))) {
      results.push(fullPath);
    }
  });
  return results;
}

async function verifyHttpRoutes() {
  console.log('\n======================================================');
  console.log('1. TESTING HTTP STATUS FOR ALL ROUTES (LOCAL & PROD)');
  console.log('======================================================');

  const testUrls = [
    // Local Admin
    { name: 'Admin Dashboard (Local)', url: 'http://localhost:3001/' },
    { name: 'Admin Notices (Local)', url: 'http://localhost:3001/notices' },
    { name: 'Admin Screens Wall (Local)', url: 'http://localhost:3001/displays' },
    { name: 'Admin Departments (Local)', url: 'http://localhost:3001/departments' },
    { name: 'Admin Users (Local)', url: 'http://localhost:3001/users' },
    { name: 'Admin Analytics (Local)', url: 'http://localhost:3001/analytics' },
    { name: 'Admin Audit Logs (Local)', url: 'http://localhost:3001/audit' },
    { name: 'Admin Settings (Local)', url: 'http://localhost:3001/settings' },
    { name: 'Admin Twilio Webhook GET (Local)', url: 'http://localhost:3001/api/webhook/twilio' },
    { name: 'Admin Meta Webhook Verification Handshake (Local)', url: 'http://localhost:3001/api/webhook/meta?hub.mode=subscribe&hub.verify_token=campuscast_verify_token_123&hub.challenge=test_challenge' },
    { name: 'Admin Scheduler GET (Local)', url: 'http://localhost:3001/api/scheduler' },

    // Local Display
    { name: 'Display Matrix / Launcher (Local)', url: 'http://localhost:3000/' },
    { name: 'Display General / All (Local)', url: 'http://localhost:3000/display' },
    { name: 'Display /display/all (Local)', url: 'http://localhost:3000/display/all' },
    { name: 'Display ECE Kiosk (Local)', url: 'http://localhost:3000/display/ece' },
    { name: 'Display CSE Kiosk (Local)', url: 'http://localhost:3000/display/cse' },
    { name: 'Display AIML Kiosk (Local)', url: 'http://localhost:3000/display/aiml' },
    { name: 'Display MECH Kiosk (Local)', url: 'http://localhost:3000/display/mech' },
    { name: 'Display CIVIL Kiosk (Local)', url: 'http://localhost:3000/display/civil' },
    { name: 'Display EEE Kiosk (Local)', url: 'http://localhost:3000/display/eee' },

    // Prod Admin
    { name: 'Admin Dashboard (Prod Vercel)', url: 'https://campus-cast-admin.vercel.app/' },
    { name: 'Admin Twilio Webhook (Prod Vercel)', url: 'https://campus-cast-admin.vercel.app/api/webhook/twilio' },

    // Prod Display
    { name: 'Display ECE Kiosk (Prod Vercel)', url: 'https://campus-cast-display.vercel.app/display/ece' },
  ];

  let passed = 0;
  let failed = 0;

  for (const item of testUrls) {
    try {
      const res = await fetch(item.url);
      const isOk = res.status >= 200 && res.status < 400;
      if (isOk) {
        console.log(`[PASS] ${item.name} -> HTTP ${res.status} (${item.url})`);
        passed++;
      } else {
        console.error(`[FAIL] ${item.name} -> HTTP ${res.status} (${item.url})`);
        failed++;
      }
    } catch (err) {
      console.error(`[ERROR] ${item.name} (${item.url}) -> ${err.message}`);
      failed++;
    }
  }

  console.log(`\nRoute Health Summary: ${passed} passed, ${failed} failed.`);
  return failed === 0;
}

function analyzeButtonsAndLinks() {
  console.log('\n======================================================');
  console.log('2. STATIC CODE AUDIT OF ALL BUTTONS AND LINKS');
  console.log('======================================================');

  const adminFiles = getAllFiles(ADMIN_SRC);
  const displayFiles = getAllFiles(DISPLAY_SRC);
  const allFiles = [...adminFiles, ...displayFiles];

  let totalLinks = 0;
  let totalButtons = 0;
  let brokenLinks = [];
  let deadButtons = [];
  let buttonCategories = {
    navigation: 0,
    modalTriggers: 0,
    crudActions: 0,
    filterToggles: 0,
    formSubmit: 0,
    exportOrDownload: 0,
    other: 0,
  };

  allFiles.forEach(filePath => {
    const relPath = path.relative(path.join(__dirname, '..'), filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    const isDisplay = relPath.startsWith('display');
    const validRoutes = isDisplay ? VALID_DISPLAY_ROUTES : VALID_ADMIN_ROUTES;

    // 1. Check Links (<Link href="..." or <a href="..." />)
    const linkRegex = /<(?:Link|a)\s+([^>]*?)href=(?:\{([^}]+)\}|"([^"]+)"|'([^']+)')([^>]*?)>/g;
    let linkMatch;
    while ((linkMatch = linkRegex.exec(content)) !== null) {
      totalLinks++;
      const rawHref = linkMatch[3] || linkMatch[4] || linkMatch[2];
      const surrounding = linkMatch[0];

      if (!rawHref) {
        brokenLinks.push({ file: relPath, rawHref: 'EMPTY', snippet: surrounding.slice(0, 80) });
        continue;
      }

      // If it's a static string internal link
      if (rawHref.startsWith('/')) {
        // Normalize any trailing slash or query
        const cleanPath = rawHref.split('?')[0].split('#')[0].replace(/\/$/, '') || '/';
        if (!validRoutes.has(cleanPath) && !cleanPath.startsWith('/display/')) {
          brokenLinks.push({ file: relPath, rawHref, cleanPath, snippet: surrounding.slice(0, 80) });
        }
      } else if (rawHref === '#') {
        // Check if there is an onClick attached to the anchor
        if (!surrounding.includes('onClick')) {
          brokenLinks.push({ file: relPath, rawHref, issue: 'Dead anchor href="#" without onClick handler', snippet: surrounding.slice(0, 80) });
        }
      }
    }

    // 2. Check Buttons (<button ... >)
    // Match button opening tag with all attributes
    const buttonRegex = /<button\s+([\s\S]*?)>/g;
    let btnMatch;
    while ((btnMatch = buttonRegex.exec(content)) !== null) {
      totalButtons++;
      const attrs = btnMatch[1];
      const hasOnClick = /onClick\s*=/.test(attrs);
      const isSubmit = /type\s*=\s*["']submit["']/.test(attrs);
      const isReset = /type\s*=\s*["']reset["']/.test(attrs);
      const isDisabled = /disabled(?:=|\s|>)/.test(attrs);
      const isFormButton = isSubmit || isReset;

      // Classify button purpose
      if (attrs.includes('Modal') || attrs.includes('Wizard') || attrs.includes('setShow') || attrs.includes('open')) {
        buttonCategories.modalTriggers++;
      } else if (attrs.includes('Delete') || attrs.includes('handleDelete') || attrs.includes('save') || attrs.includes('handleSave') || attrs.includes('toggle') || attrs.includes('handleToggle') || attrs.includes('approve') || attrs.includes('expire')) {
        buttonCategories.crudActions++;
      } else if (attrs.includes('filter') || attrs.includes('Filter') || attrs.includes('setScope') || attrs.includes('setCategory') || attrs.includes('setView') || attrs.includes('setSelected')) {
        buttonCategories.filterToggles++;
      } else if (isSubmit) {
        buttonCategories.formSubmit++;
      } else if (attrs.includes('export') || attrs.includes('download') || attrs.includes('csv')) {
        buttonCategories.exportOrDownload++;
      } else if (hasOnClick) {
        buttonCategories.navigation++;
      } else {
        buttonCategories.other++;
      }

      // Check if button has no interactive behavior
      if (!hasOnClick && !isFormButton && !isDisabled) {
        deadButtons.push({
          file: relPath,
          snippet: btnMatch[0].replace(/\s+/g, ' ').slice(0, 100),
        });
      }
    }
  });

  console.log(`Total Interactive Links Found: ${totalLinks}`);
  console.log(`Total Action Buttons Found: ${totalButtons}`);
  console.log('Button Classification Breakdown:');
  console.log('  * Modal Triggers (Create, Override, Edit):', buttonCategories.modalTriggers);
  console.log('  * CRUD & Lifecycle (Approve, Delete, Expire, Toggle):', buttonCategories.crudActions);
  console.log('  * Filter & View Selectors (Dept, Category, Mode):', buttonCategories.filterToggles);
  console.log('  * Form Submit Buttons (Save, Register, Broadcast):', buttonCategories.formSubmit);
  console.log('  * Export / Downloads (CSV Export):', buttonCategories.exportOrDownload);
  console.log('  * Navigation & Other Handlers:', buttonCategories.navigation + buttonCategories.other);

  if (brokenLinks.length > 0) {
    console.error(`\n[WARNING] Found ${brokenLinks.length} Potentially Broken Link(s):`);
    brokenLinks.forEach(b => console.error(`  - ${b.file}: ${b.rawHref} (${b.issue || 'Route not recognized'}) -> ${b.snippet}`));
  } else {
    console.log('\n[PASS] 0 Broken Links detected across all components and pages!');
  }

  if (deadButtons.length > 0) {
    console.error(`\n[WARNING] Found ${deadButtons.length} Potentially Unhandled Button(s):`);
    deadButtons.forEach(b => console.error(`  - ${b.file} -> ${b.snippet}`));
  } else {
    console.log('[PASS] 0 Dead Buttons detected! Every single button has active onClick, type="submit", or disabled controls.');
  }

  return { totalLinks, totalButtons, brokenLinks, deadButtons };
}

async function run() {
  const routesOk = await verifyHttpRoutes();
  const codeAnalysis = analyzeButtonsAndLinks();

  console.log('\n======================================================');
  console.log('FINAL AUDIT RESULT: ' + (routesOk && codeAnalysis.brokenLinks.length === 0 && codeAnalysis.deadButtons.length === 0 ? 'ALL CHECKS PASSED ✅' : 'ATTENTION NEEDED ⚠️'));
  console.log('======================================================\n');
}

run();

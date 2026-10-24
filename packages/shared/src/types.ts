/**
 * @fileoverview CampusCast Core Domain Type System & Interface Specifications.
 * 
 * Defines the unified data shapes and runtime contracts shared between the
 * Admin Management Portal, Digital Hallway Display Clients, and Serverless Ingestion
 * Webhooks. Centralizing domain models guarantees end-to-end type safety and prevents
 * schema drift across the distributed signage network.
 * 
 * @module @campuscast/shared/types
 * @package CampusCast Enterprise Digital Signage OS
 */

/** Brand Kit v2 Color Tokens */
export const BRAND_TOKENS = {
  ink: '#111111',
  blue: '#2563EB',
  blueLight: '#60A5FA',
  green: '#22C55E',
  gray: '#F3F4F6',
  white: '#FFFFFF',
  alertRed: '#DC2626',
} as const;

/** Brand Signage Theme Mode */
export type BrandThemeMode = 'light' | 'dark';

/** User roles within the institution authorization hierarchy */
export type UserRole = 'super_admin' | 'hod' | 'faculty';

/**
 * User account status:
 * - 'active': Sender is permitted to publish notices.
 * - 'suspended': Sender publishing rights revoked; inbound messages are silently dropped.
 */
export type UserStatus = 'active' | 'suspended';

/**
 * User account document stored in Firestore collection `users/{userId}`.
 * Identity is tied to the E.164 formatted phone number.
 */
export interface User {
  id: string;
  name: string;
  phone: string; // E.164 phone format e.g. "+919876543210" used as authentication credential
  role: UserRole;
  departments: string[]; // Department codes or IDs this user is authorized to publish to
  status: UserStatus;
}

/**
 * Department document stored in Firestore collection `departments/{deptId}`.
 * Acts as the routing destination and scope partition for screens and notices.
 */
export interface Department {
  id: string;
  name: string; // e.g. "Electronics & Communication Engineering"
  code: string; // Short code e.g. "ECE", "CSE", "MECH"
  screens: string[]; // Registered screen IDs assigned to this department
}

/**
 * Screen client document stored in Firestore collection `screens/{screenId}`.
 * Tracks hardware display instances and telemetry heartbeats.
 */
export interface Screen {
  id: string;
  departmentId: string; // Foreign key linking screen to target department scope
  label: string; // Human-readable location tag e.g. "ECE Hallway Main Display"
  lastSeenAt: number | null; // UNIX timestamp in ms representing the last telemetry heartbeat
}

/** Notice priority levels determining display card styling and visual prominence. */
export type NoticePriority = 'normal' | 'urgent';

/** Notice categories for visual filtering and command center analytics. */
export type NoticeCategory = 'announcement' | 'event' | 'placement' | 'exam' | 'emergency' | 'achievement';

/** Display modes supported by Smart TV department screens. */
export type DisplayMode = 'hero' | 'news_ticker' | 'emergency' | 'carousel' | 'split_screen';

/** Department Theme Colors for instant visual recognition. */
export interface DepartmentTheme {
  primary: string;
  accent: string;
  badgeBg: string;
  badgeText: string;
  border: string;
}

export const DEPARTMENT_THEMES: Record<string, DepartmentTheme> = {
  ECE: {
    primary: '#F97316', // Orange
    accent: '#EA580C',
    badgeBg: '#FFEDD5',
    badgeText: '#9A3412',
    border: '#FB923C'
  },
  CSE: {
    primary: '#2563EB', // Blue
    accent: '#1D4ED8',
    badgeBg: '#DBEAFE',
    badgeText: '#1E40AF',
    border: '#60A5FA'
  },
  AIML: {
    primary: '#8B5CF6', // Purple
    accent: '#7C3AED',
    badgeBg: '#EDE9FE',
    badgeText: '#5B21B6',
    border: '#A78BFA'
  },
  MECH: {
    primary: '#EF4444', // Red
    accent: '#DC2626',
    badgeBg: '#FEE2E2',
    badgeText: '#991B1B',
    border: '#F87171'
  },
  CIVIL: {
    primary: '#22C55E', // Green
    accent: '#16A34A',
    badgeBg: '#DCFCE7',
    badgeText: '#166534',
    border: '#4ADE80'
  },
  EEE: {
    primary: '#F59E0B', // Amber
    accent: '#D97706',
    badgeBg: '#FEF3C7',
    badgeText: '#92400E',
    border: '#FBBF24'
  }
};

/** Notice lifecycle states managed centrally by backend Cloud Functions. */
export type NoticeStatus = 'scheduled' | 'active' | 'expired' | 'deleted';

/** Media attachment types supported for inline display card rendering. */
export type MediaType = 'image' | 'pdf';

/**
 * Notice document stored in Firestore collection `notices/{noticeId}`.
 * Represents a single published announcement broadcasted to department LCD screens.
 */
export interface Notice {
  id: string;
  departmentId: string; // Target department code or ID (e.g. "ECE", "CSE", "ALL")
  title?: string; // Headline title
  category?: NoticeCategory; // Notice category (announcement, event, placement, exam, emergency, achievement)
  content: string; // Sanitized notice text body
  eventDate?: string; // Formatted event date string (e.g., "05 Oct 2026")
  eventTime?: string; // Formatted event time string (e.g., "10:00 AM")
  qrCodeUrl?: string; // QR Code target link for detailed student view
  mediaUrl: string | null; // Firebase Storage URL for poster image or PDF
  mediaType: MediaType | null;
  priority: NoticePriority; // 'urgent' triggers red alert styling and glow animation
  status: NoticeStatus; // 'active' notices are rendered live by display clients
  createdBy: string; // Publisher E.164 phone number or admin identity
  authorName?: string; // Author full name (e.g. from faculty user record)
  createdAt: number; // Creation UNIX timestamp in ms
  scheduledAt: number | null; // Future UNIX timestamp when notice should promote to active
  expiresAt: number | null; // UNIX timestamp when notice should demote to expired
}

/** Audit event types logged to `audit_log` for compliance and security auditing. */
export type AuditLogEventType = 'publish' | 'unauthorized_attempt' | 'edit' | 'delete' | 'emergency_broadcast';

/**
 * Immutable audit log document stored in Firestore collection `audit_log/{logId}`.
 * Tracks administrative actions and blocked security attempts.
 */
export interface AuditLog {
  id: string;
  type: AuditLogEventType;
  actorPhone: string; // Sender phone number or admin identity
  detail: Record<string, any>; // Event detail payload (notice diffs, security block reasons)
  timestamp: number; // Log entry creation UNIX timestamp in ms
}

/**
 * Result structure produced by the WhatsApp message parsing engine.
 * Extracted from raw inbound message body strings.
 */
export interface ParsedNoticeMessage {
  departmentCode: string | null; // Target department code if explicitly prefixed (e.g. "ECE:")
  priority: NoticePriority; // Priority derived from `#urgent` tag presence
  category?: NoticeCategory; // Category derived from tags like `#event`, `#exam`, etc.
  scheduledAt: number | null; // Scheduled timestamp derived from `#schedule` date string
  content: string; // Cleaned body text with tags and prefixes stripped out
}

/**
 * Canonical Production Cloud Deployment Endpoints for CampusCast.
 */
export const PRODUCTION_ENDPOINTS = {
  ADMIN_PORTAL: 'https://campus-cast-admin.vercel.app',
  DISPLAY_PORTAL: 'https://campus-cast-display.vercel.app',
  TWILIO_WEBHOOK: 'https://campus-cast-admin.vercel.app/api/webhook/twilio',
  META_WEBHOOK: 'https://campus-cast-admin.vercel.app/api/webhook/meta',
  SCHEDULER_CRON: 'https://campus-cast-admin.vercel.app/api/scheduler',
} as const;

/**
 * Resolves the fully qualified corridor display URL for production deployment.
 * Defaults to the live cloud production URL `https://campus-cast-display.vercel.app`.
 *
 * @param departmentId - Target department identifier (e.g. 'ECE', 'CSE', 'ALL')
 * @returns Fully qualified hallway display URL string
 */
export function getDisplayUrl(departmentId: string): string {
  const base = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_DISPLAY_URL)
    ? process.env.NEXT_PUBLIC_DISPLAY_URL
    : PRODUCTION_ENDPOINTS.DISPLAY_PORTAL;
  return `${base}/display/${departmentId.toLowerCase()}`;
}

/**
 * Validates and returns a safe HTTP/HTTPS URL, neutralizing javascript:, data:, or vbscript: XSS vectors.
 *
 * @param url - Potential URL string to sanitize
 * @returns Safe URL string or '#' fallback if invalid or unsafe
 */
export function getSafeUrl(url?: string | null): string {
  if (!url) return '#';
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return trimmed;
    }
  } catch {
    if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
      return trimmed;
    }
  }
  return '#';
}

/**
 * Masks international phone numbers to prevent plaintext PII leakage in logs and UI displays.
 *
 * @param phone - Raw phone number string in E.164 format
 * @returns Masked phone string, e.g. "+91 98*** **210"
 */
export function maskPhoneNumber(phone?: string | null): string {
  if (!phone) return 'Unknown';
  const clean = phone.trim();
  if (clean.length < 8) return '***';
  return `${clean.slice(0, 5)}****${clean.slice(-3)}`;
}

/**
 * Determines whether a notice was ingested automatically via WhatsApp gateways.
 *
 * @param notice - Notice document to inspect
 * @returns Boolean flag indicating if notice originated from WhatsApp
 */
export function isWhatsAppNotice(notice: Notice): boolean {
  if (!notice) return false;
  const creator = (notice.createdBy || '').trim();
  return (
    creator.startsWith('+') ||
    /^\+?\d{10,15}$/.test(creator.replace(/[\s-]/g, '')) ||
    (notice.authorName !== undefined && notice.authorName !== 'Admin Command Center' && notice.authorName !== 'Principal Office & Campus Security')
  );
}

/**
 * Default secure master emergency PIN code.
 */
export const DEFAULT_SECURITY_PIN = '9482';

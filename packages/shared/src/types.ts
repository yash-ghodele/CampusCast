/**
 * @file packages/shared/src/types.ts
 * @description Core domain type definitions for the CampusCast platform.
 * 
 * NEED FOR THIS FILE:
 * Maintains a single source of truth for domain shapes shared between backend 
 * Cloud Functions and frontend web applications (Display Kiosks & Admin Portal).
 * Centralizing types prevents API interface drift and guarantees type safety.
 */

/**
 * User roles within the institution authorization hierarchy:
 * - 'super_admin': Manages institution departments, screens, and faculty roster.
 * - 'hod': Department head with publishing rights and department-level notice overrides.
 * - 'faculty': Authorized faculty member who can publish notices via WhatsApp.
 */
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
  departmentId: string; // Target department code or ID
  content: string; // Sanitized notice text body
  mediaUrl: string | null; // Firebase Storage URL for poster image or PDF
  mediaType: MediaType | null;
  priority: NoticePriority; // 'urgent' triggers red alert styling and glow animation
  status: NoticeStatus; // 'active' notices are rendered live by display clients
  createdBy: string; // Publisher E.164 phone number
  createdAt: number; // Creation UNIX timestamp in ms
  scheduledAt: number | null; // Future UNIX timestamp when notice should promote to active
  expiresAt: number | null; // UNIX timestamp when notice should demote to expired
}

/** Audit event types logged to `audit_log` for compliance and security auditing. */
export type AuditLogEventType = 'publish' | 'unauthorized_attempt' | 'edit' | 'delete';

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
  scheduledAt: number | null; // Scheduled timestamp derived from `#schedule` date string
  content: string; // Cleaned body text with tags and prefixes stripped out
}

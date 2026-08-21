export type UserRole = 'super_admin' | 'hod' | 'faculty';
export type UserStatus = 'active' | 'suspended';

export interface User {
  id: string;
  name: string;
  phone: string; // E.164 format e.g. +919876543210
  role: UserRole;
  departments: string[]; // department codes or IDs
  status: UserStatus;
}

export interface Department {
  id: string;
  name: string;
  code: string; // e.g. "ECE", "CSE", "MECH"
  screens: string[];
}

export interface Screen {
  id: string;
  departmentId: string;
  label: string;
  lastSeenAt: number | null; // UNIX timestamp in ms
}

export type NoticePriority = 'normal' | 'urgent';
export type NoticeStatus = 'scheduled' | 'active' | 'expired' | 'deleted';
export type MediaType = 'image' | 'pdf';

export interface Notice {
  id: string;
  departmentId: string;
  content: string;
  mediaUrl: string | null;
  mediaType: MediaType | null;
  priority: NoticePriority;
  status: NoticeStatus;
  createdBy: string; // user phone or userId
  createdAt: number; // UNIX timestamp in ms
  scheduledAt: number | null; // UNIX timestamp in ms
  expiresAt: number | null; // UNIX timestamp in ms
}

export type AuditLogEventType = 'publish' | 'unauthorized_attempt' | 'edit' | 'delete';

export interface AuditLog {
  id: string;
  type: AuditLogEventType;
  actorPhone: string;
  detail: Record<string, any>;
  timestamp: number;
}

export interface ParsedNoticeMessage {
  departmentCode: string | null;
  priority: NoticePriority;
  scheduledAt: number | null; // UNIX timestamp in ms
  content: string;
}

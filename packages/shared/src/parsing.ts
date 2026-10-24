/**
 * @fileoverview Deterministic Inbound Message Parsing Engine for CampusCast.
 * 
 * Provides rule-based lexical analysis of plain-text WhatsApp payloads sent by faculty.
 * Extracts operational notice metadata (department scoping, urgency priority, future
 * publication timestamps, and category classifications) without external AI latency
 * or non-deterministic behavior, guaranteeing prompt-injection immunity and sub-millisecond execution.
 * 
 * @module @campuscast/shared/parsing
 * @package CampusCast Enterprise Digital Signage OS
 */

import { NoticePriority, NoticeCategory, ParsedNoticeMessage } from './types';

/**
 * Deterministically parses inbound WhatsApp message text into structured notice metadata.
 * 
 * Processing Pipeline:
 * 1. Urgency Classification: Evaluates `#urgent` tag to assign emergency priority and theme flags.
 * 2. Category Resolution: Identifies contextual tags (`#exam`, `#event`, `#placement`, `#achievement`).
 * 3. Schedule Timestamp Parsing: Extracts `DD-MM-YYYY HH:mm` / `YYYY-MM-DD HH:mm` into UNIX epoch timestamps.
 * 4. Department Scope Resolution: Detects `#dept` hashtags and `DEPT:` prefixes, assigning target display screens.
 * 5. Content Sanitization: Strips control tokens to generate clean typography for hallway Smart TVs.
 * 
 * @param {string} text - Raw message string from the inbound WhatsApp webhook.
 * @returns {ParsedNoticeMessage} Structured notice attributes and sanitized body copy.
 * 
 * @example
 * parseNoticeMessage("#urgent #ece ECE: DSP Laboratory power fluctuation detected.");
 * // => { departmentCode: "ECE", priority: "urgent", category: "emergency", scheduledAt: null, content: "DSP Laboratory power fluctuation detected." }
 */
export function parseNoticeMessage(text: string): ParsedNoticeMessage {
  let content = text.trim();
  let priority: NoticePriority = 'normal';
  let category: NoticeCategory | undefined = undefined;
  let scheduledAt: number | null = null;
  let departmentCode: string | null = null;

  // 1. Resolve urgency priority (#urgent)
  if (/#urgent/i.test(content)) {
    priority = 'urgent';
    category = 'emergency';
    content = content.replace(/#urgent/gi, '').trim();
  }

  // 2. Resolve notice category tags (#exam, #event, #placement, #achievement)
  if (/#exam/i.test(content)) {
    category = 'exam';
    content = content.replace(/#exam/gi, '').trim();
  } else if (/#event/i.test(content)) {
    category = 'event';
    content = content.replace(/#event/gi, '').trim();
  } else if (/#placement/i.test(content)) {
    category = 'placement';
    content = content.replace(/#placement/gi, '').trim();
  } else if (/#achievement/i.test(content)) {
    category = 'achievement';
    content = content.replace(/#achievement/gi, '').trim();
  }

  // 3. Resolve future publication schedule (#schedule Date Time)
  const scheduleRegex = /#schedule\s+(\d{2,4}[-/]\d{2}[-/]\d{2,4})\s+(\d{2}:\d{2})/i;
  const scheduleMatch = content.match(scheduleRegex);

  if (scheduleMatch) {
    const dateStr = scheduleMatch[1];
    const timeStr = scheduleMatch[2];
    const dateParts = dateStr.split(/[-/]/);

    let year: number, month: number, day: number;

    if (dateParts[0].length === 4) {
      // ISO 8601 Date Format: YYYY-MM-DD
      year = parseInt(dateParts[0], 10);
      month = parseInt(dateParts[1], 10) - 1; // 0-indexed month
      day = parseInt(dateParts[2], 10);
    } else {
      // European / Indian Date Format: DD-MM-YYYY
      day = parseInt(dateParts[0], 10);
      month = parseInt(dateParts[1], 10) - 1;
      year = parseInt(dateParts[2], 10);
    }

    const [hours, minutes] = timeStr.split(':').map(n => parseInt(n, 10));
    const parsedDate = new Date(year, month, day, hours, minutes);

    if (!isNaN(parsedDate.getTime())) {
      scheduledAt = parsedDate.getTime();
    }

    content = content.replace(scheduleMatch[0], '').trim();
  }

  // 4. Resolve department hashtag targeting (e.g., #ece, #cse, #all)
  const SYSTEM_TAGS = ['URGENT', 'EXAM', 'EVENT', 'PLACEMENT', 'ACHIEVEMENT', 'SCHEDULE'];
  const hashMatches = Array.from(content.matchAll(/(?:^|\s)#([A-Za-z0-9_\-]+)\b/g));
  for (const match of hashMatches) {
    const candidate = match[1].toUpperCase();
    if (!SYSTEM_TAGS.includes(candidate)) {
      if (!departmentCode) {
        departmentCode = candidate;
      }
      content = content.replace(match[0], ' ').trim();
    }
  }

  // 5. Resolve department prefix syntax (e.g., "ECE:" or "DEPT: ECE")
  const deptPrefixRegex = /^(?:DEPT:\s*([A-Z0-9_\-]+)|([A-Z0-9_\-]+):)/i;
  const deptMatch = content.match(deptPrefixRegex);

  if (deptMatch) {
    const extractedDept = (deptMatch[1] || deptMatch[2]).toUpperCase();
    if (!departmentCode) {
      departmentCode = extractedDept;
    }
    content = content.replace(deptPrefixRegex, '').trim();
  }

  return {
    departmentCode,
    priority,
    category,
    scheduledAt,
    content
  };
}

/**
 * Automatically detects whether a media URL points to an image poster, PDF document circular, or null.
 * 
 * @param url Inbound media URL or string
 * @returns 'image' | 'pdf' | null
 */
export function detectMediaType(url: string | null | undefined): 'image' | 'pdf' | null {
  if (!url || typeof url !== 'string') return null;
  const clean = url.trim().toLowerCase();
  if (clean.endsWith('.pdf') || clean.includes('.pdf?') || clean.includes('/pdf/')) {
    return 'pdf';
  }
  if (
    clean.endsWith('.png') ||
    clean.endsWith('.jpg') ||
    clean.endsWith('.jpeg') ||
    clean.endsWith('.webp') ||
    clean.endsWith('.svg') ||
    clean.endsWith('.gif') ||
    clean.includes('images.unsplash.com') ||
    clean.includes('cloudinary.com') ||
    clean.includes('imgur.com') ||
    clean.includes('firebasestorage.googleapis.com') ||
    clean.startsWith('data:image/') ||
    clean.startsWith('http')
  ) {
    return 'image';
  }
  return null;
}

/**
 * Notice partitioning interface for adaptive smart media block arrangement.
 */
export interface PartitionedNotices<T = any> {
  urgentNotices: T[];
  posterMediaNotices: T[];
  documentPdfNotices: T[];
  eventDateNotices: T[];
  textOnlyNotices: T[];
}

/**
 * Partitions notices into specific semantic blocks based on mediaType, date/time, and urgency.
 */
export function partitionNoticesByMediaType<T extends { priority?: string; category?: string; mediaType?: string | null; mediaUrl?: string | null; eventDate?: string; eventTime?: string }>(
  notices: T[]
): PartitionedNotices<T> {
  const urgentNotices: T[] = [];
  const posterMediaNotices: T[] = [];
  const documentPdfNotices: T[] = [];
  const eventDateNotices: T[] = [];
  const textOnlyNotices: T[] = [];

  for (const n of notices) {
    if (n.priority === 'urgent' || n.category === 'emergency') {
      urgentNotices.push(n);
    } else if (n.mediaType === 'image' || (n.mediaUrl && !n.mediaUrl.toLowerCase().includes('.pdf'))) {
      posterMediaNotices.push(n);
    } else if (n.mediaType === 'pdf' || (n.mediaUrl && n.mediaUrl.toLowerCase().includes('.pdf'))) {
      documentPdfNotices.push(n);
    } else if (n.eventDate || n.eventTime) {
      eventDateNotices.push(n);
    } else {
      textOnlyNotices.push(n);
    }
  }

  return {
    urgentNotices,
    posterMediaNotices,
    documentPdfNotices,
    eventDateNotices,
    textOnlyNotices
  };
}

/**
 * Formats a UNIX timestamp (ms) into a standard 24-hour or 12-hour HH:MM:SS string.
 * @example formatHeartbeatTimestamp(1727450355000) => "20:49:15"
 */
export function formatHeartbeatTimestamp(timestamp: number | null): string {
  if (!timestamp) return '--:--:--';
  const d = new Date(timestamp);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

/**
 * Formats elapsed seconds or millisecond delta into HH:MM:SS duration string.
 * @example formatDurationHHMMSS(125) => "00:02:05"
 */
export function formatDurationHHMMSS(secondsOrMs: number): string {
  if (secondsOrMs <= 0 || isNaN(secondsOrMs)) return '00:00:00';
  // If input is large (> 100,000), treat as ms, otherwise seconds
  const totalSeconds = secondsOrMs > 100000 ? Math.floor(secondsOrMs / 1000) : Math.floor(secondsOrMs);
  const hh = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const mm = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const ss = String(totalSeconds % 60).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

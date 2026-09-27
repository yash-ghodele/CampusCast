/**
 * @file packages/shared/src/parsing.ts
 * @description Inbound WhatsApp message parsing engine for CampusCast.
 * 
 * NEED FOR THIS FILE:
 * Faculty members interact exclusively via plain WhatsApp text messages.
 * This parser deterministically extracts notice metadata (department code, priority level, 
 * scheduled date/time) without introducing complex or unpredictable AI dependencies.
 * Deterministic parsing guarantees high security, zero prompt injection risk, and low latency.
 */

import { NoticePriority, NoticeCategory, ParsedNoticeMessage } from './types';

/**
 * Parses raw text received from a WhatsApp message payload into a structured `ParsedNoticeMessage`.
 * 
 * WORKING MECHANISM:
 * 1. Checks for the `#urgent` tag anywhere in the string to set high-priority styling flags.
 * 2. Scans for `#schedule DD-MM-YYYY HH:mm` or `YYYY-MM-DD HH:mm` to extract future publication timestamps.
 * 3. Identifies explicit department prefixes (e.g., `ECE:` or `DEPT: ECE`) at the start of the text.
 * 4. Strips out all extracted tag tokens to leave clean, readable body text for hallway displays.
 * 
 * @param text Raw inbound message body from Meta WhatsApp Cloud API payload
 * @returns Structured ParsedNoticeMessage object containing metadata and clean content
 * 
 * @example
 * parseNoticeMessage("#urgent ECE: Project review shifted to 2 PM.")
 * // Returns: { departmentCode: "ECE", priority: "urgent", scheduledAt: null, content: "Project review shifted to 2 PM." }
 */
export function parseNoticeMessage(text: string): ParsedNoticeMessage {
  // Normalize whitespace and prepare working string buffer
  let content = text.trim();
  let priority: NoticePriority = 'normal';
  let category: NoticeCategory | undefined = undefined;
  let scheduledAt: number | null = null;
  let departmentCode: string | null = null;

  // STEP 1: Urgent Tag Resolution (#urgent)
  if (/#urgent/i.test(content)) {
    priority = 'urgent';
    category = 'emergency';
    content = content.replace(/#urgent/gi, '').trim();
  }

  // STEP 1.5: Category Tag Resolution (#exam, #event, #placement, #achievement)
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

  // STEP 2: Scheduled Notice Timestamp Resolution (#schedule Date Time)
  // Need: Enables automated future publishing (e.g. workshop reminders, start-of-day alerts).
  // Working: Matches DD-MM-YYYY HH:mm or YYYY-MM-DD HH:mm formats. Converts to UTC/local UNIX timestamp in ms.
  const scheduleRegex = /#schedule\s+(\d{2,4}[-/]\d{2}[-/]\d{2,4})\s+(\d{2}:\d{2})/i;
  const scheduleMatch = content.match(scheduleRegex);

  if (scheduleMatch) {
    const dateStr = scheduleMatch[1];
    const timeStr = scheduleMatch[2];
    const dateParts = dateStr.split(/[-/]/);

    let year: number, month: number, day: number;

    if (dateParts[0].length === 4) {
      // Format: YYYY-MM-DD
      year = parseInt(dateParts[0], 10);
      month = parseInt(dateParts[1], 10) - 1; // JS Date months are 0-indexed (Jan = 0)
      day = parseInt(dateParts[2], 10);
    } else {
      // Format: DD-MM-YYYY
      day = parseInt(dateParts[0], 10);
      month = parseInt(dateParts[1], 10) - 1;
      year = parseInt(dateParts[2], 10);
    }

    const [hours, minutes] = timeStr.split(':').map(n => parseInt(n, 10));
    const parsedDate = new Date(year, month, day, hours, minutes);

    if (!isNaN(parsedDate.getTime())) {
      scheduledAt = parsedDate.getTime();
    }

    // Strip out the schedule tag construct from the body string
    content = content.replace(scheduleMatch[0], '').trim();
  }

  // STEP 3: Department Prefix Resolution (e.g., "ECE:" or "DEPT: ECE")
  // Need: Routes notice to the appropriate department's LCD screens when a faculty member has multi-dept access.
  // Working: Regex matches leading "DEPT: CODE" or "CODE:" patterns. Normalizes extracted code to uppercase.
  const deptPrefixRegex = /^(?:DEPT:\s*([A-Z0-9_\-]+)|([A-Z0-9_\-]+):)/i;
  const deptMatch = content.match(deptPrefixRegex);

  if (deptMatch) {
    departmentCode = (deptMatch[1] || deptMatch[2]).toUpperCase();
    content = content.replace(deptPrefixRegex, '').trim();
  }

  // Return final parsed notice metadata object
  return {
    departmentCode,
    priority,
    category,
    scheduledAt,
    content
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


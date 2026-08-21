import { NoticePriority, ParsedNoticeMessage } from './types';

/**
 * Parses inbound WhatsApp message content into structured Notice metadata.
 * Format examples:
 *  - ECE: Microprocessor Lab cancelled today.
 *  - #urgent ECE: Project review shifted to 2 PM.
 *  - #schedule 20-09-2026 10:00 ECE: Workshop starts today.
 */
export function parseNoticeMessage(text: string): ParsedNoticeMessage {
  let content = text.trim();
  let priority: NoticePriority = 'normal';
  let scheduledAt: number | null = null;
  let departmentCode: string | null = null;

  // 1. Check for #urgent tag
  if (/#urgent/i.test(content)) {
    priority = 'urgent';
    content = content.replace(/#urgent/gi, '').trim();
  }

  // 2. Check for #schedule tag
  // Supported formats: #schedule DD-MM-YYYY HH:mm OR #schedule YYYY-MM-DD HH:mm
  const scheduleRegex = /#schedule\s+(\d{2,4}[-/]\d{2}[-/]\d{2,4})\s+(\d{2}:\d{2})/i;
  const scheduleMatch = content.match(scheduleRegex);

  if (scheduleMatch) {
    const dateStr = scheduleMatch[1];
    const timeStr = scheduleMatch[2];
    const dateParts = dateStr.split(/[-/]/);

    let year: number, month: number, day: number;

    if (dateParts[0].length === 4) {
      // YYYY-MM-DD
      year = parseInt(dateParts[0], 10);
      month = parseInt(dateParts[1], 10) - 1;
      day = parseInt(dateParts[2], 10);
    } else {
      // DD-MM-YYYY
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

  // 3. Department prefix matching
  // Matches "DEPT: ECE" or "ECE:" or "MECH-ENGG:"
  const deptPrefixRegex = /^(?:DEPT:\s*([A-Z0-9_\-]+)|([A-Z0-9_\-]+):)/i;
  const deptMatch = content.match(deptPrefixRegex);

  if (deptMatch) {
    departmentCode = (deptMatch[1] || deptMatch[2]).toUpperCase();
    content = content.replace(deptPrefixRegex, '').trim();
  }

  return {
    departmentCode,
    priority,
    scheduledAt,
    content
  };
}

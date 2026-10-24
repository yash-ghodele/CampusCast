/**
 * @file packages/shared/src/parsing.test.ts
 * @description Unit Test Suite for CampusCast WhatsApp Inbound Message Parser.
 * 
 * Verifies deterministic tag extraction (#urgent, #schedule), department code parsing,
 * date-time normalization, and clean content extraction according to the specification.
 */

import { parseNoticeMessage } from './parsing';

describe('parseNoticeMessage - Deterministic Lexical Parser Suite', () => {
  it('parses plain notice with department prefix', () => {
    const result = parseNoticeMessage('ECE: Microprocessor Lab cancelled today.');
    expect(result.departmentCode).toBe('ECE');
    expect(result.priority).toBe('normal');
    expect(result.scheduledAt).toBeNull();
    expect(result.content).toBe('Microprocessor Lab cancelled today.');
  });

  it('parses urgent notice with #urgent tag', () => {
    const result = parseNoticeMessage('#urgent ECE: Project Review shifted to 2 PM.');
    expect(result.departmentCode).toBe('ECE');
    expect(result.priority).toBe('urgent');
    expect(result.scheduledAt).toBeNull();
    expect(result.content).toBe('Project Review shifted to 2 PM.');
  });

  it('parses scheduled notice with #schedule DD-MM-YYYY HH:mm tag', () => {
    const result = parseNoticeMessage('#schedule 20-09-2026 10:00 ECE: Workshop starts today.');
    expect(result.departmentCode).toBe('ECE');
    expect(result.priority).toBe('normal');
    expect(result.scheduledAt).not.toBeNull();
    expect(result.content).toBe('Workshop starts today.');
  });

  it('parses DEPT: prefix syntax', () => {
    const result = parseNoticeMessage('DEPT: CSE Hackathon registrations open now.');
    expect(result.departmentCode).toBe('CSE');
    expect(result.priority).toBe('normal');
    expect(result.content).toBe('Hackathon registrations open now.');
  });
});

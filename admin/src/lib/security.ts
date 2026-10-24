/**
 * @file admin/src/lib/security.ts
 * @description Master Security PIN and Administrative Authorization Utilities.
 * 
 * Provides centralized retrieval and validation of the master emergency broadcast security PIN,
 * reading from persistent system settings with graceful fallback to DEFAULT_SECURITY_PIN.
 */

import { DEFAULT_SECURITY_PIN } from '@campuscast/shared';

/**
 * Retrieves the currently configured master emergency PIN from localStorage or returns default.
 *
 * @returns 4-digit security PIN string
 */
export function getMasterSecurityPin(): string {
  if (typeof window === 'undefined') return DEFAULT_SECURITY_PIN;
  try {
    const stored = localStorage.getItem('campuscast_settings');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.emergencyPin && typeof parsed.emergencyPin === 'string' && parsed.emergencyPin.trim()) {
        return parsed.emergencyPin.trim();
      }
    }
  } catch {
    // fallback to default
  }
  return DEFAULT_SECURITY_PIN;
}

/**
 * Validates a user-submitted emergency PIN code against the configured master PIN.
 *
 * @param enteredPin - User-entered PIN code string
 * @returns Boolean flag indicating whether the PIN is valid
 */
export function verifyMasterSecurityPin(enteredPin: string): boolean {
  return enteredPin.trim() === getMasterSecurityPin();
}

/**
 * Shared utilities for BirthCode calculators
 */

/**
 * Parse date string to get year, month, day without timezone issues
 * Handles both "YYYY-MM-DD" strings and Date objects
 *
 * IMPORTANT: JavaScript's Date parsing of "YYYY-MM-DD" strings interprets them
 * as UTC midnight, which can shift the date when converted to local time.
 * This function extracts the literal date components to avoid that issue.
 */
export function parseDateComponents(birthDate) {
  if (typeof birthDate === 'string') {
    // Parse directly from string to avoid timezone issues
    const parts = birthDate.split('-');
    return {
      year: parseInt(parts[0], 10),
      month: parseInt(parts[1], 10),
      day: parseInt(parts[2], 10)
    };
  }
  // For Date objects, use UTC methods to avoid timezone shifts
  const date = new Date(birthDate);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate()
  };
}

/**
 * Calculate days between two dates (as strings or Date objects)
 */
export function daysBetween(date1, date2) {
  // Convert to comparable dates in UTC
  const d1 = typeof date1 === 'string'
    ? new Date(date1 + 'T00:00:00Z')
    : new Date(date1);
  const d2 = typeof date2 === 'string'
    ? new Date(date2 + 'T00:00:00Z')
    : new Date(date2);

  const oneDay = 24 * 60 * 60 * 1000;
  return Math.floor((d2 - d1) / oneDay);
}

/**
 * Create a UTC date from components
 */
export function createUTCDate(year, month, day) {
  return new Date(Date.UTC(year, month - 1, day));
}

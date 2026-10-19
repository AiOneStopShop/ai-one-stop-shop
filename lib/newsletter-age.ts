// Shared newsletter age-gate rules. Never render NEWSLETTER_MIN_AGE near the form.
export const NEWSLETTER_MIN_AGE = 16;
export const BLOCK_KEY = 'aios_ns_block';
export const BLOCK_MS = 86_400_000;

/** True when the value is a plausible 4-digit birth year (1900..current year). */
export function isValidBirthYear(value: string, now: Date = new Date()): boolean {
  if (!/^[0-9]{4}$/.test(value)) return false;
  const year = Number(value);
  return year >= 1900 && year <= now.getFullYear();
}

/** Year-only check: currentYear - birthYear < 16 is under age; == 16 is allowed. */
export function meetsMinAge(birthYear: number, now: Date = new Date()): boolean {
  return now.getFullYear() - birthYear >= NEWSLETTER_MIN_AGE;
}

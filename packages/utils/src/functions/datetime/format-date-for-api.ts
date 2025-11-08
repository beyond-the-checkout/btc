/**
 * Formats a Date to the API-expected string format:
 * "YYYY-MM-DD HH:mm:ss.sss" (UTC, without the trailing 'Z').
 */
export function formatDateForAPI(date: Date): string {
  return date.toISOString().replace("T", " ").replace("Z", "");
}


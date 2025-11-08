/**
 * Returns a new Date representing the end of the given day (23:59:59.999)
 * in the local timezone.
 */
export function getEndOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}


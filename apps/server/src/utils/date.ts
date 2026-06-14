/** Full date string e.g. "Wednesday, April 8, 2026" */
export function formatFullDate(date: Date = new Date()): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Short date + time string e.g. "Apr 8, 4:32 PM" */
export function formatShortDateTime(date: Date = new Date()): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

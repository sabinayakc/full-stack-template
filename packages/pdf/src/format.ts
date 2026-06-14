/**
 * Convert a snake_case or kebab-case identifier to Title Case for display
 * (e.g. "labor" -> "Labor", "concrete_replacement" -> "Concrete Replacement").
 */
export function formatTypeLabel(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .replace(/[_-]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((word) => (word.length === 0 ? word : word[0].toUpperCase() + word.slice(1).toLowerCase()))
    .join(" ");
}

// Formatting Utilities
export function formatDate(date: Date): string {
  return date.toISOString();
}

export function formatNumber(value: number): string {
  return value.toString();
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
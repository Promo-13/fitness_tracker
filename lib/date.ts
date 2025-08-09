export function pad2(n: number) {
  return n.toString().padStart(2, "0")
}

// Returns YYYY-MM-DD using local time components
export function dateKeyLocal(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

// Build a local date key for a specific Y/M/D (monthIndex is 0-based)
export function dateKeyFromYMD(year: number, monthIndex: number, day: number): string {
  return `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`
}

// Parse a YYYY-MM-DD key as a local Date (not UTC)
export function parseDateKeyToLocalDate(key: string): Date {
  const [y, m, d] = key.split("-").map((v) => Number.parseInt(v, 10))
  return new Date(y, (m || 1) - 1, d || 1)
}

export type Unit = "kg" | "lb"

const FACTOR = 2.20462262185

export const DEFAULT_UNIT: Unit = "kg"

export function kgToLb(kg: number): number {
  return kg * FACTOR
}

export function lbToKg(lb: number): number {
  return lb / FACTOR
}

export function roundForUnit(value: number, unit: Unit): number {
  // Common gym plate increments
  const inc = unit === "kg" ? 2.5 : 5
  return Math.round(value / inc) * inc
}

export function formatWeight(kg: number, unit: Unit): string {
  if (!kg) return `0 ${unit}`
  const val = unit === "kg" ? kg : kgToLb(kg)
  const rounded = unit === "kg" ? Math.round(val * 10) / 10 : Math.round(val) // 0.1 kg precision, 1 lb precision
  return `${rounded}${unit === "kg" ? " kg" : " lb"}`
}

// Helpers for inputs (convert displayed value <-> kg)
export function displayFromKg(kg: number, unit: Unit): number {
  const val = unit === "kg" ? kg : kgToLb(kg)
  // Keep a simple precision for inputs
  return unit === "kg" ? Math.round(val * 10) / 10 : Math.round(val)
}

export function kgFromDisplay(displayValue: number, unit: Unit): number {
  return unit === "kg" ? displayValue : lbToKg(displayValue)
}

import type { ColorKey } from "./types"

export const COLOR_OPTIONS: { key: ColorKey; label: string }[] = [
  { key: "red", label: "Red" },
  { key: "green", label: "Green" },
  { key: "purple", label: "Purple" },
  { key: "orange", label: "Orange" },
  { key: "pink", label: "Pink" },
  { key: "teal", label: "Teal" },
  { key: "amber", label: "Amber" },
  { key: "rose", label: "Rose" },
  { key: "emerald", label: "Emerald" },
  { key: "gray", label: "Gray" },
]

const calendarClassMap: Record<ColorKey, string> = {
  red: "bg-red-100 border-red-300 text-red-800",
  green: "bg-green-100 border-green-300 text-green-800",
  purple: "bg-purple-100 border-purple-300 text-purple-800",
  orange: "bg-orange-100 border-orange-300 text-orange-800",
  pink: "bg-pink-100 border-pink-300 text-pink-800",
  teal: "bg-teal-100 border-teal-300 text-teal-800",
  amber: "bg-amber-100 border-amber-300 text-amber-800",
  rose: "bg-rose-100 border-rose-300 text-rose-800",
  emerald: "bg-emerald-100 border-emerald-300 text-emerald-800",
  gray: "bg-gray-100 border-gray-300 text-gray-800",
}

const badgeClassMap: Record<ColorKey, string> = {
  red: "bg-red-100 text-red-800",
  green: "bg-green-100 text-green-800",
  purple: "bg-purple-100 text-purple-800",
  orange: "bg-orange-100 text-orange-800",
  pink: "bg-pink-100 text-pink-800",
  teal: "bg-teal-100 text-teal-800",
  amber: "bg-amber-100 text-amber-800",
  rose: "bg-rose-100 text-rose-800",
  emerald: "bg-emerald-100 text-emerald-800",
  gray: "bg-gray-100 text-gray-800",
}

export function getCalendarClasses(color: ColorKey | undefined) {
  return calendarClassMap[color || "gray"]
}

export function getBadgeClasses(color: ColorKey | undefined) {
  return badgeClassMap[color || "gray"]
}

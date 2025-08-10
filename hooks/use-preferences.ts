"use client"

import { useEffect, useState } from "react"
import type { Unit } from "@/lib/units"
import { DEFAULT_UNIT } from "@/lib/units"

const LS_UNIT = "fitness-unit"
const LS_REST = "fitness-rest-seconds"

export function useUnit() {
  const [unit, setUnit] = useState<Unit>(DEFAULT_UNIT)

  useEffect(() => {
    const saved = localStorage.getItem(LS_UNIT)
    if (saved === "kg" || saved === "lb") setUnit(saved)
  }, [])

  useEffect(() => {
    localStorage.setItem(LS_UNIT, unit)
  }, [unit])

  return { unit, setUnit }
}

export function useRestSeconds() {
  const [seconds, setSeconds] = useState<number>(() => {
    if (typeof window === "undefined") return 90
    const saved = Number.parseInt(localStorage.getItem(LS_REST) || "90", 10)
    return Number.isFinite(saved) && saved > 0 ? saved : 90
  })

  useEffect(() => {
    localStorage.setItem(LS_REST, String(seconds))
  }, [seconds])

  return { seconds, setSeconds }
}

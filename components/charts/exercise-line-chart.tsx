"use client"

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { format } from "date-fns"
import { parseDateKeyToLocalDate } from "@/lib/date"
import type { WorkoutSession } from "@/lib/types"
import { displayFromKg } from "@/lib/units"
import type { Unit } from "@/lib/units"

type Props = {
  sessions: WorkoutSession[]
  exerciseName: string
  unit: Unit
  height?: number
}

export function ExerciseLineChart({ sessions, exerciseName, unit, height = 160 }: Props) {
  const points = sessions
    .filter((s) => s.exercises.some((e) => e.name === exerciseName && e.completed))
    .map((s) => {
      const ex = s.exercises.find((e) => e.name === exerciseName)!
      const d = parseDateKeyToLocalDate(s.date)
      return {
        date: s.date,
        x: format(d, "MMM d"),
        weight: displayFromKg(ex.weight || 0, unit),
      }
    })
    .sort((a, b) => parseDateKeyToLocalDate(a.date).getTime() - parseDateKeyToLocalDate(b.date).getTime())

  if (points.length === 0) {
    return (
      <div className="h-[160px] w-full flex items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
        No completed data yet for this exercise
      </div>
    )
  }

  // Pad Y domain slightly for nicer spacing
  const min = Math.min(...points.map((p) => p.weight))
  const max = Math.max(...points.map((p) => p.weight))
  const pad = Math.max(1, Math.round((max - min) * 0.1))

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ left: 8, right: 8, top: 8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" tickMargin={6} />
          <YAxis domain={[min - pad, max + pad]} width={40} />
          <Tooltip />
          <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} dot />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

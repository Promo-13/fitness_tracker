"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { parseDateKeyToLocalDate } from "@/lib/date"
import { useUnit } from "@/hooks/use-preferences"
import { formatWeight } from "@/lib/units"
import { ExerciseLineChart } from "@/components/charts/exercise-line-chart"
import type { WorkoutSession } from "@/lib/types"

interface ProgressViewProps {
  workoutSessions: WorkoutSession[]
}

export function ProgressView({ workoutSessions }: ProgressViewProps) {
  const [selectedExercise, setSelectedExercise] = useState<string>("")
  const { unit } = useUnit()

  const allExercises = useMemo(
    () =>
      Array.from(new Set(workoutSessions.flatMap((s) => s.exercises.map((e) => e.name)))).filter(
        (name) => name.trim() !== "",
      ),
    [workoutSessions],
  )

  const sessionsFor = useMemo(
    () => (exerciseName: string) =>
      workoutSessions
        .filter((s) => s.exercises.some((e) => e.name === exerciseName))
        .sort((a, b) => parseDateKeyToLocalDate(a.date).getTime() - parseDateKeyToLocalDate(b.date).getTime()),
    [workoutSessions],
  )

  const selectedSessions = selectedExercise ? sessionsFor(selectedExercise) : []

  const lastCompleted = useMemo(() => {
    if (!selectedExercise) return null
    const latest = [...selectedSessions]
      .reverse()
      .map((s) => s.exercises.find((e) => e.name === selectedExercise && e.completed)?.weight)
      .find((w) => typeof w === "number")
    return typeof latest === "number" ? latest : null
  }, [selectedExercise, selectedSessions])

  const best = useMemo(() => {
    if (!selectedExercise) return null
    const weights = selectedSessions
      .map((s) => s.exercises.find((e) => e.name === selectedExercise && e.completed)?.weight || 0)
      .filter((w) => w > 0)
    return weights.length ? Math.max(...weights) : null
  }, [selectedExercise, selectedSessions])

  const recentEntries = useMemo(() => {
    if (!selectedExercise) return []
    // Newest first so it appears right under the header
    return [...selectedSessions]
      .reverse()
      .slice(0, 10)
      .map((session) => {
        const exercise = session.exercises.find((e) => e.name === selectedExercise)!
        return {
          date: session.date,
          dayName: session.dayName,
          weight: exercise.weight,
          reps: exercise.reps,
          completed: exercise.completed,
        }
      })
  }, [selectedExercise, selectedSessions])

  // Overall stats (unchanged)
  const totalWorkouts = workoutSessions.length
  const completedWorkouts = workoutSessions.filter((s) => s.completed).length
  const withDuration = workoutSessions.filter((s) => s.duration)
  const avgWorkoutDuration = withDuration.reduce((sum, s) => sum + (s.duration || 0), 0) / (withDuration.length || 1)
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const thisMonthWorkouts = workoutSessions.filter((s) => parseDateKeyToLocalDate(s.date) >= monthStart).length

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Progress Tracking</h2>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWorkouts}</div>
            <p className="text-xs text-muted-foreground">{completedWorkouts} completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisMonthWorkouts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgWorkoutDuration || 0)}m</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round((completedWorkouts / (totalWorkouts || 1)) * 100)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Exercise Progress */}
      {allExercises.length > 0 && (
        <Card>
          <CardHeader className="pb-3 pt-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Exercise Progress</CardTitle>
              <div className="w-full sm:w-72">
                <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an exercise" />
                  </SelectTrigger>
                  <SelectContent>
                    {allExercises.map((exercise) => (
                      <SelectItem key={exercise} value={exercise}>
                        {exercise}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedExercise && (
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="secondary">Exercise: {selectedExercise}</Badge>
                <Badge variant="outline">Sessions: {selectedSessions.length}</Badge>
                <Badge variant="outline">Last: {lastCompleted != null ? formatWeight(lastCompleted, unit) : "—"}</Badge>
                <Badge variant="outline">Best: {best != null ? formatWeight(best, unit) : "—"}</Badge>
              </div>
            )}
          </CardHeader>

          <CardContent className="pt-0">
            {!selectedExercise ? (
              <div className="h-[100px] w-full flex items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                Choose an exercise to view its recent sessions
              </div>
            ) : (
              <div className="space-y-4">
                {/* RECENT ENTRIES AT THE TOP */}
                <div className="space-y-1">
                  {recentEntries.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/70 rounded-md">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="text-sm font-medium">
                          {parseDateKeyToLocalDate(item.date).toLocaleDateString()}
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {item.dayName}
                        </Badge>
                        <Badge variant="outline">
                          {formatWeight(item.weight, unit)} × {item.reps}
                        </Badge>
                        <Badge variant={item.completed ? "default" : "secondary"}>
                          {item.completed ? "Completed" : "Skipped"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                {/* COMPACT CHART BELOW THE LIST */}
                <ExerciseLineChart
                  sessions={workoutSessions}
                  exerciseName={selectedExercise}
                  unit={unit}
                  height={140}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

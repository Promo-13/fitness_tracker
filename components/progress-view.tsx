"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { parseDateKeyToLocalDate } from "@/lib/date"
import type { WorkoutSession } from "@/app/page"

interface ProgressViewProps {
  workoutSessions: WorkoutSession[]
}

export function ProgressView({ workoutSessions }: ProgressViewProps) {
  const [selectedExercise, setSelectedExercise] = useState<string>("")

  const allExercises = Array.from(new Set(workoutSessions.flatMap((s) => s.exercises.map((e) => e.name)))).filter(
    (name) => name.trim() !== "",
  )

  const getExerciseProgress = (exerciseName: string) => {
    const exerciseSessions = workoutSessions
      .filter((s) => s.exercises.some((e) => e.name === exerciseName))
      .sort((a, b) => parseDateKeyToLocalDate(a.date).getTime() - parseDateKeyToLocalDate(b.date).getTime())

    return exerciseSessions.map((session) => {
      const exercise = session.exercises.find((e) => e.name === exerciseName)!
      return {
        date: session.date,
        day: session.day,
        weight: exercise.weight,
        reps: exercise.reps,
        completed: exercise.completed,
        notes: exercise.notes,
      }
    })
  }

  const getProgressTrend = (exerciseName: string) => {
    const progress = getExerciseProgress(exerciseName)
    if (progress.length < 2) return "neutral"

    const recent = progress.slice(-3).filter((p) => p.completed)
    const older = progress.slice(-6, -3).filter((p) => p.completed)

    if (recent.length === 0 || older.length === 0) return "neutral"

    const recentAvg = recent.reduce((sum, p) => sum + p.weight, 0) / recent.length
    const olderAvg = older.reduce((sum, p) => sum + p.weight, 0) / older.length

    if (recentAvg > olderAvg) return "up"
    if (recentAvg < olderAvg) return "down"
    return "neutral"
  }

  const getOverallStats = () => {
    const totalWorkouts = workoutSessions.length
    const completedWorkouts = workoutSessions.filter((s) => s.completed).length
    const withDuration = workoutSessions.filter((s) => s.duration)
    const avgWorkoutDuration = withDuration.reduce((sum, s) => sum + (s.duration || 0), 0) / (withDuration.length || 1)

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisMonthWorkouts = workoutSessions.filter((s) => parseDateKeyToLocalDate(s.date) >= monthStart).length

    const workoutTypeCount = workoutSessions.reduce(
      (acc, session) => {
        acc[session.day] = (acc[session.day] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      totalWorkouts,
      completedWorkouts,
      avgWorkoutDuration: Math.round(avgWorkoutDuration || 0),
      thisMonthWorkouts,
      workoutTypeCount,
    }
  }

  const stats = getOverallStats()

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Progress Tracking</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWorkouts}</div>
            <p className="text-xs text-muted-foreground">{stats.completedWorkouts} completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonthWorkouts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgWorkoutDuration}m</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((stats.completedWorkouts / (stats.totalWorkouts || 1)) * 100)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {allExercises.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Exercise Progress</CardTitle>
            <Select value={selectedExercise} onValueChange={setSelectedExercise}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select an exercise to track" />
              </SelectTrigger>
              <SelectContent>
                {allExercises.map((exercise) => (
                  <SelectItem key={exercise} value={exercise}>
                    {exercise}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {selectedExercise && (
              <div className="space-y-2">
                {getExerciseProgress(selectedExercise)
                  .slice(-10)
                  .map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-sm font-medium">
                          {parseDateKeyToLocalDate(item.date).toLocaleDateString()}
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {item.day} day
                        </Badge>
                        <Badge variant="outline">
                          {item.weight}kg × {item.reps}
                        </Badge>
                        <Badge variant={item.completed ? "default" : "secondary"}>
                          {item.completed ? "Completed" : "Skipped"}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

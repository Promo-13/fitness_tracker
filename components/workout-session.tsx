"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Clock, Save, TrendingUp } from "lucide-react"
import { dateKeyLocal } from "@/lib/date"
import type { DayTemplate, Exercise, WorkoutSession as WorkoutSessionType } from "@/lib/types"

interface WorkoutSessionProps {
  dayId: string
  template: DayTemplate
  onWorkoutSaved: (session: WorkoutSessionType) => void
  onBack: () => void
  previousSessions: WorkoutSessionType[]
}

export function WorkoutSession({ dayId, template, onWorkoutSaved, onBack, previousSessions }: WorkoutSessionProps) {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [startTime] = useState(new Date())

  useEffect(() => {
    // Initialize from template and last session weights
    const lastSession = previousSessions
      .filter((s) => s.dayId === dayId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-1)[0]

    const initial: Exercise[] = template.exercises.map((t, idx) => {
      const lastEx = lastSession?.exercises.find((ex) => ex.name === t.name)
      return {
        id: `${dayId}-${idx}`,
        name: t.name,
        sets: t.sets,
        reps: t.reps,
        weight: lastEx?.weight || 0,
        completed: false,
      }
    })
    setExercises(initial)
  }, [dayId, template, previousSessions])

  const updateExercise = (exerciseId: string, field: keyof Exercise, value: any) => {
    setExercises((prev) => prev.map((ex) => (ex.id === exerciseId ? { ...ex, [field]: value } : ex)))
  }

  const getProgressSuggestion = (exerciseName: string) => {
    const last = previousSessions
      .filter((s) => s.dayId === dayId && s.exercises.some((e) => e.name === exerciseName))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

    if (!last) return null
    const le = last.exercises.find((e) => e.name === exerciseName)
    if (!le) return null
    const bump =
      exerciseName.toLowerCase().includes("curl") || exerciseName.toLowerCase().includes("raise") ? 1.25 : 2.5
    return { lastWeight: le.weight, suggestedWeight: le.weight + bump }
  }

  const saveWorkout = () => {
    const endTime = new Date()
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000)

    const session: WorkoutSessionType = {
      id: Date.now().toString(),
      date: dateKeyLocal(new Date()),
      dayId,
      dayName: template.name,
      dayColor: template.color,
      exercises: exercises.filter((ex) => ex.weight > 0 || ex.completed),
      duration,
      completed: exercises.every((ex) => ex.completed),
    }

    onWorkoutSaved(session)
    onBack()
  }

  const completedCount = useMemo(() => exercises.filter((ex) => ex.completed).length, [exercises])
  const totalCount = exercises.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{template.name} Workout</h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Started: {startTime.toLocaleTimeString()}
              </div>
              <Badge variant="outline">
                {completedCount}/{totalCount} completed
              </Badge>
            </div>
          </div>
        </div>
        <Button onClick={saveWorkout} disabled={completedCount === 0}>
          <Save className="h-4 w-4 mr-2" />
          Save Workout
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${totalCount ? (completedCount / totalCount) * 100 : 0}%` }}
        />
      </div>

      {/* Exercises */}
      <div className="space-y-4">
        {exercises.map((exercise) => {
          const suggestion = getProgressSuggestion(exercise.name)
          return (
            <Card key={exercise.id} className={exercise.completed ? "opacity-75" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={exercise.completed}
                      onCheckedChange={(checked) => updateExercise(exercise.id, "completed", checked)}
                    />
                    <div>
                      <CardTitle className={`text-lg ${exercise.completed ? "line-through" : ""}`}>
                        {exercise.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {exercise.sets} sets × {exercise.reps} reps
                      </p>
                    </div>
                  </div>
                  {suggestion && (
                    <Badge variant="outline" className="text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Last: {suggestion.lastWeight}kg → Try: {suggestion.suggestedWeight}kg
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Weight (kg)</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={exercise.weight || ""}
                      onChange={(e) => updateExercise(exercise.id, "weight", Number.parseFloat(e.target.value) || 0)}
                      disabled={exercise.completed}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Target Reps</Label>
                    <Input
                      value={exercise.reps}
                      onChange={(e) => updateExercise(exercise.id, "reps", e.target.value)}
                      disabled={exercise.completed}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Save Button */}
      <div className="flex justify-center pt-6">
        <Button onClick={saveWorkout} size="lg" disabled={completedCount === 0}>
          <Save className="h-4 w-4 mr-2" />
          Save {template.name} Workout
        </Button>
      </div>
    </div>
  )
}

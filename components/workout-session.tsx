"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Clock, Save, TrendingUp } from "lucide-react"
import { dateKeyLocal } from "@/lib/date"
import type { WorkoutDay, Exercise, WorkoutSession as WorkoutSessionType } from "@/app/page"

const workoutTemplates: Record<WorkoutDay, Omit<Exercise, "id" | "weight" | "completed">[]> = {
  push: [
    { name: "Bench Press", sets: 4, reps: "8-10", notes: "" },
    { name: "Overhead Press", sets: 3, reps: "8-10", notes: "" },
    { name: "Incline Dumbbell Press", sets: 3, reps: "10-12", notes: "" },
    { name: "Dips", sets: 3, reps: "10-15", notes: "" },
    { name: "Tricep Extensions", sets: 3, reps: "12-15", notes: "" },
    { name: "Lateral Raises", sets: 3, reps: "12-15", notes: "" },
    { name: "Push-ups", sets: 2, reps: "15-20", notes: "" },
  ],
  pull: [
    { name: "Pull-ups/Chin-ups", sets: 4, reps: "6-10", notes: "" },
    { name: "Barbell Rows", sets: 4, reps: "8-10", notes: "" },
    { name: "Lat Pulldowns", sets: 3, reps: "10-12", notes: "" },
    { name: "Cable Rows", sets: 3, reps: "10-12", notes: "" },
    { name: "Bicep Curls", sets: 3, reps: "12-15", notes: "" },
    { name: "Hammer Curls", sets: 3, reps: "12-15", notes: "" },
    { name: "Face Pulls", sets: 3, reps: "15-20", notes: "" },
  ],
  legs: [
    { name: "Squats", sets: 4, reps: "8-10", notes: "" },
    { name: "Romanian Deadlifts", sets: 4, reps: "8-10", notes: "" },
    { name: "Leg Press", sets: 3, reps: "12-15", notes: "" },
    { name: "Leg Curls", sets: 3, reps: "12-15", notes: "" },
    { name: "Leg Extensions", sets: 3, reps: "12-15", notes: "" },
    { name: "Calf Raises", sets: 4, reps: "15-20", notes: "" },
    { name: "Walking Lunges", sets: 3, reps: "12 each leg", notes: "" },
  ],
  arms: [
    { name: "Barbell Curls", sets: 4, reps: "10-12", notes: "" },
    { name: "Close-Grip Bench Press", sets: 4, reps: "10-12", notes: "" },
    { name: "Hammer Curls", sets: 3, reps: "12-15", notes: "" },
    { name: "Tricep Dips", sets: 3, reps: "12-15", notes: "" },
    { name: "Preacher Curls", sets: 3, reps: "12-15", notes: "" },
    { name: "Tricep Pushdowns", sets: 3, reps: "12-15", notes: "" },
    { name: "21s (Bicep Curls)", sets: 2, reps: "21", notes: "" },
  ],
  abs: [
    { name: "Crunches", sets: 3, reps: "20-25", notes: "" },
    { name: "Plank", sets: 3, reps: "30-60 sec", notes: "" },
    { name: "Russian Twists", sets: 3, reps: "20 each side", notes: "" },
    { name: "Leg Raises", sets: 3, reps: "15-20", notes: "" },
    { name: "Mountain Climbers", sets: 3, reps: "20 each leg", notes: "" },
    { name: "Dead Bugs", sets: 3, reps: "10 each side", notes: "" },
    { name: "Bicycle Crunches", sets: 3, reps: "20 each side", notes: "" },
  ],
  cardio: [
    { name: "Treadmill", sets: 1, reps: "20-30 min", notes: "" },
    { name: "Cycling", sets: 1, reps: "20-30 min", notes: "" },
    { name: "Rowing Machine", sets: 1, reps: "15-20 min", notes: "" },
    { name: "Elliptical", sets: 1, reps: "20-30 min", notes: "" },
    { name: "Stair Climber", sets: 1, reps: "15-20 min", notes: "" },
    { name: "HIIT Circuit", sets: 3, reps: "5 min rounds", notes: "" },
  ],
}

interface WorkoutSessionProps {
  day: WorkoutDay
  onWorkoutSaved: (session: WorkoutSessionType) => void
  onBack: () => void
  previousSessions: WorkoutSessionType[]
}

export function WorkoutSession({ day, onWorkoutSaved, onBack, previousSessions }: WorkoutSessionProps) {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [startTime] = useState(new Date())

  useEffect(() => {
    const template = workoutTemplates[day]
    const lastSession = previousSessions
      .filter((s) => s.day === day)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-1)[0]

    const initial: Exercise[] = template.map((t, idx) => {
      const lastEx = lastSession?.exercises.find((ex) => ex.name === t.name)
      return {
        id: `${day}-${idx}`,
        name: t.name,
        sets: t.sets,
        reps: t.reps,
        weight: lastEx?.weight || 0,
        completed: false,
        notes: t.notes,
      }
    })
    setExercises(initial)
  }, [day, previousSessions])

  const updateExercise = (exerciseId: string, field: keyof Exercise, value: any) => {
    setExercises((prev) => prev.map((ex) => (ex.id === exerciseId ? { ...ex, [field]: value } : ex)))
  }

  const getProgressSuggestion = (exerciseName: string) => {
    const recent = previousSessions
      .filter((s) => s.day === day && s.exercises.some((e) => e.name === exerciseName))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

    if (!recent) return null
    const last = recent.exercises.find((e) => e.name === exerciseName)
    if (!last) return null

    const bump =
      exerciseName.toLowerCase().includes("curl") || exerciseName.toLowerCase().includes("raise") ? 1.25 : 2.5
    return { lastWeight: last.weight, suggestedWeight: last.weight + bump }
  }

  const saveWorkout = () => {
    const endTime = new Date()
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000)

    const session: WorkoutSessionType = {
      id: Date.now().toString(),
      date: dateKeyLocal(new Date()), // local date key (fixes timezone shift)
      day,
      exercises: exercises.filter((ex) => ex.weight > 0 || ex.completed),
      duration,
      completed: exercises.every((ex) => ex.completed),
    }

    onWorkoutSaved(session)
    onBack()
  }

  const completedCount = exercises.filter((ex) => ex.completed).length
  const totalCount = exercises.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold capitalize">{day} Day Workout</h2>
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

      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${(completedCount / totalCount) * 100}%` }}
        />
      </div>

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
                <div className="space-y-2">
                  <Label>Notes (optional)</Label>
                  <Textarea
                    placeholder="How did this feel? Form notes?"
                    value={exercise.notes || ""}
                    onChange={(e) => updateExercise(exercise.id, "notes", e.target.value)}
                    rows={2}
                    disabled={exercise.completed}
                  />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

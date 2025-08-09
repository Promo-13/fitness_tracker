"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Check, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Workout = {
  id: string
  date: string
  exercises: Exercise[]
  duration?: number
}

type Exercise = {
  id: string
  name: string
  sets: Set[]
  notes?: string
}

type Set = {
  reps: number
  weight: number
  completed: boolean
}

const COMMON_EXERCISES = [
  "Bench Press",
  "Squat",
  "Deadlift",
  "Overhead Press",
  "Barbell Row",
  "Pull-ups",
  "Dips",
  "Bicep Curls",
  "Tricep Extensions",
  "Lateral Raises",
  "Leg Press",
  "Leg Curls",
  "Leg Extensions",
  "Calf Raises",
  "Incline Press",
  "Decline Press",
  "Dumbbell Flyes",
  "Lat Pulldowns",
  "Cable Rows",
  "Shrugs",
]

interface WorkoutLoggerProps {
  onWorkoutSaved: (workout: Workout) => void
  workouts: Workout[]
}

export function WorkoutLogger({ onWorkoutSaved, workouts }: WorkoutLoggerProps) {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [startTime] = useState(new Date())

  const addExercise = () => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: "",
      sets: [{ reps: 0, weight: 0, completed: false }],
      notes: "",
    }
    setExercises([...exercises, newExercise])
  }

  const updateExercise = (exerciseId: string, field: keyof Exercise, value: any) => {
    setExercises(exercises.map((ex) => (ex.id === exerciseId ? { ...ex, [field]: value } : ex)))
  }

  const addSet = (exerciseId: string) => {
    setExercises(
      exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, sets: [...ex.sets, { reps: 0, weight: 0, completed: false }] } : ex,
      ),
    )
  }

  const updateSet = (exerciseId: string, setIndex: number, field: keyof Set, value: any) => {
    setExercises(
      exercises.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((set, idx) => (idx === setIndex ? { ...set, [field]: value } : set)),
            }
          : ex,
      ),
    )
  }

  const removeSet = (exerciseId: string, setIndex: number) => {
    setExercises(
      exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, sets: ex.sets.filter((_, idx) => idx !== setIndex) } : ex,
      ),
    )
  }

  const removeExercise = (exerciseId: string) => {
    setExercises(exercises.filter((ex) => ex.id !== exerciseId))
  }

  const getProgressiveOverloadSuggestion = (exerciseName: string) => {
    const recentWorkouts = workouts.filter((w) => w.exercises.some((e) => e.name === exerciseName)).slice(-3)

    if (recentWorkouts.length === 0) return null

    const lastExercise = recentWorkouts[recentWorkouts.length - 1].exercises.find((e) => e.name === exerciseName)

    if (!lastExercise) return null

    const maxWeight = Math.max(...lastExercise.sets.map((s) => s.weight))
    const suggestedWeight = maxWeight + 2.5 // Suggest 2.5kg increase

    return {
      lastWeight: maxWeight,
      suggestedWeight,
    }
  }

  const saveWorkout = () => {
    if (exercises.length === 0) return

    const endTime = new Date()
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000) // minutes

    const workout: Workout = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      exercises: exercises.filter((ex) => ex.name.trim() !== ""),
      duration,
    }

    onWorkoutSaved(workout)
    setExercises([])
    alert("Workout saved successfully!")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Log Your Workout</h2>
        <Badge variant="outline">Started: {startTime.toLocaleTimeString()}</Badge>
      </div>

      {exercises.map((exercise, exerciseIndex) => (
        <Card key={exercise.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-2">
                <Label>Exercise</Label>
                <Select value={exercise.name} onValueChange={(value) => updateExercise(exercise.id, "name", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an exercise" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_EXERCISES.map((ex) => (
                      <SelectItem key={ex} value={ex}>
                        {ex}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {exercise.name && getProgressiveOverloadSuggestion(exercise.name) && (
                  <div className="text-sm text-muted-foreground">
                    💡 Last time: {getProgressiveOverloadSuggestion(exercise.name)?.lastWeight}kg → Try:{" "}
                    {getProgressiveOverloadSuggestion(exercise.name)?.suggestedWeight}kg
                  </div>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeExercise(exercise.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sets */}
            <div className="space-y-2">
              <Label>Sets</Label>
              {exercise.sets.map((set, setIndex) => (
                <div key={setIndex} className="flex items-center gap-2">
                  <Badge variant="outline" className="w-12 justify-center">
                    {setIndex + 1}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Weight (kg)"
                      value={set.weight || ""}
                      onChange={(e) =>
                        updateSet(exercise.id, setIndex, "weight", Number.parseFloat(e.target.value) || 0)
                      }
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">kg ×</span>
                    <Input
                      type="number"
                      placeholder="Reps"
                      value={set.reps || ""}
                      onChange={(e) => updateSet(exercise.id, setIndex, "reps", Number.parseInt(e.target.value) || 0)}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">reps</span>
                  </div>
                  <Button
                    variant={set.completed ? "default" : "outline"}
                    size="icon"
                    onClick={() => updateSet(exercise.id, setIndex, "completed", !set.completed)}
                  >
                    {set.completed ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => removeSet(exercise.id, setIndex)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => addSet(exercise.id)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Set
              </Button>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="How did this exercise feel? Any form notes?"
                value={exercise.notes || ""}
                onChange={(e) => updateExercise(exercise.id, "notes", e.target.value)}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex gap-4">
        <Button onClick={addExercise} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Exercise
        </Button>
        {exercises.length > 0 && <Button onClick={saveWorkout}>Save Workout</Button>}
      </div>
    </div>
  )
}

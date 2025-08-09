\`\`\`typescript
// lib/types.ts
export type ColorKey = "red" | "green" | "purple" | "orange" | "pink" | "teal" | "amber" | "rose" | "emerald" | "gray"

export type TemplateExercise = {
  id: string
  name: string
  sets: number
  reps: string
}

export type DayTemplate = {
  id: string
  name: string
  color: ColorKey
  exercises: TemplateExercise[]
}

export type Exercise = {
  id: string
  name: string
  sets: number
  reps: string
  weight: number
  completed: boolean
}

export type WorkoutSession = {
  id: string
  date: string // YYYY-MM-DD local key
  dayId: string
  dayName: string
  dayColor?: ColorKey
  exercises: Exercise[]
  duration?: number
  completed: boolean
}
\`\`\`

\`\`\`typescript
// components/plan-manager.tsx
"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Settings2 } from "lucide-react"
import { COLOR_OPTIONS, getBadgeClasses } from "@/lib/colors"
import type { DayTemplate, TemplateExercise } from "@/lib/types"

type Props = {
  templates: DayTemplate[]
  onChange: (next: DayTemplate[]) => void
}

function newExercise(): TemplateExercise {
  return {
    id: `ex-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: "",
    sets: 3,
    reps: "8-12",
  }
}

function newDayTemplate(): DayTemplate {
  return {
    id: `day-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: "New Day",
    color: "green",
    exercises: [],
  }
}

export function PlanManager({ templates, onChange }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(templates[0]?.id || null)
  const selected = useMemo(() => templates.find((t) => t.id === selectedId) || null, [templates, selectedId])

  const addDay = () => {
    const day = newDayTemplate()
    onChange([...(templates || []), day])
    setSelectedId(day.id)
  }

  const deleteDay = (id: string) => {
    const next = templates.filter((t) => t.id !== id)
    onChange(next)
    if (selectedId === id) setSelectedId(next[0]?.id || null)
  }

  const updateDay = <K extends keyof DayTemplate>(id: string, key: K, value: DayTemplate[K]) => {
    onChange(templates.map((t) => (t.id === id ? { ...t, [key]: value } : t)))
  }

  const addExercise = (dayId: string) => {
    onChange(templates.map((t) => (t.id === dayId ? { ...t, exercises: [...t.exercises, newExercise()] } : t)))
  }

  const updateExercise = (dayId: string, exId: string, patch: Partial<TemplateExercise>) => {
    onChange(
      templates.map((t) =>
        t.id === dayId ? { ...t, exercises: t.exercises.map((ex) => (ex.id === exId ? { ...ex, ...patch } : ex)) } : t,
      ),
    )
  }

  const removeExercise = (dayId: string, exId: string) => {
    onChange(templates.map((t) => (t.id === dayId ? { ...t, exercises: t.exercises.filter((e) => e.id !== exId) } : t)))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          <h2 className="text-2xl font-bold">Plan Manager</h2>
        </div>
        <Button onClick={addDay}>
          <Plus className="h-4 w-4 mr-2" />
          Add Day
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Your Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {templates.length === 0 && <p className="text-sm text-muted-foreground">No days yet. Create one!</p>}
              {templates.map((t) => (
                <div
                  key={t.id}
                  className={`flex items-center justify-between rounded-md border p-3 cursor-pointer ${
                    selectedId === t.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedId(t.id)}
                >
                  <div className="flex items-center gap-2">
                    <Badge className={`${getBadgeClasses(t.color)} capitalize`}>{t.name}</Badge>
                    <span className="text-xs text-muted-foreground">{t.exercises.length} exercises</span>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteDay(t.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Editor</CardTitle>
          </CardHeader>
          <CardContent>
            {!selected && <p className="text-sm text-muted-foreground">Select a day to edit.</p>}
            {selected && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Day Name</Label>
                    <Input
                      value={selected.name}
                      onChange={(e) => updateDay(selected.id, "name", e.target.value)}
                      placeholder="e.g., Push, Chest, Upper, Full Body"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <Select value={selected.color} onValueChange={(val) => updateDay(selected.id, "color", val as any)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select color" />
                      </SelectTrigger>
                      <SelectContent>
                        {COLOR_OPTIONS.map((opt) => (
                          <SelectItem key={opt.key} value={opt.key}>
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-block h-3 w-3 rounded-full ${
                                  opt.key === "gray" ? "bg-gray-400" : `bg-${opt.key}-500`
                                }`}
                              />
                              {opt.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Exercises</h3>
                  <Button variant="outline" size="sm" onClick={() => addExercise(selected.id)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Exercise
                  </Button>
                </div>

                <div className="space-y-4">
                  {selected.exercises.length === 0 && (
                    <p className="text-sm text-muted-foreground">No exercises yet. Add your first one.</p>
                  )}
                  {selected.exercises.map((ex) => (
                    <div key={ex.id} className="rounded-lg border p-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="md:col-span-2 space-y-2">
                          <Label>Exercise Name</Label>
                          <Input
                            value={ex.name}
                            onChange={(e) => updateExercise(selected.id, ex.id, { name: e.target.value })}
                            placeholder="e.g., Bench Press"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Sets</Label>
                          <Input
                            type="number"
                            min={1}
                            value={ex.sets || 0}
                            onChange={(e) =>
                              updateExercise(selected.id, ex.id, { sets: Number.parseInt(e.target.value || "0", 10) })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Reps</Label>
                          <Input
                            value={ex.reps}
                            onChange={(e) => updateExercise(selected.id, ex.id, { reps: e.target.value })}
                            placeholder="e.g., 8-12"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button variant="ghost" size="sm" onClick={() => removeExercise(selected.id, ex.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
\`\`\`

\`\`\`typescript
// components/workout-session.tsx
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

      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${totalCount ? (completedCount / totalCount) * 100 : 0}%` }}
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
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex justify-center pt-6">
        <Button onClick={saveWorkout} size="lg" disabled={completedCount === 0}>
          <Save className="h-4 w-4 mr-2" />
          Save {template.name} Workout
        </Button>
      </div>
    </div>
  )
}
\`\`\`

\`\`\`typescript
// components/progress-view.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { parseDateKeyToLocalDate } from "@/lib/date"
import type { WorkoutSession } from "@/lib/types"

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
        dayName: session.dayName,
        weight: exercise.weight,
        reps: exercise.reps,
        completed: exercise.completed,
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
        const k = session.dayName
        acc[k] = (acc[k] || 0) + 1
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
                          <Badge variant="outline">{item.dayName}</Badge>
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
\`\`\`

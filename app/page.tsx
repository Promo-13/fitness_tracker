"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Dumbbell, TrendingUp, Play, Settings } from "lucide-react"
import { WorkoutDaySelector } from "@/components/workout-day-selector"
import { WorkoutSession as WorkoutSessionComponent } from "@/components/workout-session"
import { CalendarView } from "@/components/calendar-view"
import { ProgressView } from "@/components/progress-view"
import { WorkoutHistory } from "@/components/workout-history"
import { PlanManager } from "@/components/plan-manager"
import { parseDateKeyToLocalDate } from "@/lib/date"
import type { DayTemplate, WorkoutSession } from "@/lib/types"
import { UnitSelect } from "@/components/unit-select"

const LS_SESSIONS = "fitness-workout-sessions"
const LS_TEMPLATES = "fitness-day-templates"

function seedDefaults(): DayTemplate[] {
  const id = (name: string) => `day-${name.toLowerCase()}`
  return [
    {
      id: id("Push"),
      name: "Push",
      color: "red",
      exercises: [
        { id: "ex-bench", name: "Bench Press", sets: 4, reps: "8-10" },
        { id: "ex-ohp", name: "Overhead Press", sets: 3, reps: "8-10" },
        { id: "ex-incline-db", name: "Incline Dumbbell Press", sets: 3, reps: "10-12" },
        { id: "ex-dips", name: "Dips", sets: 3, reps: "10-15" },
        { id: "ex-tri-ext", name: "Tricep Extensions", sets: 3, reps: "12-15" },
        { id: "ex-lateral", name: "Lateral Raises", sets: 3, reps: "12-15" },
      ],
    },
    {
      id: id("Pull"),
      name: "Pull",
      color: "teal",
      exercises: [
        { id: "ex-pullups", name: "Pull-ups/Chin-ups", sets: 4, reps: "6-10" },
        { id: "ex-rows", name: "Barbell Rows", sets: 4, reps: "8-10" },
        { id: "ex-lat", name: "Lat Pulldowns", sets: 3, reps: "10-12" },
        { id: "ex-cable-rows", name: "Cable Rows", sets: 3, reps: "10-12" },
        { id: "ex-bicep", name: "Bicep Curls", sets: 3, reps: "12-15" },
        { id: "ex-facepulls", name: "Face Pulls", sets: 3, reps: "15-20" },
      ],
    },
    {
      id: id("Legs"),
      name: "Legs",
      color: "green",
      exercises: [
        { id: "ex-squat", name: "Squats", sets: 4, reps: "8-10" },
        { id: "ex-rdl", name: "Romanian Deadlifts", sets: 4, reps: "8-10" },
        { id: "ex-legpress", name: "Leg Press", sets: 3, reps: "12-15" },
        { id: "ex-legcurls", name: "Leg Curls", sets: 3, reps: "12-15" },
        { id: "ex-legext", name: "Leg Extensions", sets: 3, reps: "12-15" },
        { id: "ex-calf", name: "Calf Raises", sets: 4, reps: "15-20" },
      ],
    },
  ]
}

export default function FitnessTracker() {
  const [currentView, setCurrentView] = useState<
    "dashboard" | "select-day" | "workout" | "calendar" | "progress" | "plan"
  >("dashboard")
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null)
  const [templates, setTemplates] = useState<DayTemplate[]>([])
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [templatesLoaded, setTemplatesLoaded] = useState(false)

  // Load templates (or seed defaults)
  useEffect(() => {
    const saved = localStorage.getItem(LS_TEMPLATES)
    if (saved) {
      setTemplates(JSON.parse(saved))
    } else {
      const defaults = seedDefaults()
      setTemplates(defaults)
      localStorage.setItem(LS_TEMPLATES, JSON.stringify(defaults))
    }
    setTemplatesLoaded(true)
  }, [])

  // Persist templates
  useEffect(() => {
    if (templatesLoaded) {
      localStorage.setItem(LS_TEMPLATES, JSON.stringify(templates))
    }
  }, [templates, templatesLoaded])

  // Load sessions and migrate legacy structure
  useEffect(() => {
    if (!templatesLoaded) return
    const saved = localStorage.getItem(LS_SESSIONS)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Migration: legacy sessions with "day" -> map to { dayId, dayName, dayColor }
        const migrated: WorkoutSession[] = parsed.map((s: any) => {
          if (s.dayId && s.dayName) return s
          const legacyName: string = s.day || "Workout"
          const template = templates.find((t) => t.name.toLowerCase() === legacyName.toLowerCase()) ||
            templates[0] || { id: "legacy", name: legacyName, color: "gray" }
          return {
            id: s.id,
            date: s.date,
            dayId: template.id,
            dayName: legacyName,
            dayColor: template.color,
            exercises: s.exercises || [],
            duration: s.duration,
            completed: !!s.completed,
          } satisfies WorkoutSession
        })
        setWorkoutSessions(migrated)
        localStorage.setItem(LS_SESSIONS, JSON.stringify(migrated))
      } catch {
        setWorkoutSessions([])
      }
    }
    setIsLoading(false)
  }, [templatesLoaded, templates])

  // Persist sessions
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(LS_SESSIONS, JSON.stringify(workoutSessions))
    }
  }, [workoutSessions, isLoading])

  const addWorkoutSession = (session: WorkoutSession) => {
    setWorkoutSessions((prev) => [...prev, session])
  }

  const getThisWeekWorkouts = () => {
    const today = new Date()
    const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay())
    return workoutSessions.filter((s) => parseDateKeyToLocalDate(s.date) >= weekStart)
  }

  const getThisMonthWorkouts = () => {
    const today = new Date()
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    return workoutSessions.filter((s) => parseDateKeyToLocalDate(s.date) >= monthStart)
  }

  const startWorkout = (dayId: string) => {
    setSelectedDayId(dayId)
    setCurrentView("workout")
  }

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === selectedDayId) || null,
    [templates, selectedDayId],
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Dumbbell className="h-12 w-12 mx-auto mb-4 animate-pulse" />
          <p>Loading your fitness data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">FitTracker Pro</h1>
            </div>
            <nav className="flex gap-2">
              <Button
                variant={currentView === "dashboard" ? "default" : "ghost"}
                onClick={() => setCurrentView("dashboard")}
              >
                Dashboard
              </Button>
              <Button
                variant={currentView === "select-day" ? "default" : "ghost"}
                onClick={() => setCurrentView("select-day")}
              >
                <Play className="h-4 w-4 mr-2" />
                Start Workout
              </Button>
              <Button
                variant={currentView === "calendar" ? "default" : "ghost"}
                onClick={() => setCurrentView("calendar")}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Calendar
              </Button>
              <Button
                variant={currentView === "progress" ? "default" : "ghost"}
                onClick={() => setCurrentView("progress")}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Progress
              </Button>
              <Button variant={currentView === "plan" ? "default" : "ghost"} onClick={() => setCurrentView("plan")}>
                <Settings className="h-4 w-4 mr-2" />
                Plan
              </Button>
            </nav>
            <div className="ml-2">
              <UnitSelect />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {currentView === "dashboard" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Week</CardTitle>
                  <Dumbbell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{getThisWeekWorkouts().length}</div>
                  <p className="text-xs text-muted-foreground">workouts completed</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Month</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{getThisMonthWorkouts().length}</div>
                  <p className="text-xs text-muted-foreground">gym sessions</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{workoutSessions.length}</div>
                  <p className="text-xs text-muted-foreground">all time</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-4">
              <Button onClick={() => setCurrentView("select-day")} size="lg">
                <Play className="h-4 w-4 mr-2" />
                Start New Workout
              </Button>
              <Button variant="outline" onClick={() => setCurrentView("calendar")} size="lg">
                <Calendar className="h-4 w-4 mr-2" />
                View Calendar
              </Button>
              <Button variant="outline" onClick={() => setCurrentView("plan")} size="lg">
                <Settings className="h-4 w-4 mr-2" />
                Manage Plan
              </Button>
            </div>

            {/* Recent Workouts */}
            <WorkoutHistory workoutSessions={workoutSessions.slice(-5).reverse()} />
          </div>
        )}

        {currentView === "select-day" && (
          <WorkoutDaySelector
            templates={templates}
            onDaySelected={startWorkout}
            onManagePlan={() => setCurrentView("plan")}
          />
        )}

        {currentView === "workout" && selectedTemplate && selectedDayId && (
          <WorkoutSessionComponent
            dayId={selectedDayId}
            template={selectedTemplate}
            onWorkoutSaved={addWorkoutSession}
            onBack={() => setCurrentView("select-day")}
            previousSessions={workoutSessions}
          />
        )}

        {currentView === "calendar" && <CalendarView workoutSessions={workoutSessions} />}

        {currentView === "progress" && <ProgressView workoutSessions={workoutSessions} />}

        {currentView === "plan" && <PlanManager templates={templates} onChange={setTemplates} />}
      </main>
    </div>
  )
}

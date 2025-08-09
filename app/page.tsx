"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Dumbbell, TrendingUp, Play } from "lucide-react"
import { WorkoutDaySelector } from "@/components/workout-day-selector"
import { WorkoutSession as WorkoutSessionComponent } from "@/components/workout-session"
import { CalendarView } from "@/components/calendar-view"
import { ProgressView } from "@/components/progress-view"
import { WorkoutHistory } from "@/components/workout-history"
import { parseDateKeyToLocalDate } from "@/lib/date"

export type WorkoutDay = "push" | "pull" | "legs" | "arms" | "abs" | "cardio"

export type Exercise = {
  id: string
  name: string
  sets: number
  reps: string
  weight: number
  completed: boolean
  notes?: string
}

export type WorkoutSession = {
  id: string
  date: string // YYYY-MM-DD (local)
  day: WorkoutDay
  exercises: Exercise[]
  duration?: number
  completed: boolean
}

export default function FitnessTracker() {
  const [currentView, setCurrentView] = useState<"dashboard" | "select-day" | "workout" | "calendar" | "progress">(
    "dashboard",
  )
  const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null)
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem("fitness-workout-sessions")
    if (saved) setWorkoutSessions(JSON.parse(saved))
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("fitness-workout-sessions", JSON.stringify(workoutSessions))
    }
  }, [workoutSessions, isLoading])

  const addWorkoutSession = (session: WorkoutSession) => {
    setWorkoutSessions((prev) => [...prev, session])
  }

  const getWorkoutDates = () => workoutSessions.map((s) => s.date)

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

  const startWorkout = (day: WorkoutDay) => {
    setSelectedDay(day)
    setCurrentView("workout")
  }

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
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {currentView === "dashboard" && (
          <div className="space-y-6">
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

            <div className="flex gap-4">
              <Button onClick={() => setCurrentView("select-day")} size="lg">
                <Play className="h-4 w-4 mr-2" />
                Start New Workout
              </Button>
              <Button variant="outline" onClick={() => setCurrentView("calendar")} size="lg">
                <Calendar className="h-4 w-4 mr-2" />
                View Calendar
              </Button>
            </div>

            <WorkoutHistory workoutSessions={workoutSessions.slice(-5).reverse()} />
          </div>
        )}

        {currentView === "select-day" && <WorkoutDaySelector onDaySelected={startWorkout} />}

        {currentView === "workout" && selectedDay && (
          <WorkoutSessionComponent
            day={selectedDay}
            onWorkoutSaved={addWorkoutSession}
            onBack={() => setCurrentView("select-day")}
            previousSessions={workoutSessions}
          />
        )}

        {currentView === "calendar" && (
          <CalendarView workoutDates={getWorkoutDates()} workoutSessions={workoutSessions} />
        )}

        {currentView === "progress" && <ProgressView workoutSessions={workoutSessions} />}
      </main>
    </div>
  )
}

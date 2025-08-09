"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { dateKeyFromYMD, parseDateKeyToLocalDate } from "@/lib/date"
import type { WorkoutSession } from "@/app/page"

interface CalendarViewProps {
  workoutDates: string[]
  workoutSessions: WorkoutSession[]
}

const dayColors = {
  push: "bg-red-100 border-red-300 text-red-800",
  pull: "bg-blue-100 border-blue-300 text-blue-800",
  legs: "bg-green-100 border-green-300 text-green-800",
  arms: "bg-purple-100 border-purple-300 text-purple-800",
  abs: "bg-orange-100 border-orange-300 text-orange-800",
  cardio: "bg-pink-100 border-pink-300 text-pink-800",
}

export function CalendarView({ workoutDates, workoutSessions }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  // Use local date key (no UTC conversion)
  const getWorkoutForDay = (day: number) => {
    const dateStr = dateKeyFromYMD(currentDate.getFullYear(), currentDate.getMonth(), day)
    return workoutSessions.find((session) => session.date === dateStr)
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      today.getDate() === day &&
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear()
    )
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" })

  const workoutDaysThisMonth = Array.from({ length: daysInMonth }, (_, i) => i + 1).filter((day) =>
    getWorkoutForDay(day),
  ).length

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // Monthly breakdown counts by day type, using local parsing
  const workoutTypeCounts = workoutSessions
    .filter((session) => {
      const sessionDate = parseDateKeyToLocalDate(session.date)
      return (
        sessionDate.getMonth() === currentDate.getMonth() && sessionDate.getFullYear() === currentDate.getFullYear()
      )
    })
    .reduce(
      (acc, session) => {
        acc[session.day] = (acc[session.day] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{monthName}</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{workoutDaysThisMonth} workout days this month</Badge>
            <Badge variant="outline">{Math.round((workoutDaysThisMonth / daysInMonth) * 100)}% consistency</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {days.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`empty-${i}`} className="p-2" />
            ))}

            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1
              const workout = getWorkoutForDay(day)
              const todayClass = isToday(day)

              return (
                <div
                  key={day}
                  className={cn(
                    "p-2 text-center rounded-lg border-2 transition-colors min-h-[60px] flex flex-col justify-center",
                    workout ? dayColors[workout.day] : "border-gray-200 hover:border-gray-300",
                    todayClass && "ring-2 ring-blue-500 ring-offset-2",
                  )}
                >
                  <div className="text-sm font-medium">{day}</div>
                  {workout && <div className="text-xs mt-1 capitalize">{workout.day}</div>}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Monthly Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(workoutTypeCounts).map(([day, count]) => (
              <div key={day} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="capitalize font-medium">{day}</span>
                <Badge variant="secondary">{count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(dayColors).map(([day, colorClass]) => (
              <div key={day} className="flex items-center gap-2">
                <div className={`w-6 h-6 border-2 rounded ${colorClass}`}></div>
                <span className="text-sm capitalize">{day} Day</span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border-2 border-gray-200 rounded"></div>
              <span className="text-sm">Rest Day</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

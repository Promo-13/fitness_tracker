"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { dateKeyFromYMD, parseDateKeyToLocalDate } from "@/lib/date"
import { getCalendarClasses } from "@/lib/colors"
import type { WorkoutSession } from "@/lib/types"

interface CalendarViewProps {
  workoutSessions: WorkoutSession[]
}

export function CalendarView({ workoutSessions }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()

  const sessionsByDate = useMemo(() => {
    const map = new Map<string, WorkoutSession>()
    for (const s of workoutSessions) {
      map.set(s.date, s)
    }
    return map
  }, [workoutSessions])

  const getWorkoutForDay = (day: number) => {
    const dateStr = dateKeyFromYMD(currentDate.getFullYear(), currentDate.getMonth(), day)
    return sessionsByDate.get(dateStr)
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      today.getDate() === day &&
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear()
    )
  }

  const previousMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" })

  const workoutDaysThisMonth = Array.from({ length: daysInMonth }, (_, i) => i + 1).filter((day) =>
    getWorkoutForDay(day),
  ).length

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const workoutTypeCounts = workoutSessions
    .filter((session) => {
      const d = parseDateKeyToLocalDate(session.date)
      return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear()
    })
    .reduce(
      (acc, s) => {
        const key = s.dayName
        acc[key] = (acc[key] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

  const legend = useMemo(() => {
    // Unique dayName/dayColor seen in all sessions
    const map = new Map<string, string | undefined>()
    for (const s of workoutSessions) {
      if (!map.has(s.dayName)) map.set(s.dayName, s.dayColor)
    }
    return Array.from(map.entries()).map(([name, color]) => ({ name, color }))
  }, [workoutSessions])

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
                    workout ? getCalendarClasses(workout.dayColor) : "border-gray-200 hover:border-gray-300",
                    todayClass && "ring-2 ring-blue-500 ring-offset-2",
                  )}
                >
                  <div className="text-sm font-medium">{day}</div>
                  {workout && <div className="text-xs mt-1">{workout.dayName}</div>}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Monthly Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(workoutTypeCounts).map(([name, count]) => (
              <div key={name} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium">{name}</span>
                <Badge variant="secondary">{count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      {legend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {legend.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className={`w-6 h-6 border-2 rounded ${getCalendarClasses(item.color as any)}`}></div>
                  <span className="text-sm">{item.name}</span>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 border-2 border-gray-200 rounded"></div>
                <span className="text-sm">Rest Day</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

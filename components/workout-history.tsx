"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Dumbbell, CheckCircle, XCircle, Trophy } from "lucide-react"
import { parseDateKeyToLocalDate } from "@/lib/date"
import { getBadgeClasses } from "@/lib/colors"
import { useUnit } from "@/hooks/use-preferences"
import { formatWeight } from "@/lib/units"
import type { WorkoutSession } from "@/lib/types"

interface WorkoutHistoryProps {
  workoutSessions: WorkoutSession[]
}

export function WorkoutHistory({ workoutSessions }: WorkoutHistoryProps) {
  const { unit } = useUnit()

  const prs = new Map<string, number>()
  for (const s of workoutSessions) {
    for (const ex of s.exercises) {
      if (!ex.completed) continue
      const max = prs.get(ex.name) ?? 0
      prs.set(ex.name, Math.max(max, ex.weight || 0))
    }
  }

  if (workoutSessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Workouts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No workouts logged yet.</p>
            <p className="text-sm">Start your first workout to see your progress here!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Workouts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {workoutSessions.map((session) => {
            const completedExercises = session.exercises.filter((ex) => ex.completed).length
            const totalExercises = session.exercises.length
            const localDate = parseDateKeyToLocalDate(session.date)

            return (
              <div key={session.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={`${getBadgeClasses(session.dayColor)} capitalize`}>{session.dayName}</Badge>
                    <h3 className="font-semibold">
                      {localDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </h3>
                    {session.duration && (
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {session.duration}m
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {completedExercises}/{totalExercises} exercises
                    </Badge>
                    {session.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {session.exercises.map((exercise) => (
                    <div key={exercise.id} className={`bg-muted rounded p-3 ${exercise.completed ? "" : "opacity-60"}`}>
                      <div className={`font-medium text-sm ${exercise.completed ? "" : "line-through"}`}>
                        {exercise.name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                        <span>
                          {formatWeight(exercise.weight, unit)} × {exercise.reps}
                        </span>
                        {exercise.completed && exercise.weight >= (prs.get(exercise.name) ?? 0) && (
                          <span className="inline-flex items-center text-amber-600">
                            <Trophy className="h-3.5 w-3.5 mr-1" /> PR
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dumbbell, Settings } from "lucide-react"
import { getBadgeClasses } from "@/lib/colors"
import type { DayTemplate } from "@/lib/types"

interface WorkoutDaySelectorProps {
  templates: DayTemplate[]
  onDaySelected: (dayId: string) => void
  onManagePlan?: () => void
}

export function WorkoutDaySelector({ templates, onDaySelected, onManagePlan }: WorkoutDaySelectorProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h2 className="text-3xl font-bold mb-2">Choose Your Workout</h2>
          <p className="text-muted-foreground">Your custom days and exercises</p>
        </div>
        {onManagePlan && (
          <Button variant="outline" onClick={onManagePlan}>
            <Settings className="h-4 w-4 mr-2" />
            Manage Plan
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((day) => {
          return (
            <Card key={day.id} className="hover:shadow-lg transition-shadow cursor-pointer group h-full flex flex-col">
              <CardHeader className="text-center">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform ${getBadgeClasses(day.color)}`}
                >
                  <Dumbbell className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl">{day.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {day.exercises.length > 0 ? `${day.exercises.length} exercises` : "No exercises yet"}
                </p>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col">
                <div className="flex flex-wrap gap-1">
                  {day.exercises.slice(0, 4).map((exercise) => (
                    <Badge key={exercise.id} variant="secondary" className="text-xs">
                      {exercise.name}
                    </Badge>
                  ))}
                  {day.exercises.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{day.exercises.length - 4} more
                    </Badge>
                  )}
                </div>
                <Button className="w-full mt-auto" onClick={() => onDaySelected(day.id)}>
                  Start {day.name}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

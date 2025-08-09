"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dumbbell, ArrowUp, ArrowDown, Zap, Target, Heart } from "lucide-react"
import type { WorkoutDay } from "@/app/page"

interface WorkoutDaySelectorProps {
  onDaySelected: (day: WorkoutDay) => void
}

const workoutDays = [
  {
    id: "push" as WorkoutDay,
    name: "Push Day",
    description: "Chest, Shoulders, Triceps",
    icon: ArrowUp,
    color: "bg-red-100 text-red-800 border-red-200",
    exercises: ["Bench Press", "Overhead Press", "Incline Press", "Dips", "Tricep Extensions", "Lateral Raises"],
  },
  {
    id: "pull" as WorkoutDay,
    name: "Pull Day",
    description: "Back, Biceps",
    icon: ArrowDown,
    color: "bg-blue-100 text-blue-800 border-blue-200",
    exercises: ["Pull-ups", "Barbell Rows", "Lat Pulldowns", "Bicep Curls", "Face Pulls", "Shrugs"],
  },
  {
    id: "legs" as WorkoutDay,
    name: "Leg Day",
    description: "Quads, Hamstrings, Glutes, Calves",
    icon: Dumbbell,
    color: "bg-green-100 text-green-800 border-green-200",
    exercises: ["Squats", "Deadlifts", "Leg Press", "Leg Curls", "Leg Extensions", "Calf Raises"],
  },
  {
    id: "arms" as WorkoutDay,
    name: "Arms Day",
    description: "Biceps, Triceps, Forearms",
    icon: Zap,
    color: "bg-purple-100 text-purple-800 border-purple-200",
    exercises: ["Bicep Curls", "Tricep Dips", "Hammer Curls", "Close-Grip Press", "Preacher Curls", "Tricep Pushdowns"],
  },
  {
    id: "abs" as WorkoutDay,
    name: "Abs Day",
    description: "Core, Abs, Obliques",
    icon: Target,
    color: "bg-orange-100 text-orange-800 border-orange-200",
    exercises: ["Crunches", "Planks", "Russian Twists", "Leg Raises", "Mountain Climbers", "Dead Bugs"],
  },
  {
    id: "cardio" as WorkoutDay,
    name: "Cardio Day",
    description: "Cardiovascular Training",
    icon: Heart,
    color: "bg-pink-100 text-pink-800 border-pink-200",
    exercises: ["Treadmill", "Cycling", "Rowing", "Elliptical", "Stair Climber", "HIIT Circuit"],
  },
]

export function WorkoutDaySelector({ onDaySelected }: WorkoutDaySelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Choose Your Workout</h2>
        <p className="text-muted-foreground">Select a workout day to get started</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workoutDays.map((day) => {
          const Icon = day.icon
          return (
            <Card key={day.id} className="hover:shadow-lg transition-shadow cursor-pointer group h-full flex flex-col">
              <CardHeader className="text-center">
                <div
                  className={`w-16 h-16 rounded-full ${day.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl">{day.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{day.description}</p>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col">
                <div className="flex flex-wrap gap-1">
                  {day.exercises.slice(0, 4).map((exercise) => (
                    <Badge key={exercise} variant="secondary" className="text-xs">
                      {exercise}
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

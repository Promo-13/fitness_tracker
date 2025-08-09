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

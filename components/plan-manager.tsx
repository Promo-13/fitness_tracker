"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
    notes: "",
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
    if (selectedId === id) {
      setSelectedId(next[0]?.id || null)
    }
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
        {/* Days list */}
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

        {/* Editor */}
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
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
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
                        <div className="md:col-span-2 space-y-2">
                          <Label>Notes</Label>
                          <Textarea
                            rows={1}
                            value={ex.notes || ""}
                            onChange={(e) => updateExercise(selected.id, ex.id, { notes: e.target.value })}
                            placeholder="Optional notes"
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

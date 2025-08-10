"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUnit } from "@/hooks/use-preferences"

export function UnitSelect() {
  const { unit, setUnit } = useUnit()
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground hidden sm:inline">Units</span>
      <Select value={unit} onValueChange={(v) => setUnit(v as any)}>
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="kg/lb" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="kg">kg</SelectItem>
          <SelectItem value="lb">lb</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

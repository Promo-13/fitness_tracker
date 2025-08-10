"use client"

import { Badge } from "@/components/ui/badge"
import { Trophy } from "lucide-react"

type Props = { show: boolean }

export function PRBadge({ show }: Props) {
  if (!show) return null
  return (
    <Badge variant="outline" className="text-xs">
      <Trophy className="h-3 w-3 mr-1 text-amber-600" />
      New PR
    </Badge>
  )
}

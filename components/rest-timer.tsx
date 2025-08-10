"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Pause, Play, RotateCcw, Timer } from "lucide-react"
import { useRestSeconds } from "@/hooks/use-preferences"

type Props = {
  startSignal?: number // increment to auto-start
}

export function RestTimer({ startSignal = 0 }: Props) {
  const { seconds: defaultSeconds, setSeconds: setDefaultSeconds } = useRestSeconds()
  const [remaining, setRemaining] = useState(defaultSeconds)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<number | null>(null)

  const start = (sec?: number) => {
    const s = sec ?? defaultSeconds
    setRemaining(s)
    setRunning(true)
  }

  const pause = () => setRunning(false)
  const reset = () => {
    setRunning(false)
    setRemaining(defaultSeconds)
  }

  // tick
  useEffect(() => {
    if (!running) {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }
    intervalRef.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          // finish
          if (intervalRef.current) {
            window.clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [running])

  // auto-start on startSignal change
  useEffect(() => {
    if (startSignal > 0) start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startSignal])

  const presets = [60, 90, 120]

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0")
  const ss = String(remaining % 60).padStart(2, "0")

  const finished = remaining === 0

  return (
    <Card className="w-full sm:w-[360px]">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4" />
            <span className="font-medium">Rest Timer</span>
          </div>
          <div className="text-sm text-muted-foreground">Default: {defaultSeconds}s</div>
        </div>

        <div className="text-4xl font-mono text-center mb-3 tabular-nums">
          {mm}:{ss}
        </div>

        <div className="flex items-center justify-center gap-2 mb-3">
          {running ? (
            <Button size="sm" variant="outline" onClick={pause}>
              <Pause className="h-4 w-4 mr-1" />
              Pause
            </Button>
          ) : (
            <Button size="sm" onClick={() => start()}>
              <Play className="h-4 w-4 mr-1" />
              Start
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={reset}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 items-center justify-center">
          {presets.map((p) => (
            <Button
              key={p}
              size="sm"
              variant="secondary"
              onClick={() => {
                setDefaultSeconds(p)
                start(p)
              }}
            >
              {p}s
            </Button>
          ))}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setDefaultSeconds(180)
              start(180)
            }}
          >
            180s
          </Button>
        </div>

        {finished && <div className="text-center text-green-600 mt-3 text-sm font-medium">Ready for the next set!</div>}
      </CardContent>
    </Card>
  )
}

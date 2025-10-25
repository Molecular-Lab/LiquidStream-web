"use client"

import { useMemo, useEffect, useState } from "react"
import { Activity } from "lucide-react"
import { formatUnits } from "viem"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useStreamStore } from "@/store/streams"
import { useWalletMode } from "@/store/wallet-mode"
import { useSafe } from "@/store/safe"

export function StreamingStats() {
  const streams = useStreamStore((state) => state.streams)
  const [isHydrated, setIsHydrated] = useState(false)
  const { isSafeMode } = useWalletMode()
  const { safeConfig } = useSafe()

  const isInSafeMode = isSafeMode() && !!safeConfig?.address

  // Wait for Zustand store to hydrate from localStorage
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Calculate statistics from streams array
  const activeStreams = useMemo(() =>
    isHydrated ? streams.filter((stream) => stream.status === "active") : []
  , [streams, isHydrated])

  const activeStreamCount = useMemo(() => activeStreams.length, [activeStreams])

  const totalFlowRate = useMemo(() =>
    activeStreams.reduce(
      (total, stream) => total + BigInt(stream.flowRate),
      BigInt(0)
    )
  , [activeStreams])

  const totalEmployees = useMemo(() => {
    if (!isHydrated) return 0
    return streams.filter((s, index, self) =>
      index === self.findIndex((t) => t.employeeId === s.employeeId)
    ).length
  }, [streams, isHydrated])

  // Calculate flow rate per month (flowRate is per second)
  const flowRatePerMonth = useMemo(() =>
    totalFlowRate * BigInt(60 * 60 * 24 * 30)
  , [totalFlowRate])

  // Color scheme based on wallet mode
  const accentColor = isInSafeMode ? "text-green-600" : "text-[#0070BA]"
  const iconColor = isInSafeMode ? "h-5 w-5 text-green-600" : "h-5 w-5 text-[#0070BA]"

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className={iconColor} />
          Current Streaming Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Active Streams</p>
            <p className={`text-3xl font-bold ${accentColor}`}>{activeStreamCount}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Total Employees</p>
            <p className="text-3xl font-bold text-gray-900">{totalEmployees}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Flow Rate/Month</p>
            <p className={`text-3xl font-bold ${accentColor}`}>
              {parseFloat(formatUnits(flowRatePerMonth, 18)).toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">Streamable PYUSD</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Streaming Status</p>
            <Badge className={`text-base px-3 py-1 ${activeStreamCount > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              {activeStreamCount > 0 ? '● Active' : '○ Inactive'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { useEffect, useState } from "react"
import { formatEther, formatUnits } from "viem"
import { Activity, TrendingUp } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useStreamStore, PaymentStream } from "@/store/streams"
import { useEmployeeStore } from "@/store/employees"

interface StreamRowData extends PaymentStream {
  employeeName: string
  currentStreamed: string
  streamedDisplay: string
}

export function ActiveStreamsTable() {
  const streams = useStreamStore((state) => state.streams)
  const getActiveStreams = useStreamStore((state) => state.getActiveStreams)
  const employees = useEmployeeStore((state) => state.employees)
  const [streamData, setStreamData] = useState<StreamRowData[]>([])
  const [isClient, setIsClient] = useState(false)

  // Wait for client-side hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Calculate real-time streamed amount
  useEffect(() => {
    if (!isClient) return
    
    const activeStreams = getActiveStreams()

    if (activeStreams.length === 0) {
      setStreamData([])
      return
    }

    // Initial calculation
    const calculateStreamed = () => {
      const now = Date.now()
      return activeStreams.map((stream) => {
        const employee = employees.find(e => e.id === stream.employeeId)
        const elapsedSeconds = (now - stream.startTime) / 1000
        const flowRateBigInt = BigInt(stream.flowRate)
        const streamedAmount = flowRateBigInt * BigInt(Math.floor(elapsedSeconds))

        return {
          ...stream,
          employeeName: employee?.name || "Unknown",
          currentStreamed: streamedAmount.toString(),
          streamedDisplay: parseFloat(formatEther(streamedAmount)).toFixed(6)
        }
      })
    }

    setStreamData(calculateStreamed())

    // Update every 100ms for smooth real-time display
    const interval = setInterval(() => {
      setStreamData(calculateStreamed())
    }, 100)

    return () => clearInterval(interval)
  }, [streams, employees, getActiveStreams, isClient])

  // Don't render dynamic content until client-side hydration is complete
  if (!isClient) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#0070BA]" />
            Active Streaming Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Loading...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (streamData.length === 0) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#0070BA]" />
            Active Streaming Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No active streams</p>
            <p className="text-sm">Start streaming payments to see real-time activity here</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-[#0070BA]" />
          Active Streaming Payments
          <Badge className="bg-green-100 text-green-700 ml-2">
            {streamData.length} Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Token</TableHead>
                <TableHead className="text-right">Flow Rate/Month</TableHead>
                <TableHead className="text-right">Streamed (Real-time)</TableHead>
                <TableHead className="text-right">Start Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {streamData.map((stream) => {
                const flowRateBigInt = BigInt(stream.flowRate)
                const monthlyFlow = flowRateBigInt * BigInt(60 * 60 * 24 * 30)
                const monthlyDisplay = parseFloat(formatEther(monthlyFlow)).toFixed(2)
                const startDate = new Date(stream.startTime)

                return (
                  <TableRow key={stream.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{stream.employeeName}</div>
                        <div className="text-xs text-gray-500 font-mono">
                          {stream.employeeAddress.slice(0, 6)}...{stream.employeeAddress.slice(-4)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[#0070BA] border-blue-300">
                        {stream.tokenSymbol}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      <div className="text-green-600 font-medium">
                        {monthlyDisplay}
                      </div>
                      <div className="text-xs text-gray-500">{stream.tokenSymbol}/mo</div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      <div className="text-lg font-bold text-[#0070BA]">
                        {stream.streamedDisplay}
                      </div>
                      <div className="text-xs text-gray-500">{stream.tokenSymbol}</div>
                    </TableCell>
                    <TableCell className="text-right text-sm text-gray-600">
                      {isClient ? (
                        <>
                          <div>{startDate.toLocaleDateString()}</div>
                          <div className="text-xs text-gray-500">{startDate.toLocaleTimeString()}</div>
                        </>
                      ) : (
                        <div>{startDate.toISOString().split('T')[0]}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-700 animate-pulse">
                        ● Streaming
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

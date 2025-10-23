"use client"

import { useState } from "react"
import { formatEther } from "viem"
import { Edit2, StopCircle } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useStreamStore } from "@/store/streams"
import { useEmployeeStore } from "@/store/employees"
import { formatFlowRate } from "@/hooks/use-stream-info"
import { useDeleteStream } from "@/hooks/use-streams"

export function StreamsList() {
  const streams = useStreamStore((state) => state.streams)
  const employees = useEmployeeStore((state) => state.employees)
  const { mutate: deleteStream } = useDeleteStream()
  const [tab, setTab] = useState<"outgoing" | "incoming">("outgoing")

  const outgoingStreams = streams.filter((s) => s.status === "active")
  const incomingStreams: any[] = [] // Can be populated if you track incoming streams

  const activeStreams = tab === "outgoing" ? outgoingStreams : incomingStreams

  const handleStopStream = (streamId: string) => {
    const stream = streams.find((s) => s.id === streamId)
    if (!stream) return

    deleteStream({
      token: stream.token,
      receiver: stream.employeeAddress,
      streamId: stream.id,
    })
  }

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find((e) => e.id === employeeId)
    return employee?.name || "Unknown"
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Streams</CardTitle>
        <CardDescription>View and manage active payment streams</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={tab === "outgoing" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("outgoing")}
          >
            Outgoing ({outgoingStreams.length})
          </Button>
          <Button
            variant={tab === "incoming" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("incoming")}
          >
            Incoming
          </Button>
        </div>

        {/* Streams Table */}
        {activeStreams.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No active streams</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 text-xs font-medium text-muted-foreground px-4">
              <div className="col-span-3">To / From</div>
              <div className="col-span-2 text-right">All Time Flow</div>
              <div className="col-span-2 text-right">Flow rate</div>
              <div className="col-span-3 text-right">Start / End Date</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* Stream Rows */}
            {activeStreams.map((stream) => {
              const flowRates = formatFlowRate(stream.flowRate)
              
              // Calculate all-time flow safely
              const elapsedSeconds = stream.startTime 
                ? (Date.now() - stream.startTime) / 1000 
                : 0
              const flowRateBigInt = BigInt(stream.flowRate || '0')
              const allTimeFlowBigInt = flowRateBigInt * BigInt(Math.floor(elapsedSeconds))

              return (
                <div
                  key={stream.id}
                  className="grid grid-cols-12 gap-4 items-center p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  {/* Employee Name */}
                  <div className="col-span-3">
                    <div className="font-medium">{getEmployeeName(stream.employeeId)}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {stream.employeeAddress}
                    </div>
                  </div>

                  {/* All Time Flow */}
                  <div className="col-span-2 text-right tabular-nums">
                    <div className="font-medium text-green-600">
                      {parseFloat(formatEther(allTimeFlowBigInt)).toFixed(2)}
                    </div>
                  </div>

                  {/* Flow Rate */}
                  <div className="col-span-2 text-right tabular-nums">
                    <div className="font-medium">
                      {parseFloat(flowRates.perMonth).toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">/month</div>
                  </div>

                  {/* Start Date */}
                  <div className="col-span-3 text-right">
                    <div className="text-sm">{formatDate(stream.startTime)}</div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-8 px-3"
                      onClick={() => handleStopStream(stream.id)}
                    >
                      <StopCircle className="h-4 w-4 mr-1" />
                      Stop
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

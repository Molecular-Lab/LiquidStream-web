"use client"

import { useState } from "react"
import { ConnectButton } from "@rainbow-me/rainbowkit"

import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { AddEmployeeDialog } from "@/components/employees/add-employee-dialog"
import { EmployeeList } from "@/components/employees/employee-list"
import { StartStreamDialog } from "@/components/streams/start-stream-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useDeleteStream } from "@/hooks/use-streams"
import { Employee } from "@/store/employees"
import { useStreamStore } from "@/store/streams"

export default function Home() {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [streamDialogOpen, setStreamDialogOpen] = useState(false)
  const streams = useStreamStore((state) => state.streams)
  const { mutate: deleteStream } = useDeleteStream()

  const handleStartStream = (employee: Employee) => {
    setSelectedEmployee(employee)
    setStreamDialogOpen(true)
  }

  const handleStopStream = (employeeId: string) => {
    const stream = streams.find(
      (s) => s.employeeId === employeeId && s.status === "active"
    )

    if (stream) {
      deleteStream({
        token: stream.token,
        receiver: stream.employeeAddress,
        streamId: stream.id,
      })
    }
  }

  return (
    <main className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-[#0070BA] to-[#009CDE] bg-clip-text text-transparent">
            LiquidStream
          </h1>
          <p className="text-muted-foreground mt-2">
            Powered by PayPal USD - Stream payroll in real-time
          </p>
        </div>
        <ConnectButton />
      </div>

      {/* Stats */}
      <DashboardStats />

      {/* Employee Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Employees</CardTitle>
              <CardDescription>
                Manage your team members and their payment streams
              </CardDescription>
            </div>
            <AddEmployeeDialog />
          </div>
        </CardHeader>
        <CardContent>
          <EmployeeList
            onStartStream={handleStartStream}
            onStopStream={handleStopStream}
          />
        </CardContent>
      </Card>

      {/* Start Stream Dialog */}
      <StartStreamDialog
        employee={selectedEmployee}
        open={streamDialogOpen}
        onClose={() => {
          setStreamDialogOpen(false)
          setSelectedEmployee(null)
        }}
      />
    </main>
  )
}

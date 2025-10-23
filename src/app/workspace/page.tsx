"use client"

import { useState } from "react"
import Link from "next/link"
import { Shield, Bell, Settings, LogOut } from "lucide-react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"

import { SuperfluidDashboard } from "@/components/dashboard/superfluid-dashboard"
import { AddEmployeeDialog } from "@/components/employees/add-employee-dialog"
import { EmployeeList } from "@/components/employees/employee-list"
import { StartStreamDialog } from "@/components/streams/start-stream-dialog"
import { StreamsList } from "@/components/streams/streams-list"
import { UpgradeDowngradeCard } from "@/components/swap/upgrade-downgrade-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useDeleteStream } from "@/hooks/use-streams"
import { Employee } from "@/store/employees"
import { useStreamStore } from "@/store/streams"

export default function WorkspacePage() {
  const { address } = useAccount()
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [streamDialogOpen, setStreamDialogOpen] = useState(false)
  const streams = useStreamStore((state) => state.streams)
  const { mutate: deleteStream } = useDeleteStream()

  // TODO: Fetch from workspace data
  const safeAddress = "0x1234...5678"
  const pendingSignaturesCount = 2

  const handleStartStream = (employee: Employee) => {
    // When starting a stream with Safe, it will create a pending transaction
    // that requires signatures from other operation team members
    setSelectedEmployee(employee)
    setStreamDialogOpen(true)
  }

  const handleStopStream = (employeeId: string) => {
    const stream = streams.find(
      (s) => s.employeeId === employeeId && s.status === "active"
    )

    if (stream) {
      // This will also create a pending Safe transaction
      deleteStream({
        token: stream.token,
        receiver: stream.employeeAddress,
        streamId: stream.id,
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/landing">
                <div className="text-2xl font-bold bg-gradient-to-r from-[#0070BA] to-[#009CDE] bg-clip-text text-transparent">
                  SafeStream
                </div>
              </Link>

              <nav className="hidden md:flex items-center gap-6">
                <Link
                  href="/workspace"
                  className="text-sm font-medium text-foreground hover:text-[#0070BA] transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/workspace/signatures"
                  className="text-sm font-medium text-muted-foreground hover:text-[#0070BA] transition-colors relative"
                >
                  Signatures
                  {pendingSignaturesCount > 0 && (
                    <span className="absolute -top-1 -right-3 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {pendingSignaturesCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/workspace/settings"
                  className="text-sm font-medium text-muted-foreground hover:text-[#0070BA] transition-colors"
                >
                  Settings
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              {/* Safe Info */}
              <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-[#0070BA]/10 border border-[#0070BA]/20 rounded-lg">
                <Shield className="h-4 w-4 text-[#0070BA]" />
                <div className="text-xs">
                  <div className="text-muted-foreground">Safe Wallet</div>
                  <div className="font-mono font-medium">{safeAddress}</div>
                </div>
              </div>

              {/* Notifications */}
              <Link href="/workspace/signatures">
                <Button variant="outline" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  {pendingSignaturesCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {pendingSignaturesCount}
                    </span>
                  )}
                </Button>
              </Link>

              <ConnectButton />
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Safe Wallet Banner */}
        <Card className="border-2 border-[#0070BA]/50 bg-gradient-to-r from-[#0070BA]/10 to-[#009CDE]/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#0070BA] rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-lg">Safe Multisig Active</div>
                  <div className="text-sm text-muted-foreground">
                    All payroll operations require multiple signatures for security
                  </div>
                </div>
              </div>
              {pendingSignaturesCount > 0 && (
                <Link href="/workspace/signatures">
                  <Button className="bg-[#0070BA] hover:bg-[#005A94]">
                    <Bell className="mr-2 h-4 w-4" />
                    {pendingSignaturesCount} Pending Signature{pendingSignaturesCount > 1 ? "s" : ""}
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Workspace Info */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Workspace Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your team's payroll streams with enterprise-grade security
          </p>
        </div>

        {/* Superfluid Dashboard */}
        <SuperfluidDashboard />

        {/* Upgrade/Downgrade Card */}
        <UpgradeDowngradeCard />

        {/* Active Streams */}
        <StreamsList />

        {/* Employee Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  Add employees and manage their payment streams
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
    </div>
  )
}

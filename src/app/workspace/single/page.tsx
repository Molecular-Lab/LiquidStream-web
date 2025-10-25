"use client"

import { useState } from "react"
import Link from "next/link"
import { Wallet, Settings, ArrowLeft, Zap, DollarSign } from "lucide-react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"

import { SuperfluidDashboard } from "@/components/dashboard/superfluid-dashboard"
import { AddEmployeeDialog } from "@/components/employees/add-employee-dialog"
import { EmployeeList } from "@/components/employees/employee-list"
import { StartStreamDialog } from "@/components/streams/start-stream-dialog"
import { StreamsList } from "@/components/streams/streams-list"
import { UpgradeDowngradeCard } from "@/components/swap/upgrade-downgrade-card"
import { SingleWalletUpgradeDowngradeCard } from "@/components/swap/single-wallet-upgrade-downgrade-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useDeleteStream } from "@/hooks/use-streams"
import { useSingleWalletDeleteStream } from "@/hooks/use-single-wallet-streams"
import { Employee } from "@/store/employees"
import { useStreamStore } from "@/store/streams"

export default function SingleWalletWorkspace() {
    const { address } = useAccount()
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
    const [streamDialogOpen, setStreamDialogOpen] = useState(false)
    const streams = useStreamStore((state) => state.streams)
    const { mutate: deleteStream } = useSingleWalletDeleteStream()

    const handleStartStream = (employee: Employee) => {
        setSelectedEmployee(employee)
        setStreamDialogOpen(true)
    }

    const handleStopStream = (employeeId: string) => {
        const stream = streams.find(
            (s) => s.employeeId === employeeId && s.status === "active"
        )

        if (stream) {
            const employee = streams.find(s => s.employeeId === employeeId)
            deleteStream({
                token: stream.token,
                receiver: stream.employeeAddress,
                streamId: stream.id,
                employeeName: employee?.employeeName,
                tokenSymbol: stream.tokenSymbol,
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
                            <Link href="/workspace">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Workspace
                                </Button>
                            </Link>

                            <div className="text-2xl font-bold bg-gradient-to-r from-[#0070BA] to-[#009CDE] bg-clip-text text-transparent">
                                SafeStream
                            </div>

                            <nav className="hidden md:flex items-center gap-6">
                                <Link
                                    href="/workspace/single"
                                    className="text-sm font-medium text-foreground hover:text-[#0070BA] transition-colors"
                                >
                                    Single Wallet
                                </Link>
                                <Link
                                    href="/workspace/multisig"
                                    className="text-sm font-medium text-muted-foreground hover:text-[#0070BA] transition-colors"
                                >
                                    Multisig
                                </Link>
                            </nav>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Wallet Info */}
                            <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                                <Wallet className="h-4 w-4 text-green-600" />
                                <div className="text-xs">
                                    <div className="text-green-600 font-medium">Direct Wallet</div>
                                    <div className="text-green-600/70">Instant execution</div>
                                </div>
                            </div>

                            <ConnectButton />
                        </div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-6 py-8 space-y-8">
                {/* Single Wallet Banner */}
                <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                                    <Zap className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <div className="font-semibold text-lg text-green-800 dark:text-green-200">
                                        Single Wallet Mode
                                    </div>
                                    <div className="text-sm text-green-700 dark:text-green-300">
                                        Direct wallet operations - transactions execute immediately
                                    </div>
                                    <div className="text-xs text-green-600 mt-1">
                                        Perfect for small teams or individual use
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Badge variant="outline" className="text-green-700 border-green-300">
                                    <Zap className="mr-1 h-3 w-3" />
                                    Instant Execution
                                </Badge>
                                <Badge variant="outline" className="text-green-700 border-green-300">
                                    <DollarSign className="mr-1 h-3 w-3" />
                                    Low Gas Fees
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Workspace Info */}
                <div>
                    <h1 className="text-3xl font-bold mb-2">Single Wallet Dashboard</h1>
                    <p className="text-muted-foreground">
                        Manage payroll streams with your connected wallet - fast and simple
                    </p>
                </div>

                {/* Superfluid Dashboard */}
                <SuperfluidDashboard />

                {/* Token Operations */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">Token Operations</h2>
                    <SingleWalletUpgradeDowngradeCard />
                </div>

                {/* Stream Management */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">Payment Streams</h2>
                    <StreamsList />
                </div>

                {/* Employee Management */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Team Members</CardTitle>
                                <CardDescription>
                                    Add employees and manage their payment streams (instant execution)
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
"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { Wallet, ArrowLeft } from "lucide-react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"

import { BalanceCards } from "@/components/dashboard/balance-cards"
import { StreamingStats } from "@/components/dashboard/streaming-stats"
import { ActiveStreamsTable } from "@/components/dashboard/active-streams-table"
import { WalletModeBanner } from "@/components/dashboard/wallet-mode-banner"
import { WorkspaceTabs, TabType } from "@/components/dashboard/workspace-tabs"
import { EmployeesTab } from "@/components/dashboard/employees-tab"
import { StartStreamDialog } from "@/components/streams/start-stream-dialog"
import { SingleWalletUpgradeDowngradeCard } from "@/components/swap/single-wallet-upgrade-downgrade-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useSingleWalletDeleteStream } from "@/hooks/use-single-wallet-streams"
import { Employee } from "@/store/employees"
import { useStreamStore } from "@/store/streams"
import { useWalletMode } from "@/store/wallet-mode"
import { ExchangeTab } from "@/components/dashboard/exchange-tab"
import { UpgradeDowngradeCard } from "@/components/swap/upgrade-downgrade-card"

export default function SingleWalletWorkspace() {
    const { address } = useAccount()
    const [activeTab, setActiveTab] = useState<TabType>("dashboard")
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
    const [streamDialogOpen, setStreamDialogOpen] = useState(false)

    // Wallet mode management - force single mode for this page
    const { setMode: setWalletMode } = useWalletMode()

    // Stream management
    const streams = useStreamStore((state) => state.streams)
    const { mutate: deleteStream } = useSingleWalletDeleteStream()

    // Initialize wallet mode to 'single' for single wallet page
    useEffect(() => {
        setWalletMode('single')
    }, [setWalletMode])

    // Calculate total flow rate for balance animation
    const [isHydrated, setIsHydrated] = useState(false)
    useEffect(() => {
        setIsHydrated(true)
    }, [])

    const activeStreams = useMemo(() =>
        isHydrated ? streams.filter((stream) => stream.status === "active") : []
    , [streams, isHydrated])

    const totalFlowRate = useMemo(() =>
        activeStreams.reduce(
            (total, stream) => total + BigInt(stream.flowRate),
            BigInt(0)
        )
    , [activeStreams])

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
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Header */}
            <div className="border-b bg-white sticky top-0 z-50 shadow-sm">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Link href="/workspace">
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <ArrowLeft className="h-4 w-4" />
                                    Back
                                </Button>
                            </Link>

                            <div className="text-2xl font-bold text-[#0070BA]">
                                SafeStream
                            </div>
                            
                            <Badge className="bg-blue-100 text-[#0070BA] border-blue-200 px-3 py-1">
                                <Wallet className="mr-1.5 h-3.5 w-3.5" />
                                Single Wallet
                            </Badge>
                        </div>

                        <ConnectButton />
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-6 py-8 max-w-7xl">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2 text-gray-900">Single Wallet Dashboard</h1>
                    <p className="text-lg text-gray-600">
                        Manage payroll streams with instant execution - perfect for small teams
                    </p>
                </div>

                {/* Tabs Navigation */}
                <div className="mb-8">
                    <WorkspaceTabs activeTab={activeTab} onTabChange={setActiveTab} />
                </div>

                {/* Dashboard Tab */}
                {activeTab === "dashboard" && (
                    <div className="space-y-6">
                        {/* Wallet Mode Banner */}
                        <WalletModeBanner />

                        {/* Balance Cards */}
                        <BalanceCards totalFlowRate={totalFlowRate} />

                        {/* Current Streaming Stats */}
                        <StreamingStats />

                        {/* Active Streams Table */}
                        <ActiveStreamsTable />
                    </div>
                )}

                {/* Exchange Tab */}
                {activeTab === "exchange" && (
                    <div className="space-y-6">
                        <UpgradeDowngradeCard />
                    </div>
                )}

                {/* Employees Tab */}
                {activeTab === "employees" && (
                    <EmployeesTab
                        onStartStream={handleStartStream}
                        onStopStream={handleStopStream}
                    />
                )}

                {/* Start Stream Dialog */}
                {streamDialogOpen && (
                    <StartStreamDialog
                        key="start-stream"
                        employee={selectedEmployee}
                        open={streamDialogOpen}
                        onClose={() => {
                            setStreamDialogOpen(false)
                            setSelectedEmployee(null)
                        }}
                        onStreamCreated={() => {
                            setStreamDialogOpen(false)
                            setSelectedEmployee(null)
                        }}
                        forceSingleWallet={true}
                    />
                )}
            </main>
        </div>
    )
}

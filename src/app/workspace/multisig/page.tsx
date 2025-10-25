"use client"

import { useState } from "react"
import Link from "next/link"
import { Shield, Bell, ArrowLeft, Users, Lock, FileText } from "lucide-react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"

import { SuperfluidDashboard } from "@/components/dashboard/superfluid-dashboard"
import { SafeTransactionStatus } from "@/components/dashboard/safe-transaction-status"
import { PendingSignaturesAlert } from "@/components/dashboard/pending-signatures-alert"
import { SafeAppTester } from "@/components/debug/safe-app-tester"
import { AddEmployeeDialog } from "@/components/employees/add-employee-dialog"
import { EmployeeList } from "@/components/employees/employee-list"
import { StartStreamDialog } from "@/components/streams/start-stream-dialog"
import { StreamsList } from "@/components/streams/streams-list"
import { UpgradeDowngradeCard } from "@/components/swap/upgrade-downgrade-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useDeleteStream } from "@/hooks/use-streams"
import { usePendingTransactions } from "@/hooks/use-safe-operations"
import { Employee } from "@/store/employees"
import { useStreamStore } from "@/store/streams"
import { useSafeConfig } from "@/store/safe"

export default function MultisigWorkspace() {
    const { address } = useAccount()
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
    const [streamDialogOpen, setStreamDialogOpen] = useState(false)
    const streams = useStreamStore((state) => state.streams)
    const { mutate: deleteStream } = useDeleteStream()
    const { safeConfig } = useSafeConfig()
    const { data: pendingTransactions = [] } = usePendingTransactions()

    const safeAddress = safeConfig?.address
    const pendingSignaturesCount = pendingTransactions.filter(tx => tx.status === 'pending' || tx.status === 'ready').length
    const isSafeConfigured = !!safeConfig?.address

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
                                    className="text-sm font-medium text-muted-foreground hover:text-[#0070BA] transition-colors"
                                >
                                    Single Wallet
                                </Link>
                                <Link
                                    href="/workspace/multisig"
                                    className="text-sm font-medium text-foreground hover:text-[#0070BA] transition-colors"
                                >
                                    Multisig
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
                            </nav>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Safe Info */}
                            {isSafeConfigured ? (
                                <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-[#0070BA]/10 border border-[#0070BA]/20 rounded-lg">
                                    <Shield className="h-4 w-4 text-[#0070BA]" />
                                    <div className="text-xs">
                                        <div className="text-muted-foreground">Safe Wallet</div>
                                        <div className="font-mono font-medium">
                                            {safeAddress?.slice(0, 6)}...{safeAddress?.slice(-4)}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg">
                                    <Shield className="h-4 w-4 text-orange-600" />
                                    <div className="text-xs">
                                        <div className="text-orange-600 font-medium">Setup Required</div>
                                        <div className="text-orange-600/70">Configure Safe</div>
                                    </div>
                                </div>
                            )}

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
                {/* Safe Configuration Status */}
                {isSafeConfigured ? (
                    <Card className="border-2 border-[#0070BA]/50 bg-gradient-to-r from-[#0070BA]/10 to-[#009CDE]/10">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[#0070BA] rounded-full flex items-center justify-center">
                                        <Shield className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-lg flex items-center gap-2">
                                            Safe Multisig Active
                                            <Badge variant="secondary" className="text-xs">
                                                {safeConfig.threshold}/{safeConfig.signers.length} signatures required
                                            </Badge>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            All payroll operations require multiple signatures for security
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1 font-mono">
                                            {safeAddress}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Badge variant="outline" className="text-[#0070BA] border-[#0070BA]/30">
                                        <Lock className="mr-1 h-3 w-3" />
                                        Secure
                                    </Badge>
                                    <Badge variant="outline" className="text-[#0070BA] border-[#0070BA]/30">
                                        <Users className="mr-1 h-3 w-3" />
                                        {safeConfig.signers.length} Signers
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                                        <Shield className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-lg text-orange-800 dark:text-orange-200">
                                            Safe Setup Required
                                        </div>
                                        <div className="text-sm text-orange-700 dark:text-orange-300">
                                            Configure your Safe multisig wallet to enable secure payroll operations
                                        </div>
                                    </div>
                                </div>
                                <Link href="/setup-safe">
                                    <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                                        <Shield className="mr-2 h-4 w-4" />
                                        Setup Safe Multisig
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Pending Signatures Alert */}
                <PendingSignaturesAlert pendingCount={pendingSignaturesCount} safeAddress={safeAddress} />

                {/* Workspace Info */}
                <div>
                    <h1 className="text-3xl font-bold mb-2">Multisig Dashboard</h1>
                    <p className="text-muted-foreground">
                        Manage your team's payroll streams with enterprise-grade multisig security
                    </p>
                </div>

                {/* Safe Transaction Status */}
                {isSafeConfigured && pendingSignaturesCount > 0 && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Transaction Status
                        </h2>
                        <SafeTransactionStatus />
                    </div>
                )}

                {/* Safe Apps SDK Tester */}
                <SafeAppTester />

                {/* Superfluid Dashboard */}
                <SuperfluidDashboard />                {/* Token Operations */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">Token Operations</h2>
                    <UpgradeDowngradeCard />
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
                                    {isSafeConfigured
                                        ? `Add employees and manage payment streams (requires ${safeConfig.threshold}/${safeConfig.signers.length} signatures)`
                                        : "Configure Safe multisig to manage employee payment streams securely"
                                    }
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
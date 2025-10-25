"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { Shield, Bell, ArrowLeft, Wallet } from "lucide-react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"

import { BalanceCards } from "@/components/dashboard/balance-cards"
import { StreamingStats } from "@/components/dashboard/streaming-stats"
import { ActiveStreamsTable } from "@/components/dashboard/active-streams-table"
import { WalletModeBanner } from "@/components/dashboard/wallet-mode-banner"
import { WorkspaceTabs, TabType } from "@/components/dashboard/workspace-tabs"
import { EmployeesTab } from "@/components/dashboard/employees-tab"
import { SafeTransactionStatus } from "@/components/dashboard/safe-transaction-status"
import { PendingSignaturesAlert } from "@/components/dashboard/pending-signatures-alert"
import { StartStreamDialog } from "@/components/streams/start-stream-dialog"
import { UpgradeDowngradeCard } from "@/components/swap/upgrade-downgrade-card"
import { SingleWalletUpgradeDowngradeCard } from "@/components/swap/single-wallet-upgrade-downgrade-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useDeleteStream } from "@/hooks/use-streams"
import { useSingleWalletDeleteStream } from "@/hooks/use-single-wallet-streams"
import { usePendingTransactions } from "@/hooks/use-safe-operations"
import { useConnectedSafeInfo } from "@/hooks/use-safe-apps-sdk"
import { Employee } from "@/store/employees"
import { useStreamStore } from "@/store/streams"
import { useSafe } from "@/store/safe"
import { useWalletMode } from "@/store/wallet-mode"
import { ExchangeTab } from "@/components/dashboard/exchange-tab"

export default function MultisigWorkspace() {
    const { address } = useAccount()
    const [activeTab, setActiveTab] = useState<TabType>("dashboard")
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
    const [streamDialogOpen, setStreamDialogOpen] = useState(false)

    // Wallet mode management - this page is always in Safe Multisig mode
    const { mode: walletMode, setMode: setWalletMode } = useWalletMode()
    const { safeConfig, setSafeConfig } = useSafe()
    const { safeInfo, isInSafeContext } = useConnectedSafeInfo()
    const { data: pendingTransactions = [] } = usePendingTransactions()

    // Stream management
    const streams = useStreamStore((state) => state.streams)
    const { mutate: deleteStreamSafe } = useDeleteStream()
    const { mutate: deleteStreamSingle } = useSingleWalletDeleteStream()

    // Always initialize to 'safe' mode on multisig page
    useEffect(() => {
        setWalletMode('safe')
    }, [setWalletMode])

    // Sync Safe info from safe.global if connected
    useEffect(() => {
        if (isInSafeContext && safeInfo && (!safeConfig || safeConfig.address !== safeInfo.safeAddress)) {
            const safeSigners = safeInfo.owners.map((owner, idx) => ({
                address: owner,
                name: idx === 0 ? "Owner" : `Signer ${idx + 1}`,
                role: idx === 0 ? "Owner" : "Signer",
            }))

            setSafeConfig({
                address: safeInfo.safeAddress,
                signers: safeSigners,
                threshold: safeInfo.threshold,
                chainId: safeInfo.chainId,
                createdAt: new Date().toISOString(),
                createdBy: address || safeInfo.owners[0],
            })
            
            console.log("✅ Synced Safe from safe.global to multisig workspace:", safeInfo.safeAddress)
        }
    }, [isInSafeContext, safeInfo, safeConfig, setSafeConfig, address])

    const safeAddress = isInSafeContext && safeInfo ? safeInfo.safeAddress : safeConfig?.address
    const pendingSignaturesCount = pendingTransactions.filter(tx => tx.status === 'pending' || tx.status === 'ready').length
    const isSafeConfigured = !!safeConfig?.address
    const isInSafeMode = walletMode === 'safe'

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

            // Use appropriate delete function based on wallet mode
            if (isInSafeMode) {
                deleteStreamSafe({
                    token: stream.token,
                    receiver: stream.employeeAddress,
                    streamId: stream.id,
                    employeeName: employee?.employeeName,
                    tokenSymbol: stream.tokenSymbol,
                })
            } else {
                deleteStreamSingle({
                    token: stream.token,
                    receiver: stream.employeeAddress,
                    streamId: stream.id,
                    employeeName: employee?.employeeName,
                    tokenSymbol: stream.tokenSymbol,
                })
            }
        }
    }

    const handleToggleWalletMode = () => {
        setWalletMode(walletMode === 'safe' ? 'single' : 'safe')
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

                            <div className={`text-2xl font-bold ${isInSafeMode ? 'text-green-600' : 'text-[#0070BA]'}`}>
                                SafeStream
                            </div>

                            <Badge className={isInSafeMode ? "bg-green-100 text-green-700 border-green-200 px-3 py-1" : "bg-blue-100 text-blue-700 border-blue-200 px-3 py-1"}>
                                {isInSafeMode ? (
                                    <>
                                        <Shield className="mr-1.5 h-3.5 w-3.5" />
                                        Safe Multisig
                                    </>
                                ) : (
                                    <>
                                        <Wallet className="mr-1.5 h-3.5 w-3.5" />
                                        Direct Wallet
                                    </>
                                )}
                            </Badge>

                            {/* Wallet Mode Switcher */}
                            {isSafeConfigured && (
                                <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border rounded-lg">
                                    <div className="flex items-center bg-background rounded-md p-1">
                                        <Button
                                            variant={walletMode === 'safe' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setWalletMode('safe')}
                                            className="h-8 px-3 text-xs"
                                        >
                                            <Shield className="h-3 w-3 mr-1" />
                                            Safe
                                        </Button>
                                        <Button
                                            variant={walletMode === 'single' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setWalletMode('single')}
                                            className="h-8 px-3 text-xs"
                                        >
                                            <Wallet className="h-3 w-3 mr-1" />
                                            Direct
                                        </Button>
                                    </div>
                                    <div className="text-xs">
                                        <div className="font-medium text-muted-foreground">
                                            {walletMode === 'safe' ? 'Safe Multisig' : 'Direct Wallet'}
                                        </div>
                                        <div className="font-mono text-[10px] text-muted-foreground">
                                            {walletMode === 'safe'
                                                ? `${safeAddress?.slice(0, 6)}...${safeAddress?.slice(-4)}`
                                                : `${address?.slice(0, 6)}...${address?.slice(-4)}`
                                            }
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Notifications */}
                            {isInSafeMode && (
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
                            )}

                            <ConnectButton />
                        </div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-6 py-8 max-w-7xl">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2 text-gray-900">
                        {isInSafeMode ? 'Multisig Dashboard' : 'Direct Wallet Dashboard'}
                    </h1>
                    <p className="text-lg text-gray-600">
                        {isInSafeMode
                            ? "Manage payroll streams with enterprise-grade multisig security - requires multiple signatures"
                            : "Manage payroll streams with instant execution - perfect for fast operations"
                        }
                    </p>
                </div>

                {/* Pending Signatures Alert - only show in Safe mode */}
                {isInSafeMode && pendingSignaturesCount > 0 && (
                    <div className="mb-6">
                        <PendingSignaturesAlert pendingCount={pendingSignaturesCount} safeAddress={safeAddress} />
                    </div>
                )}

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

                        {/* Safe Transaction Status - only show in Safe mode with pending transactions */}
                        {isInSafeMode && pendingSignaturesCount > 0 && (
                            <SafeTransactionStatus />
                        )}
                    </div>
                )}

                {/* Exchange Tab */}
                {activeTab === "exchange" && (
                    <div className="space-y-6">
                        {/* Token Operations */}
                        <UpgradeDowngradeCard />

                        {/* About Streamable PYUSD Info */}
                        <Card className={`border-2 ${isInSafeMode ? 'border-green-200 bg-gradient-to-r from-green-50 to-white' : 'border-blue-200 bg-gradient-to-r from-blue-50 to-white'}`}>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-lg text-gray-900 mb-4">About Streamable PYUSD</h3>
                                <div className="space-y-3 text-gray-600">
                                    <p>
                                        <strong className="text-gray-900">Streamable PYUSD</strong> (PYUSDx SuperToken) is enabled for real-time payment streaming via Superfluid Protocol.
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 ml-2">
                                        <li><strong>Upgrade:</strong> Convert PYUSD → Streamable PYUSD to enable streaming</li>
                                        <li><strong>Downgrade:</strong> Convert Streamable PYUSD → PYUSD to return to base token</li>
                                        <li><strong>1:1 Ratio:</strong> Always maintains equal value during conversion</li>
                                        {isInSafeMode ? (
                                            <li><strong>Safe Multisig:</strong> Transactions require {safeConfig?.threshold}/{safeConfig?.signers.length} signatures before execution</li>
                                        ) : (
                                            <li><strong>Direct Wallet:</strong> Transactions execute immediately without approval delays</li>
                                        )}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
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
                        forceSingleWallet={!isInSafeMode}
                    />
                )}
            </main>
        </div>
    )
}

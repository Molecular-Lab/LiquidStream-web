"use client"

import { useState } from "react"
import { Clock, Shield, CheckCircle2, Users, ArrowRight, ExternalLink } from "lucide-react"
import { Address } from "viem"
import { useAccount } from "wagmi"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useSafe, PendingTransaction } from "@/store/safe"
import { useSignSafeTransaction, useExecuteSafeTransaction, usePendingTransactions } from "@/hooks/use-safe-operations"
import { useConnectedSafeInfo } from "@/hooks/use-safe-apps-sdk"

interface SafeTransactionStatusProps {
    className?: string
}

export function SafeTransactionStatus({ className }: SafeTransactionStatusProps) {
    const { address } = useAccount()
    const { safeConfig } = useSafe()
    const { safeInfo, isInSafeContext } = useConnectedSafeInfo()
    const { data: pendingTransactions = [] } = usePendingTransactions()
    const { mutate: signTransaction, isPending: isSigning } = useSignSafeTransaction()
    const { mutate: executeTransaction, isPending: isExecuting } = useExecuteSafeTransaction()

    // Prioritize safe.global connection
    const activeSafeAddress = isInSafeContext && safeInfo ? safeInfo.safeAddress : safeConfig?.address

    if (!activeSafeAddress || pendingTransactions.length === 0) {
        return null
    }

    const handleSign = (transactionId: string) => {
        signTransaction({ transactionId })
    }

    const handleExecute = (transactionId: string) => {
        executeTransaction({ transactionId })
    }

    const getStatusColor = (status: PendingTransaction['status']) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
            case 'ready':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
            case 'executed':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
            case 'rejected':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
        }
    }

    const formatTransactionType = (type: PendingTransaction['type']) => {
        switch (type) {
            case 'start_stream':
                return 'Start Stream'
            case 'stop_stream':
                return 'Stop Stream'
            case 'transfer':
                return 'Update Stream'
            case 'upgrade_token':
                return 'Upgrade Token'
            case 'batch_operations':
                return 'Batch Operations'
            default:
                return 'Transaction'
        }
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Safe Multisig Transactions
                </CardTitle>
                <CardDescription>
                    Pending transactions requiring signatures ({safeConfig.threshold}/{safeConfig.signers.length} required)
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {pendingTransactions.map((transaction) => {
                    const canSign = !transaction.signatures.includes(address!) && transaction.status === 'pending'
                    const canExecute = transaction.status === 'ready' && transaction.signatures.length >= transaction.requiredSignatures
                    const isCompleted = transaction.status === 'executed'

                    return (
                        <div
                            key={transaction.id}
                            className="border rounded-lg p-4 space-y-3 hover:bg-muted/30 transition-colors"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{formatTransactionType(transaction.type)}</span>
                                        <Badge
                                            variant="secondary"
                                            className={`text-xs ${getStatusColor(transaction.status)}`}
                                        >
                                            {transaction.status.toUpperCase()}
                                        </Badge>
                                        {transaction.isMultiOperation && (
                                            <Badge variant="outline" className="text-xs">
                                                BATCH
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {transaction.description}
                                    </p>
                                </div>

                                <div className="text-right text-xs text-muted-foreground">
                                    {new Date(transaction.createdAt).toLocaleDateString()}
                                </div>
                            </div>

                            {/* Employee/Token Info */}
                            {(transaction.employeeName || transaction.tokenSymbol) && (
                                <div className="flex items-center gap-4 text-sm">
                                    {transaction.employeeName && (
                                        <div>
                                            <span className="text-muted-foreground">Employee:</span>{' '}
                                            <span className="font-medium">{transaction.employeeName}</span>
                                        </div>
                                    )}
                                    {transaction.tokenSymbol && (
                                        <div>
                                            <span className="text-muted-foreground">Token:</span>{' '}
                                            <span className="font-medium">{transaction.tokenSymbol}</span>
                                        </div>
                                    )}
                                    {transaction.flowRate && (
                                        <div>
                                            <span className="text-muted-foreground">Flow Rate:</span>{' '}
                                            <span className="font-mono text-xs">{transaction.flowRate} wei/sec</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <Separator />

                            {/* Signatures */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        <span>Signatures</span>
                                    </div>
                                    <span className="font-medium">
                                        {transaction.signatures.length}/{transaction.requiredSignatures}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {safeConfig.signers.map((signer) => {
                                        const hasSigned = transaction.signatures.includes(signer.address)
                                        return (
                                            <div
                                                key={signer.address}
                                                className={`flex items-center gap-2 p-2 rounded text-xs ${hasSigned
                                                        ? 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300'
                                                        : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400'
                                                    }`}
                                            >
                                                {hasSigned ? (
                                                    <CheckCircle2 className="h-3 w-3" />
                                                ) : (
                                                    <Clock className="h-3 w-3" />
                                                )}
                                                <span className="truncate">{signer.name}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Actions */}
                            {!isCompleted && (
                                <div className="flex items-center gap-2 pt-2">
                                    {canSign && (
                                        <Button
                                            size="sm"
                                            onClick={() => handleSign(transaction.id)}
                                            disabled={isSigning}
                                        >
                                            {isSigning ? 'Signing...' : 'Sign Transaction'}
                                        </Button>
                                    )}

                                    {canExecute && (
                                        <Button
                                            size="sm"
                                            onClick={() => handleExecute(transaction.id)}
                                            disabled={isExecuting}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            {isExecuting ? 'Executing...' : 'Execute Transaction'}
                                            <ArrowRight className="h-3 w-3 ml-1" />
                                        </Button>
                                    )}

                                    {transaction.safeTransactionHash && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                // Open Safe transaction in new tab
                                                const safeUrl = `https://app.safe.global/transactions/queue?safe=sep:${safeConfig.address}`
                                                window.open(safeUrl, '_blank')
                                            }}
                                        >
                                            <ExternalLink className="h-3 w-3 mr-1" />
                                            View in Safe
                                        </Button>
                                    )}
                                </div>
                            )}

                            {/* Completed transaction info */}
                            {isCompleted && transaction.txHash && (
                                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded text-sm">
                                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span className="font-medium">Transaction Executed</span>
                                    </div>
                                    <div className="mt-1 text-blue-600 dark:text-blue-400 font-mono text-xs">
                                        {transaction.txHash.slice(0, 10)}...{transaction.txHash.slice(-8)}
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    )
}
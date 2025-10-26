"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Shield, CheckCircle2, Clock, AlertTriangle, ArrowLeft, FileText, DollarSign, UserPlus, UserMinus, Loader2 } from "lucide-react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSafe } from "@/store/safe"

export default function SignaturesPage() {
  const { address } = useAccount()
  const searchParams = useSearchParams()
  const highlightTxId = searchParams.get("highlight")
  
  const { pendingTransactions, signTransaction, executeTransaction, getSignerInfo } = useSafe()
  const [isSigning, setIsSigning] = useState<string | null>(null)

  const handleSign = async (txId: string) => {
    if (!address) return
    
    setIsSigning(txId)

    try {
      // TODO: Integrate with Safe SDK to sign transaction
      // 1. Get transaction details from Safe
      // 2. Create signature with user's wallet
      // 3. Submit signature to Safe
      
      await new Promise((resolve) => setTimeout(resolve, 2000))
      
      // Update signature in store
      signTransaction(txId, address.toLowerCase())

      toast.success("Transaction signed!", {
        description: "Signature has been added to the Safe transaction",
      })
    } catch (error: any) {
      console.error("Signing error:", error)
      toast.error("Failed to sign transaction", {
        description: error.message || "Please try again",
      })
    } finally {
      setIsSigning(null)
    }
  }

  const handleExecute = async (txId: string) => {
    setIsSigning(txId)

    try {
      // TODO: Execute transaction if threshold is met
      await new Promise((resolve) => setTimeout(resolve, 2000))
      
      // Mark as executed in store
      executeTransaction(txId)

      toast.success("Transaction executed!", {
        description: "The operation has been completed successfully",
      })
    } catch (error: any) {
      console.error("Execution error:", error)
      toast.error("Failed to execute transaction", {
        description: error.message || "Please try again",
      })
    } finally {
      setIsSigning(null)
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "start_stream":
        return <DollarSign className="h-5 w-5" />
      case "stop_stream":
        return <UserMinus className="h-5 w-5" />
      case "add_employee":
        return <UserPlus className="h-5 w-5" />
      case "fund_safe":
        return <FileText className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "start_stream":
        return "text-green-600 bg-green-100 dark:bg-green-950"
      case "stop_stream":
        return "text-red-600 bg-red-100 dark:bg-red-950"
      case "add_employee":
        return "text-blue-600 bg-blue-100 dark:bg-blue-950"
      case "transfer":
        return "text-purple-600 bg-purple-100 dark:bg-purple-950"
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-950"
    }
  }

  const hasUserSigned = (tx: typeof pendingTransactions[0]) => {
    return tx.signatures.includes(address?.toLowerCase() || "")
  }

  const canExecute = (tx: typeof pendingTransactions[0]) => {
    return tx.status === "ready"
  }

  // Filter out executed transactions
  const activePendingTxs = pendingTransactions.filter(tx => tx.status !== "executed")

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/workspace">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            <ConnectButton />
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-[#0070BA]/10 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-[#0070BA]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Pending Signatures</h1>
              <p className="text-muted-foreground">
                Review and sign Safe multisig transactions
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{activePendingTxs.length}</div>
                  <div className="text-sm text-muted-foreground">Pending Transactions</div>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {activePendingTxs.filter((tx) => !hasUserSigned(tx)).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Awaiting Your Signature</div>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {activePendingTxs.filter((tx) => canExecute(tx)).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Ready to Execute</div>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Transactions List */}
        <div className="space-y-6">
          {activePendingTxs.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
                <p className="text-muted-foreground">
                  No pending transactions require your attention
                </p>
              </CardContent>
            </Card>
          ) : (
            activePendingTxs.map((tx) => {
              const userSigned = hasUserSigned(tx)
              const readyToExecute = canExecute(tx)

              return (
                <Card key={tx.id} className={`border-2 ${highlightTxId === tx.id ? "border-[#0070BA] ring-2 ring-[#0070BA]/20" : ""}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center ${getTransactionColor(
                            tx.type
                          )}`}
                        >
                          {getTransactionIcon(tx.type)}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{tx.description}</CardTitle>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div>
                              Proposed by{" "}
                              <span className="font-mono">{tx.createdBy.slice(0, 6)}...{tx.createdBy.slice(-4)}</span>
                            </div>
                            <div>
                              {new Date(tx.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {readyToExecute ? (
                          <div className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 rounded-full text-sm font-medium">
                            Ready to Execute
                          </div>
                        ) : userSigned ? (
                          <div className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded-full text-sm font-medium">
                            Signed
                          </div>
                        ) : (
                          <div className="px-3 py-1 bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 rounded-full text-sm font-medium">
                            Pending
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Transaction Details */}
                    <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                      <div>
                        <div className="text-sm text-muted-foreground">Transaction To</div>
                        <div className="font-mono text-sm">{tx.to.slice(0, 10)}...{tx.to.slice(-8)}</div>
                      </div>
                      {tx.value && (
                        <div>
                          <div className="text-sm text-muted-foreground">Value</div>
                          <div className="font-medium">{tx.value}</div>
                        </div>
                      )}
                    </div>

                    {/* Signature Progress */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-medium">Signatures</div>
                        <div className="text-sm text-muted-foreground">
                          {tx.signatures.length} of {tx.requiredSignatures} required
                        </div>
                      </div>

                      <div className="space-y-2">
                        {tx.signatures.map((signerAddr, index) => {
                          const signerInfo = getSignerInfo(signerAddr)
                          return (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-100 dark:bg-green-950">
                                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                  <div className="font-medium">{signerInfo?.name || "Signer"}</div>
                                  <div className="text-sm text-muted-foreground font-mono">
                                    {signerAddr.slice(0, 6)}...{signerAddr.slice(-4)}
                                  </div>
                                </div>
                              </div>
                              <div className="text-xs text-green-600 font-medium">
                                ✓ Signed
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      {!userSigned && (
                        <Button
                          onClick={() => handleSign(tx.id)}
                          disabled={isSigning === tx.id}
                          className="bg-[#0070BA] hover:bg-[#005A94] flex-1"
                        >
                          {isSigning === tx.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Signing...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Sign Transaction
                            </>
                          )}
                        </Button>
                      )}
                      {readyToExecute && userSigned && (
                        <Button
                          onClick={() => handleExecute(tx.id)}
                          disabled={isSigning === tx.id}
                          className="bg-green-600 hover:bg-green-700 flex-1"
                        >
                          {isSigning === tx.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Executing...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Execute Transaction
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}

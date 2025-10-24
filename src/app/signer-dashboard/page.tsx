"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Shield, FileSignature, CheckCircle2, Clock, AlertCircle, ArrowRight, ExternalLink } from "lucide-react"
import { useAccount } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSafe } from "@/store/safe"

export default function SignerDashboardPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { safeConfig, pendingTransactions, isSigner, getSignerInfo, getPendingForSigner } = useSafe()
  
  const [isSignerUser, setIsSignerUser] = useState(false)
  const [signerInfo, setSignerInfo] = useState<any>(null)
  const [awaitingSignature, setAwaitingSignature] = useState<any[]>([])
  const [allPending, setAllPending] = useState<any[]>([])

  useEffect(() => {
    if (address && safeConfig) {
      const userIsSigner = isSigner(address)
      setIsSignerUser(userIsSigner)
      
      if (userIsSigner) {
        const info = getSignerInfo(address)
        setSignerInfo(info)
        
        const pending = getPendingForSigner(address)
        setAwaitingSignature(pending)
        
        const all = pendingTransactions.filter(tx => tx.status !== "executed")
        setAllPending(all)
      }
    }
  }, [address, safeConfig, pendingTransactions, isSigner, getSignerInfo, getPendingForSigner])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="border-b">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="text-2xl font-bold bg-gradient-to-r from-[#0070BA] to-[#009CDE] bg-clip-text text-transparent">
              SafeStream
            </div>
            <ConnectButton />
          </div>
        </div>
        
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-md mx-auto text-center">
            <Shield className="h-16 w-16 text-[#0070BA] mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Signer Dashboard</h1>
            <p className="text-muted-foreground mb-8">
              Connect your wallet to view pending transactions requiring your signature
            </p>
            <ConnectButton />
          </div>
        </div>
      </div>
    )
  }

  if (!safeConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="border-b">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="text-2xl font-bold bg-gradient-to-r from-[#0070BA] to-[#009CDE] bg-clip-text text-transparent">
              SafeStream
            </div>
            <ConnectButton />
          </div>
        </div>
        
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-md mx-auto text-center">
            <AlertCircle className="h-16 w-16 text-orange-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">No Safe Wallet Found</h1>
            <p className="text-muted-foreground mb-8">
              No Safe wallet configuration found. Please create a workspace first.
            </p>
            <Link href="/register">
              <Button className="bg-[#0070BA] hover:bg-[#005A94]">
                Create Workspace
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!isSignerUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="border-b">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="text-2xl font-bold bg-gradient-to-r from-[#0070BA] to-[#009CDE] bg-clip-text text-transparent">
              SafeStream
            </div>
            <ConnectButton />
          </div>
        </div>
        
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-md mx-auto text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-4">
              Your wallet address is not a signer on this Safe wallet.
            </p>
            <div className="bg-muted p-4 rounded-lg text-sm mb-8">
              <div className="text-muted-foreground mb-1">Your Address:</div>
              <div className="font-mono text-xs break-all">{address}</div>
            </div>
            <p className="text-sm text-muted-foreground">
              Please connect with a signer wallet or contact the workspace owner.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="border-b sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-[#0070BA] to-[#009CDE] bg-clip-text text-transparent">
            SafeStream
          </div>
          <div className="flex items-center gap-4">
            <Link href="/workspace">
              <Button variant="ghost" size="sm">
                Go to Workspace
              </Button>
            </Link>
            <ConnectButton />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Signer Dashboard</h1>
            <p className="text-muted-foreground">
              Review and sign pending Safe transactions
            </p>
          </div>

          {/* Signer Info Card */}
          <Card className="border-2 border-[#0070BA]/50 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#0070BA]/10 rounded-full flex items-center justify-center">
                    <Shield className="h-6 w-6 text-[#0070BA]" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">
                      {signerInfo?.name || "Signer"}
                    </div>
                    {signerInfo?.role && (
                      <div className="text-sm text-[#0070BA]">{signerInfo.role}</div>
                    )}
                    <div className="text-xs text-muted-foreground font-mono mt-1">
                      {address?.slice(0, 10)}...{address?.slice(-8)}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Safe Wallet</div>
                  <div className="font-mono text-xs">
                    {safeConfig.address.slice(0, 10)}...{safeConfig.address.slice(-8)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {safeConfig.threshold} of {safeConfig.signers.length} signatures required
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-orange-500" />
                  <div>
                    <div className="text-3xl font-bold">{allPending.length}</div>
                    <div className="text-sm text-muted-foreground">Total Pending</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <FileSignature className="h-8 w-8 text-[#0070BA]" />
                  <div>
                    <div className="text-3xl font-bold">{awaitingSignature.length}</div>
                    <div className="text-sm text-muted-foreground">Awaiting Your Signature</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                  <div>
                    <div className="text-3xl font-bold">
                      {allPending.filter(tx => tx.status === "ready").length}
                    </div>
                    <div className="text-sm text-muted-foreground">Ready to Execute</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Awaiting Your Signature */}
          {awaitingSignature.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Awaiting Your Signature</h2>
              <div className="space-y-4">
                {awaitingSignature.map((tx) => (
                  <Card key={tx.id} className="border-2 border-orange-500/50 hover:border-orange-500 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                              tx.type === "start_stream"
                                ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                                : tx.type === "stop_stream"
                                ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                            }`}>
                              {tx.type.replace("_", " ").toUpperCase()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Created {new Date(tx.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          
                          <div className="font-semibold text-lg mb-2">{tx.description}</div>
                          
                          <div className="text-sm text-muted-foreground mb-4">
                            To: <span className="font-mono">{tx.to.slice(0, 10)}...{tx.to.slice(-8)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm">
                            <div className="text-muted-foreground">Signatures:</div>
                            <div className="font-medium">
                              {tx.signatures.length} of {tx.requiredSignatures}
                            </div>
                            <div className="flex gap-1 ml-2">
                              {Array.from({ length: tx.requiredSignatures }).map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-2 h-2 rounded-full ${
                                    i < tx.signatures.length ? "bg-green-500" : "bg-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          onClick={() => router.push(`/workspace/signatures?highlight=${tx.id}`)}
                          className="bg-[#0070BA] hover:bg-[#005A94]"
                        >
                          Sign Transaction
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All Pending Transactions */}
          <div>
            <h2 className="text-2xl font-bold mb-4">All Pending Transactions</h2>
            
            {allPending.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">All Clear!</h3>
                  <p className="text-muted-foreground">
                    No pending transactions requiring signatures
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {allPending.map((tx) => {
                  const hasUserSigned = tx.signatures.includes(address?.toLowerCase() || "")
                  
                  return (
                    <Card key={tx.id} className="border-2">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                tx.type === "start_stream"
                                  ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                                  : tx.type === "stop_stream"
                                  ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                                  : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                              }`}>
                                {tx.type.replace("_", " ").toUpperCase()}
                              </div>
                              
                              {tx.status === "ready" && (
                                <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300">
                                  READY TO EXECUTE
                                </div>
                              )}
                              
                              {hasUserSigned && (
                                <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                  YOU SIGNED
                                </div>
                              )}
                              
                              <div className="text-xs text-muted-foreground">
                                Created {new Date(tx.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            
                            <div className="font-semibold text-lg mb-2">{tx.description}</div>
                            
                            <div className="text-sm text-muted-foreground mb-4">
                              To: <span className="font-mono">{tx.to.slice(0, 10)}...{tx.to.slice(-8)}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm">
                              <div className="text-muted-foreground">Signatures:</div>
                              <div className="font-medium">
                                {tx.signatures.length} of {tx.requiredSignatures}
                              </div>
                              <div className="flex gap-1 ml-2">
                                {Array.from({ length: tx.requiredSignatures }).map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full ${
                                      i < tx.signatures.length ? "bg-green-500" : "bg-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <Button
                            onClick={() => router.push(`/workspace/signatures?highlight=${tx.id}`)}
                            variant={hasUserSigned ? "outline" : "default"}
                            className={!hasUserSigned ? "bg-[#0070BA] hover:bg-[#005A94]" : ""}
                          >
                            {hasUserSigned ? "View Details" : "Sign Now"}
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

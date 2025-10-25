"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Shield, Users, CheckCircle2, ArrowRight, Loader2, Plus, X } from "lucide-react"
import { useAccount, useWalletClient, useSendTransaction } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { toast } from "sonner"
import Safe from "@safe-global/protocol-kit"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useWorkspace } from "@/store/workspace"
import { useSafe, type SafeSigner } from "@/store/safe"
import { useConnectedSafeInfo } from "@/hooks/use-safe-apps-sdk"

interface Signer {
  address: string
  name: string
  email?: string
  role?: string
}

export default function SetupSafePage() {
  const router = useRouter()
  const { address, isConnected, chain } = useAccount()
  const { data: walletClient } = useWalletClient()
  const { sendTransaction } = useSendTransaction()
  const { registration: workspaceData } = useWorkspace()
  const { setSafeConfig, safeConfig } = useSafe()
  const { safeInfo, isLoading: isLoadingSafeInfo, isInSafeContext, hasConnectedSafe } = useConnectedSafeInfo()

  const [isCreating, setIsCreating] = useState(false)
  const [safeCreated, setSafeCreated] = useState(false)
  const [safeAddress, setSafeAddress] = useState("")
  const [signers, setSigners] = useState<Signer[]>([
    { address: address || "", name: "You (Owner)", role: "Owner" },
  ])
  const [threshold, setThreshold] = useState(1)

  // Check if Safe is already connected via safe.global
  useEffect(() => {
    if (!isLoadingSafeInfo && safeInfo && isInSafeContext) {
      // Safe is connected via safe.global - use that instead of creating new
      console.log("🔗 Safe already connected via safe.global:", safeInfo.safeAddress)
      setSafeAddress(safeInfo.safeAddress)
      setSafeCreated(true)
      
      // Update Zustand store with connected Safe info
      const safeSigners: SafeSigner[] = safeInfo.owners.map((owner, idx) => ({
        address: owner,
        name: idx === 0 ? "Owner" : `Signer ${idx + 1}`,
        role: idx === 0 ? "Owner" : "Signer",
      }))

      if (!safeConfig || safeConfig.address !== safeInfo.safeAddress) {
        setSafeConfig({
          address: safeInfo.safeAddress,
          signers: safeSigners,
          threshold: safeInfo.threshold,
          chainId: safeInfo.chainId,
          createdAt: new Date().toISOString(),
          createdBy: address || safeInfo.owners[0],
          workspaceName: workspaceData?.name,
        })
        
        toast.success("Safe wallet detected!", {
          description: `Connected to Safe at ${safeInfo.safeAddress.slice(0, 10)}...`,
        })
      }
    }
  }, [isLoadingSafeInfo, safeInfo, isInSafeContext, address, workspaceData, safeConfig, setSafeConfig])

  useEffect(() => {
    if (address && signers[0] && signers[0].address !== address) {
      const updated = [...signers]
      updated[0].address = address
      setSigners(updated)
    }
  }, [address])

  const addManualSigner = () => {
    setSigners([...signers, { address: "", name: "", role: "Custom Signer" }])
  }

  const removeSigner = (index: number) => {
    if (signers.length > 1 && index > 0) {
      setSigners(signers.filter((_, i) => i !== index))
      if (threshold > signers.length - 1) {
        setThreshold(signers.length - 1)
      }
    }
  }

  const updateSigner = (index: number, field: keyof Signer, value: string) => {
    const updated = [...signers]
    updated[index][field] = value
    setSigners(updated)
  }

  const handleCreateSafe = async () => {
    if (!isConnected || !address || !walletClient) {
      toast.error("Please connect your wallet first")
      return
    }

    if (chain?.id !== 11155111) {
      toast.error("Please switch to Sepolia network")
      return
    }

    const hasEmptyAddresses = signers.slice(1).some((s) => !s.address)
    if (hasEmptyAddresses) {
      toast.error("Please fill in all signer addresses")
      return
    }

    if (signers.length === 0) {
      toast.error("Please add at least one signer")
      return
    }

    if (threshold > signers.length || threshold === 0) {
      toast.error("Invalid threshold value")
      return
    }

    setIsCreating(true)

    try {
      toast.info("Creating Safe wallet...")

      const protocolKit = await Safe.init({
        provider: window.ethereum as any,
        signer: walletClient.account.address,
        predictedSafe: {
          safeAccountConfig: {
            owners: signers.map(s => s.address),
            threshold: threshold,
          },
        },
      })

      const predictedAddress = await protocolKit.getAddress()

      console.log("🔐 Safe Wallet Address:", predictedAddress)
      console.log("📋 Owners:", signers.map(s => s.address))
      console.log("🔢 Threshold:", threshold)

      toast.info(`Safe address: ${predictedAddress.slice(0, 10)}... Deploying contract...`)

      const isDeployed = await protocolKit.isSafeDeployed()
      let finalDeploymentStatus = isDeployed

      if (!isDeployed) {
        const deploymentTransaction = await protocolKit.createSafeDeploymentTransaction()
        toast.info("Deploying Safe contract...")

        const txHash = await new Promise<string>((resolve, reject) => {
          sendTransaction(
            {
              to: deploymentTransaction.to as `0x${string}`,
              data: deploymentTransaction.data as `0x${string}`,
            },
            {
              onSuccess: (hash) => resolve(hash),
              onError: (error) => reject(error),
            }
          )
        })

        toast.info(`Transaction submitted: ${txHash.slice(0, 10)}... Waiting for confirmation...`)
        await new Promise(resolve => setTimeout(resolve, 15000))

        let attempts = 0
        let deployed = false

        while (attempts < 3 && !deployed) {
          deployed = await protocolKit.isSafeDeployed()
          if (!deployed) {
            console.log(`⏳ Deployment check ${attempts + 1}/3 - not confirmed yet, waiting...`)
            await new Promise(resolve => setTimeout(resolve, 5000))
          }
          attempts++
        }

        finalDeploymentStatus = deployed

        if (!deployed) {
          console.warn("⚠️ Safe deployment not confirmed after 3 attempts")
          toast.warning("Safe deployment is taking longer than expected. You may need to refresh after deployment completes.")
        } else {
          console.log("✅ Safe deployment confirmed on-chain")
          toast.success("Safe deployed successfully!")
        }
      } else {
        console.log("ℹ️ Safe already deployed at:", predictedAddress)
      }

      setSafeAddress(predictedAddress)
      setSafeCreated(true)

      const safeSigners: SafeSigner[] = signers.map((s) => ({
        address: s.address,
        name: s.name,
        email: s.email,
        role: s.role,
      }))

      console.log("✅ Safe Created Successfully!")
      console.log("📍 Safe Address:", predictedAddress)
      console.log("✨ Deployment Status:", finalDeploymentStatus ? "DEPLOYED" : "PENDING")
      console.log("👥 Signers:", safeSigners)
      console.log("🔐 Threshold:", threshold, "of", safeSigners.length)

      setSafeConfig({
        address: predictedAddress,
        signers: safeSigners,
        threshold: threshold,
        chainId: chain?.id || 11155111,
        createdAt: new Date().toISOString(),
        createdBy: address,
        workspaceName: workspaceData?.name,
      })

      console.log("💾 Safe config saved to store")

      toast.success("Safe wallet created successfully!", {
        description: `Safe Address: ${predictedAddress.slice(0, 10)}...`,
      })

    } catch (error: any) {
      console.error("Safe creation error:", error)
      toast.error("Failed to create Safe wallet", {
        description: error.message || "Please try again",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleContinueToDashboard = () => {
    toast.success("Safe wallet activated!", {
      description: `Your workspace will now operate through Safe multisig at ${safeAddress.slice(0, 10)}...`,
    })

    setTimeout(() => {
      router.push("/workspace")
    }, 1000)
  }

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

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-[#0070BA]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-[#0070BA]" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Create Safe Multisig Wallet</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Set up enterprise-grade security for your payroll operations. Multiple signatures
              required for all transactions.
            </p>

            {workspaceData && (
              <div className="mt-6 max-w-md mx-auto">
                <Card className="border-[#0070BA]/50 bg-[#0070BA]/5">
                  <CardContent className="p-4">
                    <div className="text-sm space-y-1">
                      <div className="font-semibold text-[#0070BA]">
                        Workspace: {workspaceData.name}
                      </div>
                      <div className="text-muted-foreground">
                        Setting up Safe Multisig wallet
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Safe Connection Status Banner */}
            {isInSafeContext && safeInfo && (
              <div className="mt-6 max-w-2xl mx-auto">
                <Card className="border-green-500/50 bg-green-50/50 dark:bg-green-950/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm space-y-1 text-left">
                        <div className="font-semibold text-green-900 dark:text-green-100">
                          Safe Wallet Connected via safe.global
                        </div>
                        <div className="text-green-800 dark:text-green-200">
                          Using existing Safe: {safeInfo.safeAddress.slice(0, 10)}...{safeInfo.safeAddress.slice(-8)}
                        </div>
                        <div className="text-xs text-green-700 dark:text-green-300">
                          {safeInfo.threshold} of {safeInfo.owners.length} signatures required
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {!safeCreated ? (
            <>
              {/* Only show configuration form if NOT connected via safe.global */}
              {!isInSafeContext && (
                <>
                  <Card className="border-2 mb-8">
                    <CardHeader>
                      <CardTitle>Configure Your Safe</CardTitle>
                      <CardDescription>
                        Add your operation team members as signers and set signature threshold
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Signers</Label>

                    <div className="p-4 bg-[#0070BA]/10 border border-[#0070BA]/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">Owner (You)</div>
                        <div className="text-xs text-[#0070BA] font-medium">PRIMARY SIGNER</div>
                      </div>
                      <div className="text-sm text-muted-foreground break-all">
                        {address || "Connect wallet to continue"}
                      </div>
                    </div>

                    {signers.slice(1).map((signer, index) => (
                      <div key={index + 1} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">
                              {signer.name || `Signer ${index + 2}`}
                            </div>
                            {signer.role && (
                              <div className="text-xs text-[#0070BA] mt-1">{signer.role}</div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSigner(index + 1)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm">Name</Label>
                          <Input
                            placeholder="Team member name"
                            value={signer.name}
                            onChange={(e) =>
                              updateSigner(index + 1, "name", e.target.value)
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm">
                            Wallet Address <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            placeholder="0x..."
                            value={signer.address}
                            onChange={(e) =>
                              updateSigner(index + 1, "address", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    ))}

                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={addManualSigner}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Additional Signer
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <Label className="text-base font-semibold">
                        Signature Threshold
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Number of signatures required to execute transactions
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="text-3xl font-bold text-[#0070BA]">
                          {threshold}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          out of {signers.length} signers
                        </div>
                      </div>

                      <Slider
                        value={[threshold]}
                        onValueChange={(value) => setThreshold(value[0])}
                        min={1}
                        max={signers.length}
                        step={1}
                        className="w-full"
                      />

                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className={`p-2 rounded ${threshold === 1 ? "bg-orange-100 text-orange-700 border border-orange-300" : "bg-muted text-muted-foreground"}`}>
                          Low Security
                        </div>
                        <div className={`p-2 rounded ${threshold > 1 && threshold < signers.length ? "bg-green-100 text-green-700 border border-green-300" : "bg-muted text-muted-foreground"}`}>
                          Recommended
                        </div>
                        <div className={`p-2 rounded ${threshold === signers.length ? "bg-blue-100 text-blue-700 border border-blue-300" : "bg-muted text-muted-foreground"}`}>
                          Maximum Security
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-lg">How It Works</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-[#0070BA] flex-shrink-0 mt-0.5" />
                      <div>Safe wallet will be deployed with your configuration</div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-[#0070BA] flex-shrink-0 mt-0.5" />
                      <div>All signers will receive notification to join</div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-[#0070BA] flex-shrink-0 mt-0.5" />
                      <div>Transactions require {threshold} signature{threshold > 1 ? "s" : ""} to execute</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Security Benefits</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <Shield className="h-5 w-5 text-[#0070BA] flex-shrink-0 mt-0.5" />
                      <div>No single point of failure - shared control</div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Shield className="h-5 w-5 text-[#0070BA] flex-shrink-0 mt-0.5" />
                      <div>Transparent audit trail for all transactions</div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Shield className="h-5 w-5 text-[#0070BA] flex-shrink-0 mt-0.5" />
                      <div>Battle-tested by thousands of organizations</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-center">
                {isInSafeContext && safeInfo ? (
                  <Button
                    size="lg"
                    onClick={handleContinueToDashboard}
                    className="bg-green-600 hover:bg-green-700 text-lg h-14 px-12"
                  >
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Continue to Workspace
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    onClick={handleCreateSafe}
                    disabled={!isConnected || isCreating || signers.length < 1}
                    className="bg-[#0070BA] hover:bg-[#005A94] text-lg h-14 px-12"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creating Safe Wallet...
                      </>
                    ) : (
                      <>
                        Create Safe Wallet
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                )}
              </div>
              </>
              )}
            </>
          ) : (
            <Card className="border-2 border-green-500/50 bg-green-50/50 dark:bg-green-950/20">
              <CardContent className="p-12 text-center space-y-6">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </div>

                <div>
                  <h2 className="text-3xl font-bold mb-2">Safe Wallet Created!</h2>
                  <p className="text-muted-foreground">
                    Your multisig wallet is ready for payroll operations
                  </p>
                </div>

                <div className="p-4 bg-background rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Safe Address</div>
                  <div className="font-mono text-sm break-all">{safeAddress}</div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {signers.length} signers configured
                  </div>
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    {threshold} of {signers.length} signatures required
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                  <div className="text-sm space-y-2">
                    <div className="font-semibold text-orange-900 dark:text-orange-100 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Important: Your Safe is Now Active
                    </div>
                    <div className="text-orange-800 dark:text-orange-200">
                      All payroll operations will now require {threshold} of {signers.length} signatures.
                      Your Safe wallet is now the primary account for all transactions.
                    </div>
                  </div>
                </div>

                <div className="bg-[#0070BA]/10 border border-[#0070BA]/20 rounded-lg p-4">
                  <div className="text-sm space-y-1">
                    <div className="font-semibold">Next Steps:</div>
                    <div className="text-muted-foreground">• Fund your Safe wallet with PYUSD</div>
                    <div className="text-muted-foreground">• Upgrade PYUSD to PYUSDx for streaming</div>
                    <div className="text-muted-foreground">• Add employees and start streaming payroll</div>
                  </div>
                </div>

                <Button
                  size="lg"
                  onClick={handleContinueToDashboard}
                  className="bg-[#0070BA] hover:bg-[#005A94] text-lg h-14 px-12"
                >
                  Go to Workspace
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Shield, Users, CheckCircle2, ArrowRight, Loader2, Plus, X, ChevronDown } from "lucide-react"
import { useAccount, useWalletClient, useSendTransaction, useWaitForTransactionReceipt } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { toast } from "sonner"
import { createConfig as createSafeConfig } from "@safe-global/safe-react-hooks"
import Safe, { PredictedSafeProps } from "@safe-global/protocol-kit"
import { sepolia } from "viem/chains"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useWorkspace, type TeamMember } from "@/store/workspace"
import { useSafeConfig, type SafeSigner } from "@/store/safe"

interface Signer {
  address: string
  name: string
  email?: string
  role?: string
  operatorId?: string // To track which operator was selected
}

interface WorkspaceData {
  company: {
    name: string
    industry: string
    size: string
    country: string
  }
  team: Array<{
    email: string
    role: string
    name: string
  }>
  createdAt: string
}

export default function SetupSafePage() {
  const router = useRouter()
  const { address, isConnected, chain } = useAccount()
  const { data: walletClient } = useWalletClient()
  const { sendTransaction } = useSendTransaction()
  const { registration: workspaceData, getOperators } = useWorkspace()
  const { setSafeConfig } = useSafeConfig()
  
  const [isCreating, setIsCreating] = useState(false)
  const [safeCreated, setSafeCreated] = useState(false)
  const [safeAddress, setSafeAddress] = useState("")
  const [availableOperators, setAvailableOperators] = useState<TeamMember[]>([])

  // Signers state (owner only initially, operators added via dropdown)
  const [signers, setSigners] = useState<Signer[]>([
    { address: address || "", name: "You (Owner)", role: "Owner" },
  ])

  // Threshold (minimum signatures required)
  const [threshold, setThreshold] = useState(1)

  // Load available operators from workspace
  useEffect(() => {
    if (workspaceData) {
      const operators = getOperators()
      setAvailableOperators(operators)
      
      if (operators.length > 0) {
        toast.success(`Loaded ${operators.length} operators from workspace`)
      }
    }
  }, [workspaceData, getOperators])

  // Update owner address when wallet connects
  useEffect(() => {
    if (address && signers[0]) {
      const updated = [...signers]
      updated[0].address = address
      setSigners(updated)
    }
  }, [address])

  const addOperatorAsSigner = (operator: TeamMember) => {
    // Check if already added
    const alreadyAdded = signers.some((s) => s.email === operator.email)
    if (alreadyAdded) {
      toast.error(`${operator.name} is already added as a signer`)
      return
    }

    const newSigner: Signer = {
      address: operator.walletAddress || "",
      name: operator.name,
      email: operator.email,
      role: operator.role,
      operatorId: operator.email, // Use email as unique ID
    }

    setSigners([...signers, newSigner])
    
    // Auto-adjust threshold
    const newSignerCount = signers.length + 1
    if (threshold === 1 && newSignerCount > 1) {
      setThreshold(2) // Recommend at least 2 signatures
    }
    
    toast.success(`Added ${operator.name} as signer`)
  }

  const addManualSigner = () => {
    setSigners([...signers, { address: "", name: "", role: "Custom Signer" }])
  }

  const removeSigner = (index: number) => {
    if (signers.length > 1 && index > 0) {
      // Can't remove the owner (index 0)
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

  const getUnusedOperators = () => {
    return availableOperators.filter(
      (op) => !signers.some((s) => s.email === op.email)
    )
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

    // Validate all signers have addresses
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

      // Initialize Safe with predicted configuration
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

      // Get the predicted Safe address
      const predictedAddress = await protocolKit.getAddress()
      
      console.log("🔐 Safe Wallet Address:", predictedAddress)
      console.log("📋 Owners:", signers.map(s => s.address))
      console.log("🔢 Threshold:", threshold)
      
      toast.info(`Safe address: ${predictedAddress.slice(0, 10)}... Deploying contract...`)

      // Check if Safe is already deployed
      const isDeployed = await protocolKit.isSafeDeployed()
      
      let finalDeploymentStatus = isDeployed
      
      if (!isDeployed) {
        // Deploy the Safe
        const deploymentTransaction = await protocolKit.createSafeDeploymentTransaction()
        
        toast.info("Deploying Safe contract...")
        
        // Execute deployment transaction using wagmi
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
        
        // Wait for deployment to be confirmed (longer delay for Sepolia)
        await new Promise(resolve => setTimeout(resolve, 15000))
        
        // Verify deployment multiple times
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

      // Save Safe configuration to Zustand store
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
        chainId: chain?.id || 1,
        createdAt: new Date().toISOString(),
        createdBy: address,
        workspaceName: workspaceData?.company.name,
        isDeployed: finalDeploymentStatus, // Only set to true if confirmed deployed
      })

      console.log("💾 Safe config saved to store with isDeployed:", finalDeploymentStatus)

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
      {/* Header */}
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
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-[#0070BA]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-[#0070BA]" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Create Safe Multisig Wallet</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Set up enterprise-grade security for your payroll operations. Multiple signatures
              required for all transactions.
            </p>
            
            {/* Workspace Info Banner */}
            {workspaceData && (
              <div className="mt-6 max-w-md mx-auto">
                <Card className="border-[#0070BA]/50 bg-[#0070BA]/5">
                  <CardContent className="p-4">
                    <div className="text-sm space-y-1">
                      <div className="font-semibold text-[#0070BA]">
                        Workspace: {workspaceData.company.name}
                      </div>
                      <div className="text-muted-foreground">
                        {workspaceData.team.length} operation team member(s) loaded
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {!safeCreated ? (
            <>
              {/* Safe Configuration */}
              <Card className="border-2 mb-8">
                <CardHeader>
                  <CardTitle>Configure Your Safe</CardTitle>
                  <CardDescription>
                    Add your operation team members as signers and set signature threshold
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Owner (Current User) */}
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

                    {/* Additional Signers */}
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

                        {signer.operatorId ? (
                          // Operator from workspace - show info only
                          <div className="space-y-2">
                            <div className="text-sm text-muted-foreground">
                              From workspace operators
                            </div>
                            {signer.email && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Email:</span> {signer.email}
                              </div>
                            )}
                            <div className="space-y-2">
                              <Label className="text-sm">
                                Wallet Address <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                placeholder="0x... (operator needs to provide)"
                                value={signer.address}
                                onChange={(e) =>
                                  updateSigner(index + 1, "address", e.target.value)
                                }
                              />
                            </div>
                          </div>
                        ) : (
                          // Manual signer - full form
                          <>
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
                          </>
                        )}
                      </div>
                    ))}

                    {/* Add Signer Buttons */}
                    <div className="space-y-2">
                      {/* Dropdown for workspace operators */}
                      {availableOperators.length > 0 && getUnusedOperators().length > 0 && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full">
                              <Users className="mr-2 h-4 w-4" />
                              Add Operator as Signer
                              <ChevronDown className="ml-auto h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-full" align="start">
                            {getUnusedOperators().map((operator) => (
                              <DropdownMenuItem
                                key={operator.email}
                                onClick={() => addOperatorAsSigner(operator)}
                              >
                                <div className="flex flex-col">
                                  <div className="font-medium">{operator.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {operator.role} • {operator.email}
                                  </div>
                                </div>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}

                      {/* Manual signer button */}
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={addManualSigner}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Custom Signer
                      </Button>
                    </div>
                  </div>

                  {/* Threshold Configuration */}
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
                        <div
                          className={`p-2 rounded ${
                            threshold === 1
                              ? "bg-orange-100 text-orange-700 border border-orange-300"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          Low Security
                        </div>
                        <div
                          className={`p-2 rounded ${
                            threshold > 1 && threshold < signers.length
                              ? "bg-green-100 text-green-700 border border-green-300"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          Recommended
                        </div>
                        <div
                          className={`p-2 rounded ${
                            threshold === signers.length
                              ? "bg-blue-100 text-blue-700 border border-blue-300"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          Maximum Security
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Information Cards */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-lg">How It Works</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-[#0070BA] flex-shrink-0 mt-0.5" />
                      <div>
                        Safe wallet will be deployed with your configuration
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-[#0070BA] flex-shrink-0 mt-0.5" />
                      <div>
                        All signers will receive notification to join
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-[#0070BA] flex-shrink-0 mt-0.5" />
                      <div>
                        Transactions require {threshold} signature{threshold > 1 ? "s" : ""} to execute
                      </div>
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
                      <div>
                        No single point of failure - shared control
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Shield className="h-5 w-5 text-[#0070BA] flex-shrink-0 mt-0.5" />
                      <div>
                        Transparent audit trail for all transactions
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Shield className="h-5 w-5 text-[#0070BA] flex-shrink-0 mt-0.5" />
                      <div>
                        Battle-tested by thousands of organizations
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Create Safe Button */}
              <div className="flex justify-center">
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
              </div>
            </>
          ) : (
            /* Success State */
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
                    <div className="text-muted-foreground">
                      • Fund your Safe wallet with PYUSD (send to Safe address above)
                    </div>
                    <div className="text-muted-foreground">
                      • Upgrade PYUSD to PYUSDx for streaming (requires {threshold} signatures)
                    </div>
                    <div className="text-muted-foreground">
                      • Add employees and start streaming payroll (each stream requires approval)
                    </div>
                    <div className="text-muted-foreground">
                      • All signers will be notified of pending transactions
                    </div>
                  </div>
                </div>

                <Button
                  size="lg"
                  onClick={handleContinueToDashboard}
                  className="bg-[#0070BA] hover:bg-[#005A94] text-lg h-14 px-12"
                >
                  Activate Safe & Go to Workspace
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

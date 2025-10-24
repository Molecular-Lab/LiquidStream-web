"use client"

import { useState } from "react"
import { Address, formatUnits, parseUnits, encodeFunctionData } from "viem"
import { useAccount, useReadContract, useWriteContract, usePublicClient } from "wagmi"
import { ArrowDownUp, ArrowDown, ArrowUp, Loader2, Shield, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PYUSD_ADDRESS, PYUSDX_ADDRESS, SUPER_TOKEN_ABI } from "@/lib/contract"
import { useSafeConfig } from "@/store/safe"
import { useSafeTokenOperations } from "@/hooks/use-safe-operations"
import { parseAbi } from "viem"

const PYUSD_ABI = parseAbi([
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
])

export function UpgradeDowngradeCard() {
  const { address } = useAccount()
  const [mode, setMode] = useState<"upgrade" | "downgrade">("upgrade")
  const [amount, setAmount] = useState("")
  const [isApproving, setIsApproving] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const { writeContractAsync } = useWriteContract()
  const publicClient = usePublicClient()
  const { safeConfig, isSigner } = useSafeConfig()
  const { mutate: createSafeTokenTransaction, isPending: isSafeOperationPending } = useSafeTokenOperations()

  const isSafeConfigured = !!safeConfig?.address
  const isUserSigner = address ? isSigner(address) : false

  // Use Safe address or connected wallet address for balance queries
  const queryAddress = safeConfig?.address || address

  // Read PYUSD balance (from Safe or connected wallet)
  const { data: pyusdBalance } = useReadContract({
    address: PYUSD_ADDRESS,
    abi: PYUSD_ABI,
    functionName: "balanceOf",
    args: queryAddress ? [queryAddress] : undefined,
  })

  // Read PYUSDx balance (from Safe or connected wallet)
  const { data: pyusdxBalance } = useReadContract({
    address: PYUSDX_ADDRESS,
    abi: SUPER_TOKEN_ABI,
    functionName: "balanceOf",
    args: queryAddress ? [queryAddress] : undefined,
  })

  // Read PYUSD allowance (from Safe or connected wallet)
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: PYUSD_ADDRESS,
    abi: PYUSD_ABI,
    functionName: "allowance",
    args: queryAddress ? [queryAddress, PYUSDX_ADDRESS] : undefined,
  })

  const handleUpgrade = async () => {
    if (!address || !amount || !publicClient) return

    try {
      setIsProcessing(true)
      const amountInUnits = parseUnits(amount, 6) // PYUSD has 6 decimals

      if (isSafeConfigured) {
        // Safe multisig workflow
        if (!isUserSigner) {
          toast.error("You are not authorized to create transactions for this Safe")
          return
        }

        // Check if we need approval first
        if (!allowance || allowance < amountInUnits) {
          // Create approval transaction proposal
          createSafeTokenTransaction({
            operation: "approve",
            tokenAddress: PYUSD_ADDRESS,
            amount: amountInUnits,
            tokenSymbol: "PYUSD",
            spenderAddress: PYUSDX_ADDRESS,
            tokenAbi: PYUSD_ABI,
          })

          toast.success("Approval transaction proposal created", {
            description: `Requires ${safeConfig.threshold}/${safeConfig.signers.length} signatures`,
          })
        }

        // Create upgrade transaction proposal
        const upgradeAmount = amountInUnits * BigInt(10 ** 12) // Convert 6 to 18 decimals

        console.log("Creating Safe upgrade transaction:", {
          operation: "upgrade",
          tokenAddress: PYUSDX_ADDRESS,
          amount: upgradeAmount.toString(),
          tokenSymbol: "PYUSD",
          originalAmount: amount,
          amountInUnits: amountInUnits.toString()
        })

        createSafeTokenTransaction({
          operation: "upgrade",
          tokenAddress: PYUSDX_ADDRESS,
          amount: upgradeAmount,
          tokenSymbol: "PYUSD",
        })

      } else {
        // Direct wallet workflow (fallback)
        // Check if we need approval
        if (!allowance || allowance < amountInUnits) {
          toast.info("Step 1/2: Approving PYUSD...")
          setIsApproving(true)

          const approveTx = await writeContractAsync({
            address: PYUSD_ADDRESS,
            abi: PYUSD_ABI,
            functionName: "approve",
            args: [PYUSDX_ADDRESS, amountInUnits],
          } as any)

          toast.info("Waiting for approval confirmation...")

          const receipt = await publicClient.waitForTransactionReceipt({
            hash: approveTx,
            confirmations: 1,
          })

          if (receipt.status === 'success') {
            toast.success("Approval confirmed! ✅")
            await refetchAllowance()
            await new Promise(resolve => setTimeout(resolve, 1000))
          } else {
            throw new Error("Approval transaction failed")
          }

          setIsApproving(false)
        }

        // Convert 6 decimal to 18 decimal for upgrade
        const upgradeAmount = amountInUnits * BigInt(10 ** 12)

        toast.info("Step 2/2: Upgrading PYUSD to PYUSDx...")

        const upgradeTx = await writeContractAsync({
          address: PYUSDX_ADDRESS,
          abi: SUPER_TOKEN_ABI,
          functionName: "upgrade",
          args: [upgradeAmount],
        } as any)

        toast.info("Waiting for upgrade confirmation...")

        const upgradeReceipt = await publicClient.waitForTransactionReceipt({
          hash: upgradeTx,
          confirmations: 1,
        })

        if (upgradeReceipt.status === 'success') {
          toast.success("Upgrade successful! 🎉", {
            description: `Wrapped ${amount} PYUSD to PYUSDx`,
          })
        } else {
          throw new Error("Upgrade transaction failed")
        }
      }

      setAmount("")
    } catch (error: any) {
      console.error("Upgrade error:", error)
      toast.error("Upgrade failed", {
        description: error.shortMessage || error.message || "Please try again",
      })
    } finally {
      setIsApproving(false)
      setIsProcessing(false)
    }
  }

  const handleDowngrade = async () => {
    if (!address || !amount) return

    try {
      setIsProcessing(true)
      const amountInUnits = parseUnits(amount, 18) // PYUSDx has 18 decimals

      if (isSafeConfigured) {
        // Safe multisig workflow
        if (!isUserSigner) {
          toast.error("You are not authorized to create transactions for this Safe")
          return
        }

        // Create downgrade transaction proposal
        createSafeTokenTransaction({
          operation: "downgrade",
          tokenAddress: PYUSDX_ADDRESS,
          amount: amountInUnits,
          tokenSymbol: "PYUSDx",
        })

        console.log("Safe downgrade transaction created:", {
          operation: "downgrade",
          tokenAddress: PYUSDX_ADDRESS,
          amount: amountInUnits.toString(),
          tokenSymbol: "PYUSDx"
        })

      } else {
        // Direct wallet workflow (fallback)
        toast.info("Downgrading PYUSDx to PYUSD...")

        const downgradeTx = await writeContractAsync({
          address: PYUSDX_ADDRESS,
          abi: SUPER_TOKEN_ABI,
          functionName: "downgrade",
          args: [amountInUnits],
        } as any)

        toast.success("Downgrade successful! 🎉", {
          description: `Unwrapped ${amount} PYUSDx to PYUSD`,
        })
      }

      setAmount("")
    } catch (error: any) {
      console.error("Downgrade error:", error)
      toast.error("Downgrade failed", {
        description: error.message || "Please try again",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleMaxClick = () => {
    if (mode === "upgrade" && pyusdBalance) {
      setAmount(formatUnits(pyusdBalance as bigint, 6))
    } else if (mode === "downgrade" && pyusdxBalance) {
      setAmount(formatUnits(pyusdxBalance as bigint, 18))
    }
  }

  const toggleMode = () => {
    setMode(mode === "upgrade" ? "downgrade" : "upgrade")
    setAmount("")
  }

  const isUpgradeMode = mode === "upgrade"
  const formattedPyusdBalance = pyusdBalance ? formatUnits(pyusdBalance as bigint, 6) : "0"
  const formattedPyusdxBalance = pyusdxBalance ? formatUnits(pyusdxBalance as bigint, 18) : "0"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowDownUp className="h-5 w-5" />
          Swap Tokens
          {isSafeConfigured ? (
            <Badge variant="secondary" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              Safe Protected
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Direct Wallet
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {isSafeConfigured
            ? `Create proposals to upgrade PYUSD to PYUSDx (wrap) or downgrade PYUSDx to PYUSD (unwrap) - requires ${safeConfig.threshold}/${safeConfig.signers.length} signatures`
            : "Upgrade PYUSD to PYUSDx (wrap) or downgrade PYUSDx to PYUSD (unwrap)"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Safe Info Banner */}
        {isSafeConfigured && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-medium text-blue-900 dark:text-blue-100 text-sm">
                  Safe Multisig Operations
                </div>
                <div className="text-blue-800 dark:text-blue-200 text-xs">
                  Token operations will create transaction proposals requiring {safeConfig.threshold} out of {safeConfig.signers.length} signatures.
                  Balances shown are from Safe wallet: {safeConfig.address.slice(0, 10)}...{safeConfig.address.slice(-6)}
                </div>
              </div>
            </div>
          </div>
        )}
        {/* From Token */}
        <div className="space-y-2">
          <Label>From</Label>
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {isUpgradeMode ? "PYUSD" : "PYUSDx"}
              </span>
              <span className="text-sm text-muted-foreground">
                Balance: {isUpgradeMode ? formattedPyusdBalance : formattedPyusdxBalance}
              </span>
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-2xl h-12"
              />
              <Button
                variant="outline"
                onClick={handleMaxClick}
                className="shrink-0"
              >
                MAX
              </Button>
            </div>
          </div>
        </div>

        {/* Swap Direction Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleMode}
            className="rounded-full h-10 w-10"
          >
            {isUpgradeMode ? (
              <ArrowDown className="h-4 w-4" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* To Token */}
        <div className="space-y-2">
          <Label>To</Label>
          <div className="rounded-lg border p-4 space-y-3 bg-muted/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {isUpgradeMode ? "PYUSDx" : "PYUSD"}
              </span>
              <span className="text-sm text-muted-foreground">
                Balance: {isUpgradeMode ? formattedPyusdxBalance : formattedPyusdBalance}
              </span>
            </div>
            <div className="text-2xl h-12 flex items-center">
              {amount || "0.0"}
            </div>
          </div>
        </div>

        <Separator />

        {/* Info */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Exchange Rate</span>
            <span>1:1</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Type</span>
            <span>{isUpgradeMode ? "Upgrade (Wrap)" : "Downgrade (Unwrap)"}</span>
          </div>
        </div>

        {/* Action Button */}
        <Button
          className="w-full"
          size="lg"
          onClick={isUpgradeMode ? handleUpgrade : handleDowngrade}
          disabled={!address || !amount || parseFloat(amount) <= 0 || isApproving || isProcessing || (isSafeConfigured && !isUserSigner)}
        >
          {isApproving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Approving...
            </>
          ) : isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isSafeConfigured ? "Creating Proposal..." : "Processing..."}
            </>
          ) : isSafeConfigured ? (
            isUpgradeMode ? "Propose Upgrade to PYUSDx" : "Propose Downgrade to PYUSD"
          ) : (
            isUpgradeMode ? "Upgrade to PYUSDx" : "Downgrade to PYUSD"
          )}
        </Button>

        {/* Authorization Warning for Safe */}
        {isSafeConfigured && !isUserSigner && (
          <div className="text-xs text-orange-600 bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
            ⚠️ You are not authorized to create transactions for this Safe wallet. Only configured signers can propose token operations.
          </div>
        )}

        {/* Info Warning */}
        {isUpgradeMode && (
          <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            💡 {isSafeConfigured
              ? "Upgrading will create a proposal to wrap your PYUSD into PYUSDx SuperToken, enabling real-time streaming capabilities after approval."
              : "Upgrading wraps your PYUSD into PYUSDx SuperToken, which enables real-time streaming capabilities."
            }
          </div>
        )}
      </CardContent>
    </Card>
  )
}

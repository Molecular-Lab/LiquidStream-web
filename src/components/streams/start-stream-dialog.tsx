"use client"

import { useState, useMemo, useCallback } from "react"
import { CoinsIcon, Shield, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { parseUnits } from "viem"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { currencies, CurrencyKey } from "@/config/currency"
import { useCreateStream } from "@/hooks/use-streams"
import { useSingleWalletCreateStream } from "@/hooks/use-single-wallet-streams"
import { calculateFlowRate } from "@/lib/contract"
import { Employee } from "@/store/employees"
import { useSafe } from "@/store/safe"

type StreamFrequency = "daily" | "weekly" | "monthly" | "annual"

interface StartStreamDialogProps {
  employee: Employee | null
  open: boolean
  onClose: () => void
  forceSingleWallet?: boolean
  onStreamCreated?: (data: { flowRate: bigint; tokenSymbol: string; txHash: string }) => void
}

export function StartStreamDialog({
  employee,
  open,
  onClose,
  forceSingleWallet = false,
  onStreamCreated,
}: StartStreamDialogProps) {
  const [selectedToken, setSelectedToken] = useState<CurrencyKey>("pyusdx")
  const [frequency, setFrequency] = useState<StreamFrequency>("monthly")
  const [customAmount, setCustomAmount] = useState<string>("")

  // Use appropriate hook based on Safe configuration or forced mode
  const { mutate: createStreamMultisig, isPending: isPendingMultisig } = useCreateStream()
  const { mutate: createStreamSingle, isPending: isPendingSingle } = useSingleWalletCreateStream()
  const { safeConfig } = useSafe()

  // Determine wallet mode - force single wallet overrides Safe configuration
  const isSafeConfigured = !!safeConfig?.address && !forceSingleWallet
  const isPending = isSafeConfigured ? isPendingMultisig : isPendingSingle

  // Choose the appropriate create function
  const createStream = isSafeConfigured ? createStreamMultisig : createStreamSingle

  // Calculate flow rate based on frequency - memoize to prevent recalculation
  // Use optional chaining to handle null employee safely
  const calculateFlowRateByFrequency = useCallback((): bigint => {
    if (!employee) return BigInt(0)
    
    let annualAmount: number

    if (frequency === "annual") {
      annualAmount = Number(employee.salary)
    } else {
      // Use custom amount for daily, weekly, monthly
      const amount = customAmount ? Number(customAmount) : 0

      switch (frequency) {
        case "daily":
          annualAmount = amount * 365.25
          break
        case "weekly":
          annualAmount = amount * 52.18 // 365.25 / 7
          break
        case "monthly":
          annualAmount = amount * 12
          break
        default:
          annualAmount = 0
      }
    }

    return calculateFlowRate(annualAmount)
  }, [frequency, customAmount, employee])

  // Memoize the flow rate calculation
  const flowRate = useMemo(() => calculateFlowRateByFrequency(), [calculateFlowRateByFrequency])

  // Calculate display amounts - memoize to prevent recalculation
  const amounts = useMemo(() => {
    if (!employee) {
      return {
        annual: 0,
        monthly: 0,
        weekly: 0,
        daily: 0,
      }
    }
    
    if (frequency === "annual") {
      const annual = Number(employee.salary)
      return {
        annual,
        monthly: annual / 12,
        weekly: annual / 52.18,
        daily: annual / 365.25,
      }
    } else {
      const amount = customAmount ? Number(customAmount) : 0
      let annual = 0

      switch (frequency) {
        case "daily":
          annual = amount * 365.25
          break
        case "weekly":
          annual = amount * 52.18
          break
        case "monthly":
          annual = amount * 12
          break
      }

      return {
        annual,
        monthly: annual / 12,
        weekly: annual / 52.18,
        daily: annual / 365.25,
      }
    }
  }, [frequency, customAmount, employee])

  const handleStartStream = useCallback(() => {
    if (!employee) return
    
    const token = currencies[selectedToken]

    if (!customAmount || Number(customAmount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    createStream(
      {
        token: token.address,
        receiver: employee.walletAddress,
        flowRate,
        employeeId: employee.id,
        employeeName: employee.name,
        tokenSymbol: token.symbol,
      },
      {
        onSuccess: (txHash) => {
          // Handle both string hash (direct wallet) and Safe Apps SDK response
          const hashString = typeof txHash === 'string' ? txHash :
            (typeof txHash === 'object' && 'safeTxHash' in txHash) ? txHash.safeTxHash : ""

          // Reset form
          setCustomAmount("")
          
          // Call the callback to notify parent
          if (onStreamCreated) {
            onStreamCreated({
              flowRate,
              tokenSymbol: token.symbol,
              txHash: hashString,
            })
          }
          
          // Force close dialog immediately
          onClose()
        },
        onError: (error) => {
          // Error toast already shown by mutation
          console.error("Stream creation error:", error)
        }
      }
    )
  }, [selectedToken, customAmount, flowRate, employee, createStream, onStreamCreated, onClose])

  // Early return after all hooks are called to comply with Rules of Hooks
  if (!employee) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="min-w-[700px]">
          {/* Loading Overlay - covers the entire dialog during transaction */}
          {isPending && (
            <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-[100] flex items-center justify-center rounded-lg">
              <div className="text-center space-y-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm font-medium">Processing transaction...</p>
                <p className="text-xs text-muted-foreground">Please confirm in your wallet</p>
              </div>
            </div>
          )}
          
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              {isSafeConfigured ? "Propose Payment Stream" : "Start Payment Stream"}
              {isSafeConfigured ? (
                <Badge variant="secondary" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Safe Multisig
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Direct Wallet
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription className="text-base">
              {isSafeConfigured
                ? `Create a proposal to stream payments to ${employee.name} (requires ${safeConfig?.threshold}/${safeConfig?.signers.length} signatures)`
                : `Stream payments to ${employee.name}`
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Safe Info Banner */}
            {isSafeConfigured && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-medium text-blue-900 dark:text-blue-100 text-sm">
                      Safe Multisig Transaction
                    </div>
                    <div className="text-blue-800 dark:text-blue-200 text-xs">
                      This will create a transaction proposal requiring {safeConfig.threshold} out of {safeConfig.signers.length} signatures before execution.
                      Other signers will be notified to review and approve this stream.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Receiver Wallet Address */}
            <div className="space-y-2">
              <label className="text-base font-medium">Receiver Wallet Address</label>
              <div className="relative">
                <Input
                  value={employee.walletAddress}
                  readOnly
                  className="h-14 text-base pl-10 bg-muted/50 font-mono"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2">
                  🔍
                </span>
              </div>
            </div>

            {/* Super Token and Flow Rate */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-base font-medium">Super Token</label>
                <Select value={selectedToken} onValueChange={(val) => setSelectedToken(val as CurrencyKey)}>
                  <SelectTrigger className="h-14 text-base">
                    <SelectValue placeholder="Select a token" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies["pyusdx"] && (
                      <SelectItem key={currencies["pyusdx"].key} value={currencies["pyusdx"].key}>
                        <div className="flex items-center gap-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={"/paypal-usd-pyusd-logo.png"}
                            className="h-5 w-5 rounded-full"
                            alt="PYUSDx token logo"
                          />
                          {currencies["pyusdx"].symbol}
                        </div>
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-base font-medium">Flow Rate</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="h-14 text-base flex-1"
                    min="0"
                    step="0.01"
                  />
                  <Select value={frequency} onValueChange={(val) => setFrequency(val as StreamFrequency)}>
                    <SelectTrigger className="h-14 w-[140px] text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">/ day</SelectItem>
                      <SelectItem value="weekly">/ week</SelectItem>
                      <SelectItem value="monthly">/ month</SelectItem>
                      <SelectItem value="annual">/ year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Summary Card */}
            {customAmount && Number(customAmount) > 0 && (
              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="text-sm text-muted-foreground mb-2">Stream Summary</div>
                <div className="grid grid-cols-4 gap-3 text-sm">
                  <div>
                    <div className="text-muted-foreground">Daily</div>
                    <div className="font-medium">${amounts.daily.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Weekly</div>
                    <div className="font-medium">${amounts.weekly.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Monthly</div>
                    <div className="font-medium">${amounts.monthly.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Yearly</div>
                    <div className="font-medium">${amounts.annual.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            )}

          </div>

          <DialogFooter className="pt-2">
            <Button
              onClick={handleStartStream}
              disabled={isPending || !customAmount || Number(customAmount) <= 0}
              className="w-full h-14 text-base"
              size="lg"
            >
              {isPending
                ? (isSafeConfigured ? "Creating Proposal..." : "Sending Stream...")
                : (isSafeConfigured ? "Create Stream Proposal" : "Send Stream")
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  )
}

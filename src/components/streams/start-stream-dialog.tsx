"use client"

import { useState } from "react"
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
import { useSafeConfig } from "@/store/safe"
import { StreamingStatusDialog } from "./streaming-status-dialog"

type StreamFrequency = "daily" | "weekly" | "monthly" | "annual"

interface StartStreamDialogProps {
  employee: Employee | null
  open: boolean
  onClose: () => void
}

export function StartStreamDialog({
  employee,
  open,
  onClose,
}: StartStreamDialogProps) {
  const [selectedToken, setSelectedToken] = useState<CurrencyKey>("pyusdx")
  const [frequency, setFrequency] = useState<StreamFrequency>("monthly")
  const [customAmount, setCustomAmount] = useState<string>("")
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [streamDetails, setStreamDetails] = useState<{
    flowRate: bigint
    tokenSymbol: string
    txHash: string
  } | null>(null)

  // Use appropriate hook based on Safe configuration
  const { mutate: createStreamMultisig, isPending: isPendingMultisig } = useCreateStream()
  const { mutate: createStreamSingle, isPending: isPendingSingle } = useSingleWalletCreateStream()
  const { safeConfig } = useSafeConfig()

  const isSafeConfigured = !!safeConfig?.address
  const isPending = isSafeConfigured ? isPendingMultisig : isPendingSingle

  // Choose the appropriate create function
  const createStream = isSafeConfigured ? createStreamMultisig : createStreamSingle

  if (!employee) return null

  // Calculate flow rate based on frequency
  const calculateFlowRateByFrequency = (): bigint => {
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
  }

  const handleStartStream = () => {
    const token = currencies[selectedToken]

    if (!customAmount || Number(customAmount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    const flowRate = calculateFlowRateByFrequency()

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
          // Store stream details and show status dialog
          // Handle both string hash (direct wallet) and Safe Apps SDK response
          const hashString = typeof txHash === 'string' ? txHash :
            (typeof txHash === 'object' && 'safeTxHash' in txHash) ? txHash.safeTxHash : ""

          setStreamDetails({
            flowRate,
            tokenSymbol: token.symbol,
            txHash: hashString,
          })
          onClose() // Close start stream dialog
          setShowStatusDialog(true) // Open status dialog
        },
      }
    )
  }

  const handleCloseStatusDialog = () => {
    setShowStatusDialog(false)
    setStreamDetails(null)
    setCustomAmount("")
  }

  const flowRate = calculateFlowRateByFrequency()

  // Calculate display amounts
  const getDisplayAmounts = () => {
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
  }

  const amounts = getDisplayAmounts()

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="min-w-[700px]">
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
                ? `Create a proposal to stream payments to ${employee.name} (requires ${safeConfig.threshold}/${safeConfig.signers.length} signatures)`
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

      {/* Streaming Status Dialog */}
      {streamDetails && (
        <StreamingStatusDialog
          employee={employee}
          flowRate={streamDetails.flowRate}
          tokenSymbol={streamDetails.tokenSymbol}
          transactionHash={streamDetails.txHash}
          open={showStatusDialog}
          onClose={handleCloseStatusDialog}
        />
      )}
    </>
  )
}

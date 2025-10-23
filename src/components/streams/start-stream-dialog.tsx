"use client"

import { useState } from "react"
import { CoinsIcon } from "lucide-react"
import { toast } from "sonner"
import { parseUnits } from "viem"

import { Button } from "@/components/ui/button"
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
import { calculateFlowRate } from "@/lib/contract"
import { Employee } from "@/store/employees"
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
  const { mutate: createStream, isPending } = useCreateStream()

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
          setStreamDetails({
            flowRate,
            tokenSymbol: token.symbol,
            txHash: txHash || "",
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
          <DialogTitle className="text-2xl">Start Payment Stream</DialogTitle>
          <DialogDescription className="text-base">
            Stream payments to {employee.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
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
            {isPending ? "Sending Stream..." : "Send Stream"}
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

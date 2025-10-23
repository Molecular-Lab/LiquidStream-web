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
import { currencies, CurrencyKey } from "@/config/currency"
import { useCreateStream } from "@/hooks/use-streams"
import { calculateFlowRate } from "@/lib/contract"
import { Employee } from "@/store/employees"

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
  const { mutate: createStream, isPending } = useCreateStream()

  if (!employee) return null

  const handleStartStream = () => {
    const token = currencies[selectedToken]
    const flowRate = calculateFlowRate(Number(employee.salary))

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
        onSuccess: () => {
          onClose()
        },
      }
    )
  }

  const monthlyAmount = Number(employee.salary) / 12
  const flowRate = calculateFlowRate(Number(employee.salary))

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start Payment Stream</DialogTitle>
          <DialogDescription>
            Configure and start a payment stream for {employee.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Employee</label>
            <div className="rounded-md border p-3">
              <div className="font-medium">{employee.name}</div>
              <div className="text-sm text-muted-foreground">
                {employee.email}
              </div>
              <div className="mt-1 text-xs text-muted-foreground font-mono">
                {employee.walletAddress.slice(0, 6)}...
                {employee.walletAddress.slice(-4)}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Payment Token</label>
            <Select value={selectedToken} onValueChange={(val) => setSelectedToken(val as CurrencyKey)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(currencies).map((currency) => (
                  <SelectItem key={currency.key} value={currency.key}>
                    <div className="flex items-center gap-2">
                      <img
                        src={currency.icon}
                        alt={currency.symbol}
                        className="h-5 w-5 rounded-full"
                      />
                      {currency.name} ({currency.symbol})
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Powered by PayPal USD - a trusted stablecoin
            </p>
          </div>

          <div className="space-y-2 rounded-md border bg-muted/50 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CoinsIcon className="h-4 w-4" />
              Stream Details
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Annual Salary:</span>
                <span className="font-medium">
                  ${Number(employee.salary).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly (~):</span>
                <span className="font-medium">
                  ${monthlyAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Flow Rate:</span>
                <span className="font-mono text-xs">
                  {flowRate.toString()} wei/sec
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-yellow-500/50 bg-yellow-500/10 p-3 text-sm text-yellow-600 dark:text-yellow-400">
            <strong>Note:</strong> Make sure you have sufficient balance and
            deposit buffer in your wallet to maintain the stream.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleStartStream} disabled={isPending}>
            {isPending ? "Starting..." : "Start Stream"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

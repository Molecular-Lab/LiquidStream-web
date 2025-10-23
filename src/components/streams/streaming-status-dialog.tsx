"use client"

import { useEffect, useState } from "react"
import { CoinsIcon, TrendingUpIcon, CalendarIcon, ClockIcon, CheckCircle2Icon } from "lucide-react"
import { formatEther } from "viem"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Employee } from "@/store/employees"
import { flowRateToAnnualSalary } from "@/lib/contract"

interface StreamingStatusDialogProps {
  employee: Employee | null
  flowRate: bigint
  tokenSymbol: string
  transactionHash: string
  open: boolean
  onClose: () => void
}

export function StreamingStatusDialog({
  employee,
  flowRate,
  tokenSymbol,
  transactionHash,
  open,
  onClose,
}: StreamingStatusDialogProps) {
  const [elapsedTime, setElapsedTime] = useState(0)
  const [streamedAmount, setStreamedAmount] = useState(0)

  useEffect(() => {
    if (!open) {
      setElapsedTime(0)
      setStreamedAmount(0)
      return
    }

    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      setElapsedTime(elapsed)
      
      // Calculate streamed amount: flowRate (wei/sec) * elapsed seconds
      const streamed = Number(flowRate) * elapsed / 1e18
      setStreamedAmount(streamed)
    }, 100) // Update every 100ms for smooth animation

    return () => clearInterval(interval)
  }, [open, flowRate])

  if (!employee) return null

  const secondsPerDay = 86400
  const secondsPerMonth = 2592000 // 30 days
  const secondsPerYear = 31557600 // 365.25 days

  const flowRateNumber = Number(flowRate)
  const perSecond = flowRateNumber / 1e18
  const perDay = (flowRateNumber * secondsPerDay) / 1e18
  const perMonth = (flowRateNumber * secondsPerMonth) / 1e18
  const perYear = (flowRateNumber * secondsPerYear) / 1e18

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`
    if (mins > 0) return `${mins}m ${secs}s`
    return `${secs}s`
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[65vw]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2Icon className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Stream Active!</DialogTitle>
              <DialogDescription className="text-base">
                Money is now streaming continuously to {employee.name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Live Streaming Counter */}
          <div className="rounded-lg border-2 border-green-500/20 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  STREAMING NOW
                </span>
              </div>
              <Badge variant="secondary" className="font-mono">
                {formatTime(elapsedTime)} elapsed
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Total Streamed</div>
              <div className="text-5xl font-bold text-green-600 dark:text-green-400 font-mono">
                ${streamedAmount.toFixed(8)}
              </div>
              <div className="text-sm text-muted-foreground">
                {tokenSymbol} • Real-time balance updates
              </div>
            </div>
          </div>

          {/* Stream Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Recipient */}
            <div className="col-span-2 rounded-lg border bg-muted/30 p-4">
              <div className="text-sm text-muted-foreground mb-2">Streaming To</div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-lg">{employee.name}</div>
                  <div className="text-sm text-muted-foreground">{employee.email}</div>
                </div>
                <div className="text-xs font-mono bg-background px-3 py-1.5 rounded-md">
                  {employee.walletAddress.slice(0, 10)}...{employee.walletAddress.slice(-8)}
                </div>
              </div>
            </div>

            {/* Flow Rates */}
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center gap-2 mb-3">
                <ClockIcon className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm font-medium">Per Second</div>
              </div>
              <div className="text-2xl font-bold">${perSecond.toFixed(8)}</div>
              <div className="text-xs text-muted-foreground mt-1">Continuous flow</div>
            </div>

            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm font-medium">Per Day</div>
              </div>
              <div className="text-2xl font-bold">${perDay.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground mt-1">Daily equivalent</div>
            </div>

            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center gap-2 mb-3">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm font-medium">Per Month</div>
              </div>
              <div className="text-2xl font-bold">${perMonth.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground mt-1">Monthly equivalent</div>
            </div>

            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center gap-2 mb-3">
                <CoinsIcon className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm font-medium">Per Year</div>
              </div>
              <div className="text-2xl font-bold">${perYear.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground mt-1">Annual equivalent</div>
            </div>
          </div>

          {/* Transaction Info */}
          <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/20 p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">ℹ️</div>
              <div className="flex-1">
                <div className="font-semibold text-sm mb-2">How It Works</div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>💰 No more transactions needed - balance updates automatically every second</li>
                  <li>⚡ Powered by Superfluid Protocol - gasless continuous streaming</li>
                  <li>🔒 Stream will continue until manually stopped or balance depleted</li>
                </ul>
                <div className="mt-3 pt-3 border-t">
                  <div className="text-xs text-muted-foreground mb-1">Transaction Hash</div>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {transactionHash}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="rounded-lg border-2 border-green-500/20 bg-green-500/5 p-4 text-center">
            <div className="text-lg font-semibold text-green-700 dark:text-green-400 mb-1">
              🎉 Stream Created Successfully!
            </div>
            <div className="text-sm text-muted-foreground">
              Money is flowing continuously. The receiver can withdraw anytime.
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full" size="lg">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

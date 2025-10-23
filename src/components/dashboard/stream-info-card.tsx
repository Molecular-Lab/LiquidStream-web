"use client"

import { Address, formatEther } from "viem"
import { useAccount } from "wagmi"
import { Copy, ExternalLink } from "lucide-react"
import { toast } from "sonner"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useStreamInfo, formatFlowRate } from "@/hooks/use-stream-info"
import { PYUSDX_ADDRESS } from "@/lib/contract"
import { cn } from "@/lib/utils"

interface StreamInfoCardProps {
  sender?: Address
  receiver: Address
  token?: Address
  className?: string
}

export function StreamInfoCard({ sender, receiver, token = PYUSDX_ADDRESS, className }: StreamInfoCardProps) {
  const { address } = useAccount()
  const effectiveSender = sender || address
  const { streamInfo, loading, error } = useStreamInfo(token, effectiveSender, receiver)

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  const openEtherscan = (address: string) => {
    window.open(`https://sepolia.etherscan.io/address/${address}`, "_blank")
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6 text-center text-muted-foreground">
          <div className="animate-pulse">Loading stream information...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn("border-red-500", className)}>
        <CardContent className="pt-6 text-center text-red-600">
          Error loading stream: {error}
        </CardContent>
      </Card>
    )
  }

  if (!streamInfo || !streamInfo.isActive) {
    return (
      <Card className={className}>
        <CardContent className="pt-6 text-center text-muted-foreground">
          No active stream found between these addresses.
        </CardContent>
      </Card>
    )
  }

  const flowRates = formatFlowRate(streamInfo.flowRate)
  const startDate = new Date(Number(streamInfo.timestamp) * 1000)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Stream Details</span>
          <span className="text-sm font-normal text-green-600 dark:text-green-400">
            ● Active
          </span>
        </CardTitle>
        <CardDescription>Real-time payment stream information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Addresses */}
        <div className="space-y-3">
          <div>
            <div className="text-xs text-muted-foreground mb-1">From (Sender)</div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm bg-muted px-3 py-2 rounded font-mono">
                {effectiveSender}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(effectiveSender!, "Sender address")}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openEtherscan(effectiveSender!)}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-1">To (Receiver)</div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm bg-muted px-3 py-2 rounded font-mono">
                {receiver}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(receiver, "Receiver address")}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openEtherscan(receiver)}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        {/* Flow Rates */}
        <div>
          <div className="text-sm font-medium mb-3">Flow Rate</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Per Second</div>
              <div className="text-lg font-semibold tabular-nums">{flowRates.perSecond}</div>
              <div className="text-xs text-muted-foreground">PYUSDx</div>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Per Day</div>
              <div className="text-lg font-semibold tabular-nums">{flowRates.perDay}</div>
              <div className="text-xs text-muted-foreground">PYUSDx</div>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Per Month</div>
              <div className="text-lg font-semibold tabular-nums text-green-600 dark:text-green-400">
                {flowRates.perMonth}
              </div>
              <div className="text-xs text-muted-foreground">PYUSDx</div>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Per Year</div>
              <div className="text-lg font-semibold tabular-nums">{flowRates.perYear}</div>
              <div className="text-xs text-muted-foreground">PYUSDx</div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Deposit Info */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Flow Rate (raw):</span>
            <span className="text-sm font-mono">{streamInfo.flowRate.toString()} wei/sec</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Deposit:</span>
            <span className="text-sm font-medium tabular-nums">
              {formatEther(streamInfo.deposit)} PYUSDx
            </span>
          </div>
          {streamInfo.owedDeposit > BigInt(0) && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Owed Deposit:</span>
              <span className="text-sm font-medium tabular-nums text-orange-600">
                {formatEther(streamInfo.owedDeposit)} PYUSDx
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Started:</span>
            <span className="text-sm">
              {startDate.toLocaleDateString()} at {startDate.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

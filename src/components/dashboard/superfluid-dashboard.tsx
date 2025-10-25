"use client"

import { useEffect, useState } from "react"
import { Address, formatEther } from "viem"
import { useAccount } from "wagmi"
import { Activity, ArrowDownIcon, ArrowUpIcon, TrendingDown, TrendingUp, Shield, AlertTriangle } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRealtimeBalance, useIncomingStreams, formatFlowRate } from "@/hooks/use-stream-info"
import { PYUSDX_ADDRESS } from "@/lib/contract"
import { useStreamStore } from "@/store/streams"
import { useSafeConfig } from "@/store/safe"
import { Separator } from "@/components/ui/separator"

export function SuperfluidDashboard() {
  const { address } = useAccount()
  const { safeConfig } = useSafeConfig()

  // Use Safe address if configured, otherwise use connected wallet
  const activeAddress = safeConfig?.address || address
  const isSafeConfigured = !!safeConfig?.address

  const { balance, loading: balanceLoading } = useRealtimeBalance(PYUSDX_ADDRESS, activeAddress)
  const { netFlowRate, loading: flowLoading } = useIncomingStreams(PYUSDX_ADDRESS, activeAddress)
  const streams = useStreamStore((state) => state.streams)
  const [currentBalance, setCurrentBalance] = useState("0")

  const activeStreamsOut = streams.filter((s) => s.status === "active").length
  const totalStreams = streams.length

  // Calculate flow rates
  const flowRates = netFlowRate ? formatFlowRate(netFlowRate) : null
  const isStreamingOut = netFlowRate < BigInt(0)
  const isStreamingIn = netFlowRate > BigInt(0)

  // Format balance with reasonable decimals
  const formattedBalance = balance
    ? parseFloat(formatEther(balance.availableBalance)).toFixed(4)
    : "0.0000"

  const formattedDeposit = balance
    ? parseFloat(formatEther(balance.deposit)).toFixed(4)
    : "0.0000"

  // Calculate monthly and annual burn/income
  const monthlyFlow = flowRates
    ? parseFloat(flowRates.perMonth).toFixed(2)
    : "0.00"

  const annualFlow = flowRates
    ? parseFloat(flowRates.perYear).toFixed(2)
    : "0.00"

  const perDayFlow = flowRates
    ? parseFloat(flowRates.perDay).toFixed(4)
    : "0.0000"

  const perSecondFlow = flowRates
    ? parseFloat(flowRates.perSecond).toFixed(10)
    : "0.0000000000"

  // Real-time balance update simulation
  useEffect(() => {
    if (!balance) return

    const startBalance = balance.availableBalance
    const startTime = Date.now()

    // Set initial balance
    setCurrentBalance(parseFloat(formatEther(startBalance)).toFixed(6))

    // If no flow rate, just show static balance
    if (!netFlowRate || netFlowRate === BigInt(0)) {
      return
    }

    // Update balance in real-time if streaming
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000 // seconds
      const flowAmount = netFlowRate * BigInt(Math.floor(elapsed))
      const newBalance = startBalance + flowAmount

      setCurrentBalance(parseFloat(formatEther(newBalance)).toFixed(6))
    }, 100) // Update every 100ms

    return () => clearInterval(interval)
  }, [balance, netFlowRate])

  return (
    <div className="space-y-6">
      {/* Top Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Balance Card */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              Balance
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
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <div className="text-3xl font-bold tabular-nums">
                  {balanceLoading ? "..." : currentBalance || formattedBalance}
                </div>
                <div className="text-sm text-muted-foreground">PYUSDx</div>
                {isSafeConfigured && (
                  <div className="text-xs text-muted-foreground mt-1 font-mono">
                    {safeConfig.address?.slice(0, 10)}...{safeConfig.address?.slice(-6)}
                  </div>
                )}
              </div>

              {(isStreamingOut || isStreamingIn) && (
                <div className="flex items-center gap-2 text-sm">
                  {isStreamingOut ? (
                    <>
                      <ArrowUpIcon className="h-4 w-4 text-orange-500" />
                      <span className="text-orange-500">Streaming out</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownIcon className="h-4 w-4 text-green-500" />
                      <span className="text-green-500">Streaming in</span>
                    </>
                  )}
                </div>
              )}

              <div className="pt-2 border-t">
                <div className="text-xs text-muted-foreground">Deposit:</div>
                <div className="text-sm font-medium tabular-nums">
                  {formattedDeposit} PYUSDx
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Employees */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Active Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeStreamsOut}</div>
            <p className="text-xs text-muted-foreground">
              {activeStreamsOut} receiving payments
            </p>
          </CardContent>
        </Card>

        {/* Active Streams */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Active Streams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeStreamsOut}</div>
            <p className="text-xs text-muted-foreground">
              Out of {totalStreams} total
            </p>
          </CardContent>
        </Card>

        {/* Monthly Burn */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Monthly Burn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Math.abs(parseFloat(monthlyFlow)).toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </div>
            <p className="text-xs text-muted-foreground">Estimated monthly cost</p>
          </CardContent>
        </Card>

        {/* Annual Burn */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Annual Burn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Math.abs(parseFloat(annualFlow)).toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </div>
            <p className="text-xs text-muted-foreground">Total annual payroll</p>
          </CardContent>
        </Card>
      </div>

      {/* Flow Rate Card */}
      <Card>
        <CardHeader>
          <CardTitle>Flow rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Main flow rate */}
            <div>
              <div className="text-3xl font-bold tabular-nums text-orange-500">
                {flowLoading
                  ? "..."
                  : `${isStreamingOut ? "-" : ""}${Math.abs(parseFloat(monthlyFlow)).toFixed(2)}`}
              </div>
              <div className="text-sm text-muted-foreground">/mo</div>
            </div>

            <Separator />

            {/* Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Per second</div>
                <div className="text-sm font-medium tabular-nums">
                  {isStreamingOut ? "-" : ""}
                  {Math.abs(parseFloat(perSecondFlow)).toFixed(8)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Per day</div>
                <div className="text-sm font-medium tabular-nums">
                  {isStreamingOut ? "-" : ""}
                  {Math.abs(parseFloat(perDayFlow)).toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Per month</div>
                <div className="text-sm font-medium tabular-nums">
                  {isStreamingOut ? "-" : ""}
                  {Math.abs(parseFloat(monthlyFlow)).toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Per year</div>
                <div className="text-sm font-medium tabular-nums">
                  {isStreamingOut ? "-" : ""}
                  {Math.abs(parseFloat(annualFlow)).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

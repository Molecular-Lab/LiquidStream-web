"use client"

import { useEffect, useState } from "react"
import { useAccount, useReadContract } from "wagmi"
import { Address, formatUnits, parseAbi } from "viem"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PYUSD_ADDRESS, PYUSDX_ADDRESS, SUPER_TOKEN_ABI } from "@/lib/contract"
import { useWalletMode } from "@/store/wallet-mode"
import { useSafe } from "@/store/safe"

const PYUSD_ABI = parseAbi([
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
])

interface BalanceCardsProps {
  totalFlowRate?: bigint
}

export function BalanceCards({ totalFlowRate = BigInt(0) }: BalanceCardsProps) {
  const { address } = useAccount()
  const { isSafeMode } = useWalletMode()
  const { safeConfig } = useSafe()

  // IMPORTANT: Determine which address to query based on wallet mode
  // In Safe mode, we MUST use Safe address for ALL contract interactions
  const queryAddress = isSafeMode() && safeConfig?.address
    ? (safeConfig.address as Address)
    : address

  const isInSafeMode = isSafeMode() && !!safeConfig?.address

  // Read PYUSD balance
  const { data: pyusdBalance, isLoading: pyusdLoading } = useReadContract({
    address: PYUSD_ADDRESS,
    abi: PYUSD_ABI,
    functionName: "balanceOf",
    args: queryAddress ? [queryAddress] : undefined,
  })

  // Read PYUSDx balance
  const { data: pyusdxBalance, isLoading: pyusdxLoading } = useReadContract({
    address: PYUSDX_ADDRESS,
    abi: SUPER_TOKEN_ABI,
    functionName: "balanceOf",
    args: queryAddress ? [queryAddress] : undefined,
  })

  // Real-time balance calculation for PYUSDx
  const [currentPyusdxBalance, setCurrentPyusdxBalance] = useState<string | null>(null)

  useEffect(() => {
    if (!pyusdxBalance || totalFlowRate === BigInt(0)) {
      setCurrentPyusdxBalance(null)
      return
    }

    const startBalance = pyusdxBalance as bigint
    const startTime = Date.now()

    // Set initial balance
    setCurrentPyusdxBalance(parseFloat(formatUnits(startBalance, 18)).toFixed(6))

    // Update balance in real-time if streaming
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000 // seconds
      // Negative because we're streaming out
      const flowAmount = -totalFlowRate * BigInt(Math.floor(elapsed))
      const newBalance = startBalance + flowAmount

      setCurrentPyusdxBalance(parseFloat(formatUnits(newBalance, 18)).toFixed(6))
    }, 100) // Update every 100ms for smooth animation

    return () => clearInterval(interval)
  }, [pyusdxBalance, totalFlowRate])

  // Color scheme based on wallet mode
  const accentColor = isInSafeMode ? "text-green-600" : "text-[#0070BA]"
  const accentColorDark = isInSafeMode ? "text-green-700" : "text-blue-600"
  const bgGradient = isInSafeMode ? "bg-gradient-to-br from-green-50 to-white" : "bg-gradient-to-br from-blue-50 to-white"

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* PYUSD Balance Card */}
      <Card className="border-2 hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">PYUSD Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900">
              {pyusdLoading ? "..." : pyusdBalance ? parseFloat(formatUnits(pyusdBalance as bigint, 6)).toFixed(2) : "0.00"}
            </span>
            <span className="text-lg text-gray-500">PYUSD</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">Base token balance</p>
          {isInSafeMode && (
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              Safe: {safeConfig.address?.slice(0, 6)}...{safeConfig.address?.slice(-4)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* PYUSDx Balance Card */}
      <Card className={`border-2 hover:shadow-lg transition-shadow ${bgGradient}`}>
        <CardHeader className="pb-3">
          <CardTitle className={`text-sm font-medium ${accentColor}`}>Streamable PYUSD</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-bold ${accentColor} tabular-nums`}>
              {pyusdxLoading
                ? "..."
                : currentPyusdxBalance && totalFlowRate > BigInt(0)
                  ? currentPyusdxBalance
                  : pyusdxBalance
                    ? parseFloat(formatUnits(pyusdxBalance as bigint, 18)).toFixed(2)
                    : "0.00"
              }
            </span>
            <span className={`text-lg ${accentColorDark}`}>PYUSDx</span>
          </div>
          <p className={`text-sm ${accentColorDark} mt-2`}>
            {totalFlowRate > BigInt(0) ? "Real-time streaming balance" : "SuperToken for streaming"}
          </p>
          {isInSafeMode && (
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              Safe: {safeConfig.address?.slice(0, 6)}...{safeConfig.address?.slice(-4)}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

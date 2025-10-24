"use client"

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Address, formatEther } from "viem"
import { usePublicClient, useAccount } from "wagmi"
import { readContract } from "wagmi/actions"

import { CFAV1_ADDRESS, PYUSDX_ADDRESS, CFA_ABI, SUPER_TOKEN_ABI } from "@/lib/contract"
import { config } from "@/config/wallet"
import { useSafeConfig } from "@/store/safe"
import { FileWarningIcon } from "lucide-react"

export interface StreamInfo {
  timestamp: bigint
  flowRate: bigint
  deposit: bigint
  owedDeposit: bigint
  // Calculated values
  perSecond: bigint
  perDay: bigint
  perMonth: bigint
  perYear: bigint
  isActive: boolean
}

export interface RealtimeBalance {
  availableBalance: bigint
  deposit: bigint
  owedDeposit: bigint
  timestamp: bigint
}

/**
 * Hook to get stream info between sender and receiver (database-less)
 * Reads directly from Superfluid CFA contract
 */
export const useStreamInfo = (token: Address, sender?: Address, receiver?: Address) => {
  const { address } = useAccount()
  const { safeConfig } = useSafeConfig()
  const publicClient = usePublicClient()

  // Use Safe address if configured, otherwise use connected wallet address
  const senderAddress = sender || safeConfig?.address || address
  const receiverAddress = receiver

  return useQuery({
    queryKey: ["streamInfo", token, senderAddress, receiverAddress],
    queryFn: async () => {
      if (!publicClient || !senderAddress || !receiverAddress) {
        return null
      }

      try {
        const result = await publicClient.readContract({
          address: CFAV1_ADDRESS,
          abi: CFA_ABI,
          functionName: "getFlow",
          args: [token, senderAddress, receiverAddress],
        })

        const [timestamp, flowRate, deposit, owedDeposit] = result as [bigint, bigint, bigint, bigint]

        return {
          timestamp,
          flowRate,
          deposit,
          owedDeposit,
          isActive: flowRate > 0n,
        }
      } catch (error) {
        console.error("Error fetching stream info:", error)
        return null
      }
    },
    enabled: !!publicClient && !!senderAddress && !!receiverAddress,
    refetchInterval: 10000, // Refetch every 10 seconds
  })
}

/**
 * Hook to get real-time balance with streaming
 */
export function useRealtimeBalance(
  token: Address = PYUSDX_ADDRESS,
  account?: Address
) {
  const publicClient = usePublicClient()
  const { address: connectedAddress } = useAccount()
  const [balance, setBalance] = useState<RealtimeBalance | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const effectiveAccount = account || connectedAddress

  useEffect(() => {
    if (!publicClient || !effectiveAccount) {
      setBalance(null)
      return
    }

    let mounted = true

    async function fetchBalance() {
      setLoading(true)
      setError(null)

      try {
        // Get real-time balance: [availableBalance, deposit, owedDeposit, timestamp]
        const realtimeBalance = (await readContract(config, {
          address: token,
          abi: SUPER_TOKEN_ABI,
          functionName: "realtimeBalanceOfNow",
          args: [effectiveAccount!],
        })) as [bigint, bigint, bigint, bigint]

        if (!mounted) return

        setBalance({
          availableBalance: realtimeBalance[0],
          deposit: realtimeBalance[1],
          owedDeposit: realtimeBalance[2],
          timestamp: realtimeBalance[3],
        })
      } catch (err: any) {
        if (mounted) {
          console.error("Error fetching realtime balance:", err)
          setError(err.message || "Failed to fetch balance")
          setBalance(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchBalance()

    // Refresh every 10 seconds
    const interval = setInterval(fetchBalance, 10000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [publicClient, token, effectiveAccount])

  return { balance, loading, error }
}

/**
 * Hook to get all incoming streams to an address
 */
export function useIncomingStreams(
  token: Address = PYUSDX_ADDRESS,
  receiver?: Address
) {
  const publicClient = usePublicClient()
  const { address: connectedAddress } = useAccount()
  const [netFlowRate, setNetFlowRate] = useState<bigint>(BigInt(0))
  const [loading, setLoading] = useState(false)

  const effectiveReceiver = receiver || connectedAddress

  useEffect(() => {
    if (!publicClient || !effectiveReceiver) {
      setNetFlowRate(BigInt(0))
      return
    }

    let mounted = true

    async function fetchNetFlow() {
      setLoading(true)

      try {
        // Get net flow rate for the receiver
        const netFlow = (await readContract(config, {
          address: CFAV1_ADDRESS,
          abi: CFA_ABI,
          functionName: "getNetFlow",
          args: [token, effectiveReceiver!],
        })) as bigint

        if (mounted) {
          setNetFlowRate(netFlow)
        }
      } catch (err) {
        console.error("Error fetching net flow:", err)
        if (mounted) {
          setNetFlowRate(BigInt(0))
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchNetFlow()

    // Refresh every 15 seconds
    const interval = setInterval(fetchNetFlow, 15000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [publicClient, token, effectiveReceiver])

  return { netFlowRate, loading }
}

/**
 * Format flow rate to human-readable format
 */
export function formatFlowRate(flowRate: bigint | string, decimals: number = 18) {
  // Convert string to bigint if needed
  const rate = typeof flowRate === 'string' ? BigInt(flowRate) : flowRate

  // Use precise time calculations matching Superfluid
  const secondsPerDay = 86400n      // 24 * 60 * 60
  const secondsPerYear = 31557600n  // 365.25 * 24 * 60 * 60
  const secondsPerMonth = 2629800n  // 365.25 / 12 * 24 * 60 * 60 = 30.4375 days

  return {
    perSecond: formatEther(rate),
    perDay: formatEther(rate * secondsPerDay),
    perMonth: formatEther(rate * secondsPerMonth),
    perYear: formatEther(rate * secondsPerYear),
  }
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Address } from "viem"
import { useAccount, usePublicClient, useWriteContract } from "wagmi"

import {
  CFA_ABI,
  HOST_ADDRESS,
  HOST_ABI,
  buildCreateFlowOperation,
  buildUpdateFlowOperation,
  buildDeleteFlowOperation,
  CFAV1_ADDRESS,
} from "@/lib/contract"
import { useStreamStore } from "@/store/streams"

/**
 * Hook to create a new payment stream using direct wallet
 */
export const useSingleWalletCreateStream = () => {
  const { writeContractAsync } = useWriteContract()
  const { address } = useAccount()
  const queryClient = useQueryClient()
  const addStream = useStreamStore((state) => state.addStream)

  return useMutation({
    mutationFn: async ({
      token,
      receiver,
      flowRate,
      employeeId,
      employeeName,
      tokenSymbol,
    }: {
      token: Address
      receiver: Address
      flowRate: bigint
      employeeId: string
      employeeName: string
      tokenSymbol: string
    }) => {
      if (!address) throw new Error("Wallet not connected")

      console.log("Creating stream with direct wallet:", {
        token,
        receiver,
        flowRate: flowRate.toString(),
        employeeId,
        employeeName,
        tokenSymbol
      })

      // Direct wallet transaction
      const operation = buildCreateFlowOperation(token, receiver, flowRate)
      const hash = await writeContractAsync({
        address: HOST_ADDRESS,
        abi: HOST_ABI,
        functionName: "batchCall",
        args: [[operation]],
      } as any)

      console.log("Stream created successfully:", { hash })

      // Add to local store
      addStream({
        employeeId,
        employeeName,
        employeeAddress: receiver as `0x${string}`,
        token: token as `0x${string}`,
        tokenSymbol,
        flowRate: flowRate.toString(),
        startTime: Date.now(),
        status: "active",
      })

      return hash
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["streams"] })
      toast.success("Payment stream started! 🚀", {
        description: `Streaming ${variables.tokenSymbol} to ${variables.employeeName} - Transaction: ${result.slice(0, 10)}...`,
        duration: 5000,
        action: {
          label: "View on Explorer",
          onClick: () => {
            window.open(`https://sepolia.etherscan.io/tx/${result}`, '_blank')
          }
        }
      })
    },
    onError: (error: Error) => {
      console.error("Stream creation failed:", error)
      toast.error("Failed to start stream", {
        description: error.message.includes('User rejected') 
          ? 'Transaction was cancelled by user'
          : error.message,
      })
    },
  })
}

/**
 * Hook to update an existing payment stream using direct wallet
 */
export const useSingleWalletUpdateStream = () => {
  const { writeContractAsync } = useWriteContract()
  const { address } = useAccount()
  const queryClient = useQueryClient()
  const updateStream = useStreamStore((state) => state.updateStream)

  return useMutation({
    mutationFn: async ({
      token,
      receiver,
      newFlowRate,
      streamId,
      employeeName,
      tokenSymbol,
    }: {
      token: Address
      receiver: Address
      newFlowRate: bigint
      streamId: string
      employeeName?: string
      tokenSymbol?: string
    }) => {
      if (!address) throw new Error("Wallet not connected")

      console.log("Updating stream with direct wallet:", {
        token,
        receiver,
        newFlowRate: newFlowRate.toString(),
        streamId
      })

      // Direct wallet transaction
      const operation = buildUpdateFlowOperation(token, receiver, newFlowRate)
      const hash = await writeContractAsync({
        address: HOST_ADDRESS,
        abi: HOST_ABI,
        functionName: "batchCall",
        args: [[operation]],
      } as any)

      console.log("Stream updated successfully:", { hash })

      // Update local store
      updateStream(streamId, {
        flowRate: newFlowRate.toString(),
        status: "active",
      })

      return hash
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["streams"] })
      toast.success("Payment stream updated! ⚡", {
        description: `Stream to ${variables.employeeName || 'employee'} updated - Transaction: ${result.slice(0, 10)}...`,
        duration: 5000,
        action: {
          label: "View on Explorer",
          onClick: () => {
            window.open(`https://sepolia.etherscan.io/tx/${result}`, '_blank')
          }
        }
      })
    },
    onError: (error: Error) => {
      console.error("Stream update failed:", error)
      toast.error("Failed to update stream", {
        description: error.message.includes('User rejected') 
          ? 'Transaction was cancelled by user'
          : error.message,
      })
    },
  })
}

/**
 * Hook to delete/stop a payment stream using direct wallet
 */
export const useSingleWalletDeleteStream = () => {
  const { writeContractAsync } = useWriteContract()
  const { address } = useAccount()
  const queryClient = useQueryClient()
  const endStream = useStreamStore((state) => state.endStream)

  return useMutation({
    mutationFn: async ({
      token,
      receiver,
      streamId,
      employeeName,
      tokenSymbol,
    }: {
      token: Address
      receiver: Address
      streamId: string
      employeeName?: string
      tokenSymbol?: string
    }) => {
      if (!address) throw new Error("Wallet not connected")

      console.log("Stopping stream with direct wallet:", {
        token,
        receiver,
        streamId,
        sender: address
      })

      // Direct wallet transaction
      const operation = buildDeleteFlowOperation(token, address, receiver)
      const hash = await writeContractAsync({
        address: HOST_ADDRESS,
        abi: HOST_ABI,
        functionName: "batchCall",
        args: [[operation]],
      } as any)

      console.log("Stream stopped successfully:", { hash })

      // Update local store
      endStream(streamId)

      return hash
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["streams"] })
      toast.success("Payment stream stopped! ⏹️", {
        description: `Stream to ${variables.employeeName || 'employee'} stopped - Transaction: ${result.slice(0, 10)}...`,
        duration: 5000,
        action: {
          label: "View on Explorer",
          onClick: () => {
            window.open(`https://sepolia.etherscan.io/tx/${result}`, '_blank')
          }
        }
      })
    },
    onError: (error: Error) => {
      console.error("Stream deletion failed:", error)
      toast.error("Failed to stop stream", {
        description: error.message.includes('User rejected') 
          ? 'Transaction was cancelled by user'
          : error.message,
      })
    },
  })
}

/**
 * Hook to get stream flow info using direct chain queries
 */
export const useSingleWalletStreamInfo = (token: Address, sender: Address, receiver: Address) => {
  const publicClient = usePublicClient()

  return useQuery({
    queryKey: ["stream-info", token, sender, receiver],
    queryFn: async () => {
      if (!publicClient) throw new Error("Public client not available")

      try {
        // Get flow info from Superfluid CFA contract
        const flowInfo = await publicClient.readContract({
          address: CFAV1_ADDRESS,
          abi: CFA_ABI,
          functionName: "getFlow",
          args: [token, sender, receiver],
        } as any) as [bigint, bigint, bigint, bigint]

        const [timestamp, flowRate, deposit, owedDeposit] = flowInfo

        return {
          timestamp: Number(timestamp),
          flowRate,
          deposit,
          owedDeposit,
          isActive: flowRate > 0n,
        }
      } catch (error) {
        console.log("No active stream found:", error)
        return {
          timestamp: 0,
          flowRate: 0n,
          deposit: 0n,
          owedDeposit: 0n,
          isActive: false,
        }
      }
    },
    enabled: !!(publicClient && token && sender && receiver),
    refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
  })
}

/**
 * Hook to get all streams for a sender using direct chain queries
 */
export const useSingleWalletAllStreams = (sender?: Address) => {
  const publicClient = usePublicClient()
  const streams = useStreamStore((state) => state.streams)

  return useQuery({
    queryKey: ["all-streams", sender],
    queryFn: async () => {
      if (!publicClient || !sender) return []

      // Get stream info for all stored streams
      const streamPromises = streams.map(async (stream) => {
        try {
          const flowInfo = await publicClient.readContract({
            address: CFAV1_ADDRESS,
            abi: CFA_ABI,
            functionName: "getFlow",
            args: [stream.token, sender, stream.employeeAddress],
          } as any) as [bigint, bigint, bigint, bigint]

          const [timestamp, flowRate, deposit, owedDeposit] = flowInfo

          return {
            ...stream,
            onChainFlowRate: flowRate,
            isActiveOnChain: flowRate > 0n,
            timestamp: Number(timestamp),
            deposit,
            owedDeposit,
          }
        } catch (error) {
          console.log(`No flow found for stream ${stream.id}:`, error)
          return {
            ...stream,
            onChainFlowRate: 0n,
            isActiveOnChain: false,
            timestamp: 0,
            deposit: 0n,
            owedDeposit: 0n,
          }
        }
      })

      return Promise.all(streamPromises)
    },
    enabled: !!(publicClient && sender && streams.length > 0),
    refetchInterval: 15000, // Refetch every 15 seconds
  })
}
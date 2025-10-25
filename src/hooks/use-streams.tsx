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
import { useSafeConfig } from "@/store/safe"
import { useSafeStreamOperations } from "@/hooks/use-safe-operations"

/**
 * Hook to create a new payment stream using Safe multisig or direct wallet
 */
export const useCreateStream = () => {
  const { writeContractAsync } = useWriteContract()
  const { address } = useAccount()
  const queryClient = useQueryClient()
  const addStream = useStreamStore((state) => state.addStream)
  const { safeConfig } = useSafeConfig()
  const { mutate: createSafeStream } = useSafeStreamOperations()

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

      // Use Safe multisig if configured, otherwise use direct wallet
      if (safeConfig?.address) {
        // Create Safe transaction
        await new Promise<void>((resolve, reject) => {
          createSafeStream(
            {
              operation: 'create',
              token,
              receiver,
              flowRate,
              employeeId,
              employeeName,
              tokenSymbol,
            },
            {
              onSuccess: () => {
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
                resolve()
              },
              onError: (error) => reject(error),
            }
          )
        })
        return "safe-transaction" // Return placeholder since Safe handles the actual hash
      } else {
        // Direct wallet transaction (fallback)
        const operation = buildCreateFlowOperation(token, receiver, flowRate)
        const hash = await writeContractAsync({
          address: HOST_ADDRESS,
          abi: HOST_ABI,
          functionName: "batchCall",
          args: [[operation]],
        } as any)

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
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["streams"] })
      if (result === "safe-transaction") {
        // Safe operation success is handled by useSafeStreamOperations
        return
      }
      toast.success("Payment stream created successfully!", {
        description: `Transaction hash: ${result.slice(0, 10)}...`,
      })
    },
    onError: (error: Error) => {
      toast.error("Failed to create stream", {
        description: error.message,
      })
    },
  })
}

/**
 * Hook to update an existing payment stream using Safe multisig or direct wallet
 */
export const useUpdateStream = () => {
  const { writeContractAsync } = useWriteContract()
  const { address } = useAccount()
  const queryClient = useQueryClient()
  const updateStream = useStreamStore((state) => state.updateStream)
  const { safeConfig } = useSafeConfig()
  const { mutate: updateSafeStream } = useSafeStreamOperations()

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

      // Use Safe multisig if configured, otherwise use direct wallet
      if (safeConfig?.address) {
        // Create Safe transaction
        await new Promise<void>((resolve, reject) => {
          updateSafeStream(
            {
              operation: 'update',
              token,
              receiver,
              flowRate: newFlowRate,
              employeeName,
              tokenSymbol,
            },
            {
              onSuccess: () => {
                // Update local store
                updateStream(streamId, {
                  flowRate: newFlowRate.toString(),
                  status: "active",
                })
                resolve()
              },
              onError: (error) => reject(error),
            }
          )
        })
        return "safe-transaction"
      } else {
        // Direct wallet transaction (fallback)
        const operation = buildUpdateFlowOperation(token, receiver, newFlowRate)
        const hash = await writeContractAsync({
          address: HOST_ADDRESS,
          abi: HOST_ABI,
          functionName: "batchCall",
          args: [[operation]],
        } as any)

        // Update local store
        updateStream(streamId, {
          flowRate: newFlowRate.toString(),
          status: "active",
        })

        return hash
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["streams"] })
      if (result === "safe-transaction") {
        return
      }
      toast.success("Stream updated successfully!", {
        description: `Transaction hash: ${result.slice(0, 10)}...`,
      })
    },
    onError: (error: Error) => {
      toast.error("Failed to update stream", {
        description: error.message,
      })
    },
  })
}

/**
 * Hook to delete/stop a payment stream using Safe multisig or direct wallet
 */
export const useDeleteStream = () => {
  const { writeContractAsync } = useWriteContract()
  const { address } = useAccount()
  const queryClient = useQueryClient()
  const endStream = useStreamStore((state) => state.endStream)
  const { safeConfig } = useSafeConfig()
  const { mutate: deleteSafeStream } = useSafeStreamOperations()

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

      // Use Safe multisig if configured, otherwise use direct wallet
      if (safeConfig?.address) {
        // Create Safe transaction
        await new Promise<void>((resolve, reject) => {
          deleteSafeStream(
            {
              operation: 'delete',
              token,
              receiver,
              employeeName,
              tokenSymbol,
            },
            {
              onSuccess: () => {
                // Update local store
                endStream(streamId)
                resolve()
              },
              onError: (error) => reject(error),
            }
          )
        })
        return "safe-transaction"
      } else {
        // Direct wallet transaction (fallback)
        const operation = buildDeleteFlowOperation(token, address, receiver)
        const hash = await writeContractAsync({
          address: HOST_ADDRESS,
          abi: HOST_ABI,
          functionName: "batchCall",
          args: [[operation]],
        } as any)

        // Update local store
        endStream(streamId)

        return hash
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["streams"] })
      if (result === "safe-transaction") {
        return
      }
      toast.success("Stream stopped successfully!", {
        description: `Transaction hash: ${result.slice(0, 10)}...`,
      })
    },
    onError: (error: Error) => {
      toast.error("Failed to stop stream", {
        description: error.message,
      })
    },
  })
}

/**
 * Hook to get flow details for a specific sender/receiver pair
 */
export const useGetFlow = (token: Address, sender: Address, receiver: Address) => {
  const publicClient = usePublicClient()

  return useQuery({
    queryKey: ["flow", token, sender, receiver],
    queryFn: async () => {
      if (!publicClient) throw new Error("Public client not available")

      const result = await publicClient.readContract({
        address: CFAV1_ADDRESS,
        abi: CFA_ABI,
        functionName: "getFlow",
        args: [token, sender, receiver],
      } as any)

      return {
        timestamp: result[0],
        flowRate: result[1],
        deposit: result[2],
        owedDeposit: result[3],
      }
    },
    enabled: !!publicClient && !!token && !!sender && !!receiver,
    refetchInterval: 10000, // Refetch every 10 seconds
  })
}

/**
 * Hook to get net flow for an account
 */
export const useGetNetFlow = (token: Address, account: Address) => {
  const publicClient = usePublicClient()

  return useQuery({
    queryKey: ["netFlow", token, account],
    queryFn: async () => {
      if (!publicClient) throw new Error("Public client not available")

      const flowRate = await publicClient.readContract({
        address: CFAV1_ADDRESS,
        abi: CFA_ABI,
        functionName: "getNetFlow",
        args: [token, account],
      } as any)

      return flowRate
    },
    enabled: !!publicClient && !!token && !!account,
    refetchInterval: 10000, // Refetch every 10 seconds
  })
}

/**
 * Hook to refresh stream data from the query client
 */
export const useRefreshStreams = () => {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: ["streams"] })
    queryClient.invalidateQueries({ queryKey: ["flow"] })
    queryClient.invalidateQueries({ queryKey: ["netFlow"] })
  }
}

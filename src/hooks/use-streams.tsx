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
 * Hook to create a new payment stream using Superfluid batchCall
 */
export const useCreateStream = () => {
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

      // Build createFlow operation
      const operation = buildCreateFlowOperation(token, receiver, flowRate)

      // Execute batchCall on Superfluid Host
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
        employeeAddress: receiver,
        token,
        tokenSymbol,
        flowRate: flowRate.toString(),
        startTime: Date.now(),
        status: "active",
      })

      return hash
    },
    onSuccess: (hash) => {
      queryClient.invalidateQueries({ queryKey: ["streams"] })
      toast.success("Payment stream created successfully!", {
        description: `Transaction hash: ${hash.slice(0, 10)}...`,
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
 * Hook to update an existing payment stream using batchCall
 */
export const useUpdateStream = () => {
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
    }: {
      token: Address
      receiver: Address
      newFlowRate: bigint
      streamId: string
    }) => {
      if (!address) throw new Error("Wallet not connected")

      // Build updateFlow operation
      const operation = buildUpdateFlowOperation(token, receiver, newFlowRate)

      // Execute batchCall
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
    },
    onSuccess: (hash) => {
      queryClient.invalidateQueries({ queryKey: ["streams"] })
      toast.success("Stream updated successfully!", {
        description: `Transaction hash: ${hash.slice(0, 10)}...`,
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
 * Hook to delete/stop a payment stream using batchCall
 */
export const useDeleteStream = () => {
  const { writeContractAsync } = useWriteContract()
  const { address } = useAccount()
  const queryClient = useQueryClient()
  const endStream = useStreamStore((state) => state.endStream)

  return useMutation({
    mutationFn: async ({
      token,
      receiver,
      streamId,
    }: {
      token: Address
      receiver: Address
      streamId: string
    }) => {
      if (!address) throw new Error("Wallet not connected")

      // Build deleteFlow operation
      const operation = buildDeleteFlowOperation(token, address, receiver)

      // Execute batchCall
      const hash = await writeContractAsync({
        address: HOST_ADDRESS,
        abi: HOST_ABI,
        functionName: "batchCall",
        args: [[operation]],
      } as any)

      // Update local store
      endStream(streamId)

      return hash
    },
    onSuccess: (hash) => {
      queryClient.invalidateQueries({ queryKey: ["streams"] })
      toast.success("Stream stopped successfully!", {
        description: `Transaction hash: ${hash.slice(0, 10)}...`,
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

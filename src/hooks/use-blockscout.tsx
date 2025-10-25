"use client"

import { useQuery } from "@tanstack/react-query"
import { Address } from "viem"

// Blockscout API endpoints for different networks
const BLOCKSCOUT_APIS = {
  sepolia: "https://eth-sepolia.blockscout.com/api",
  scrollSepolia: "https://sepolia.scrollscan.com/api",
  optimismSepolia: "https://sepolia-optimism.blockscout.com/api",
  baseSepolia: "https://sepolia.basescan.org/api",
} as const

export type SupportedNetwork = keyof typeof BLOCKSCOUT_APIS

export interface BlockscoutTransaction {
  hash: string
  from: string
  to: string
  value: string
  timeStamp: string
  blockNumber: string
  confirmations: string
  isError: string
  txreceipt_status: string
  input: string
  contractAddress: string
  gasUsed: string
  gasPrice: string
  methodId: string
  functionName: string
}

export interface BlockscoutTokenTransfer {
  blockNumber: string
  timeStamp: string
  hash: string
  from: string
  to: string
  value: string
  tokenName: string
  tokenSymbol: string
  tokenDecimal: string
  contractAddress: string
  transactionIndex: string
  confirmations: string
}

/**
 * Hook to fetch transaction history from Blockscout
 */
export const useBlockscoutTransactions = (
  address?: Address,
  network: SupportedNetwork = "sepolia",
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["blockscout-transactions", address, network],
    queryFn: async () => {
      if (!address) return []

      try {
        const apiUrl = BLOCKSCOUT_APIS[network]
        const url = `${apiUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=100&sort=desc`
        
        console.log("Fetching Blockscout transactions:", {
          address,
          network,
          url
        })

        const response = await fetch(url)
        
        if (!response.ok) {
          console.error("Blockscout API error:", response.status, response.statusText)
          return []
        }

        const data = await response.json()
        
        console.log("Blockscout API response:", data)

        if (data.status === "1" && Array.isArray(data.result)) {
          return data.result as BlockscoutTransaction[]
        }

        if (data.message && data.message.includes("No transactions found")) {
          console.log("No transactions found for address:", address)
          return []
        }

        console.warn("Unexpected Blockscout response format:", data)
        return []
      } catch (error) {
        console.error("Failed to fetch Blockscout transactions:", error)
        return []
      }
    },
    enabled: !!address && enabled,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 20000,
    retry: 2,
  })
}

/**
 * Hook to fetch ERC20 token transfers from Blockscout
 */
export const useBlockscoutTokenTransfers = (
  address?: Address,
  contractAddress?: Address,
  network: SupportedNetwork = "sepolia",
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["blockscout-token-transfers", address, contractAddress, network],
    queryFn: async () => {
      if (!address) return []

      try {
        const apiUrl = BLOCKSCOUT_APIS[network]
        const contractParam = contractAddress ? `&contractaddress=${contractAddress}` : ""
        const url = `${apiUrl}?module=account&action=tokentx&address=${address}${contractParam}&startblock=0&endblock=99999999&page=1&offset=100&sort=desc`
        
        console.log("Fetching Blockscout token transfers:", {
          address,
          contractAddress,
          network,
          url
        })

        const response = await fetch(url)
        
        if (!response.ok) {
          console.error("Blockscout token API error:", response.status, response.statusText)
          return []
        }

        const data = await response.json()
        
        console.log("Blockscout token API response:", data)

        if (data.status === "1" && Array.isArray(data.result)) {
          return data.result as BlockscoutTokenTransfer[]
        }

        if (data.message && data.message.includes("No transactions found")) {
          console.log("No token transfers found for address:", address)
          return []
        }

        console.warn("Unexpected Blockscout token response format:", data)
        return []
      } catch (error) {
        console.error("Failed to fetch Blockscout token transfers:", error)
        return []
      }
    },
    enabled: !!address && enabled,
    refetchInterval: 30000,
    staleTime: 20000,
    retry: 2,
  })
}

/**
 * Helper to get Blockscout explorer URL
 */
export const getBlockscoutUrl = (
  type: "tx" | "address" | "token",
  identifier: string,
  network: SupportedNetwork = "sepolia"
): string => {
  const baseUrls = {
    sepolia: "https://eth-sepolia.blockscout.com",
    scrollSepolia: "https://sepolia.scrollscan.com",
    optimismSepolia: "https://sepolia-optimism.blockscout.com",
    baseSepolia: "https://sepolia.basescan.org",
  }

  const baseUrl = baseUrls[network]

  switch (type) {
    case "tx":
      return `${baseUrl}/tx/${identifier}`
    case "address":
      return `${baseUrl}/address/${identifier}`
    case "token":
      return `${baseUrl}/token/${identifier}`
    default:
      return baseUrl
  }
}

/**
 * Helper to open Blockscout in new tab
 */
export const openBlockscout = (
  type: "tx" | "address" | "token",
  identifier: string,
  network: SupportedNetwork = "sepolia"
) => {
  const url = getBlockscoutUrl(type, identifier, network)
  window.open(url, "_blank")
}

/**
 * Helper to format transaction timestamp
 */
export const formatTxTimestamp = (timestamp: string): string => {
  const date = new Date(parseInt(timestamp) * 1000)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`

  return date.toLocaleDateString()
}

/**
 * Helper to get transaction type/label from function signature
 */
export const getTransactionLabel = (functionName: string, methodId: string): string => {
  const labels: Record<string, string> = {
    "transfer": "Transfer",
    "approve": "Approval",
    "createFlow": "Start Stream",
    "updateFlow": "Update Stream",
    "deleteFlow": "Stop Stream",
    "upgrade": "Wrap Token",
    "downgrade": "Unwrap Token",
    "batchCall": "Batch Operation",
    "execTransaction": "Safe Transaction",
    "approveHash": "Safe Approval",
  }

  // Try to match by function name first
  for (const [key, label] of Object.entries(labels)) {
    if (functionName.toLowerCase().includes(key.toLowerCase())) {
      return label
    }
  }

  // Fallback to method ID or generic label
  if (methodId && methodId !== "0x") {
    return `Contract Call (${methodId.slice(0, 10)})`
  }

  return "Transaction"
}

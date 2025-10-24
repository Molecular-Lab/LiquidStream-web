import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface SafeSigner {
  address: string
  name: string
  email?: string
  role?: string
}

export interface PendingTransaction {
  id: string
  type: "start_stream" | "stop_stream" | "transfer" | "upgrade_token" | "batch_operations" | "other"
  description: string
  to: string
  value?: string
  data?: string
  signatures: string[] // Array of signer addresses who have signed
  requiredSignatures: number
  createdAt: string
  createdBy: string
  status: "pending" | "ready" | "executed" | "rejected"
  nonce: number
  // Enhanced fields for Safe transactions
  safeTransactionHash?: string  // Safe transaction hash for off-chain tracking
  txHash?: string              // On-chain transaction hash after execution
  employeeId?: string          // Associated employee for stream operations
  employeeName?: string        // Employee name for UI display
  tokenSymbol?: string         // Token being used
  flowRate?: string           // Stream flow rate
  isMultiOperation?: boolean   // Whether this is a batch operation
}

export interface SafeConfig {
  address: string
  signers: SafeSigner[]
  threshold: number
  chainId: number
  createdAt: string
  createdBy: string // Owner address
  workspaceName?: string
  isDeployed?: boolean // Track if Safe contract is actually deployed on-chain
}

interface SafeStore {
  safeConfig: SafeConfig | null
  pendingTransactions: PendingTransaction[]
  
  // Safe configuration
  setSafeConfig: (config: SafeConfig) => void
  clearSafeConfig: () => void
  
  // Transaction management (for UI/demo purposes)
  addPendingTransaction: (tx: Omit<PendingTransaction, "id" | "createdAt">) => void
  signTransaction: (txId: string, signerAddress: string) => void
  executeTransaction: (txId: string) => void
  removePendingTransaction: (txId: string) => void
  
  // Signer info
  isSigner: (address: string) => boolean
  getSignerInfo: (address: string) => SafeSigner | undefined
  getPendingForSigner: (address: string) => PendingTransaction[]
}

// Renamed from useSafe to avoid conflict with @safe-global/safe-react-hooks
export const useSafeConfig = create<SafeStore>()(
  persist(
    (set, get) => ({
      safeConfig: null,
      pendingTransactions: [],

      setSafeConfig: (config) => {
        set({ safeConfig: config })
        // Only save to sessionStorage on client side
        if (typeof window !== 'undefined') {
          sessionStorage.setItem("safe_config", JSON.stringify(config))
        }
      },

      clearSafeConfig: () => {
        set({ safeConfig: null, pendingTransactions: [] })
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem("safe_config")
        }
      },

      addPendingTransaction: (tx) => {
        const newTx: PendingTransaction = {
          ...tx,
          id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          createdAt: new Date().toISOString(),
          status: "pending",
        }
        
        set((state) => ({
          pendingTransactions: [...state.pendingTransactions, newTx],
        }))
      },

      signTransaction: (txId, signerAddress) => {
        set((state) => {
          const updatedTxs = state.pendingTransactions.map((tx) => {
            if (tx.id === txId && !tx.signatures.includes(signerAddress)) {
              const newSignatures = [...tx.signatures, signerAddress]
              const isReady = newSignatures.length >= tx.requiredSignatures
              
              return {
                ...tx,
                signatures: newSignatures,
                status: isReady ? "ready" : "pending",
              } as PendingTransaction
            }
            return tx
          })
          
          return { pendingTransactions: updatedTxs }
        })
      },

      executeTransaction: (txId) => {
        set((state) => {
          const updatedTxs = state.pendingTransactions.map((tx) =>
            tx.id === txId ? { ...tx, status: "executed" as const } : tx
          )
          
          // Remove executed transactions after a delay (or keep for history)
          return { pendingTransactions: updatedTxs }
        })
      },

      removePendingTransaction: (txId) => {
        set((state) => ({
          pendingTransactions: state.pendingTransactions.filter((tx) => tx.id !== txId),
        }))
      },

      isSigner: (address) => {
        const { safeConfig } = get()
        if (!safeConfig) return false
        return safeConfig.signers.some(
          (s) => s.address.toLowerCase() === address.toLowerCase()
        )
      },

      getSignerInfo: (address) => {
        const { safeConfig } = get()
        if (!safeConfig) return undefined
        return safeConfig.signers.find(
          (s) => s.address.toLowerCase() === address.toLowerCase()
        )
      },

      getPendingForSigner: (address) => {
        const { pendingTransactions } = get()
        return pendingTransactions.filter(
          (tx) =>
            tx.status !== "executed" &&
            !tx.signatures.includes(address.toLowerCase())
        )
      },
    }),
    {
      name: "safe-store",
    }
  )
)

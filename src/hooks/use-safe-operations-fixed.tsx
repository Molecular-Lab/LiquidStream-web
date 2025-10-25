import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Address } from "viem"
import { useAccount, useWalletClient, useChainId } from "wagmi"

import { SafeTransactionBuilder, createSafeTransactionBuilder } from "@/lib/safe-transactions"
import { useSafeConfig } from "@/store/safe"

/**
 * Hook for Safe token operations (upgrade/downgrade)
 */
export const useSafeTokenOperations = () => {
    const { data: walletClient } = useWalletClient()
    const { address } = useAccount()
    const chainId = useChainId()
    const { safeConfig, addPendingTransaction, isSigner } = useSafeConfig()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            operation,
            tokenAddress,
            amount,
            tokenSymbol,
            spenderAddress,
            tokenAbi,
        }: {
            operation: 'upgrade' | 'downgrade' | 'approve'
            tokenAddress: Address
            amount: bigint
            tokenSymbol: string
            spenderAddress?: Address
            tokenAbi?: any
        }) => {
            if (!walletClient || !address || !safeConfig) {
                throw new Error("Wallet not connected or Safe not configured")
            }

            if (!isSigner(address)) {
                throw new Error("You are not authorized to create transactions for this Safe")
            }

            try {
                // Create Safe transaction builder
                const txBuilder = await createSafeTransactionBuilder(
                    safeConfig.address,
                    walletClient
                )

                let safeTransaction
                let description: string

                switch (operation) {
                    case 'upgrade':
                        console.log(`Creating upgrade transaction for ${amount} ${tokenSymbol}...`)
                        safeTransaction = await txBuilder.upgradeTokenTransaction(
                            amount,
                            tokenAddress
                        )
                        description = `Upgrade ${tokenSymbol} to ${tokenSymbol}x SuperToken`
                        console.log("Upgrade transaction created:", safeTransaction)
                        break

                    case 'downgrade':
                        console.log(`Creating downgrade transaction for ${amount} ${tokenSymbol}...`)
                        safeTransaction = await txBuilder.downgradeTokenTransaction(
                            amount,
                            tokenAddress
                        )
                        description = `Downgrade ${tokenSymbol} to ${tokenSymbol.replace('x', '')} base token`
                        console.log("Downgrade transaction created:", safeTransaction)
                        break

                    case 'approve':
                        if (!spenderAddress || !tokenAbi) {
                            throw new Error("Spender address and token ABI required for approval")
                        }
                        safeTransaction = await txBuilder.approveTokenTransaction(
                            tokenAddress,
                            spenderAddress,
                            amount,
                            tokenAbi
                        )
                        description = `Approve ${tokenSymbol} spending`
                        break

                    default:
                        throw new Error(`Unknown operation: ${operation}`)
                }

                // Validate transaction was created successfully
                if (!safeTransaction || !safeTransaction.to || !safeTransaction.data) {
                    throw new Error("Failed to create Safe transaction data")
                }

                console.log("Transaction data ready:", {
                    operation,
                    amount: amount.toString(),
                    safeTransaction
                })

                // Get transaction hash for tracking
                const txHash = await txBuilder.getTransactionHash(safeTransaction)
                const transactionData = await txBuilder.getTransactionData(safeTransaction)

                // Add to pending transactions in store for UI tracking
                addPendingTransaction({
                    type: "upgrade_token",
                    description,
                    to: tokenAddress,
                    signatures: [], // Empty - signatures will be collected via Safe API
                    requiredSignatures: safeConfig.threshold,
                    createdBy: address,
                    status: "pending",
                    nonce: transactionData.nonce,
                    safeTransactionHash: txHash,
                    tokenSymbol,
                    data: JSON.stringify(transactionData), // Store transaction data for Safe API
                })

                return { txHash, safeTransactionHash: txHash, transactionData, submittedToSafe: false }
            } catch (error) {
                console.error(`Failed to create ${operation} transaction:`, error)
                throw error
            }
        },
        onSuccess: (result, variables) => {
            queryClient.invalidateQueries({ queryKey: ["token-balances"] })
            queryClient.invalidateQueries({ queryKey: ["pending-transactions"] })

            const operationName = variables.operation === 'upgrade' ? 'Upgrade' : 'Downgrade'
            const tokenInfo = variables.operation === 'upgrade'
                ? `${variables.tokenSymbol} → ${variables.tokenSymbol}x`
                : `${variables.tokenSymbol} → ${variables.tokenSymbol.replace('x', '')}`

            toast.success(`${operationName} proposal created! 🎉`, {
                description: `${tokenInfo} transaction is ready. Requires ${safeConfig?.threshold}/${safeConfig?.signers.length} signatures.`,
                duration: 6000,
                action: {
                    label: "View Signatures",
                    onClick: () => {
                        window.location.href = '/workspace/signatures'
                    }
                }
            })

            // Show additional info about where to find the transaction
            setTimeout(() => {
                toast.info(`💡 Transaction ready for signatures`, {
                    description: "Check the Signatures page to sign and execute.",
                    duration: 5000
                })
            }, 2000)
        },
        onError: (error: Error, variables) => {
            console.error(`Token ${variables.operation} error:`, error)
            toast.error(`Failed to ${variables.operation} token`, {
                description: error.message.includes('EthersAdapter')
                    ? 'Safe SDK initialization failed. Please try again.'
                    : error.message,
            })
        },
    })
}

/**
 * Hook to create Safe transactions for Superfluid operations
 */
export const useSafeStreamOperations = () => {
    const { data: walletClient } = useWalletClient()
    const { address } = useAccount()
    const { safeConfig, addPendingTransaction, isSigner } = useSafeConfig()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            operation,
            token,
            receiver,
            flowRate,
            employeeId,
            employeeName,
            tokenSymbol,
        }: {
            operation: 'create' | 'update' | 'delete'
            token: Address
            receiver: Address
            flowRate?: bigint
            employeeId?: string
            employeeName?: string
            tokenSymbol?: string
        }) => {
            if (!walletClient || !address || !safeConfig) {
                throw new Error("Wallet not connected or Safe not configured")
            }

            if (!isSigner(address)) {
                throw new Error("You are not authorized to create transactions for this Safe")
            }

            // Create Safe transaction builder
            const txBuilder = await createSafeTransactionBuilder(
                safeConfig.address,
                walletClient
            )

            let safeTransaction
            let description: string

            switch (operation) {
                case 'create':
                    if (!flowRate) throw new Error("Flow rate required for create operation")
                    safeTransaction = await txBuilder.createStreamTransaction(
                        token,
                        receiver,
                        flowRate
                    )
                    description = `Start payment stream to ${employeeName || receiver} (${tokenSymbol})`
                    break

                case 'update':
                    if (!flowRate) throw new Error("Flow rate required for update operation")
                    safeTransaction = await txBuilder.updateStreamTransaction(
                        token,
                        receiver,
                        flowRate
                    )
                    description = `Update payment stream to ${employeeName || receiver} (${tokenSymbol})`
                    break

                case 'delete':
                    safeTransaction = await txBuilder.deleteStreamTransaction(
                        token,
                        receiver
                    )
                    description = `Stop payment stream to ${employeeName || receiver} (${tokenSymbol})`
                    break
            }

            // Get transaction hash for tracking (no signing needed)
            const txHash = await txBuilder.getTransactionHash(safeTransaction)
            const transactionData = await txBuilder.getTransactionData(safeTransaction)

            // Add to pending transactions in store
            addPendingTransaction({
                type: operation === 'create' ? "start_stream" : operation === 'delete' ? "stop_stream" : "transfer",
                description,
                to: token, // Contract address
                signatures: [], // Empty - signatures will be collected via Safe API
                requiredSignatures: safeConfig.threshold,
                createdBy: address,
                status: "pending",
                nonce: transactionData.nonce,
                safeTransactionHash: txHash,
                employeeId,
                employeeName,
                tokenSymbol,
                flowRate: flowRate?.toString(),
                data: JSON.stringify(transactionData),
            })

            return { txHash, safeTransactionHash: txHash }
        },
        onSuccess: (result, variables) => {
            queryClient.invalidateQueries({ queryKey: ["streams"] })

            toast.success(`Stream ${variables.operation} proposal created!`, {
                description: `Use Safe interface to sign and execute the transaction.`,
                action: {
                    label: "Open Safe App",
                    onClick: () => window.open(`https://app.safe.global/transactions/queue?safe=${safeConfig.address}`, '_blank')
                }
            })
        },
        onError: (error: Error, variables) => {
            toast.error(`Failed to ${variables.operation} stream`, {
                description: error.message,
            })
        },
    })
}

/**
 * Hook to sign pending Safe transactions
 */
export const useSignSafeTransaction = () => {
    const { data: walletClient } = useWalletClient()
    const { address } = useAccount()
    const { safeConfig, pendingTransactions, signTransaction, isSigner } = useSafeConfig()

    return useMutation({
        mutationFn: async ({ transactionId }: { transactionId: string }) => {
            if (!walletClient || !address || !safeConfig) {
                throw new Error("Wallet not connected or Safe not configured")
            }

            if (!isSigner(address)) {
                throw new Error("You are not authorized to sign transactions for this Safe")
            }

            // Get the pending transaction from store
            const pendingTx = pendingTransactions.find(tx => tx.id === transactionId)
            if (!pendingTx) {
                throw new Error("Transaction not found")
            }

            // Instead of signing here, redirect to Safe interface
            // In a real implementation, this would integrate with Safe's signing API
            const safeAppUrl = `https://app.safe.global/transactions/queue?safe=${safeConfig.address}`

            // Open Safe app for signing
            window.open(safeAppUrl, '_blank')

            // For demo purposes, simulate adding signature after user returns
            // In real implementation, this would be handled by Safe API webhooks
            toast.info("Redirecting to Safe interface for signing...", {
                description: "Sign the transaction in the Safe app, then return here."
            })

            return {
                transactionId,
                signature: "pending_safe_signature",
                safeTransactionHash: pendingTx.safeTransactionHash,
                requiresSafeInterface: true
            }
        },
        onSuccess: (result) => {
            if (result.requiresSafeInterface) {
                toast.success("Safe interface opened!", {
                    description: "Complete the signing process in the Safe app.",
                })
            } else {
                toast.success("Transaction signed successfully!", {
                    description: `Your signature has been added to the Safe transaction`,
                })
            }
        },
        onError: (error: Error) => {
            toast.error("Failed to sign transaction", {
                description: error.message,
            })
        },
    })
}

/**
 * Hook to execute Safe transactions when threshold is met
 */
export const useExecuteSafeTransaction = () => {
    const { data: walletClient } = useWalletClient()
    const { address } = useAccount()
    const { safeConfig, pendingTransactions, executeTransaction, isSigner } = useSafeConfig()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ transactionId }: { transactionId: string }) => {
            if (!walletClient || !address || !safeConfig) {
                throw new Error("Wallet not connected or Safe not configured")
            }

            if (!isSigner(address)) {
                throw new Error("You are not authorized to execute transactions for this Safe")
            }

            // Get the pending transaction from store
            const pendingTx = pendingTransactions.find(tx => tx.id === transactionId)
            if (!pendingTx) {
                throw new Error("Transaction not found")
            }

            // Redirect to Safe interface for execution
            const safeAppUrl = `https://app.safe.global/transactions/queue?safe=${safeConfig.address}`
            window.open(safeAppUrl, '_blank')

            toast.info("Redirecting to Safe interface for execution...", {
                description: "Execute the transaction in the Safe app when threshold is met."
            })

            return {
                transactionId,
                requiresSafeInterface: true,
                safeTransactionHash: pendingTx.safeTransactionHash
            }
        },
        onSuccess: (result, variables) => {
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ["streams"] })
            queryClient.invalidateQueries({ queryKey: ["token-balances"] })

            if (result.requiresSafeInterface) {
                toast.success("Safe interface opened!", {
                    description: "Complete the execution in the Safe app when threshold is met.",
                })
            } else {
                toast.success("Transaction executed successfully!", {
                    description: `Transaction completed on-chain`,
                })
            }
        },
        onError: (error: Error) => {
            toast.error("Failed to execute transaction", {
                description: error.message,
            })
        },
    })
}

/**
 * Hook to get pending transactions for current signer
 */
export const usePendingTransactions = () => {
    const { address } = useAccount()
    const { getPendingForSigner } = useSafeConfig()

    return useQuery({
        queryKey: ["pending-transactions", address],
        queryFn: () => {
            if (!address) return []
            return getPendingForSigner(address)
        },
        enabled: !!address,
        refetchInterval: 30000, // Refetch every 30 seconds
    })
}

/**
 * Hook for batch operations (start multiple streams at once)
 */
export const useBatchSafeOperations = () => {
    const { data: walletClient } = useWalletClient()
    const { address } = useAccount()
    const { safeConfig, addPendingTransaction } = useSafeConfig()

    return useMutation({
        mutationFn: async ({
            operations,
        }: {
            operations: Array<{
                type: 'create' | 'update' | 'delete'
                token: Address
                receiver: Address
                flowRate?: bigint
                employeeId?: string
                employeeName?: string
            }>
        }) => {
            if (!walletClient || !address || !safeConfig) {
                throw new Error("Wallet not connected or Safe not configured")
            }

            const txBuilder = await createSafeTransactionBuilder(
                safeConfig.address,
                walletClient
            )

            // Create batch transaction
            const safeTransactions = await txBuilder.batchStreamOperations(operations)
            const firstTransaction = Array.isArray(safeTransactions) ? safeTransactions[0] : safeTransactions
            const txHash = await txBuilder.getTransactionHash(firstTransaction)
            const transactionData = await txBuilder.getTransactionData(firstTransaction)

            // Add to pending transactions
            addPendingTransaction({
                type: "batch_operations",
                description: `Batch operation: ${operations.length} stream operations`,
                to: safeConfig.address,
                signatures: [],
                requiredSignatures: safeConfig.threshold,
                createdBy: address,
                status: "pending",
                nonce: transactionData.nonce,
                safeTransactionHash: txHash,
                isMultiOperation: true,
                data: JSON.stringify(transactionData),
            })

            return { txHash, safeTransactionHash: txHash }
        },
        onSuccess: (result, variables) => {
            toast.success(`Batch transaction proposal created!`, {
                description: `${variables.operations.length} operations proposed. Use Safe interface to sign and execute.`,
                action: {
                    label: "Open Safe App",
                    onClick: () => window.open(`https://app.safe.global/transactions/queue?safe=${safeConfig.address}`, '_blank')
                }
            })
        },
        onError: (error: Error) => {
            toast.error("Failed to create batch operation", {
                description: error.message,
            })
        },
    })
}
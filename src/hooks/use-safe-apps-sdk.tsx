"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Address, encodeFunctionData, parseUnits } from "viem"
import { useAccount } from "wagmi"
import SafeAppsSDK, { BaseTransaction } from "@safe-global/safe-apps-sdk"

import { PYUSD_ADDRESS, PYUSDX_ADDRESS, SUPER_TOKEN_ABI } from "@/lib/contract"
import { useSafeConfig } from "@/store/safe"
import { parseAbi } from "viem"

const PYUSD_ABI = parseAbi([
    'function approve(address spender, uint256 amount) returns (bool)',
])

// Initialize Safe Apps SDK
const sdk = new SafeAppsSDK()

/**
 * Check if we're running inside Safe iframe
 */
const isInSafeContext = () => {
    try {
        return window.parent !== window && window.parent.location.hostname.includes('safe.global')
    } catch (e) {
        // Cross-origin access blocked, likely in iframe
        return window.parent !== window
    }
}

/**
 * Get development safe info for testing
 */
const getDevelopmentSafeInfo = async () => {
    // For development testing - replace with actual Safe address
    const devSafeAddress = "0x1234567890123456789012345678901234567890" // Replace with your Safe address
    return {
        safeAddress: devSafeAddress,
        chainId: 11155111, // Sepolia
        threshold: 2,
        owners: ["0x1234567890123456789012345678901234567890"], // Replace with actual owners
        isReadOnly: false
    }
}

/**
 * Hook for Safe Apps SDK token operations using official SDK
 */
export const useSafeAppsTokenOperations = () => {
    const { address } = useAccount()
    const { safeConfig, addPendingTransaction, isSigner } = useSafeConfig()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            operation,
            tokenAddress,
            amount,
            tokenSymbol,
            spenderAddress,
        }: {
            operation: 'upgrade' | 'downgrade' | 'approve'
            tokenAddress: Address
            amount: bigint
            tokenSymbol: string
            spenderAddress?: Address
        }) => {
            if (!address || !safeConfig) {
                throw new Error("Wallet not connected or Safe not configured")
            }

            if (!isSigner(address)) {
                throw new Error("You are not authorized to create transactions for this Safe")
            }

            let transactions: BaseTransaction[] = []
            let description: string

            switch (operation) {
                case 'upgrade':
                    // For upgrade, we need to call the upgrade function on the SuperToken
                    const upgradeData = encodeFunctionData({
                        abi: SUPER_TOKEN_ABI,
                        functionName: "upgrade",
                        args: [amount]
                    })

                    transactions = [{
                        to: tokenAddress,
                        value: "0",
                        data: upgradeData
                    }]
                    description = `Upgrade ${tokenSymbol} to ${tokenSymbol}x SuperToken`
                    console.log("Creating upgrade transaction:", {
                        to: tokenAddress,
                        amount: amount.toString(),
                        data: upgradeData
                    })
                    break

                case 'downgrade':
                    // For downgrade, we need to call the downgrade function on the SuperToken
                    const downgradeData = encodeFunctionData({
                        abi: SUPER_TOKEN_ABI,
                        functionName: "downgrade",
                        args: [amount]
                    })

                    transactions = [{
                        to: tokenAddress,
                        value: "0",
                        data: downgradeData
                    }]
                    description = `Downgrade ${tokenSymbol} to ${tokenSymbol.replace('x', '')} base token`
                    console.log("Creating downgrade transaction:", {
                        to: tokenAddress,
                        amount: amount.toString(),
                        data: downgradeData
                    })
                    break

                case 'approve':
                    if (!spenderAddress) {
                        throw new Error("Spender address required for approval")
                    }

                    const approveData = encodeFunctionData({
                        abi: PYUSD_ABI,
                        functionName: "approve",
                        args: [spenderAddress, amount]
                    })

                    transactions = [{
                        to: tokenAddress,
                        value: "0",
                        data: approveData
                    }]
                    description = `Approve ${tokenSymbol} spending`
                    console.log("Creating approve transaction:", {
                        to: tokenAddress,
                        spender: spenderAddress,
                        amount: amount.toString(),
                        data: approveData
                    })
                    break

                default:
                    throw new Error(`Unknown operation: ${operation}`)
            }

            // Check if we're in Safe context
            const inSafeContext = isInSafeContext()

            if (!inSafeContext) {
                // Development mode - provide instructions
                throw new Error(`Safe Apps SDK requires running inside Safe interface. 

🔧 To test Safe integration:
1. Go to https://app.safe.global
2. Access your Safe wallet  
3. Go to Apps → Add Custom App
4. Enter: http://localhost:3001
5. Open the app within Safe

Current URL: ${window.location.href}
Safe Context: ${inSafeContext ? 'Yes ✅' : 'No ❌'}

For development testing, this transaction would be:
- Operation: ${operation}
- Token: ${tokenAddress}
- Amount: ${amount.toString()}`)
            }

            // Send transactions using Safe Apps SDK
            console.log("Sending transactions to Safe Apps SDK:", transactions)
            const response = await sdk.txs.send({ txs: transactions })

            console.log("Safe Apps SDK response:", response)

            // Store transaction info locally for UI tracking
            addPendingTransaction({
                type: "upgrade_token",
                description,
                to: tokenAddress,
                signatures: [],
                requiredSignatures: safeConfig.threshold,
                createdBy: address,
                status: "pending",
                nonce: 0, // Safe will handle nonce
                safeTransactionHash: response.safeTxHash,
                tokenSymbol,
                data: JSON.stringify(transactions),
            })

            return {
                safeTxHash: response.safeTxHash,
                transactions,
                submittedToSafe: true
            }
        },
        onSuccess: (result, variables) => {
            queryClient.invalidateQueries({ queryKey: ["token-balances"] })
            queryClient.invalidateQueries({ queryKey: ["pending-transactions"] })

            const operationName = variables.operation === 'upgrade' ? 'Upgrade' :
                variables.operation === 'downgrade' ? 'Downgrade' : 'Approval'

            const tokenInfo = variables.operation === 'upgrade'
                ? `${variables.tokenSymbol} → ${variables.tokenSymbol}x`
                : variables.operation === 'downgrade'
                    ? `${variables.tokenSymbol} → ${variables.tokenSymbol.replace('x', '')}`
                    : `${variables.tokenSymbol} approval`

            toast.success(`${operationName} transaction created! 🎉`, {
                description: `${tokenInfo} transaction submitted to Safe. SafeTxHash: ${result.safeTxHash.slice(0, 10)}...`,
                duration: 8000,
                action: {
                    label: "View in Safe",
                    onClick: () => {
                        window.open(`https://app.safe.global/transactions/queue?safe=${safeConfig?.address}`, '_blank')
                    }
                }
            })

            // Additional info toast
            setTimeout(() => {
                toast.info(`💡 Transaction ready for signing`, {
                    description: "The transaction is now in your Safe's queue and ready for signatures.",
                    duration: 5000
                })
            }, 2000)
        },
        onError: (error: Error, variables) => {
            console.error(`Token ${variables.operation} error:`, error)
            toast.error(`Failed to ${variables.operation} token`, {
                description: error.message.includes('not in an iframe')
                    ? 'Safe Apps SDK requires running inside Safe interface. Please access through Safe app.'
                    : error.message,
            })
        },
    })
}

/**
 * Hook to get Safe info using Safe Apps SDK
 */
export const useSafeAppsInfo = () => {
    return useMutation({
        mutationFn: async () => {
            try {
                const safeInfo = await sdk.safe.getInfo()
                const chainInfo = await sdk.safe.getChainInfo()

                console.log("Safe Apps SDK - Safe Info:", safeInfo)
                console.log("Safe Apps SDK - Chain Info:", chainInfo)

                return { safeInfo, chainInfo }
            } catch (error) {
                console.error("Failed to get Safe info:", error)
                throw error
            }
        },
        onSuccess: (result) => {
            toast.success("Connected to Safe!", {
                description: `Safe: ${result.safeInfo.safeAddress.slice(0, 10)}... on chain ${result.chainInfo.chainId}`,
            })
        },
        onError: (error: Error) => {
            console.error("Safe Apps SDK connection error:", error)
            toast.error("Failed to connect to Safe", {
                description: error.message.includes('not in an iframe')
                    ? 'This app needs to run inside the Safe interface.'
                    : error.message,
            })
        },
    })
}

/**
 * Hook for stream operations using Safe Apps SDK
 */
export const useSafeAppsStreamOperations = () => {
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
            if (!address || !safeConfig) {
                throw new Error("Wallet not connected or Safe not configured")
            }

            if (!isSigner(address)) {
                throw new Error("You are not authorized to create transactions for this Safe")
            }

            let transactions: BaseTransaction[] = []
            let description: string

            // Create transaction data based on operation type
            // This would need to be implemented based on your Superfluid contract calls
            switch (operation) {
                case 'create':
                    if (!flowRate) throw new Error("Flow rate required for create operation")

                    // Example transaction for creating stream
                    // You'll need to replace this with actual Superfluid contract calls
                    transactions = [{
                        to: token,
                        value: "0",
                        data: "0x" // Encode your create stream function call here
                    }]
                    description = `Start payment stream to ${employeeName || receiver} (${tokenSymbol})`
                    break

                case 'update':
                    if (!flowRate) throw new Error("Flow rate required for update operation")

                    transactions = [{
                        to: token,
                        value: "0",
                        data: "0x" // Encode your update stream function call here
                    }]
                    description = `Update payment stream to ${employeeName || receiver} (${tokenSymbol})`
                    break

                case 'delete':
                    transactions = [{
                        to: token,
                        value: "0",
                        data: "0x" // Encode your delete stream function call here
                    }]
                    description = `Stop payment stream to ${employeeName || receiver} (${tokenSymbol})`
                    break
            }

            // Send transactions using Safe Apps SDK
            const response = await sdk.txs.send({ txs: transactions })

            // Store transaction info locally
            addPendingTransaction({
                type: operation === 'create' ? "start_stream" : operation === 'delete' ? "stop_stream" : "transfer",
                description,
                to: token,
                signatures: [],
                requiredSignatures: safeConfig.threshold,
                createdBy: address,
                status: "pending",
                nonce: 0,
                safeTransactionHash: response.safeTxHash,
                employeeId,
                employeeName,
                tokenSymbol,
                flowRate: flowRate?.toString(),
                data: JSON.stringify(transactions),
            })

            return { safeTxHash: response.safeTxHash }
        },
        onSuccess: (result, variables) => {
            queryClient.invalidateQueries({ queryKey: ["streams"] })

            toast.success(`Stream ${variables.operation} transaction created!`, {
                description: `SafeTxHash: ${result.safeTxHash.slice(0, 10)}...`,
                action: {
                    label: "Open Safe App",
                    onClick: () => window.open(`https://app.safe.global/transactions/queue?safe=${safeConfig?.address}`, '_blank')
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

export { sdk as safeAppsSDK }
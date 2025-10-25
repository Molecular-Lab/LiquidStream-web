"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Address, encodeFunctionData, parseUnits } from "viem"
import { useAccount } from "wagmi"
import { useCallback, useState, useEffect } from "react"
import SafeAppsSDK, { BaseTransaction } from "@safe-global/safe-apps-sdk"

import { PYUSD_ADDRESS, PYUSDX_ADDRESS, SUPER_TOKEN_ABI, HOST_ADDRESS, HOST_ABI, CFAV1_ADDRESS, CFA_ABI, buildCreateFlowOperation, buildUpdateFlowOperation, buildDeleteFlowOperation } from "@/lib/contract"
import { useSafe } from "@/store/safe"
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
    const { safeConfig, addPendingTransaction, isSigner } = useSafe()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            operation,
            tokenAddress,
            amount,
            tokenSymbol,
            spenderAddress,
        }: {
            operation: 'upgrade' | 'downgrade' | 'approve' | 'upgrade-only'
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
                    // For upgrade, we need TWO transactions: approve PYUSD + upgrade to PYUSDx
                    // PYUSD has 6 decimals, PYUSDx has 18 decimals

                    // Calculate the PYUSD amount (6 decimals) from PYUSDx amount (18 decimals)
                    const pyusdAmount = amount / BigInt(10 ** 12) // Convert 18 decimals back to 6 decimals

                    // Step 1: Approve PYUSD spending by PYUSDx contract (6 decimals)
                    const upgradeApproveData = encodeFunctionData({
                        abi: PYUSD_ABI,
                        functionName: "approve",
                        args: [tokenAddress, pyusdAmount] // tokenAddress is PYUSDx, amount in PYUSD (6 decimals)
                    })

                    // Step 2: Call upgrade function on PYUSDx contract (18 decimals)
                    const upgradeData = encodeFunctionData({
                        abi: SUPER_TOKEN_ABI,
                        functionName: "upgrade",
                        args: [amount] // amount is already in 18 decimals
                    })

                    transactions = [
                        {
                            to: PYUSD_ADDRESS, // Approve PYUSD spending (6 decimals)
                            value: "0",
                            data: upgradeApproveData
                        },
                        {
                            to: tokenAddress, // Call upgrade on PYUSDx (18 decimals)
                            value: "0",
                            data: upgradeData
                        }
                    ]
                    description = `Approve ${pyusdAmount.toString()} PYUSD and upgrade to ${amount.toString()} PYUSDx`
                    console.log("Creating upgrade batch transaction:", {
                        approve: { to: PYUSD_ADDRESS, amount: pyusdAmount.toString() + " (6 decimals)" },
                        upgrade: { to: tokenAddress, amount: amount.toString() + " (18 decimals)" }
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

                case 'upgrade-only':
                    // For upgrade-only (when approval already exists), just call upgrade function
                    const upgradeOnlyData = encodeFunctionData({
                        abi: SUPER_TOKEN_ABI,
                        functionName: "upgrade",
                        args: [amount] // amount is already in 18 decimals
                    })

                    transactions = [{
                        to: tokenAddress, // PYUSDx contract
                        value: "0",
                        data: upgradeOnlyData
                    }]
                    description = `Upgrade to ${tokenSymbol}x SuperToken (pre-approved)`
                    console.log("Creating upgrade-only transaction:", {
                        to: tokenAddress,
                        amount: amount.toString() + " (18 decimals)",
                        data: upgradeOnlyData
                    })
                    break

                case 'approve':
                    if (!spenderAddress) {
                        throw new Error("Spender address required for approval")
                    }

                    const standaloneApproveData = encodeFunctionData({
                        abi: PYUSD_ABI,
                        functionName: "approve",
                        args: [spenderAddress, amount]
                    })

                    transactions = [{
                        to: tokenAddress,
                        value: "0",
                        data: standaloneApproveData
                    }]
                    description = `Approve ${tokenSymbol} spending`
                    console.log("Creating approve transaction:", {
                        to: tokenAddress,
                        spender: spenderAddress,
                        amount: amount.toString(),
                        data: standaloneApproveData
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
    const { safeConfig, isSigner } = useSafe()

    const executeStreamOperation = useCallback(async ({
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
        try {
            if (!isInSafeContext()) {
                throw new Error("This operation requires running inside Safe interface")
            }

            if (!address || !safeConfig) {
                throw new Error("Wallet not connected or Safe not configured")
            }

            if (!isSigner(address)) {
                throw new Error("You are not authorized to create transactions for this Safe")
            }

            let transactions: BaseTransaction[] = []
            let description: string

            // Create transaction data based on operation type
            switch (operation) {
                case 'create':
                    if (!flowRate) throw new Error("Flow rate required for create operation")

                    // Create Superfluid stream operation
                    const createOperation = buildCreateFlowOperation(token, receiver, flowRate)

                    const createStreamData = encodeFunctionData({
                        abi: HOST_ABI,
                        functionName: "batchCall",
                        args: [[createOperation]]
                    })

                    transactions = [{
                        to: HOST_ADDRESS,
                        value: "0",
                        data: createStreamData
                    }]
                    description = `Start payment stream to ${employeeName || receiver} (${tokenSymbol})`
                    console.log("Creating start stream transaction:", {
                        to: HOST_ADDRESS,
                        receiver,
                        flowRate: flowRate.toString(),
                        data: createStreamData
                    })
                    break

                case 'update':
                    if (!flowRate) throw new Error("Flow rate required for update operation")

                    // Update Superfluid stream operation
                    const updateOperation = buildUpdateFlowOperation(token, receiver, flowRate)

                    const updateStreamData = encodeFunctionData({
                        abi: HOST_ABI,
                        functionName: "batchCall",
                        args: [[updateOperation]]
                    })

                    transactions = [{
                        to: HOST_ADDRESS,
                        value: "0",
                        data: updateStreamData
                    }]
                    description = `Update payment stream to ${employeeName || receiver} (${tokenSymbol})`
                    console.log("Creating update stream transaction:", {
                        to: HOST_ADDRESS,
                        receiver,
                        flowRate: flowRate.toString(),
                        data: updateStreamData
                    })
                    break

                case 'delete':
                    // Delete Superfluid stream operation (requires sender address)
                    if (!address) throw new Error("Sender address required for delete operation")

                    const deleteOperation = buildDeleteFlowOperation(token, address, receiver)

                    const deleteStreamData = encodeFunctionData({
                        abi: HOST_ABI,
                        functionName: "batchCall",
                        args: [[deleteOperation]]
                    })

                    transactions = [{
                        to: HOST_ADDRESS,
                        value: "0",
                        data: deleteStreamData
                    }]
                    description = `Stop payment stream to ${employeeName || receiver} (${tokenSymbol})`
                    console.log("Creating stop stream transaction:", {
                        to: HOST_ADDRESS,
                        sender: address,
                        receiver,
                        data: deleteStreamData
                    })
                    break

                default:
                    throw new Error(`Unknown operation: ${operation}`)
            }

            if (!transactions.length) {
                throw new Error("Failed to generate transaction data")
            }

            // Send transaction to Safe
            const safeTxHash = await sdk.txs.send({
                txs: transactions
            })

            console.log("Stream transaction sent to Safe:", {
                operation,
                description,
                txHash: safeTxHash,
                transactions
            })

            return {
                success: true,
                description,
                txHash: safeTxHash
            }

        } catch (error) {
            console.error("Stream operation failed:", error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Stream operation failed'
            }
        }
    }, [address, safeConfig, isSigner])

    return {
        executeStreamOperation
    }
}

/**
 * Hook to detect and get connected Safe wallet info
 * Prioritizes Safe.global connection over localStorage
 */
export const useConnectedSafeInfo = () => {
    const [safeInfo, setSafeInfo] = useState<{
        safeAddress: string
        chainId: number
        threshold: number
        owners: string[]
        isConnected: boolean
        isInSafeContext: boolean
    } | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const { safeConfig } = useSafe()

    useEffect(() => {
        let mounted = true

        const detectSafe = async () => {
            try {
                // Check if running inside Safe iframe
                const inSafeContext = isInSafeContext()
                
                if (inSafeContext) {
                    // Try to get Safe info from SDK (when app is opened in safe.global)
                    try {
                        const info = await sdk.safe.getInfo()
                        const chainInfo = await sdk.safe.getChainInfo()
                        
                        if (mounted) {
                            setSafeInfo({
                                safeAddress: info.safeAddress,
                                chainId: parseInt(chainInfo.chainId),
                                threshold: info.threshold,
                                owners: info.owners,
                                isConnected: true,
                                isInSafeContext: true
                            })
                            console.log("✅ Connected to Safe from safe.global:", info.safeAddress)
                        }
                    } catch (sdkError) {
                        console.warn("Failed to get Safe info from SDK:", sdkError)
                        // Fallback to localStorage if in Safe context but SDK fails
                        if (mounted && safeConfig) {
                            setSafeInfo({
                                safeAddress: safeConfig.address,
                                chainId: safeConfig.chainId,
                                threshold: safeConfig.threshold,
                                owners: safeConfig.signers.map(s => s.address),
                                isConnected: true,
                                isInSafeContext: true
                            })
                        }
                    }
                } else {
                    // Not in Safe context, use localStorage config if available
                    if (mounted && safeConfig) {
                        setSafeInfo({
                            safeAddress: safeConfig.address,
                            chainId: safeConfig.chainId,
                            threshold: safeConfig.threshold,
                            owners: safeConfig.signers.map(s => s.address),
                            isConnected: false,
                            isInSafeContext: false
                        })
                        console.log("📦 Using Safe config from localStorage:", safeConfig.address)
                    } else {
                        if (mounted) {
                            setSafeInfo(null)
                        }
                    }
                }
            } catch (error) {
                console.error("Error detecting Safe:", error)
                // Fallback to localStorage
                if (mounted && safeConfig) {
                    setSafeInfo({
                        safeAddress: safeConfig.address,
                        chainId: safeConfig.chainId,
                        threshold: safeConfig.threshold,
                        owners: safeConfig.signers.map(s => s.address),
                        isConnected: false,
                        isInSafeContext: false
                    })
                }
            } finally {
                if (mounted) {
                    setIsLoading(false)
                }
            }
        }

        detectSafe()

        return () => {
            mounted = false
        }
    }, [safeConfig])

    return {
        safeInfo,
        isLoading,
        isInSafeContext: safeInfo?.isInSafeContext || false,
        hasConnectedSafe: !!safeInfo?.safeAddress,
    }
}

export { sdk as safeAppsSDK }
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Address, encodeFunctionData, parseUnits } from "viem"
import { useAccount, useWriteContract } from "wagmi"
import { parseAbi } from "viem"

import { PYUSD_ADDRESS, PYUSDX_ADDRESS, SUPER_TOKEN_ABI } from "@/lib/contract"

const PYUSD_ABI = parseAbi([
    'function approve(address spender, uint256 amount) returns (bool)',
])

/**
 * Hook for single wallet token operations (upgrade/downgrade/approve)
 */
export const useSingleWalletTokenOperations = () => {
    const { writeContractAsync } = useWriteContract()
    const { address } = useAccount()
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
            if (!address) throw new Error("Wallet not connected")

            console.log(`Executing ${operation} with direct wallet:`, {
                operation,
                tokenAddress,
                amount: amount.toString(),
                tokenSymbol
            })

            let hash: string

            switch (operation) {
                case 'upgrade':
                    // Upgrade PYUSD to PYUSDx
                    hash = await writeContractAsync({
                        address: PYUSDX_ADDRESS,
                        abi: SUPER_TOKEN_ABI,
                        functionName: "upgrade",
                        args: [amount],
                    } as any)
                    console.log("Upgrade transaction completed:", { hash })
                    break

                case 'downgrade':
                    // Downgrade PYUSDx to PYUSD
                    hash = await writeContractAsync({
                        address: PYUSDX_ADDRESS,
                        abi: SUPER_TOKEN_ABI,
                        functionName: "downgrade",
                        args: [amount],
                    } as any)
                    console.log("Downgrade transaction completed:", { hash })
                    break

                case 'approve':
                    if (!spenderAddress) {
                        throw new Error("Spender address required for approval")
                    }
                    // Approve token spending
                    hash = await writeContractAsync({
                        address: tokenAddress,
                        abi: PYUSD_ABI,
                        functionName: "approve",
                        args: [spenderAddress, amount],
                    } as any)
                    console.log("Approval transaction completed:", { hash })
                    break

                default:
                    throw new Error(`Unknown operation: ${operation}`)
            }

            return { hash, operation, tokenSymbol, amount }
        },
        onSuccess: (result, variables) => {
            queryClient.invalidateQueries({ queryKey: ["token-balances"] })

            const operationName = variables.operation === 'upgrade' ? 'Upgrade' :
                variables.operation === 'downgrade' ? 'Downgrade' : 'Approval'

            let description = ""
            if (variables.operation === 'upgrade') {
                description = `Successfully upgraded ${variables.tokenSymbol} to ${variables.tokenSymbol}x SuperToken`
            } else if (variables.operation === 'downgrade') {
                description = `Successfully downgraded ${variables.tokenSymbol} to ${variables.tokenSymbol.replace('x', '')} base token`
            } else {
                description = `Successfully approved ${variables.tokenSymbol} spending`
            }

            toast.success(`${operationName} completed! ✅`, {
                description: `${description} - Transaction: ${result.hash.slice(0, 10)}...`,
                duration: 5000,
                action: {
                    label: "View on Explorer",
                    onClick: () => {
                        window.open(`https://sepolia.etherscan.io/tx/${result.hash}`, '_blank')
                    }
                }
            })
        },
        onError: (error: Error, variables) => {
            console.error(`Token ${variables.operation} error:`, error)

            let errorMessage = error.message
            if (error.message.includes('User rejected')) {
                errorMessage = 'Transaction was cancelled by user'
            } else if (error.message.includes('insufficient funds')) {
                errorMessage = 'Insufficient funds for this transaction'
            } else if (error.message.includes('allowance')) {
                errorMessage = 'Token allowance insufficient'
            }

            toast.error(`Failed to ${variables.operation} token`, {
                description: errorMessage,
                duration: 6000
            })
        },
    })
}

/**
 * Hook for combined approval and upgrade in single wallet mode
 */
export const useSingleWalletUpgradeWithApproval = () => {
    const { mutate: tokenOperation } = useSingleWalletTokenOperations()

    return useMutation({
        mutationFn: async ({
            amount,
            tokenSymbol = "PYUSD",
        }: {
            amount: bigint
            tokenSymbol?: string
        }) => {
            // First approve PYUSDx contract to spend PYUSD
            await new Promise<void>((resolve, reject) => {
                tokenOperation({
                    operation: 'approve',
                    tokenAddress: PYUSD_ADDRESS,
                    amount,
                    tokenSymbol,
                    spenderAddress: PYUSDX_ADDRESS,
                }, {
                    onSuccess: () => resolve(),
                    onError: (error) => reject(error),
                })
            })

            // Small delay to ensure approval is processed
            await new Promise(resolve => setTimeout(resolve, 2000))

            // Then upgrade to PYUSDx
            await new Promise<void>((resolve, reject) => {
                tokenOperation({
                    operation: 'upgrade',
                    tokenAddress: PYUSDX_ADDRESS,
                    amount,
                    tokenSymbol: tokenSymbol + 'x',
                }, {
                    onSuccess: () => resolve(),
                    onError: (error) => reject(error),
                })
            })

            return { success: true, amount, tokenSymbol }
        },
        onSuccess: (result) => {
            toast.success("Upgrade process completed! 🎉", {
                description: `Successfully upgraded ${result.tokenSymbol} to ${result.tokenSymbol}x in 2 steps`,
                duration: 6000
            })
        },
        onError: (error: Error) => {
            toast.error("Upgrade process failed", {
                description: error.message,
                duration: 6000
            })
        },
    })
}
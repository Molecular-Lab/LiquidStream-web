import { Address, encodeFunctionData, keccak256, encodeAbiParameters } from "viem"

import { CFA_ABI, SUPER_TOKEN_ABI, CFAV1_ADDRESS } from "./contract"

/**
 * Simplified Safe transaction data structure
 */
export interface SafeTransactionData {
  to: Address
  value: string
  data: `0x${string}`
  operation: number
  safeTxGas: string
  baseGas: string
  gasPrice: string
  gasToken: Address
  refundReceiver: Address
  nonce: number
}

/**
 * Helper class for creating Safe transaction data for Superfluid operations
 * This creates transaction data that can be submitted to Safe API/UI
 */
export class SafeTransactionBuilder {
  private safeAddress: Address

  constructor(safeAddress: Address) {
    this.safeAddress = safeAddress
  }

  /**
   * Create transaction data for starting a payment stream
   */
  async createStreamTransaction(
    token: Address,
    receiver: Address,
    flowRate: bigint,
    userData: `0x${string}` = "0x"
  ): Promise<SafeTransactionData> {
    const data = encodeFunctionData({
      abi: CFA_ABI,
      functionName: "createFlow",
      args: [token, receiver, flowRate, userData],
    })

    return {
      to: CFAV1_ADDRESS,
      value: "0",
      data,
      operation: 0, // CALL
      safeTxGas: "0",
      baseGas: "0",
      gasPrice: "0",
      gasToken: "0x0000000000000000000000000000000000000000" as Address,
      refundReceiver: "0x0000000000000000000000000000000000000000" as Address,
      nonce: 0, // Will be set by Safe
    }
  }

  /**
   * Create transaction data for updating a stream
   */
  async updateStreamTransaction(
    token: Address,
    receiver: Address,
    flowRate: bigint,
    userData: `0x${string}` = "0x"
  ): Promise<SafeTransactionData> {
    const data = encodeFunctionData({
      abi: CFA_ABI,
      functionName: "updateFlow",
      args: [token, receiver, flowRate, userData],
    })

    return {
      to: CFAV1_ADDRESS,
      value: "0",
      data,
      operation: 0,
      safeTxGas: "0",
      baseGas: "0",
      gasPrice: "0",
      gasToken: "0x0000000000000000000000000000000000000000" as Address,
      refundReceiver: "0x0000000000000000000000000000000000000000" as Address,
      nonce: 0,
    }
  }

  /**
   * Create transaction data for stopping a stream
   */
  async deleteStreamTransaction(
    token: Address,
    receiver: Address,
    userData: `0x${string}` = "0x"
  ): Promise<SafeTransactionData> {
    const data = encodeFunctionData({
      abi: CFA_ABI,
      functionName: "deleteFlow",
      args: [token, this.safeAddress, receiver, userData],
    })

    return {
      to: CFAV1_ADDRESS,
      value: "0",
      data,
      operation: 0,
      safeTxGas: "0",
      baseGas: "0",
      gasPrice: "0",
      gasToken: "0x0000000000000000000000000000000000000000" as Address,
      refundReceiver: "0x0000000000000000000000000000000000000000" as Address,
      nonce: 0,
    }
  }

  /**
   * Create transaction data for upgrading tokens (PYUSD -> PYUSDx)
   */
  async upgradeTokenTransaction(
    amount: bigint,
    superTokenAddress: Address
  ): Promise<SafeTransactionData> {
    if (amount <= 0n) {
      throw new Error("Upgrade amount must be greater than 0")
    }

    const data = encodeFunctionData({
      abi: SUPER_TOKEN_ABI,
      functionName: "upgrade",
      args: [amount],
    })

    console.log("Creating upgrade transaction:", {
      to: superTokenAddress,
      amount: amount.toString(),
      data
    })

    return {
      to: superTokenAddress,
      value: "0",
      data,
      operation: 0, // CALL operation
      safeTxGas: "0",
      baseGas: "0",
      gasPrice: "0",
      gasToken: "0x0000000000000000000000000000000000000000" as Address,
      refundReceiver: "0x0000000000000000000000000000000000000000" as Address,
      nonce: 0, // Will be set by Safe API
    }
  }

  /**
   * Create transaction data for downgrading tokens (PYUSDx -> PYUSD)
   */
  async downgradeTokenTransaction(
    amount: bigint,
    superTokenAddress: Address
  ): Promise<SafeTransactionData> {
    if (amount <= 0n) {
      throw new Error("Downgrade amount must be greater than 0")
    }

    const data = encodeFunctionData({
      abi: SUPER_TOKEN_ABI,
      functionName: "downgrade",
      args: [amount],
    })

    console.log("Creating downgrade transaction:", {
      to: superTokenAddress,
      amount: amount.toString(),
      data
    })

    return {
      to: superTokenAddress,
      value: "0",
      data,
      operation: 0, // CALL operation
      safeTxGas: "0",
      baseGas: "0",
      gasPrice: "0",
      gasToken: "0x0000000000000000000000000000000000000000" as Address,
      refundReceiver: "0x0000000000000000000000000000000000000000" as Address,
      nonce: 0, // Will be set by Safe API
    }
  }

  /**
   * Create transaction data for token approval
   */
  async approveTokenTransaction(
    tokenAddress: Address,
    spenderAddress: Address,
    amount: bigint,
    tokenAbi: any
  ): Promise<SafeTransactionData> {
    const data = encodeFunctionData({
      abi: tokenAbi,
      functionName: "approve",
      args: [spenderAddress, amount],
    })

    return {
      to: tokenAddress,
      value: "0",
      data,
      operation: 0,
      safeTxGas: "0",
      baseGas: "0",
      gasPrice: "0",
      gasToken: "0x0000000000000000000000000000000000000000" as Address,
      refundReceiver: "0x0000000000000000000000000000000000000000" as Address,
      nonce: 0,
    }
  }

  /**
   * Get transaction hash for off-chain signature collection
   */
  async getTransactionHash(transactionData: SafeTransactionData): Promise<string> {
    // Simple hash for demo purposes - in production, use Safe's transaction hash calculation
    const encoded = encodeAbiParameters(
      [
        { type: "address", name: "to" },
        { type: "uint256", name: "value" },
        { type: "bytes", name: "data" },
        { type: "uint8", name: "operation" },
        { type: "uint256", name: "nonce" }
      ],
      [
        transactionData.to,
        BigInt(transactionData.value),
        transactionData.data,
        transactionData.operation,
        BigInt(transactionData.nonce)
      ]
    )
    
    return keccak256(encoded)
  }

  /**
   * Get transaction data for Safe UI/API integration
   */
  async getTransactionData(transactionData: SafeTransactionData) {
    return transactionData
  }

  /**
   * Create batch transactions for multiple stream operations
   */
  async batchStreamOperations(
    operations: Array<{
      type: 'create' | 'update' | 'delete'
      token: Address
      receiver: Address
      flowRate?: bigint
      userData?: `0x${string}`
    }>
  ): Promise<SafeTransactionData[]> {
    const transactions = []

    for (const operation of operations) {
      let txData: SafeTransactionData

      switch (operation.type) {
        case 'create':
          if (!operation.flowRate) throw new Error('Flow rate required for create operation')
          txData = await this.createStreamTransaction(
            operation.token,
            operation.receiver,
            operation.flowRate,
            operation.userData || "0x"
          )
          break

        case 'update':
          if (!operation.flowRate) throw new Error('Flow rate required for update operation')
          txData = await this.updateStreamTransaction(
            operation.token,
            operation.receiver,
            operation.flowRate,
            operation.userData || "0x"
          )
          break

        case 'delete':
          txData = await this.deleteStreamTransaction(
            operation.token,
            operation.receiver,
            operation.userData || "0x"
          )
          break

        default:
          throw new Error(`Unknown operation type: ${operation.type}`)
      }

      transactions.push(txData)
    }

    return transactions
  }
}

/**
 * Create a Safe transaction builder instance (simplified)
 */
export async function createSafeTransactionBuilder(
  safeAddress: Address,
  walletClient?: any
): Promise<SafeTransactionBuilder> {
  return new SafeTransactionBuilder(safeAddress)
}

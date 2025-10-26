import { Address, createPublicClient, http, parseAbi, encodeFunctionData, encodeAbiParameters, parseAbiParameters } from "viem"
import { sepolia } from "viem/chains"

import {
  CFA_ABI as CFA_ABI_STRINGS,
  SuperToken_ABI,
  SuperfluidHost_ABI,
} from "@/asset/abi"

export const PYUSD_ADDRESS = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9" as Address
export const PYUSDX_ADDRESS = "0x8fece7605C7475cc5f1d697D8915408986CA9fB6" as Address // Super PYUSD on Sepolia (update with actual address)

export const CFAV1_ADDRESS = "0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef" as Address // CFA (Constant Flow Agreement)
export const HOST_ADDRESS = "0x109412E3C84f0539b43d39dB691B08c90f58dC7c" as Address // Superfluid Host

// Parse ABIs from asset/abi.ts
export const CFA_ABI = parseAbi(CFA_ABI_STRINGS)
export const SUPER_TOKEN_ABI = parseAbi(SuperToken_ABI)
export const HOST_ABI = parseAbi(SuperfluidHost_ABI)

// Operation types for Superfluid batchCall
export const OPERATION_TYPE = {
  SUPERFLUID_CALL_AGREEMENT: 201, // For CFA operations (createFlow, updateFlow, deleteFlow)
  SUPERFLUID_CALL_APP_ACTION: 202,
} as const

// Helper to build batchCall operations
export interface Operation {
  operationType: number
  target: Address
  data: `0x${string}`
}

/**
 * Build createFlow operation for batchCall
 * @param token - SuperToken address
 * @param receiver - Receiver address
 * @param flowRate - Flow rate in wei/second
 * @returns Operation object for batchCall
 */
export function buildCreateFlowOperation(
  token: Address,
  receiver: Address,
  flowRate: bigint
): Operation {
  // Encode createFlow function call
  const createFlowCallData = encodeFunctionData({
    abi: CFA_ABI,
    functionName: "createFlow",
    args: [token, receiver, flowRate as any, "0x"],
  })

  // Encode operation data (callData, userData)
  const operationData = encodeAbiParameters(
    parseAbiParameters("bytes, bytes"),
    [createFlowCallData, "0x"]
  )

  return {
    operationType: OPERATION_TYPE.SUPERFLUID_CALL_AGREEMENT,
    target: CFAV1_ADDRESS,
    data: operationData,
  }
}

/**
 * Build updateFlow operation for batchCall
 */
export function buildUpdateFlowOperation(
  token: Address,
  receiver: Address,
  flowRate: bigint
): Operation {
  const updateFlowCallData = encodeFunctionData({
    abi: CFA_ABI,
    functionName: "updateFlow",
    args: [token, receiver, flowRate as any, "0x"],
  })

  const operationData = encodeAbiParameters(
    parseAbiParameters("bytes, bytes"),
    [updateFlowCallData, "0x"]
  )

  return {
    operationType: OPERATION_TYPE.SUPERFLUID_CALL_AGREEMENT,
    target: CFAV1_ADDRESS,
    data: operationData,
  }
}

/**
 * Build deleteFlow operation for batchCall
 */
export function buildDeleteFlowOperation(
  token: Address,
  sender: Address,
  receiver: Address
): Operation {
  const deleteFlowCallData = encodeFunctionData({
    abi: CFA_ABI,
    functionName: "deleteFlow",
    args: [token, sender, receiver, "0x"],
  })

  const operationData = encodeAbiParameters(
    parseAbiParameters("bytes, bytes"),
    [deleteFlowCallData, "0x"]
  )

  return {
    operationType: OPERATION_TYPE.SUPERFLUID_CALL_AGREEMENT,
    target: CFAV1_ADDRESS,
    data: operationData,
  }
}

export const ContractConfigs = {
  // Create a new payment stream
  createFlow: (
    token: Address,
    receiver: Address,
    flowRate: bigint,
    userData: `0x${string}` = "0x"
  ) => ({
    address: CFAV1_ADDRESS,
    abi: CFA_ABI,
    functionName: "createFlow",
    args: [token, receiver, flowRate, userData],
  }),

  // Update an existing stream
  updateFlow: (
    token: Address,
    receiver: Address,
    flowRate: bigint,
    userData: `0x${string}` = "0x"
  ) => ({
    address: CFAV1_ADDRESS,
    abi: CFA_ABI,
    functionName: "updateFlow",
    args: [token, receiver, flowRate, userData],
  }),

  // Delete/stop a stream
  deleteFlow: (
    token: Address,
    sender: Address,
    receiver: Address,
    userData: `0x${string}` = "0x"
  ) => ({
    address: CFAV1_ADDRESS,
    abi: CFA_ABI,
    functionName: "deleteFlow",
    args: [token, sender, receiver, userData],
  }),

  // Get flow details
  getFlow: (token: Address, sender: Address, receiver: Address) => ({
    address: CFAV1_ADDRESS,
    abi: CFA_ABI,
    functionName: "getFlow",
    args: [token, sender, receiver],
  }),
}

export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
})

// Utility function to calculate flow rate from annual salary
export function calculateFlowRate(annualSalary: number): bigint {
  // Annual salary in USD -> per second in smallest unit (18 decimals for super tokens)
  // flowRate = (annualSalary * 10^18) / (365.25 * 24 * 60 * 60)
  const secondsPerYear = 365.25 * 24 * 60 * 60
  const salaryInWei = BigInt(Math.floor(annualSalary * 1e18))
  return salaryInWei / BigInt(Math.floor(secondsPerYear))
}

// Utility to calculate annual salary from flow rate
export function flowRateToAnnualSalary(flowRate: bigint): number {
  const secondsPerYear = 365.25 * 24 * 60 * 60
  const annualWei = flowRate * BigInt(Math.floor(secondsPerYear))
  return Number(annualWei) / 1e18
}

// Token addresses export for easy access
export const tokenAbi = SUPER_TOKEN_ABI
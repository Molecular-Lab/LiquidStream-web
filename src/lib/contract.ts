import { createConfig, getAccount, http } from "@wagmi/core"
import { sepolia, scrollSepolia } from "@wagmi/core/chains"
import { Address, createPublicClient, parseAbi } from "viem"

// Superfluid contract addresses on Sepolia testnet
export const SuperfluidContracts = {
  // Sepolia
  cfaV1: "0x18fB38404DADeE1727Be4b805c5b242B5413Fa40" as Address, // CFA (Constant Flow Agreement)
  host: "0x109412E3C84f0539b43d39dB691B08c90f58dC7c" as Address, // Superfluid Host
  // Super Tokens
  pyusdx: "0x42bb40bF79730451B11f6De1CbA222F17b87Afd7" as Address, // Super PYUSD on Sepolia (update with actual address)
}

export const contractConfig = createConfig({
  chains: [sepolia, scrollSepolia],
  transports: {
    [sepolia.id]: http(),
    [scrollSepolia.id]: http(),
  },
})

export const { connector, address: AccountAddress } = getAccount(contractConfig)

// Superfluid CFA (Constant Flow Agreement) ABI - simplified for essential operations
export const CFA_ABI = parseAbi([
  // Read functions
  "function getFlow(address token, address sender, address receiver) view returns (uint256 timestamp, int96 flowRate, uint256 deposit, uint256 owedDeposit)",
  "function getNetFlow(address token, address account) view returns (int96 flowRate)",
  "function getAccountFlowInfo(address token, address account) view returns (uint256 timestamp, int96 flowRate, uint256 deposit, uint256 owedDeposit)",
  
  // Write functions
  "function createFlow(address token, address receiver, int96 flowRate, bytes userData) returns (bool)",
  "function updateFlow(address token, address receiver, int96 flowRate, bytes userData) returns (bool)",
  "function deleteFlow(address token, address sender, address receiver, bytes userData) returns (bool)",
  
  // Events
  "event FlowUpdated(address indexed token, address indexed sender, address indexed receiver, int96 flowRate, int256 totalSenderFlowRate, int256 totalReceiverFlowRate, bytes userData)",
])

// ERC20 Token ABI for Super Tokens
export const SUPER_TOKEN_ABI = parseAbi([
  "function balanceOf(address account) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transfer(address recipient, uint256 amount) returns (bool)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  
  // Super Token specific
  "function getUnderlyingToken() view returns (address)",
  "function upgrade(uint256 amount) returns (bool)",
  "function downgrade(uint256 amount) returns (bool)",
  "function realtimeBalanceOf(address account, uint256 timestamp) view returns (int256 availableBalance, uint256 deposit, uint256 owedDeposit)",
])

// Superfluid Host ABI
export const HOST_ABI = parseAbi([
  "function callAgreement(address agreementClass, bytes callData, bytes userData) returns (bytes returnedData)",
  "function getAgreementClass(bytes32 agreementType) view returns (address agreementClass)",
])

export const ContractConfigs = {
  // Create a new payment stream
  createFlow: (
    token: Address,
    receiver: Address,
    flowRate: bigint,
    userData: `0x${string}` = "0x"
  ) => ({
    address: SuperfluidContracts.cfaV1,
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
    address: SuperfluidContracts.cfaV1,
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
    address: SuperfluidContracts.cfaV1,
    abi: CFA_ABI,
    functionName: "deleteFlow",
    args: [token, sender, receiver, userData],
  }),

  // Get flow details
  getFlow: (token: Address, sender: Address, receiver: Address) => ({
    address: SuperfluidContracts.cfaV1,
    abi: CFA_ABI,
    functionName: "getFlow",
    args: [token, sender, receiver],
  }),
}

export const client = createPublicClient({
  chain: sepolia,
  transport: http(),
})

export const contracts = {
  cfaV1: SuperfluidContracts.cfaV1,
  host: SuperfluidContracts.host,
  pyusdx: SuperfluidContracts.pyusdx,
}

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
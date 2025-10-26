// Ready-to-use minimal ABIs (string signatures) used by scripts in this folder.
// Import and pass these arrays into `parseAbi(...)` or use them directly with ethers/viem.

export const SuperToken_ABI = [
  'function upgrade(uint256 amount)',
  'function downgrade(uint256 amount)',
  'function balanceOf(address) view returns (uint256)',
  'function getUnderlyingToken() view returns (address)',
  'function getUnderlyingDecimals() view returns (uint8)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  // realtimeBalanceOfNow is used by checkFlow.ts
  'function realtimeBalanceOfNow(address account) view returns (int256 availableBalance, uint256 deposit, uint256 owedDeposit, uint256 timestamp)',
]

export const ERC20_PYUSD_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
]

export const SuperfluidHost_ABI = [
  'function callAgreement(address agreementClass, bytes callData, bytes userData) returns (bytes returnedData)',
  'function batchCall((uint32 operationType, address target, bytes data)[] operations) payable',
]

export const CFA_ABI = [
  'function createFlow(address token, address receiver, int96 flowRate, bytes ctx) returns (bytes newCtx)',
  'function updateFlow(address token, address receiver, int96 flowRate, bytes ctx) returns (bytes newCtx)',
  'function deleteFlow(address token, address sender, address receiver, bytes ctx) returns (bytes newCtx)',
  'function getFlow(address token, address sender, address receiver) view returns (uint256 timestamp, int96 flowRate, uint256 deposit, uint256 owedDeposit)',
]

export const CFAv1Forwarder_ABI = [
  'function deleteFlow(address token, address sender, address receiver, bytes userData) returns (bool)',
  'function getFlowrate(address token, address sender, address receiver) view returns (int96 flowrate)',
  'function getFlowInfo(address token, address sender, address receiver) view returns (uint256 lastUpdated, int96 flowrate, uint256 deposit, uint256 owedDeposit)',
]

// Helper: common export default (optional)
export default {
  SuperToken_ABI,
  ERC20_PYUSD_ABI,
  SuperfluidHost_ABI,
  CFA_ABI,
  CFAv1Forwarder_ABI,
}

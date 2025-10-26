# Superfluid BatchCall Operations - Complete Reference Guide

This guide documents all available batch operation types in Superfluid's `batchCall()` function, enabling you to combine multiple operations into a single atomic transaction.

## Table of Contents
1. [Overview](#overview)
2. [ERC20 Operations (1-5)](#erc20-operations)
3. [SuperToken Operations (101-104)](#supertoken-operations)
4. [Agreement Operations (201-202)](#agreement-operations)
5. [Forwarder Operations (301-302)](#forwarder-operations)
6. [Usage Examples](#usage-examples)

---

## Overview

### BatchCall Function Signature
```solidity
function batchCall(Operation[] calldata operations) external payable
```

### Operation Structure
```typescript
interface Operation {
  operationType: number  // Operation type identifier
  target: address        // Target contract address
  data: bytes           // ABI-encoded operation data
}
```

### Key Benefits
- **Atomic Execution**: All operations succeed or fail together
- **Gas Efficiency**: Single transaction for multiple operations
- **Complex Workflows**: Combine upgrade + streaming in one tx
- **Native Token Support**: Can forward ETH to specific operations

---

## ERC20 Operations

### 1. OPERATION_TYPE_ERC20_APPROVE
**Type Code:** `1`
**Purpose:** Approve ERC20 spending allowance

```typescript
// Data encoding
const data = encodeAbiParameters(
  parseAbiParameters('address, uint256'),
  [spender, amount]
)

// Operation
{
  operationType: 1,
  target: superTokenAddress,
  data: data
}
```

**Solidity Call Spec:**
```solidity
ISuperToken(target).operationApprove(spender, amount)
```

**Use Case:** Set allowance for another address to spend your SuperTokens

---

### 2. OPERATION_TYPE_ERC20_TRANSFER_FROM
**Type Code:** `2`
**Purpose:** Transfer tokens using allowance

```typescript
// Data encoding
const data = encodeAbiParameters(
  parseAbiParameters('address, address, uint256'),
  [sender, receiver, amount]
)

// Operation
{
  operationType: 2,
  target: superTokenAddress,
  data: data
}
```

**Solidity Call Spec:**
```solidity
ISuperToken(target).operationTransferFrom(sender, receiver, amount)
```

**Use Case:** Transfer tokens from another address (requires prior approval)

---

### 3. OPERATION_TYPE_ERC777_SEND
**Type Code:** `3`
**Purpose:** Send tokens with userData (ERC777 standard)

```typescript
// Data encoding
const data = encodeAbiParameters(
  parseAbiParameters('address, uint256, bytes'),
  [recipient, amount, userData]
)

// Operation
{
  operationType: 3,
  target: superTokenAddress,
  data: data
}
```

**Solidity Call Spec:**
```solidity
ISuperToken(target).operationSend(recipient, amount, userData)
```

**Use Case:** One-time token transfer with optional metadata

**Note:** This is NOT for streaming - use OPERATION_TYPE_SUPERFLUID_CALL_AGREEMENT (201) for streams

---

### 4. OPERATION_TYPE_ERC20_INCREASE_ALLOWANCE
**Type Code:** `4`
**Purpose:** Increase existing allowance

```typescript
// Data encoding
const data = encodeAbiParameters(
  parseAbiParameters('address, uint256'),
  [spender, addedValue]
)

// Operation
{
  operationType: 4,
  target: superTokenAddress,
  data: data
}
```

**Solidity Call Spec:**
```solidity
ISuperToken(target).operationIncreaseAllowance(spender, addedValue)
```

**Use Case:** Safely increase spending allowance without race conditions

---

### 5. OPERATION_TYPE_ERC20_DECREASE_ALLOWANCE
**Type Code:** `5`
**Purpose:** Decrease existing allowance

```typescript
// Data encoding
const data = encodeAbiParameters(
  parseAbiParameters('address, uint256'),
  [spender, subtractedValue]
)

// Operation
{
  operationType: 5,
  target: superTokenAddress,
  data: data
}
```

**Solidity Call Spec:**
```solidity
ISuperToken(target).operationDecreaseAllowance(spender, subtractedValue)
```

**Use Case:** Safely decrease spending allowance

---

## SuperToken Operations

### 101. OPERATION_TYPE_SUPERTOKEN_UPGRADE
**Type Code:** `101` (`1 + 100`)
**Purpose:** Wrap ERC20 tokens into SuperTokens

```typescript
// Data encoding
const data = encodeAbiParameters(
  parseAbiParameters('uint256'),
  [amount]
)

// Operation
{
  operationType: 101,
  target: superTokenAddress,
  data: data
}
```

**Solidity Call Spec:**
```solidity
ISuperToken(target).operationUpgrade(amount)
```

**Use Case:** Convert ERC20 → SuperToken before creating a stream

**Common Pattern:**
```typescript
// Upgrade 1000 USDC to USDCx, then create stream
const operations = [
  { operationType: 101, target: usdcx, data: encodeAmount(1000) },
  { operationType: 201, target: cfa, data: encodeCreateFlow(...) }
]
```

---

### 102. OPERATION_TYPE_SUPERTOKEN_DOWNGRADE
**Type Code:** `102` (`2 + 100`)
**Purpose:** Unwrap SuperTokens back to ERC20

```typescript
// Data encoding
const data = encodeAbiParameters(
  parseAbiParameters('uint256'),
  [amount]
)

// Operation
{
  operationType: 102,
  target: superTokenAddress,
  data: data
}
```

**Solidity Call Spec:**
```solidity
ISuperToken(target).operationDowngrade(amount)
```

**Use Case:** Convert SuperToken → ERC20 (e.g., to use on other protocols)

---

### 103. OPERATION_TYPE_SUPERTOKEN_UPGRADE_TO
**Type Code:** `103` (`3 + 100`)
**Purpose:** Wrap ERC20 to SuperToken and send to another address

```typescript
// Data encoding
const data = encodeAbiParameters(
  parseAbiParameters('address, uint256'),
  [recipient, amount]
)

// Operation
{
  operationType: 103,
  target: superTokenAddress,
  data: data
}
```

**Solidity Call Spec:**
```solidity
ISuperToken(target).operationUpgradeTo(recipient, amount)
```

**Use Case:** Upgrade tokens directly to another address

---

### 104. OPERATION_TYPE_SUPERTOKEN_DOWNGRADE_TO
**Type Code:** `104` (`4 + 100`)
**Purpose:** Unwrap SuperToken to ERC20 and send to another address

```typescript
// Data encoding
const data = encodeAbiParameters(
  parseAbiParameters('address, uint256'),
  [recipient, amount]
)

// Operation
{
  operationType: 104,
  target: superTokenAddress,
  data: data
}
```

**Solidity Call Spec:**
```solidity
ISuperToken(target).operationDowngradeTo(recipient, amount)
```

**Use Case:** Downgrade tokens directly to another address

---

## Agreement Operations

### 201. OPERATION_TYPE_SUPERFLUID_CALL_AGREEMENT
**Type Code:** `201` (`1 + 200`)
**Purpose:** Execute Superfluid Agreement operations (Streaming, GDA, etc.)

```typescript
// Step 1: Encode the agreement function call (e.g., createFlow)
const createFlowCallData = encodeFunctionData({
  abi: cfaAbi,
  functionName: 'createFlow',
  args: [superToken, receiver, flowRate, '0x']
})

// Step 2: Encode operation data (callData + userData)
const operationData = encodeAbiParameters(
  parseAbiParameters('bytes, bytes'),
  [createFlowCallData, '0x'] // userData is usually empty
)

// Operation
{
  operationType: 201,
  target: agreementAddress, // CFA, GDA, etc.
  data: operationData
}
```

**Solidity Call Spec:**
```solidity
callAgreement(
  ISuperAgreement(target),
  callData,  // encoded function call
  userData   // optional user data
)
```

**Agreement Types:**
- **CFA (Constant Flow Agreement)**: `createFlow`, `updateFlow`, `deleteFlow`
- **GDA (General Distribution Agreement)**: Pool distributions
- **IDA (Instant Distribution Agreement)**: Instant distributions

**Use Cases:**
- Create streaming payments
- Update existing streams
- Delete/cancel streams
- Distribute tokens to pools

**Complete Example - Create Stream:**
```typescript
// CFA ABI
const cfaAbi = parseAbi([
  'function createFlow(address token, address receiver, int96 flowRate, bytes ctx) returns (bytes newCtx)'
])

// Encode createFlow
const createFlowCallData = encodeFunctionData({
  abi: cfaAbi,
  functionName: 'createFlow',
  args: [
    '0x30a6933ca9230361972e413a15dc8114c952414e', // SuperToken
    '0xbBdb0a2F77636F819CFb02F528ba91775f1Aaf9E', // Receiver
    166666666666n, // Flow rate (wei/sec)
    '0x' // Empty context
  ]
})

// Encode operation data
const operationData = encodeAbiParameters(
  parseAbiParameters('bytes, bytes'),
  [createFlowCallData, '0x']
)

// Build operation
const operation = {
  operationType: 201,
  target: '0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef', // CFA address
  data: operationData
}

// Execute
await host.write.batchCall([[operation]])
```

---

### 202. OPERATION_TYPE_SUPERFLUID_CALL_APP_ACTION
**Type Code:** `202` (`2 + 200`)
**Purpose:** Call SuperApp custom actions

```typescript
// Data is the raw call data for the SuperApp function
const data = encodeFunctionData({
  abi: superAppAbi,
  functionName: 'customAction',
  args: [...]
})

// Operation
{
  operationType: 202,
  target: superAppAddress,
  data: data
}
```

**Solidity Call Spec:**
```solidity
callAppAction(ISuperApp(target), data)
```

**Use Case:** Invoke custom logic in registered SuperApps

**Note:** Can receive native tokens (ETH) if sent with the transaction

---

## Forwarder Operations

### 301. OPERATION_TYPE_SIMPLE_FORWARD_CALL
**Type Code:** `301` (`1 + 300`)
**Purpose:** Forward arbitrary call to any contract

```typescript
// Data is the raw call data for the target contract
const data = encodeFunctionData({
  abi: targetAbi,
  functionName: 'someFunction',
  args: [...]
})

// Operation
{
  operationType: 301,
  target: anyContractAddress,
  data: data
}
```

**Solidity Call Spec:**
```solidity
SimpleForwarder.forwardCall(target, data)
```

**Use Cases:**
- Call external protocols in the same transaction
- Interact with non-Superfluid contracts
- Build complex DeFi workflows

**Security Note:**
- Calls are routed through `SimpleForwarder` utility contract
- Prevents host contract from being sender (security isolation)
- Can receive native tokens (ETH)

**Example - Upgrade and Swap:**
```typescript
const operations = [
  { operationType: 101, target: usdcx, data: upgradeData },
  { operationType: 301, target: dexRouter, data: swapData }
]
```

---

### 302. OPERATION_TYPE_ERC2771_FORWARD_CALL
**Type Code:** `302` (`2 + 300`)
**Purpose:** Forward ERC2771 meta-transaction call

```typescript
// Data is the raw call data for the target contract
const data = encodeFunctionData({
  abi: targetAbi,
  functionName: 'someFunction',
  args: [...]
})

// Operation
{
  operationType: 302,
  target: erc2771RecipientAddress,
  data: data
}
```

**Solidity Call Spec:**
```solidity
ERC2771Forwarder.forward2771Call(target, msgSender, data)
```

**Use Case:** Execute gasless transactions (meta-transactions)

**Requirements:**
- Target must trust Superfluid's ERC2771Forwarder
- Implement `isTrustedForwarder()` check:
```solidity
function isTrustedForwarder(address forwarder) public view returns(bool) {
  return forwarder == address(host.getERC2771Forwarder());
}
```

**Note:** Can receive native tokens (ETH)

---

## Usage Examples

### Example 1: Upgrade and Stream (Most Common)
Wrap ERC20 tokens and immediately start streaming:

```typescript
import { encodeFunctionData, encodeAbiParameters, parseAbiParameters } from 'viem'

// Step 1: Upgrade 1000 USDC to USDCx
const upgradeData = encodeAbiParameters(
  parseAbiParameters('uint256'),
  [parseEther('1000')]
)

// Step 2: Create stream
const createFlowCallData = encodeFunctionData({
  abi: cfaAbi,
  functionName: 'createFlow',
  args: [usdcxAddress, receiverAddress, flowRate, '0x']
})

const createFlowOperationData = encodeAbiParameters(
  parseAbiParameters('bytes, bytes'),
  [createFlowCallData, '0x']
)

// Step 3: Build operations
const operations = [
  {
    operationType: 101, // Upgrade
    target: usdcxAddress,
    data: upgradeData
  },
  {
    operationType: 201, // Create Flow
    target: cfaAddress,
    data: createFlowOperationData
  }
]

// Execute
await host.write.batchCall([operations])
```

---

### Example 2: Update Multiple Streams
Update flow rates to multiple receivers:

```typescript
const operations = [
  // Update stream to receiver 1
  {
    operationType: 201,
    target: cfaAddress,
    data: encodeUpdateFlow(receiver1, newRate1)
  },
  // Update stream to receiver 2
  {
    operationType: 201,
    target: cfaAddress,
    data: encodeUpdateFlow(receiver2, newRate2)
  }
]

await host.write.batchCall([operations])
```

---

### Example 3: Stream and External Protocol
Create stream and interact with external DeFi protocol:

```typescript
const operations = [
  // Create Superfluid stream
  {
    operationType: 201,
    target: cfaAddress,
    data: encodeCreateFlow(...)
  },
  // Deposit to Aave (example)
  {
    operationType: 301, // Forward call
    target: aaveLendingPool,
    data: encodeDepositCall(...)
  }
]

await host.write.batchCall([operations])
```

---

### Example 4: Approve and Transfer
Set allowance and transfer in one transaction:

```typescript
const operations = [
  // Approve spending
  {
    operationType: 1, // ERC20 Approve
    target: superTokenAddress,
    data: encodeAbiParameters(
      parseAbiParameters('address, uint256'),
      [spender, amount]
    )
  },
  // Transfer tokens
  {
    operationType: 2, // ERC20 TransferFrom
    target: superTokenAddress,
    data: encodeAbiParameters(
      parseAbiParameters('address, address, uint256'),
      [sender, receiver, amount]
    )
  }
]

await host.write.batchCall([operations])
```

---

### Example 5: Close Stream and Downgrade
Stop streaming and convert back to ERC20:

```typescript
const operations = [
  // Delete stream
  {
    operationType: 201,
    target: cfaAddress,
    data: encodeDeleteFlow(sender, receiver)
  },
  // Downgrade remaining balance
  {
    operationType: 102, // Downgrade
    target: superTokenAddress,
    data: encodeAbiParameters(
      parseAbiParameters('uint256'),
      [remainingBalance]
    )
  }
]

await host.write.batchCall([operations])
```

---

## Native Token (ETH) Forwarding

BatchCall supports forwarding native tokens to specific operations:

**Operations that can receive ETH:**
- `202` - OPERATION_TYPE_SUPERFLUID_CALL_APP_ACTION
- `301` - OPERATION_TYPE_SIMPLE_FORWARD_CALL
- `302` - OPERATION_TYPE_ERC2771_FORWARD_CALL

**Behavior:**
- ETH is forwarded to the **first** operation of these types
- Any remaining ETH is returned to sender
- Use `msg.value` when calling `batchCall`

```typescript
await host.write.batchCall([operations], {
  value: parseEther('0.1') // Forward 0.1 ETH
})
```

---

## Operation Type Summary Table

| Code | Name | Category | Purpose |
|------|------|----------|---------|
| 1 | ERC20_APPROVE | ERC20 | Approve token spending |
| 2 | ERC20_TRANSFER_FROM | ERC20 | Transfer with allowance |
| 3 | ERC777_SEND | ERC20 | One-time token transfer |
| 4 | ERC20_INCREASE_ALLOWANCE | ERC20 | Increase allowance |
| 5 | ERC20_DECREASE_ALLOWANCE | ERC20 | Decrease allowance |
| 101 | SUPERTOKEN_UPGRADE | SuperToken | Wrap ERC20 → SuperToken |
| 102 | SUPERTOKEN_DOWNGRADE | SuperToken | Unwrap SuperToken → ERC20 |
| 103 | SUPERTOKEN_UPGRADE_TO | SuperToken | Wrap and send |
| 104 | SUPERTOKEN_DOWNGRADE_TO | SuperToken | Unwrap and send |
| 201 | SUPERFLUID_CALL_AGREEMENT | Agreement | Streaming & distributions |
| 202 | SUPERFLUID_CALL_APP_ACTION | SuperApp | Custom SuperApp actions |
| 301 | SIMPLE_FORWARD_CALL | Forwarder | Arbitrary contract calls |
| 302 | ERC2771_FORWARD_CALL | Forwarder | Meta-transaction calls |

---

## Best Practices

### 1. Operation Ordering
- **Upgrade before streaming**: Place upgrade operations before createFlow
- **Delete before downgrade**: Close streams before unwrapping tokens
- **Approve before transfer**: Set allowances before transferFrom

### 2. Error Handling
- All operations are **atomic** - if one fails, all fail
- Use `try/catch` to handle batch failures gracefully
- Consider breaking complex batches into smaller ones

### 3. Gas Optimization
- Batch related operations to save on base transaction costs
- Typical gas savings: 21,000 gas per avoided transaction
- Balance complexity vs. gas savings

### 4. Security Considerations
- Always validate operation data encoding
- Be cautious with operation type 301 (arbitrary calls)
- Verify target addresses before execution
- Test batches on testnet first

---

## Common Patterns

### Pattern 1: Stream Lifecycle Management
```typescript
// Setup: Upgrade + Create Stream
[101, 201]

// Update: Modify Flow Rate
[201]

// Teardown: Delete Stream + Downgrade
[201, 102]
```

### Pattern 2: Multi-Recipient Streaming
```typescript
// Create streams to multiple receivers
[201, 201, 201, ...]
```

### Pattern 3: DeFi Composition
```typescript
// Superfluid + External Protocol
[101, 201, 301]
```

### Pattern 4: Token Management
```typescript
// Approve + Transfer pattern
[1, 2]

// Increase allowance + Execute
[4, 301]
```

---

## References

- **Source Code**: `packages/ethereum-contracts/contracts/interfaces/superfluid/Definitions.sol`
- **Implementation**: `packages/ethereum-contracts/contracts/superfluid/Superfluid.sol` (lines 810-928)
- **Example Scripts**: `hardhat-deployment/scripts/batchCreateFlow.ts`

---

## Additional Resources

### Helper Functions

```typescript
// Encode upgrade operation data
function encodeUpgradeData(amount: bigint) {
  return encodeAbiParameters(
    parseAbiParameters('uint256'),
    [amount]
  )
}

// Encode createFlow agreement data
function encodeCreateFlowOperation(
  token: Address,
  receiver: Address,
  flowRate: bigint
) {
  const createFlowCallData = encodeFunctionData({
    abi: parseAbi([
      'function createFlow(address,address,int96,bytes) returns (bytes)'
    ]),
    functionName: 'createFlow',
    args: [token, receiver, flowRate as any, '0x']
  })

  return encodeAbiParameters(
    parseAbiParameters('bytes, bytes'),
    [createFlowCallData, '0x']
  )
}
```

---

## Need Help?

- **Documentation**: https://docs.superfluid.finance
- **Discord**: https://discord.gg/superfluid
- **GitHub**: https://github.com/superfluid-finance/protocol-monorepo

---

**Last Updated**: 2025
**Superfluid Protocol Version**: V1
**Compatible Networks**: Ethereum, Polygon, Optimism, Arbitrum, Base, BSC, Avalanche, Gnosis Chain

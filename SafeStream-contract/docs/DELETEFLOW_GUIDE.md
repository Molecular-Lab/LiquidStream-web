# Deleting Superfluid Streams - Complete Guide

This guide explains the different ways to delete (stop) a Superfluid stream and when to use each method.

## Table of Contents
1. [Overview](#overview)
2. [Method 1: CFAv1Forwarder (Recommended)](#method-1-cfav1forwarder-recommended)
3. [Method 2: Direct CFA Call](#method-2-direct-cfa-call)
4. [Method 3: BatchCall Operation](#method-3-batchcall-operation)
5. [Who Can Delete a Stream?](#who-can-delete-a-stream)
6. [Comparison Table](#comparison-table)

---

## Overview

When you delete a stream, several things happen:
1. **Flow stops immediately** - No more tokens stream from sender to receiver
2. **Deposit is returned** - The sender gets back their security deposit
3. **Final settlement** - Any streamed but unsettled balance is transferred
4. **Flow data cleared** - The flow record is removed from storage

---

## Method 1: CFAv1Forwarder (Recommended)

### What is CFAv1Forwarder?
A convenience contract that provides a simplified interface for managing flows. It's the **easiest and recommended** way to interact with Superfluid streams.

### Function Signature
```solidity
function deleteFlow(
    address token,
    address sender,
    address receiver,
    bytes memory userData
) external returns (bool)
```

### Key Features
- ✅ Simple interface - just 4 parameters
- ✅ Automatic permission handling
- ✅ Works for sender, receiver, and operators
- ✅ Returns boolean success status
- ✅ Gas efficient

### TypeScript Example
```typescript
import { network } from 'hardhat'
import { Address, parseAbi, getContract } from 'viem'

const cfaForwarderAbi = parseAbi([
  'function deleteFlow(address token, address sender, address receiver, bytes userData) returns (bool)'
])

const forwarder = getContract({
  address: '0xcfA132E353cB4E398080B9700609bb008eceB125', // Sepolia
  abi: cfaForwarderAbi,
  client: { public: publicClient, wallet: deployer }
})

// Delete the flow
const hash = await forwarder.write.deleteFlow([
  superTokenAddress,
  senderAddress,
  receiverAddress,
  '0x' // empty userData
])

const receipt = await publicClient.waitForTransactionReceipt({ hash })
console.log('Stream deleted in block:', receipt.blockNumber)
```

### When to Use
- ✅ Default choice for most use cases
- ✅ When you want clean, simple code
- ✅ When interacting from EOAs (wallets)
- ✅ When you need a single operation

### CFAv1Forwarder Addresses

| Network | CFAv1Forwarder Address |
|---------|------------------------|
| Sepolia Testnet | `0xcfA132E353cB4E398080B9700609bb008eceB125` |
| Base Mainnet | `0xcfA132E353cB4E398080B9700609bb008eceB125` |
| Base Sepolia | `0xcfA132E353cB4E398080B9700609bb008eceB125` |
| Ethereum Mainnet | `0xcfA132E353cB4E398080B9700609bb008eceB125` |
| Polygon | `0xcfA132E353cB4E398080B9700609bb008eceB125` |
| Optimism | `0xcfA132E353cB4E398080B9700609bb008eceB125` |
| Arbitrum | `0xcfA132E353cB4E398080B9700609bb008eceB125` |

---

## Method 2: Direct CFA Call

### What is Direct CFA Call?
Calling the ConstantFlowAgreementV1 (CFA) contract directly through the Superfluid Host contract.

### Function Signature
```solidity
// Through Superfluid Host
function callAgreement(
    ISuperAgreement agreementClass,
    bytes memory callData,
    bytes memory userData
) external returns (bytes memory returnedData)

// CFA deleteFlow function being called
function deleteFlow(
    address token,
    address sender,
    address receiver,
    bytes calldata ctx
) external returns (bytes memory newCtx)
```

### Key Features
- More control over the agreement call
- Lower-level access to protocol
- Required for custom SuperApp callbacks
- More complex to use

### TypeScript Example
```typescript
import { encodeFunctionData, parseAbi, getContract } from 'viem'

const superfluidHostAbi = parseAbi([
  'function callAgreement(address agreementClass, bytes callData, bytes userData) returns (bytes returnedData)'
])

const cfaAbi = parseAbi([
  'function deleteFlow(address token, address sender, address receiver, bytes ctx) returns (bytes newCtx)'
])

// Step 1: Encode deleteFlow call
const deleteFlowData = encodeFunctionData({
  abi: cfaAbi,
  functionName: 'deleteFlow',
  args: [
    superTokenAddress,
    senderAddress,
    receiverAddress,
    '0x' // empty context
  ]
})

// Step 2: Get host contract
const host = getContract({
  address: '0x109412E3C84f0539b43d39dB691B08c90f58dC7c', // Sepolia host
  abi: superfluidHostAbi,
  client: { public: publicClient, wallet: deployer }
})

// Step 3: Call agreement
const hash = await host.write.callAgreement([
  '0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef', // CFA address
  deleteFlowData,
  '0x' // empty user data
])

const receipt = await publicClient.waitForTransactionReceipt({ hash })
```

### When to Use
- When building SuperApps that need context
- When you need fine-grained control
- When integrating with custom agreement logic
- For advanced protocol features

---

## Method 3: BatchCall Operation

### What is BatchCall?
Execute multiple operations atomically in a single transaction. Useful for combining stream deletion with other operations.

### Operation Type
- **Operation Type:** `201` (OPERATION_TYPE_SUPERFLUID_CALL_AGREEMENT)

### Key Features
- ✅ Combine with other operations
- ✅ Atomic execution (all or nothing)
- ✅ Gas efficient for multiple ops
- ✅ Complex workflows in one tx

### TypeScript Example
```typescript
import { encodeFunctionData, encodeAbiParameters, parseAbiParameters } from 'viem'

// Step 1: Encode deleteFlow call
const deleteFlowCallData = encodeFunctionData({
  abi: cfaAbi,
  functionName: 'deleteFlow',
  args: [superTokenAddress, senderAddress, receiverAddress, '0x']
})

// Step 2: Encode operation data
const operationData = encodeAbiParameters(
  parseAbiParameters('bytes, bytes'),
  [deleteFlowCallData, '0x']
)

// Step 3: Build operations array
const operations = [
  {
    operationType: 201, // OPERATION_TYPE_SUPERFLUID_CALL_AGREEMENT
    target: cfaAddress,
    data: operationData
  },
  {
    operationType: 102, // OPERATION_TYPE_SUPERTOKEN_DOWNGRADE
    target: superTokenAddress,
    data: encodeAbiParameters(
      parseAbiParameters('uint256'),
      [downgradeAmount]
    )
  }
]

// Step 4: Execute batch call
const hash = await host.write.batchCall([operations])
```

### Common BatchCall Patterns

#### Pattern 1: Delete Stream + Downgrade
Stop streaming and unwrap remaining SuperTokens:
```typescript
const operations = [
  { operationType: 201, target: cfa, data: deleteFlowData },
  { operationType: 102, target: superToken, data: downgradeData }
]
```

#### Pattern 2: Delete Multiple Streams
Stop all outgoing streams at once:
```typescript
const operations = [
  { operationType: 201, target: cfa, data: deleteFlow1Data },
  { operationType: 201, target: cfa, data: deleteFlow2Data },
  { operationType: 201, target: cfa, data: deleteFlow3Data }
]
```

#### Pattern 3: Delete + External Protocol
Stop stream and interact with other DeFi:
```typescript
const operations = [
  { operationType: 201, target: cfa, data: deleteFlowData },
  { operationType: 301, target: aave, data: withdrawData }
]
```

### When to Use
- ✅ When you need to combine operations
- ✅ Stop stream + unwrap tokens
- ✅ Delete multiple streams at once
- ✅ Complex DeFi workflows

---

## Who Can Delete a Stream?

Different accounts have different permissions to delete a stream:

### 1. Sender (Flow Creator)
✅ **Always allowed** - The account that created the flow can always delete it

```typescript
// As sender
await forwarder.write.deleteFlow([
  superToken,
  myAddress,      // sender = me
  receiverAddress,
  '0x'
])
```

### 2. Receiver (Flow Recipient)
✅ **Always allowed** - The account receiving the stream can close it

```typescript
// As receiver
await forwarder.write.deleteFlow([
  superToken,
  senderAddress,
  myAddress,      // receiver = me
  '0x'
])
```

### 3. Flow Operator
✅ **Allowed with permissions** - An authorized operator with delete permissions

**Granting Permissions:**
```typescript
const forwarderAbi = parseAbi([
  'function grantPermissions(address token, address flowOperator) returns (bool)'
])

// Grant full control (create/update/delete)
await forwarder.write.grantPermissions([
  superTokenAddress,
  operatorAddress
])
```

**Flow Operator Permissions:**
```solidity
// Permission flags (from FlowOperatorDefinitions)
AUTHORIZE_FLOW_OPERATOR_CREATE = 1 << 0  // 0x01
AUTHORIZE_FLOW_OPERATOR_UPDATE = 1 << 1  // 0x02
AUTHORIZE_FLOW_OPERATOR_DELETE = 1 << 2  // 0x04
AUTHORIZE_FULL_CONTROL = 0x07            // All permissions
```

**Deleting as Operator:**
```typescript
// As authorized flow operator
await forwarder.write.deleteFlow([
  superToken,
  senderAddress,   // flow I'm operating
  receiverAddress,
  '0x'
])
```

### 4. Liquidator (Anyone)
✅ **Allowed when sender is critical** - Anyone can delete if sender's balance is negative

**Critical State Conditions:**
- Sender's available balance < 0
- Sender is insolvent
- Sender cannot cover the stream

**Liquidation Benefits:**
```typescript
// Anyone can liquidate critical flows
await forwarder.write.deleteFlow([
  superToken,
  insolventsenderAddress,  // This sender is critical
  receiverAddress,
  '0x'
])
// Liquidator receives reward from sender's deposit
```

**Liquidation Rewards:**
- **Patrician Period**: Reward goes to protocol governance
- **Pleb Period**: Liquidator gets portion of deposit
- **Pirate Period**: Liquidator gets full deposit

---

## Permission Check Example

```typescript
// Check who you are in relation to the flow
const isSender = myAddress === senderAddress
const isReceiver = myAddress === receiverAddress

// Check flow operator permissions
const [permissions, flowrateAllowance] = await forwarder.read.getFlowOperatorPermissions([
  superTokenAddress,
  senderAddress,
  myAddress
])

const hasDeletePermission = (permissions & 0x04) !== 0

// Check if sender is critical
const [availableBalance] = await superToken.read.realtimeBalanceOfNow([senderAddress])
const isCritical = availableBalance < 0n

// Determine if I can delete
const canDelete = isSender || isReceiver || hasDeletePermission || isCritical

if (!canDelete) {
  console.log('❌ You do not have permission to delete this flow')
} else {
  console.log('✅ You can delete this flow')
}
```

---

## Comparison Table

| Feature | CFAv1Forwarder | Direct CFA Call | BatchCall |
|---------|----------------|-----------------|-----------|
| **Ease of Use** | ⭐⭐⭐⭐⭐ Simplest | ⭐⭐ Complex | ⭐⭐⭐ Moderate |
| **Gas Cost** | Low | Low | Lower (for multiple ops) |
| **Code Lines** | ~5 | ~10 | ~15+ |
| **Permissions** | Auto-handled | Manual | Manual |
| **SuperApp Support** | Limited | Full | Full |
| **Combine Operations** | No | No | Yes ✅ |
| **Return Value** | Boolean | Bytes | None |
| **Best For** | Simple flows | SuperApps | Multi-operation |
| **Recommended** | ✅ Default choice | Advanced use | Batch operations |

---

## Error Handling

### Common Errors

#### 1. Flow Does Not Exist
```
Error: CFA_FLOW_DOES_NOT_EXIST
```
**Solution:** Check if flow exists before trying to delete

```typescript
const flowRate = await forwarder.read.getFlowrate([token, sender, receiver])
if (flowRate === 0n) {
  console.log('No flow to delete')
  return
}
```

#### 2. Insufficient Permissions
```
Error: CFA_NON_CRITICAL_SENDER
```
**Solution:** You don't have permission. Must be sender, receiver, or operator

```typescript
// Check permissions first
const canDelete = await checkDeletePermissions(...)
if (!canDelete) {
  throw new Error('No permission to delete')
}
```

#### 3. Invalid Address
```
Error: CFA_ZERO_ADDRESS_SENDER / CFA_ZERO_ADDRESS_RECEIVER
```
**Solution:** Verify addresses are non-zero

```typescript
if (sender === '0x0000000000000000000000000000000000000000') {
  throw new Error('Invalid sender address')
}
```

---

## Scripts Reference

### Available Scripts

1. **`deleteFlowForwarder.ts`** - Delete using CFAv1Forwarder (Recommended)
   ```bash
   npx hardhat run scripts/deleteFlowForwarder.ts --network sepolia
   ```

2. **`deleteFlow.ts`** - Delete using direct CFA call
   ```bash
   npx hardhat run scripts/deleteFlow.ts --network sepolia
   ```

3. **`batchDeleteFlow.ts`** - Delete with batchCall (for complex workflows)
   ```bash
   npx hardhat run scripts/batchDeleteFlow.ts --network sepolia
   ```

### Environment Variables

Create a `.env` file:
```bash
SUPER_TOKEN=0x30a6933ca9230361972e413a15dc8114c952414e
SENDER=0x41649a1F8B2499e2F7884184D062639CEF9d0601
RECEIVER=0xbBdb0a2F77636F819CFb02F528ba91775f1Aaf9E
```

---

## Best Practices

### 1. Check Flow Exists First
```typescript
const flowRate = await forwarder.read.getFlowrate([token, sender, receiver])
if (flowRate === 0n) {
  console.log('No flow to delete')
  return
}
```

### 2. Verify Permissions
```typescript
const isSender = myAddress === senderAddress
const isReceiver = myAddress === receiverAddress
if (!isSender && !isReceiver) {
  // Check operator permissions or critical state
}
```

### 3. Handle Deposits
```typescript
// Get deposit amount before deletion
const [, , deposit] = await forwarder.read.getFlowInfo([token, sender, receiver])
console.log('Deposit to be returned:', deposit)
```

### 4. Combine with Downgrade
```typescript
// If sender, consider downgrading after deletion
const operations = [
  deleteFlowOperation,
  downgradeOperation
]
await host.write.batchCall([operations])
```

### 5. Test on Testnet First
Always test deletion logic on Sepolia or Base Sepolia before mainnet.

---

## Additional Resources

- **CFAv1Forwarder Contract**: `contracts/utils/CFAv1Forwarder.sol`
- **CFA Contract**: `contracts/agreements/ConstantFlowAgreementV1.sol`
- **Superfluid Docs**: https://docs.superfluid.finance
- **BatchCall Guide**: `BATCHCALL_OPERATIONS_GUIDE.md`

---

## Summary

### Quick Decision Guide

**Use CFAv1Forwarder when:**
- ✅ You want simple, clean code
- ✅ You're deleting a single flow
- ✅ You don't need batch operations
- ✅ **This is the recommended default**

**Use Direct CFA Call when:**
- You're building a SuperApp
- You need context/callbacks
- You need low-level control

**Use BatchCall when:**
- You need to combine operations
- You're deleting multiple flows
- You want atomic execution
- You need complex workflows

**95% of the time, use CFAv1Forwarder!** 🎯

---

**Last Updated**: 2025
**Superfluid Protocol Version**: V1

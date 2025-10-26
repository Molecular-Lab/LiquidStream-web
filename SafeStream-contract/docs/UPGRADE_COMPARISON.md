# PYUSD Upgrade Methods Comparison

This guide compares two methods for upgrading (wrapping) PYUSD tokens to SuperTokens.

## Table of Contents
1. [Overview](#overview)
2. [Method 1: Direct Contract Interaction](#method-1-direct-contract-interaction)
3. [Method 2: BatchCall (Recommended)](#method-2-batchcall-recommended)
4. [Side-by-Side Comparison](#side-by-side-comparison)
5. [When to Use Each Method](#when-to-use-each-method)

---

## Overview

Both methods achieve the same goal: wrapping PYUSD tokens into SuperTokens. The difference is in how they execute the required steps.

### Required Steps:
1. **Approve** - Grant SuperToken contract permission to spend your PYUSD
2. **Upgrade** - Wrap PYUSD into SuperToken (1:1 ratio with decimal conversion)

---

## Method 1: Direct Contract Interaction

### File: `upgradePYUSD.ts`

This is the traditional approach - calling each contract method separately.

### How It Works

```typescript
// Step 1: Approve PYUSD
const approveTx = await pyusd.write.approve([SUPERTOKEN_ADDRESS, AMOUNT])
await publicClient.waitForTransactionReceipt({ hash: approveTx })

// Step 2: Upgrade to SuperToken
const upgradeTx = await superToken.write.upgrade([upgradeAmount])
await publicClient.waitForTransactionReceipt({ hash: upgradeTx })
```

### Transaction Flow

```
Transaction 1: Approve
  User → PYUSD Contract
  │
  └─> approve(superToken, amount)
        ✓ Confirmed

⏱️ Wait for confirmation...

Transaction 2: Upgrade
  User → SuperToken Contract
  │
  └─> upgrade(amount)
        │
        └─> PYUSD.transferFrom(user, superToken, amount)
        ✓ Confirmed
```

### Characteristics

**Pros:**
- ✅ Simple to understand
- ✅ Standard ERC20 pattern
- ✅ Easy to debug
- ✅ Works with any wallet

**Cons:**
- ❌ Two separate transactions
- ❌ Higher gas cost (2x base fee)
- ❌ Slower (wait for 2 confirmations)
- ❌ Non-atomic (could fail between steps)
- ❌ Allowance remains if upgrade fails

**Gas Cost:**
- Approve: ~46,000 gas + 21,000 base = ~67,000 gas
- Upgrade: ~120,000 gas + 21,000 base = ~141,000 gas
- **Total: ~208,000 gas**

**Time:**
- 2 transactions × ~12 seconds = ~24 seconds

---

## Method 2: BatchCall (Recommended)

### File: `upgradePYUSDBatch.ts`

This uses Superfluid's `batchCall()` to execute both operations atomically in a single transaction.

### How It Works

```typescript
// Build operations array
const operations = [
  {
    operationType: 1,   // ERC20_APPROVE
    target: PYUSD_ADDRESS,
    data: encodeAbiParameters(['address', 'uint256'], [SUPERTOKEN_ADDRESS, AMOUNT])
  },
  {
    operationType: 101, // SUPERTOKEN_UPGRADE
    target: SUPERTOKEN_ADDRESS,
    data: encodeAbiParameters(['uint256'], [upgradeAmount])
  }
]

// Execute in single transaction
const hash = await host.write.batchCall([operations])
await publicClient.waitForTransactionReceipt({ hash })
```

### Transaction Flow

```
Transaction 1: BatchCall
  User → Superfluid Host
  │
  └─> batchCall([approve, upgrade])
        │
        ├─> PYUSD.operationApprove(superToken, amount)
        │   ✓ Approved
        │
        └─> SuperToken.operationUpgrade(amount)
            │
            └─> PYUSD.transferFrom(user, superToken, amount)
            ✓ Upgraded

        ✓ Confirmed (all operations atomic)
```

### Characteristics

**Pros:**
- ✅ Single transaction
- ✅ Lower gas cost (1x base fee)
- ✅ Faster (single confirmation)
- ✅ Atomic execution (all or nothing)
- ✅ No leftover allowance on failure
- ✅ Can combine with more operations

**Cons:**
- ⚠️ Requires understanding of batchCall
- ⚠️ More complex encoding
- ⚠️ Harder to debug failures

**Gas Cost:**
- BatchCall: ~167,000 gas + 21,000 base = ~188,000 gas
- **Total: ~188,000 gas**
- **Savings: ~20,000 gas (10% cheaper)**

**Time:**
- 1 transaction × ~12 seconds = ~12 seconds
- **50% faster**

---

## Side-by-Side Comparison

### Code Comparison

#### Direct Method
```typescript
// Check allowance
const currentAllowance = await pyusd.read.allowance([user, superToken])

if (currentAllowance < AMOUNT) {
  // Transaction 1: Approve
  const approveTx = await pyusd.write.approve([superToken, AMOUNT])
  await publicClient.waitForTransactionReceipt({ hash: approveTx })
}

// Transaction 2: Upgrade
const upgradeTx = await superToken.write.upgrade([upgradeAmount])
await publicClient.waitForTransactionReceipt({ hash: upgradeTx })
```

#### BatchCall Method
```typescript
// Build operations
const operations = [
  {
    operationType: 1,
    target: PYUSD_ADDRESS,
    data: encodeAbiParameters(
      parseAbiParameters('address, uint256'),
      [SUPERTOKEN_ADDRESS, AMOUNT]
    )
  },
  {
    operationType: 101,
    target: SUPERTOKEN_ADDRESS,
    data: encodeAbiParameters(
      parseAbiParameters('uint256'),
      [upgradeAmount]
    )
  }
]

// Single transaction
const hash = await host.write.batchCall([operations])
await publicClient.waitForTransactionReceipt({ hash })
```

### Feature Comparison Table

| Feature | Direct Method | BatchCall Method |
|---------|---------------|------------------|
| **Transactions** | 2 | 1 |
| **Gas Cost** | ~208,000 | ~188,000 ⚡ |
| **Time** | ~24 seconds | ~12 seconds ⚡ |
| **Atomic** | ❌ No | ✅ Yes |
| **Complexity** | ⭐ Simple | ⭐⭐ Moderate |
| **Debugging** | Easy | Moderate |
| **Extensibility** | Limited | ✅ High |
| **Recommended** | Beginners | Production ⭐ |

---

## When to Use Each Method

### Use Direct Method (`upgradePYUSD.ts`) When:

✅ **Learning Superfluid**
- You're new to the protocol
- Want to understand each step
- Prefer simple, clear code

✅ **Debugging**
- Need to isolate which step fails
- Testing approve functionality
- Checking allowances

✅ **Development**
- Rapid prototyping
- Local testing
- Educational purposes

### Use BatchCall (`upgradePYUSDBatch.ts`) When:

✅ **Production Deployment** ⭐
- Building dApps
- Live applications
- Gas optimization matters

✅ **User Experience**
- Want faster execution
- Single-click operations
- Professional UX

✅ **Complex Workflows**
- Need to combine operations
- Upgrade + create stream
- Multi-step atomic execution

---

## Extended BatchCall Examples

### Example 1: Upgrade + Create Stream

```typescript
const operations = [
  {
    operationType: 1,   // Approve PYUSD
    target: PYUSD_ADDRESS,
    data: encodeApprove(SUPERTOKEN_ADDRESS, AMOUNT)
  },
  {
    operationType: 101, // Upgrade to SuperToken
    target: SUPERTOKEN_ADDRESS,
    data: encodeUpgrade(upgradeAmount)
  },
  {
    operationType: 201, // Create Stream
    target: CFA_ADDRESS,
    data: encodeCreateFlow(SUPERTOKEN_ADDRESS, RECEIVER, FLOW_RATE)
  }
]

// One transaction: approve → upgrade → stream
await host.write.batchCall([operations])
```

### Example 2: Upgrade Multiple Tokens

```typescript
const operations = [
  // Approve + Upgrade PYUSD
  { operationType: 1, target: PYUSD, data: approveData1 },
  { operationType: 101, target: PYUSD_SUPER, data: upgradeData1 },
  // Approve + Upgrade USDC
  { operationType: 1, target: USDC, data: approveData2 },
  { operationType: 101, target: USDC_SUPER, data: upgradeData2 }
]

// One transaction for both tokens
await host.write.batchCall([operations])
```

### Example 3: Upgrade, Stream, and Downgrade Excess

```typescript
const operations = [
  { operationType: 101, target: SUPERTOKEN, data: upgradeAll },
  { operationType: 201, target: CFA, data: createStream },
  { operationType: 102, target: SUPERTOKEN, data: downgradeExcess }
]

// One transaction: upgrade → stream → downgrade remainder
await host.write.batchCall([operations])
```

---

## Error Handling

### Direct Method Errors

```typescript
try {
  // Transaction 1
  const approveTx = await pyusd.write.approve([...])
  await publicClient.waitForTransactionReceipt({ hash: approveTx })
} catch (error) {
  console.error('Approve failed:', error)
  // Only approve failed, no upgrade happened
}

try {
  // Transaction 2
  const upgradeTx = await superToken.write.upgrade([...])
  await publicClient.waitForTransactionReceipt({ hash: upgradeTx })
} catch (error) {
  console.error('Upgrade failed:', error)
  // Approve succeeded but upgrade failed
  // ⚠️ Allowance is still set!
}
```

### BatchCall Errors

```typescript
try {
  const hash = await host.write.batchCall([operations])
  await publicClient.waitForTransactionReceipt({ hash })
} catch (error) {
  console.error('BatchCall failed:', error)
  // ✅ Everything reverted atomically
  // No leftover state or allowances
}
```

---

## Decimal Conversion

Both methods handle PYUSD's 6 decimals → SuperToken's 18 decimals conversion:

```typescript
// PYUSD has 6 decimals
const AMOUNT = parseUnits('100', 6) // 100 PYUSD = 100000000 (100 * 10^6)

// SuperToken expects 18 decimals internally
const underlyingDecimals = 6 // from superToken.getUnderlyingDecimals()
const upgradeAmount = AMOUNT * BigInt(10 ** (18 - underlyingDecimals))
// upgradeAmount = 100000000 * 10^12 = 100000000000000000000 (100 * 10^18)

// Result: 100 PYUSD → 100 SuperToken (1:1 ratio, different precision)
```

---

## Migration Guide

### Converting Direct Code to BatchCall

**Before (Direct):**
```typescript
// Step 1
await pyusd.write.approve([superToken, amount])
// Step 2
await superToken.write.upgrade([amount])
```

**After (BatchCall):**
```typescript
const operations = [
  { operationType: 1, target: pyusd, data: encodeApprove(superToken, amount) },
  { operationType: 101, target: superToken, data: encodeUpgrade(amount) }
]
await host.write.batchCall([operations])
```

---

## Best Practices

### For Direct Method
1. ✅ Always check allowance before approving
2. ✅ Handle approval failures gracefully
3. ✅ Verify upgrade succeeds
4. ✅ Check balances after each step

### For BatchCall
1. ✅ Test operations individually first
2. ✅ Verify encoding is correct
3. ✅ Use proper operation types
4. ✅ Handle atomic failures
5. ✅ Consider gas limits for complex batches

---

## Summary

### Quick Decision Guide

**Choose Direct Method if:**
- 🎓 Learning Superfluid
- 🔍 Need to debug step-by-step
- 📝 Building educational content
- 🧪 Local development/testing

**Choose BatchCall if:**
- 🚀 Production deployment
- ⚡ Gas optimization matters
- 🎯 Single-click UX desired
- 🔗 Combining multiple operations
- 💼 Professional application

### Recommendation

For **PYUSD streaming in production**, use **BatchCall** (`upgradePYUSDBatch.ts`):
- 10% cheaper gas
- 50% faster
- Atomic execution
- Better UX

Use the Direct Method for learning and debugging only.

---

## Running the Scripts

### Direct Method
```bash
# Set environment variables
export PYUSD_ADDRESS=0x...
export SUPERTOKEN_ADDRESS=0x...

# Run script
npx hardhat run scripts/upgradePYUSD.ts --network sepolia
```

### BatchCall Method (Recommended)
```bash
# Set environment variables
export PYUSD_ADDRESS=0x...
export SUPERTOKEN_ADDRESS=0x...

# Run script
npx hardhat run scripts/upgradePYUSDBatch.ts --network sepolia
```

---

## Additional Resources

- **BatchCall Operations Guide**: `BATCHCALL_OPERATIONS_GUIDE.md`
- **Superfluid Docs**: https://docs.superfluid.finance
- **Operation Type Reference**: See `Definitions.sol` in contracts

---

**Last Updated**: 2025
**Protocol Version**: Superfluid V1

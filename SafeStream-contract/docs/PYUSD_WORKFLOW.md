# PYUSD Streaming Workflow Guide

Complete guide for wrapping PYUSD and creating streams on Superfluid.

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Two-Step Workflow (Recommended)](#two-step-workflow-recommended)
4. [Scripts Reference](#scripts-reference)
5. [Common Patterns](#common-patterns)
6. [Troubleshooting](#troubleshooting)

---

## Overview

To stream PYUSD on Superfluid, you need to:
1. **Wrap** PYUSD into PYUSD SuperToken (1:1 ratio)
2. **Create Stream** from the SuperToken

This guide shows you how to do both separately or combined.

---

## Prerequisites

### Required
- ✅ PYUSD tokens in your wallet
- ✅ ETH for gas fees (Sepolia testnet)
- ✅ Private key in `.env` file

### Addresses (Sepolia Testnet)
- **PYUSD Token**: `0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9`
- **PYUSD SuperToken**: `0x8fece7605C7475cc5f1d697D8915408986CA9fB6`
- **Superfluid Host**: `0x109412E3C84f0539b43d39dB691B08c90f58dC7c`
- **CFA (Constant Flow Agreement)**: `0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef`

---

## Two-Step Workflow (Recommended)

### Step 1: Upgrade PYUSD to SuperToken

Wrap your PYUSD tokens into SuperTokens:

```bash
npx hardhat run scripts/upgradePYUSDSimple.ts --network sepolia
```

**What it does:**
1. ✅ Checks your PYUSD balance
2. ✅ Approves SuperToken contract to spend PYUSD (if needed)
3. ✅ Wraps PYUSD → PYUSD SuperToken (1:1 ratio)

**Example Output:**
```
=== Upgrading PYUSD to SuperToken ===

--- BEFORE ---
PYUSD Balance: 100.0
SuperToken Balance: 0.0

--- APPROVING ---
Approving 10.0 PYUSD...
✓ Approved!

--- UPGRADING ---
Upgrading 10.0 PYUSD to SuperToken...
✓ Upgraded!

--- AFTER ---
PYUSD Balance: 90.0
SuperToken Balance: 10.0

=== SUCCESS ===
✅ Upgrade completed!
```

---

### Step 2: Create Stream

Create a continuous payment stream:

```bash
npx hardhat run scripts/createStreamPYUSD.ts --network sepolia
```

**What it does:**
1. ✅ Checks your SuperToken balance
2. ✅ Creates stream using batchCall
3. ✅ Money starts flowing immediately

**Example Output:**
```
=== Create PYUSD SuperToken Stream (BatchCall) ===

SuperToken Address: 0x8fece7605C7475cc5f1d697D8915408986CA9fB6
Stream Receiver: 0xbBdb0a2F77636F819CFb02F528ba91775f1Aaf9E
Flow Rate: 3858024691 wei/sec
Monthly Flow: 10.0 tokens/month

--- CHECKING BALANCE ---
Your SuperToken Balance: 10.0

--- EXECUTING BATCH CALL ---
🚀 Creating stream...
✓ Confirmed in block: 12345678

=== SUCCESS ===
✅ Stream created successfully!

Stream Details:
  From: 0x41649a1F8B2499e2F7884184D062639CEF9d0601
  To: 0xbBdb0a2F77636F819CFb02F528ba91775f1Aaf9E
  Flow Rate: 0.000000003858024691 tokens/sec
  Daily: 0.333333333333333333 tokens/day
  Monthly: 10.0 tokens/month

💰 Money is now streaming continuously!
```

---

## Scripts Reference

### 1. `upgradePYUSDSimple.ts` - Wrap PYUSD

**Purpose:** Convert PYUSD to PYUSD SuperToken

**Usage:**
```bash
npx hardhat run scripts/upgradePYUSDSimple.ts --network sepolia
```

**Configuration:**
Edit the amount in the script (line 41):
```typescript
const AMOUNT = parseUnits('10', 6) // Change to your desired amount
```

**When to use:**
- ✅ First time wrapping PYUSD
- ✅ Adding more SuperTokens to your balance
- ✅ Need SuperTokens for multiple streams

---

### 2. `createStreamPYUSD.ts` - Create Stream

**Purpose:** Start streaming PYUSD SuperTokens to a receiver

**Usage:**
```bash
# Default receiver
npx hardhat run scripts/createStreamPYUSD.ts --network sepolia

# Custom receiver
RECEIVER=0xYourReceiverAddress npx hardhat run scripts/createStreamPYUSD.ts --network sepolia

# Custom flow rate (10 PYUSD/month = 3858024691 wei/sec)
FLOW_RATE=3858024691 npx hardhat run scripts/createStreamPYUSD.ts --network sepolia
```

**Environment Variables:**
```bash
RECEIVER=0x...      # Address to stream to (optional)
FLOW_RATE=3858...   # Flow rate in wei/sec (optional)
```

**Flow Rate Calculator:**
```typescript
// Monthly amount to wei/sec
flowRate = (tokensPerMonth / 2592000) * 10^18

// Examples:
// 10 PYUSD/month = 3858024691 wei/sec
// 100 PYUSD/month = 38580246913 wei/sec
```

**When to use:**
- ✅ Have SuperTokens already wrapped
- ✅ Want to start streaming immediately
- ✅ Creating payment streams

---

### 3. `upgradePYUSDBatch.ts` - Batch Upgrade (Failed)

**Status:** ❌ Does not work

**Reason:** BatchCall `operationType: 1` (ERC20_APPROVE) only works with SuperTokens, not underlying ERC20 tokens like PYUSD.

**Lesson Learned:** Use `upgradePYUSDSimple.ts` instead for the approve step.

---

### 4. `upgradeAndStreamPYUSD.ts` - Combined (Advanced)

**Purpose:** Wrap + Stream in one transaction

**Status:** ⚠️ Requires pre-approval

**Usage:**
```bash
# 1. First approve PYUSD (one time)
# Run upgradePYUSDSimple.ts or approve manually

# 2. Then run combined script
npx hardhat run scripts/upgradeAndStreamPYUSD.ts --network sepolia
```

**When to use:**
- Advanced users
- Want atomic upgrade + stream
- Already have PYUSD approved

---

## Common Patterns

### Pattern 1: Initial Setup
First time using Superfluid with PYUSD:

```bash
# Step 1: Wrap PYUSD
npx hardhat run scripts/upgradePYUSDSimple.ts --network sepolia

# Step 2: Create stream
npx hardhat run scripts/createStreamPYUSD.ts --network sepolia
```

---

### Pattern 2: Multiple Streams
Create streams to different receivers:

```bash
# Wrap enough PYUSD for all streams
# Edit amount in upgradePYUSDSimple.ts to wrap more

# Create first stream
RECEIVER=0xReceiver1 FLOW_RATE=3858024691 \
npx hardhat run scripts/createStreamPYUSD.ts --network sepolia

# Create second stream
RECEIVER=0xReceiver2 FLOW_RATE=3858024691 \
npx hardhat run scripts/createStreamPYUSD.ts --network sepolia
```

---

### Pattern 3: Top Up SuperTokens
Already have SuperTokens, need more:

```bash
# Just wrap more PYUSD
npx hardhat run scripts/upgradePYUSDSimple.ts --network sepolia
```

---

### Pattern 4: Check Stream Status
After creating a stream:

```bash
npx hardhat run scripts/checkFlow.ts --network sepolia
```

---

### Pattern 5: Stop Stream
To stop a stream:

```bash
# Using CFAv1Forwarder (recommended)
npx hardhat run scripts/deleteFlowForwarder.ts --network sepolia

# Or direct CFA call
npx hardhat run scripts/deleteFlow.ts --network sepolia
```

---

## Decimal Conversion

PYUSD has **6 decimals**, SuperToken uses **18 decimals** internally.

### How It Works

```typescript
// PYUSD amount (6 decimals)
const pyusdAmount = parseUnits('10', 6) // 10000000 (10 * 10^6)

// Convert to 18 decimals for SuperToken
const underlyingDecimals = 6
const superTokenAmount = pyusdAmount * BigInt(10 ** (18 - underlyingDecimals))
// Result: 10000000000000000000 (10 * 10^18)

// Display value is same: 10 PYUSD = 10 SuperToken
```

### Why This Matters

- ✅ 1 PYUSD = 1 PYUSD SuperToken (1:1 ratio)
- ✅ Different precision, same value
- ✅ Scripts handle conversion automatically
- ✅ You don't need to worry about it!

---

## Troubleshooting

### Error: "Insufficient PYUSD balance"
**Solution:** Get more PYUSD tokens
```bash
# Check your balance first
cast balance --erc20 0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9 YOUR_ADDRESS
```

---

### Error: "You have no SuperTokens"
**Solution:** Run upgrade script first
```bash
npx hardhat run scripts/upgradePYUSDSimple.ts --network sepolia
```

---

### Error: "The contract function batchCall reverted"
**Possible causes:**
1. Insufficient SuperToken balance
2. Flow already exists to receiver
3. Invalid flow rate (must be > 0)
4. Receiver is same as sender

**Solution:** Check existing flows first
```bash
npx hardhat run scripts/checkFlow.ts --network sepolia
```

---

### Error: "Address is invalid"
**Cause:** Missing quotes around address
**Solution:** Wrap addresses in quotes:
```typescript
// Wrong
const PYUSD = 0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9

// Correct
const PYUSD = '0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9' as Address
```

---

### How to Check SuperToken Balance

```bash
# Using cast
cast call 0x8fece7605C7475cc5f1d697D8915408986CA9fB6 \
  "balanceOf(address)(uint256)" YOUR_ADDRESS \
  --rpc-url $SEPOLIA_RPC_URL

# Or check in script (already included)
```

---

### How to Check Stream Status

```bash
# Set addresses in .env
export SUPER_TOKEN=0x8fece7605C7475cc5f1d697D8915408986CA9fB6
export SENDER=0xYourAddress
export RECEIVER=0xReceiverAddress

# Run check
npx hardhat run scripts/checkFlow.ts --network sepolia
```

---

## Flow Rate Calculator

Calculate flow rate for your desired monthly amount:

### Formula
```
flowRate = (monthlyAmount * 10^18) / 2592000
```

### Common Rates

| Monthly Amount | Flow Rate (wei/sec) |
|----------------|---------------------|
| 1 PYUSD | 385802469135 |
| 10 PYUSD | 3858024691358 |
| 100 PYUSD | 38580246913580 |
| 1000 PYUSD | 385802469135802 |

### Calculate Custom Rate

```typescript
// For X PYUSD per month
const monthlyAmount = parseUnits('X', 18) // X PYUSD with 18 decimals
const flowRate = monthlyAmount / 2592000n

console.log('Flow rate:', flowRate.toString())
```

---

## Best Practices

### 1. Wrap First, Stream Later
✅ **Recommended:** Two separate steps
```bash
# Step 1: Wrap
npx hardhat run scripts/upgradePYUSDSimple.ts --network sepolia

# Step 2: Stream (anytime later)
npx hardhat run scripts/createStreamPYUSD.ts --network sepolia
```

### 2. Check Balance Before Streaming
```typescript
// Already included in createStreamPYUSD.ts
const balance = await superToken.read.balanceOf([address])
if (balance === 0n) {
  console.error('No SuperTokens! Wrap PYUSD first.')
}
```

### 3. Monitor Stream Health
Regularly check your balance to ensure stream doesn't run out:
```bash
npx hardhat run scripts/checkFlow.ts --network sepolia
```

### 4. Plan for Deposits
When creating a stream, a deposit is locked:
- Deposit = flowRate × liquidationPeriod
- Returned when stream is deleted
- Factor this into your balance planning

---

## Complete Example Session

```bash
# 1. Check PYUSD balance
cast balance --erc20 0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9 \
  0x41649a1F8B2499e2F7884184D062639CEF9d0601

# Output: 1000000000 (100 PYUSD)

# 2. Wrap 10 PYUSD to SuperToken
npx hardhat run scripts/upgradePYUSDSimple.ts --network sepolia
# ✓ Success: Now have 10 PYUSD SuperToken

# 3. Create stream (10 PYUSD/month)
RECEIVER=0xbBdb0a2F77636F819CFb02F528ba91775f1Aaf9E \
npx hardhat run scripts/createStreamPYUSD.ts --network sepolia
# ✓ Success: Stream created!

# 4. Check stream status
npx hardhat run scripts/checkFlow.ts --network sepolia
# Output: Flow rate: 3858024691 wei/sec, Monthly: 10 PYUSD

# 5. Later, stop the stream
npx hardhat run scripts/deleteFlowForwarder.ts --network sepolia
# ✓ Success: Stream deleted, deposit returned
```

---

## Summary

### Quick Reference

**Wrap PYUSD:**
```bash
npx hardhat run scripts/upgradePYUSDSimple.ts --network sepolia
```

**Create Stream:**
```bash
npx hardhat run scripts/createStreamPYUSD.ts --network sepolia
```

**Check Stream:**
```bash
npx hardhat run scripts/checkFlow.ts --network sepolia
```

**Delete Stream:**
```bash
npx hardhat run scripts/deleteFlowForwarder.ts --network sepolia
```

### Key Points
- ✅ Always wrap PYUSD first
- ✅ Use two-step workflow (wrap → stream)
- ✅ 1 PYUSD = 1 SuperToken (1:1 ratio)
- ✅ Streams are continuous (no per-second transactions)
- ✅ Check balance regularly
- ✅ Deposit is returned when stream ends

---

## Additional Resources

- **Superfluid Docs**: https://docs.superfluid.finance
- **BatchCall Guide**: `BATCHCALL_OPERATIONS_GUIDE.md`
- **Delete Flow Guide**: `DELETEFLOW_GUIDE.md`
- **Upgrade Comparison**: `UPGRADE_COMPARISON.md`

---

**Last Updated**: 2025
**Network**: Sepolia Testnet
**Protocol**: Superfluid V1

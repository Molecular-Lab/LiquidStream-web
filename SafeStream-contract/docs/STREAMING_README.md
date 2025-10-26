# 🌊 Superfluid Streaming Scripts (Hardhat v3 + Viem)

Complete scripts for creating and managing Superfluid streams using **Hardhat v3 with Viem**.

## 📦 Scripts Available

- `createFlow.ts` - Create a new stream
- `updateFlow.ts` - Update an existing stream's flow rate
- `deleteFlow.ts` - Stop/delete a stream
- `checkFlow.ts` - View stream information

## 🚀 Quick Start

### 1. Setup Environment Variables

Create a `.env` file:

```bash
# Required
SUPER_TOKEN=0x30a6933ca9230361972e413a15dc8114c952414e
RECEIVER=0xbBdb0a2F77636F819CFb02F528ba91775f1Aaf9E
FLOW_RATE=385802469135  # ~1000 tokens/month

# Optional (for checking streams)
SENDER=0x41649a1F8B2499e2F7884184D062639CEF9d0601

# Your private key
PRIVATE_KEY=0x...
```

### 2. Run Scripts

```bash
# Check stream info (read-only)
npx hardhat run scripts/checkFlow.ts --network sepolia

# Create a new stream
npx hardhat run scripts/createFlow.ts --network sepolia

# Update stream flow rate
npx hardhat run scripts/updateFlow.ts --network sepolia

# Delete/stop stream
npx hardhat run scripts/deleteFlow.ts --network sepolia
```

---

## 📊 Flow Rate Calculator

Flow rate is in **wei per second** (18 decimals):

```javascript
// Calculate flow rate for monthly streaming
const tokensPerMonth = 1000;
const flowRate = Math.floor((tokensPerMonth / 2592000) * 1e18);
console.log(flowRate); // 385802469135
```

### Common Flow Rates

| Monthly Amount | Flow Rate (wei/sec) |
|----------------|---------------------|
| 100 tokens/month | 38580246913 |
| 1000 tokens/month | 385802469135 |
| 10000 tokens/month | 3858024691358 |

---

## 🔧 Network Configurations

### Supported Networks

The scripts auto-detect networks:

**Sepolia Testnet (11155111)**
- Host: `0x109412E3C84f0539b43d39dB691B08c90f58dC7c`
- CFA: `0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef`

**Base Sepolia (84532)**
- Host: `0x109412E3C84f0539b43d39dB691B08c90f58dC7c`
- CFA: `0xcfA132E353cB4E398080B9700609bb008eceB125`

**Base Mainnet (8453)**
- Host: `0x4C073B3baB6d8826b8C5b229f3cfdC1eC6E47E74`
- CFA: `0x19ba78B9cDB05A877718841c574325fdB53601bb`

---

## 📝 Script Details

### 1. Create Stream

**File:** `scripts/createFlow.ts`

Creates a continuous money stream from sender to receiver.

**What it does:**
- Checks your SuperToken balance
- Encodes `createFlow` call data
- Calls `host.callAgreement(cfa, createFlowData)`
- ✨ Stream is now active - money flows every second!

**Example:**
```bash
SUPER_TOKEN=0x... RECEIVER=0x... FLOW_RATE=385802469135 \
npx hardhat run scripts/createFlow.ts --network sepolia
```

**Output:**
```
=== Creating Superfluid Stream (Viem) ===

Network: Sepolia Testnet
Chain ID: 11155111
Host: 0x109412E3C84f0539b43d39dB691B08c90f58dC7c
CFA: 0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef

SuperToken: 0x30a6933ca9230361972e413a15dc8114c952414e
Receiver: 0xbBdb0a2F77636F819CFb02F528ba91775f1Aaf9E
Flow Rate: 385802469135 wei/second
Sender: 0x41649a1F8B2499e2F7884184D062639CEF9d0601

Your SuperToken balance: 5000.0

Creating stream via Superfluid Host...

Transaction hash: 0x...
Waiting for confirmation...
Confirmed in block: 12345678

=== SUCCESS ===
Stream created! Money is now flowing continuously.
No more transactions needed - balance updates automatically!

Flow rate: 0.000000385802469135 tokens/sec
Daily flow: 0.03333333 tokens/day
Monthly flow: 1.0 tokens/month
```

---

### 2. Update Stream

**File:** `scripts/updateFlow.ts`

Changes the flow rate of an existing stream.

**Example:**
```bash
# Double the flow rate
SUPER_TOKEN=0x... RECEIVER=0x... FLOW_RATE=771604938271 \
npx hardhat run scripts/updateFlow.ts --network sepolia
```

---

### 3. Delete Stream

**File:** `scripts/deleteFlow.ts`

Stops the stream and returns your deposit.

**Example:**
```bash
SUPER_TOKEN=0x... RECEIVER=0x... \
npx hardhat run scripts/deleteFlow.ts --network sepolia
```

---

### 4. Check Stream

**File:** `scripts/checkFlow.ts`

View detailed stream information (read-only, no transaction).

**Example:**
```bash
SUPER_TOKEN=0x... RECEIVER=0x... SENDER=0x... \
npx hardhat run scripts/checkFlow.ts --network sepolia
```

**Output:**
```
=== Stream Info (Viem) ===

Network: Sepolia Testnet
Chain ID: 11155111
Sender: 0x41649a1F8B2499e2F7884184D062639CEF9d0601
Receiver: 0xbBdb0a2F77636F819CFb02F528ba91775f1Aaf9E
SuperToken: 0x30a6933ca9230361972e413a15dc8114c952414e

✅ Active stream found!

Flow Rate: 385802469135 wei/sec
Last Updated: 2025-01-17T10:30:00.000Z
Deposit: 120.0 tokens
Owed Deposit: 0.0 tokens

=== Calculated Flows ===
Per second: 0.000000385802469135 tokens
Per day:    0.03333333 tokens
Per month:  1.0 tokens

=== Balances ===
Sender balance:   4880.0 tokens
Receiver balance: 120.0 tokens

=== Real-time Balance (with active streams) ===
Available balance: 4760.0 tokens
Deposit: 120.0 tokens
Owed deposit: 0.0 tokens
```

---

## 🎯 Key Viem Features Used

### 1. Public Client (Read Operations)
```typescript
const publicClient = await hre.viem.getPublicClient();

// Read contract
const balance = await publicClient.readContract({
  address: superTokenAddr,
  abi: SUPER_TOKEN_ABI,
  functionName: "balanceOf",
  args: [sender],
});
```

### 2. Wallet Client (Write Operations)
```typescript
const [walletClient] = await hre.viem.getWalletClients();

// Write contract
const hash = await walletClient.writeContract({
  address: config.superfluidHost,
  abi: SUPERFLUID_HOST_ABI,
  functionName: "callAgreement",
  args: [config.cfa, createFlowData, "0x"],
});
```

### 3. Encode Function Data
```typescript
import { encodeFunctionData } from "viem";

const createFlowData = encodeFunctionData({
  abi: CFA_ABI,
  functionName: "createFlow",
  args: [superTokenAddr, receiver, flowRate, "0x"],
});
```

---

## 🔍 How Streaming Works

### Traditional Transfers
```
[TX] → Transfer 100 tokens → [Done]
```

### Superfluid Streaming
```
[TX: Create Stream] → 0.01 tokens/sec flowing → ∞

Balance calculated as:
receiverBalance = staticBalance + (currentTime - lastUpdate) × flowRate

✨ No gas after creation!
✨ Updates every second automatically!
```

---

## ⚙️ Contract Flow

```
┌─────────────────────────────────────────────────┐
│  1. Your Script (Viem)                          │
│     ↓ encodeFunctionData(createFlow)            │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  2. Superfluid Host                             │
│     host.callAgreement(cfa, createFlowData)     │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  3. Constant Flow Agreement V1 (CFA)            │
│     cfa.createFlow(token, receiver, flowRate)   │
│     • Stores flow state                         │
│     • Locks deposit                             │
│     • Records timestamp + rate                  │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  4. Stream is ACTIVE ⚡                         │
│     Balance = static + (now - last) × rate      │
│     No more transactions needed!                │
└─────────────────────────────────────────────────┘
```

---

## 🛠️ Troubleshooting

### "You need SuperTokens to create a stream"
**Solution:** Wrap your underlying tokens first:
```typescript
// Step 1: Approve
await underlying.approve(superTokenAddr, amount);

// Step 2: Upgrade (wrap)
await superToken.upgrade(amount);
```

### "Unsupported network"
**Solution:** Add your network config to `getNetworkConfig()`:
```typescript
function getNetworkConfig(chainId: number): NetworkConfig {
  const configs: { [key: number]: NetworkConfig } = {
    // Add your network
    YOUR_CHAIN_ID: {
      superfluidHost: "0x...",
      cfa: "0x...",
      networkName: "Your Network",
    },
  };
  // ...
}
```

### "Missing required environment variables"
**Solution:** Create `.env` file with all required variables.

---

## 📚 Additional Resources

- **Superfluid Docs:** https://docs.superfluid.finance
- **Viem Docs:** https://viem.sh
- **Hardhat v3 Docs:** https://hardhat.org
- **Network Addresses:** https://docs.superfluid.finance/superfluid/developers/networks

---

## 🎉 Summary

**You now have:**
- ✅ Full Hardhat v3 + Viem streaming scripts
- ✅ Create, update, delete, and check streams
- ✅ Auto-detected network configurations
- ✅ Type-safe Viem client usage
- ✅ Complete flow rate calculators

**Start streaming money continuously with zero gas! 🌊**

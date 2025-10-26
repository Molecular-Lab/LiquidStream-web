# PYUSD SuperToken Upgrade/Downgrade Scripts

Complete guide for wrapping and unwrapping PYUSD using Hardhat scripts.

## Scripts Overview

| Script | Purpose |
|--------|---------|
| `checkBalances.ts` | Check PYUSD and SuperToken balances, allowances, and status |
| `upgradePYUSD.ts` | Wrap PYUSD → SuperToken (approve + upgrade) |
| `downgradePYUSD.ts` | Unwrap SuperToken → PYUSD (downgrade) |

---

## Prerequisites

### 1. Environment Setup

Make sure your `.env` file has:

```bash
# Network RPC
SEPOLIA_RPC=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY

# Your private key
PRIVKEY=your_private_key_here

# Token addresses
PYUSD_ADDRESS=0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9
SUPERTOKEN_ADDRESS=0x8fece7605C7475cc5f1d697D8915408986CA9fB6
```

### 2. Install Dependencies

```bash
cd hardhat-deployment
pnpm install
```

---

## Usage

### Step 1: Check Your Balances

First, check your current balances and approval status:

```bash
npx hardhat run scripts/checkBalances.ts --network sepolia
```

**Output Example:**
```
=== Checking Balances ===

--- Contract Addresses ---
PYUSD Address: 0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9
SuperToken Address: 0x8fece7605C7475cc5f1d697D8915408986CA9fB6
User Address: 0xYourAddress

--- Token Information ---
PYUSD:
  Name: PayPal USD
  Symbol: PYUSD
  Decimals: 6

SuperToken:
  Name: Super PayPal USD
  Symbol: PYUSDx
  Decimals: 18
  Underlying Decimals: 6

--- User Balances ---
PYUSD Balance: 1000.0 PYUSD
SuperToken Balance: 0.0 PYUSDx

--- Approval Status ---
Current Allowance: 0.0 PYUSD

--- Status ---
✓ You have PYUSD tokens
❌ No approval set for SuperToken
   → Run: npx hardhat run scripts/upgradePYUSD.ts --network sepolia
```

---

### Step 2: Upgrade (Wrap) PYUSD → SuperToken

This script will:
1. Approve SuperToken to spend your PYUSD
2. Call `upgrade()` to wrap PYUSD into SuperToken

**Edit the amount first** in `scripts/upgradePYUSD.ts` (line 33):
```typescript
const AMOUNT = ethers.parseUnits('100', 6); // Change 100 to your amount
```

Then run:
```bash
npx hardhat run scripts/upgradePYUSD.ts --network sepolia
```

**Output Example:**
```
=== Upgrading PYUSD to SuperToken ===

PYUSD Address: 0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9
SuperToken Address: 0x8fece7605C7475cc5f1d697D8915408986CA9fB6
User Address: 0xYourAddress

Amount to wrap: 100.0 PYUSD

--- BEFORE ---
PYUSD Balance: 1000.0
SuperToken Balance: 0.0

--- STEP 1: Check Allowance ---
Current Allowance: 0.0
Need to approve SuperToken to spend PYUSD...

--- STEP 2: Approve ---
Approving 100.0 PYUSD...
Approval TX: 0xabc123...
✓ Approved!

--- STEP 3: Upgrade (Wrap) ---
Upgrading 100.0 PYUSD to SuperToken...
Upgrade amount (18 decimals): 100.0
Upgrade TX: 0xdef456...
✓ Upgraded!

--- AFTER ---
PYUSD Balance: 900.0
SuperToken Balance: 100.0

=== SUCCESS ===
Wrapped 100.0 PYUSD
Received 100.0 SuperToken

You can now use your SuperTokens for streaming!
```

---

### Step 3: Downgrade (Unwrap) SuperToken → PYUSD

When you want to convert back to PYUSD.

**Edit the amount first** in `scripts/downgradePYUSD.ts` (line 33):
```typescript
const AMOUNT = ethers.parseUnits('50', 18); // Change 50 to your amount
```

Then run:
```bash
npx hardhat run scripts/downgradePYUSD.ts --network sepolia
```

**Output Example:**
```
=== Downgrading SuperToken to PYUSD ===

PYUSD Address: 0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9
SuperToken Address: 0x8fece7605C7475cc5f1d697D8915408986CA9fB6
User Address: 0xYourAddress

Amount to unwrap: 50.0 SuperToken

--- BEFORE ---
PYUSD Balance: 900.0
SuperToken Balance: 100.0

--- DOWNGRADE (Unwrap) ---
Downgrading 50.0 SuperToken to PYUSD...
Downgrade TX: 0x789abc...
✓ Downgraded!

--- AFTER ---
PYUSD Balance: 950.0
SuperToken Balance: 50.0

=== SUCCESS ===
Unwrapped 50.0 SuperToken
Received 50.0 PYUSD
Expected 50.0 PYUSD

You now have your PYUSD back!
```

---

## Important Notes

### Decimals Conversion

- **PYUSD**: 6 decimals (1 PYUSD = 1,000,000 units)
- **SuperToken**: 18 decimals (1 SuperToken = 1,000,000,000,000,000,000 units)
- The scripts handle conversion automatically!

### Amount Examples

**For upgradePYUSD.ts (PYUSD has 6 decimals):**
```typescript
const AMOUNT = ethers.parseUnits('1', 6);      // 1 PYUSD
const AMOUNT = ethers.parseUnits('10', 6);     // 10 PYUSD
const AMOUNT = ethers.parseUnits('100', 6);    // 100 PYUSD
const AMOUNT = ethers.parseUnits('1000', 6);   // 1000 PYUSD
```

**For downgradePYUSD.ts (SuperToken has 18 decimals):**
```typescript
const AMOUNT = ethers.parseUnits('1', 18);     // 1 SuperToken
const AMOUNT = ethers.parseUnits('10', 18);    // 10 SuperToken
const AMOUNT = ethers.parseUnits('100', 18);   // 100 SuperToken
const AMOUNT = ethers.parseUnits('1000', 18);  // 1000 SuperToken
```

---

## Troubleshooting

### Error: "Insufficient PYUSD balance"
You don't have enough PYUSD. Get PYUSD first or reduce the amount.

### Error: "Insufficient SuperToken balance"
You don't have enough SuperToken. Reduce the amount in downgradePYUSD.ts.

### Error: "execution reverted" during upgrade
1. Check you have enough PYUSD
2. Verify PYUSD is not paused
3. Make sure your address is not blocklisted
4. Try running checkBalances.ts to diagnose

### Error: "transaction underpriced"
Increase gas price. The scripts use default gas settings.

### Check Transaction on Explorer
- Sepolia: https://sepolia.etherscan.io/tx/YOUR_TX_HASH

---

## Complete Workflow Example

```bash
# 1. Check initial balances
npx hardhat run scripts/checkBalances.ts --network sepolia

# 2. Edit upgradePYUSD.ts to set your amount
# Change line 33: const AMOUNT = ethers.parseUnits('100', 6);

# 3. Wrap PYUSD to SuperToken
npx hardhat run scripts/upgradePYUSD.ts --network sepolia

# 4. Check balances again
npx hardhat run scripts/checkBalances.ts --network sepolia

# 5. Use SuperTokens for streaming...

# 6. When done, edit downgradePYUSD.ts to set amount
# Change line 33: const AMOUNT = ethers.parseUnits('50', 18);

# 7. Unwrap SuperToken back to PYUSD
npx hardhat run scripts/downgradePYUSD.ts --network sepolia

# 8. Check final balances
npx hardhat run scripts/checkBalances.ts --network sepolia
```

---

## Network Configuration

The scripts work with any network configured in `hardhat.config.ts`.

### Running on Different Networks

```bash
# Sepolia testnet
npx hardhat run scripts/upgradePYUSD.ts --network sepolia

# Base Mainnet (if configured)
npx hardhat run scripts/upgradePYUSD.ts --network base

# Ethereum Mainnet (if configured)
npx hardhat run scripts/upgradePYUSD.ts --network mainnet
```

Make sure your `.env` has the correct addresses for each network!

---

## What Happens Under the Hood

### Upgrade Process (`upgrade(amount)`)

1. **User approves** SuperToken to spend PYUSD
   ```solidity
   PYUSD.approve(superTokenAddress, amount)
   ```

2. **SuperToken contract** transfers PYUSD from user
   ```solidity
   _underlyingToken.safeTransferFrom(account, address(this), underlyingAmount);
   ```

3. **SuperToken mints** equivalent amount to user (1:1 ratio)
   ```solidity
   _mint(operator, to, adjustedAmount, ...);
   ```

### Downgrade Process (`downgrade(amount)`)

1. **SuperToken burns** user's tokens
   ```solidity
   _burn(operator, account, adjustedAmount, ...);
   ```

2. **SuperToken transfers** PYUSD back to user
   ```solidity
   _underlyingToken.safeTransfer(to, underlyingAmount);
   ```

---

## Security Notes

1. **Always check balances first** using checkBalances.ts
2. **Start with small amounts** on testnet
3. **Verify token addresses** in your .env
4. **Keep your private key safe** - never commit it to git
5. **The contracts are 1:1 backed** - you can always unwrap

---

## Need Help?

- Check balances: `npx hardhat run scripts/checkBalances.ts --network sepolia`
- View transactions: https://sepolia.etherscan.io
- Superfluid docs: https://docs.superfluid.finance

---

**Happy Wrapping! 🚀**

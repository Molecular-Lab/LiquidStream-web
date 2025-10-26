# SafeStream Contract Project

Hardhat project for deploying and managing Superfluid SuperToken wrappers (PYUSDx) for SafeStream payroll streaming.

## Quick Start

### 1. Install & Setup
```bash
# Install dependencies
make install

# Copy and configure environment
cp .env.example .env
# Edit .env and add your values (see below)
```

### 2. Configure Environment

Edit `.env` with your values:

```bash
# Required
SEPOLIA_RPC=https://sepolia.infura.io/v3/YOUR_KEY
PRIVKEY=0xYOUR_PRIVATE_KEY

# Get PYUSD from faucet: https://faucet.circle.com/
PYUSD_ADDRESS=0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9

# Superfluid Protocol (pre-deployed on Sepolia)
SUPERFLUID_HOST=0x109412E3C84f0539b43d39dB691B08c90f58dC7c
CFA_ADDRESS=0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef

# Leave empty initially, will be set after deployment
SUPERTOKEN_ADDRESS=

# Optional
ETHERSCAN_API_KEY=your_api_key
```

⚠️ **Security:** Never commit `.env` with real keys! It's in `.gitignore`.

## Workflow

### Step 1: Deploy SuperToken
```bash
make deploy
```
- Creates wrapped SuperToken (PYUSDx) on Sepolia
- **⚠️ Important:** Copy the deployed address and update `SUPERTOKEN_ADDRESS` in `.env`

### Step 2: Wrap PYUSD to SuperToken
```bash
make upgrade
```
- Approves and wraps PYUSD to SuperToken in one transaction
- Edit script to change amount (default: 10 PYUSD)

### Step 3: Start Payment Stream
```bash
make stream-start
```
- Starts continuous payment stream
- Adjust recipient and flow rate in script

### Step 4: Monitor Stream
```bash
# Check active streams
make stream-check

# Check token balances
make balance
```

### Step 5: Stop Stream (when needed)
```bash
make stream-stop
```

### Step 6: Unwrap (optional)
```bash
make downgrade
```
- Unwraps SuperToken back to PYUSD

## All Make Commands

```bash
make help           # Show all commands
make install        # Install dependencies
make compile        # Compile interfaces
make deploy         # Deploy SuperToken
make upgrade        # Wrap PYUSD → SuperToken
make downgrade      # Unwrap SuperToken → PYUSD
make stream-start   # Start payment stream
make stream-check   # Check streams
make stream-stop    # Stop stream
make balance        # Check balances
make clean          # Clean artifacts
```

## Project Structure

- `contracts/interfaces/` - Superfluid protocol interfaces (23 files)
- `contracts/custom/` - Your custom contracts (if needed)
- `abi/` - Contract ABIs for scripts
- `scripts/supertoken/` - Deployment & management scripts
  - `registration/` - Deploy SuperToken
  - `upgrade-token/` - Wrap tokens
  - `downgrade-token/` - Unwrap tokens
  - `create-streaming/` - Start streams
  - `stop-streaming/` - Stop streams
  - `get-streaming/` - Query streams

## Contract Addresses (Sepolia)

| Contract | Address |
|----------|---------|
| PYUSD | `0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9` |
| Superfluid Host | `0x109412E3C84f0539b43d39dB691B08c90f58dC7c` |
| CFA | `0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef` |
| PYUSDx SuperToken | Set after deployment |

## Integration with Web App

After deployment, update `SafeStream-web/src/lib/contract.ts`:
```typescript
export const PYUSDX_ADDRESS = "0xYOUR_DEPLOYED_ADDRESS"
```

## Documentation

- [Quick Start Guide](./docs/QUICKSTART.md)
- [Superfluid Docs](https://docs.superfluid.finance)

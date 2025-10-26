# SafeStream Contract Architecture

## Overview

SafeStream uses **Superfluid Protocol** for real-time payment streaming. Instead of maintaining local contract copies, we use the `@superfluid-finance/ethereum-contracts` package and deploy to already-deployed protocol contracts.

## Why No Local Contracts?

### Previous Approach (Problematic)
- ❌ Copied individual Superfluid contracts
- ❌ Missing dependencies (upgradability, libs, agreements)
- ❌ Import path issues
- ❌ Hard to maintain and update
- ❌ Compilation errors

### Current Approach (Clean)
- ✅ Use `@superfluid-finance/ethereum-contracts` npm package
- ✅ No compilation needed
- ✅ Deploy scripts interact with deployed Superfluid contracts
- ✅ Easy to update (just update package version)
- ✅ All dependencies included

## Project Components

### 1. Deployment Scripts (`/scripts`)
Interact with already-deployed Superfluid contracts:
- **registration/** - Deploy new wrapped SuperTokens
- **upgrade-token/** - Wrap ERC20 to SuperToken
- **downgrade-token/** - Unwrap SuperToken to ERC20
- **create-streaming/** - Start payment streams
- **stop-streaming/** - Stop payment streams
- **get-streaming/** - Query stream info

### 2. ABIs (`/abi`)
Minimal ABIs for deployment operations:
- `erc20_metadata_abi.json` - Read underlying token info
- `superfluid_host_abi.json` - Get factory address
- `supertoken_factory_abi.json` - Deploy SuperTokens
- `supertoken_abi.json` - SuperToken operations
- `abis.ts` - TypeScript exports for web integration

### 3. Configuration
- `hardhat.config.ts` - Network configs (Sepolia, etc.)
- `.env` - Private keys and RPC endpoints
- `package.json` - Dependencies and scripts

## Superfluid Protocol Contracts (Sepolia)

Already deployed - we don't deploy these:

```
Superfluid Host:     0x109412E3C84f0539b43d39dB691B08c90f58dC7c
CFA (Flow Agreement): 0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef
```

## What We Deploy

Only **wrapped SuperTokens** (e.g., PYUSDx):

```typescript
// Deployment flow:
1. Call SuperfluidHost.getSuperTokenFactory()
2. Call factory.createERC20Wrapper(underlyingToken, ...)
3. Get new SuperToken address from event
4. Users can now upgrade/downgrade/stream
```

## Integration with Web App

### ABI Sync
```bash
# ABIs are maintained in contract project
# Web app imports from: SafeStream-web/src/asset/abi.ts
# Keep in sync manually or via CI/CD
```

### Contract Addresses
```typescript
// SafeStream-web/src/lib/contract.ts
export const PYUSDX_ADDRESS = "0x..." // Update after deployment
export const SF_HOST = "0x109412E3C84f0539b43d39dB691B08c90f58dC7c"
export const CFA_ADDRESS = "0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef"
```

## Deployment Workflow

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.example .env
# Edit .env with SEPOLIA_RPC, PRIVKEY

# 3. Deploy SuperToken (no compilation!)
pnpm deploy

# 4. Save output address
# Update SafeStream-web/src/lib/contract.ts

# 5. Test in web app
cd ../SafeStream-web
pnpm dev
```

## Benefits of This Architecture

1. **No Compilation** - Deploy scripts only, no contract compilation
2. **Always Up-to-Date** - Update package version to get latest Superfluid
3. **Smaller Repo** - No large contract folders
4. **Fewer Errors** - No import path or dependency issues
5. **Easier Maintenance** - One source of truth (Superfluid package)
6. **Production Ready** - Using official audited contracts

## Security

- Private keys in `.env` (gitignored)
- No contract modifications (using official Superfluid)
- Deployment scripts use local ABIs (no network dependencies)
- All transactions signed locally with your private key

## Resources

- [Superfluid Docs](https://docs.superfluid.finance/)
- [Superfluid GitHub](https://github.com/superfluid-finance/protocol-monorepo)
- [SafeStream Documentation](../docs/)

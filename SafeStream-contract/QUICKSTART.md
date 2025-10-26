# SafeStream Quick Reference

## First Time Setup (5 minutes)

```bash
# 1. Install
make install

# 2. Configure
cp .env.example .env
nano .env  # Add SEPOLIA_RPC and PRIVKEY

# 3. Deploy SuperToken
make deploy
# Copy output address → Update SUPERTOKEN_ADDRESS in .env

# 4. Get PYUSD tokens
# Visit: https://faucet.circle.com/ (Sepolia testnet)
```

## Daily Operations

### Wrap & Stream
```bash
make upgrade        # Wrap PYUSD → SuperToken (10 tokens)
make stream-start   # Start payment stream
make stream-check   # Verify stream is active
```

### Stop & Unwrap
```bash
make stream-stop    # Stop payment stream
make stream-check   # Verify stream stopped
make downgrade      # Unwrap SuperToken → PYUSD (5 tokens)
```

### Monitor
```bash
make balance        # Check PYUSD and SuperToken balances
make stream-check   # Check active streams and flow rates
```

## Full Workflow Example

```bash
# Step 1: Deploy (one time)
make deploy
# Output: SuperToken deployed at: 0xABC...
# → Update SUPERTOKEN_ADDRESS=0xABC... in .env

# Step 2: Get test tokens
# → Visit Circle PYUSD faucet

# Step 3: Wrap tokens
make upgrade
# Wraps 10 PYUSD → 10 PYUSDx

# Step 4: Check balance
make balance
# Shows: PYUSD: 118, PYUSDx: 10

# Step 5: Start streaming
make stream-start
# Starts stream to employee

# Step 6: Monitor
make stream-check
# Shows: Flow active, rate: X tokens/sec

# Step 7: Stop streaming
make stream-stop
# Stops all streams

# Step 8: Unwrap (optional)
make downgrade
# Unwraps 5 PYUSDx → 5 PYUSD
```

## Customization

### Change Wrap Amount
Edit `scripts/supertoken/upgrade-token/upgradePYUSDBatch.ts`:
```typescript
const AMOUNT = parseUnits('50', 6) // Change 10 to 50
```

### Change Unwrap Amount
Edit `scripts/supertoken/downgrade-token/downgradePYUSD.ts`:
```typescript
const AMOUNT = parseUnits('20', 6) // Change 5 to 20
```

### Change Stream Recipient & Rate
Edit `scripts/supertoken/create-streaming/batchCreateFlow.ts`:
```typescript
const receiver = '0xRECIPIENT_ADDRESS'
const flowRate = '385802469' // tokens per second (wei)
```

#### Flow Rate Examples
```
$100/month   = 385,802,469 wei/sec
$1000/month  = 3,858,024,691 wei/sec
$50,000/year = 1,585,489,599 wei/sec
```

## Environment Variables

Required in `.env`:
- `SEPOLIA_RPC` - Infura/Alchemy RPC endpoint
- `PRIVKEY` - Your wallet private key (0x-prefixed)
- `PYUSD_ADDRESS` - PYUSD token address (default provided)
- `SUPERTOKEN_ADDRESS` - Deployed SuperToken address (set after deploy)
- `SUPERFLUID_HOST` - Superfluid host (default provided)
- `CFA_ADDRESS` - CFA contract (default provided)

Optional:
- `ETHERSCAN_API_KEY` - For contract verification

## Troubleshooting

### "Insufficient PYUSD balance"
→ Get more from faucet: https://faucet.circle.com/

### "SuperToken not deployed"
→ Run `make deploy` and update `SUPERTOKEN_ADDRESS` in `.env`

### "Transaction reverted"
→ Check you have enough PYUSD and gas (ETH)

### "PRIVKEY not set"
→ Edit `.env` and add your private key

## Security

- ✅ `.env` is in `.gitignore`
- ❌ Never commit `.env` with real keys
- ❌ Never share your `PRIVKEY`
- ✅ Use testnet (Sepolia) for development
- ✅ Use separate wallet for testing

## Resources

- Makefile commands: `make help`
- Full docs: `README.md`
- ABI docs: `abi/README.md`
- Superfluid: https://docs.superfluid.finance
- Circle PYUSD: https://faucet.circle.com/

# LiquidStream Quick Start Guide

## 🚀 Getting Started

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment
Create a `.env` file:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id
```

Get your WalletConnect Project ID from: https://cloud.walletconnect.com/

### 3. Run Development Server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 Using the Dashboard

### Step 1: Connect Your Wallet
1. Click "Connect Wallet" in the top right
2. Select your wallet (MetaMask, Coinbase Wallet, etc.)
3. Approve the connection

### Step 2: Add Employees
1. Click "Add Employee" button
2. Fill in employee details:
   - Full Name
   - Email
   - Wallet Address (Ethereum address to receive payments)
   - Role (Developer, Designer, Manager, etc.)
   - Department
   - Annual Salary (in USD)
3. Click "Add Employee"

### Step 3: Start Payment Streams
1. Find the employee in the list
2. Click the ⋮ menu button on the right
3. Click "Start Stream"
4. Review PYUSD stream details (PayPal USD)
5. Click "Start Stream"
6. Approve the transaction in your wallet

### Step 4: Monitor Streams
- View active streams in the employee list (green "Streaming" badge)
- Check dashboard stats for total burn rate
- Real-time balance updates every 10 seconds

### Step 5: Stop Streams
1. Click the ⋮ menu on an employee with active stream
2. Click "Stop Stream"
3. Approve the transaction in your wallet

## 📝 Important Notes

### Testnet Setup
- The app is configured for **Sepolia testnet** by default
- You'll need testnet ETH for gas fees
- Get testnet ETH from: https://sepoliafaucet.com/

### Super Tokens
- Payment streams use **Super Tokens** (PYUSDx)
- Super Tokens are wrapped versions of PayPal USD
- You need to wrap your PYUSD first (PYUSD → PYUSDx)

### Getting Test Tokens
1. Get testnet PYUSD from faucet (check PayPal developer docs)
2. Wrap to PYUSDx using Superfluid dashboard: https://console.superfluid.finance/

### Contract Addresses (Sepolia)
- **CFA (Flow Agreement)**: `0x18fB38404DADeE1727Be4b805c5b242B5413Fa40`
- **PYUSDx (Super PYUSD)**: Update with actual address when deployed

## 🛠️ Troubleshooting

### "Insufficient balance" error
- Make sure you have testnet ETH for gas
- Ensure you have wrapped PYUSD (PYUSDx)
- Check your balance is greater than the deposit buffer required

### Transaction fails
- Increase gas limit in wallet settings
- Make sure you're on the correct network (Sepolia)
- Check if you have approval for the token

### Stream doesn't appear
- Wait for transaction confirmation (can take 15-30 seconds)
- Refresh the page
- Check transaction on Etherscan: https://sepolia.etherscan.io/

### Can't see employees
- Employees are stored in browser localStorage
- Clear browser cache will reset employee data
- Export data before clearing cache (feature coming soon)

## 🔗 Useful Links

- **PayPal Developer**: https://developer.paypal.com/
- **PYUSD Info**: https://www.paypal.com/pyusd
- **Superfluid Docs**: https://docs.superfluid.finance/
- **Superfluid Console**: https://console.superfluid.finance/
- **Sepolia Etherscan**: https://sepolia.etherscan.io/
- **Sepolia Faucet**: https://sepoliafaucet.com/
- **WalletConnect**: https://cloud.walletconnect.com/

## 📱 Supported Wallets
- MetaMask
- Coinbase Wallet
- WalletConnect compatible wallets
- Rainbow Wallet
- Trust Wallet

## 🔐 Security Notes
- Never share your private keys
- This is a testnet application - do not use with mainnet funds
- Always verify transaction details before signing
- Keep your seed phrase secure

## 💡 Tips
- Start with small test amounts first
- Monitor your stream balance regularly
- Keep extra buffer tokens for gas fees
- Use clear naming for employees
- Double-check wallet addresses before starting streams

---

**Need Help?** Check the [README.md](./README.md) or [IMPLEMENTATION.md](./IMPLEMENTATION.md) for more details.

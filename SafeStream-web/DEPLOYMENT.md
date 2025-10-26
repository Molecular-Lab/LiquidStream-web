# 🚀 Deployment Checklist for LiquidStream

## Pre-Deployment Steps

### 1. Environment Configuration
- [ ] Create `.env` file from `.env.example`
- [ ] Get WalletConnect Project ID from https://cloud.walletconnect.com/
- [ ] Add `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` to `.env`
- [ ] Verify `NEXT_PUBLIC_APP_URL` is correct
- [ ] (Optional) Add Google Analytics ID

### 2. Smart Contract Addresses
- [ ] Verify Superfluid contract addresses in `src/lib/contract.ts`
- [ ] Update if deploying to different network
- [ ] Test contract addresses on block explorer

**Current Addresses (Sepolia Testnet):**
```typescript
CFA: 0x18fB38404DADeE1727Be4b805c5b242B5413Fa40
USDCx: 0x42bb40bF79730451B11f6De1CbA222F17b87Afd7
DAIx: 0x1305F6B6Df9Dc47159D12Eb7aC2804d4A33173c2
```

### 3. Network Configuration
- [ ] Verify supported chains in `src/config/wallet.ts`
- [ ] Add/remove chains as needed
- [ ] Update RPC endpoints if using custom providers

**Current Chains:**
- Sepolia (Ethereum testnet)
- Scroll Sepolia
- Optimism Sepolia
- Base Sepolia

### 4. Dependencies
- [ ] Run `pnpm install` to ensure all deps are installed
- [ ] Check for any security vulnerabilities: `pnpm audit`
- [ ] Update outdated packages: `pnpm update --latest`

### 5. Code Quality
- [ ] Run linter: `pnpm lint`
- [ ] Fix any linting errors
- [ ] Format code: `pnpm format`
- [ ] Remove console.logs from production code

### 6. Testing
- [ ] Test wallet connection
- [ ] Test adding employees
- [ ] Test starting streams (requires testnet tokens)
- [ ] Test stopping streams
- [ ] Test dashboard calculations
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Test on mobile devices
- [ ] Test error states

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   pnpm install -g vercel
   
   # Deploy
   vercel
   ```

2. **Configure Environment Variables in Vercel Dashboard**
   - Go to Project Settings → Environment Variables
   - Add `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`
   - Add `NEXT_PUBLIC_APP_URL` (your Vercel URL)
   - Add `NEXT_PUBLIC_GA_ID` (optional)

3. **Deploy**
   - Push to main branch
   - Vercel auto-deploys
   - Or run: `vercel --prod`

### Option 2: Netlify

1. **Build Command**
   ```
   pnpm build
   ```

2. **Publish Directory**
   ```
   .next
   ```

3. **Environment Variables**
   - Add in Netlify dashboard under Site settings → Environment variables

### Option 3: Self-Hosted

1. **Build for Production**
   ```bash
   pnpm build
   ```

2. **Start Production Server**
   ```bash
   pnpm start
   ```

3. **Using PM2 (Process Manager)**
   ```bash
   npm install -g pm2
   pm2 start npm --name "liquidstream" -- start
   pm2 save
   pm2 startup
   ```

## Post-Deployment

### 1. Verify Deployment
- [ ] Visit deployed URL
- [ ] Test wallet connection
- [ ] Check all pages load correctly
- [ ] Test on mobile
- [ ] Check console for errors

### 2. Monitor
- [ ] Set up error tracking (Sentry, LogRocket)
- [ ] Monitor deployment logs
- [ ] Check analytics (if configured)

### 3. Documentation
- [ ] Update README with live demo URL
- [ ] Add screenshots/demo video
- [ ] Document any deployment-specific setup

## Mainnet Deployment (Future)

### Critical Updates Needed
- [ ] Update all contract addresses to mainnet
- [ ] Change RPC endpoints to mainnet
- [ ] Update supported chains
- [ ] Add extensive testing on mainnet fork
- [ ] Security audit of smart contract interactions
- [ ] Set up multi-sig for admin functions
- [ ] Add backend for employee data (not localStorage)
- [ ] Implement proper authentication/authorization
- [ ] Add rate limiting
- [ ] Set up monitoring and alerts
- [ ] Create incident response plan

### Contract Addresses for Mainnet
```typescript
// Update in src/lib/contract.ts
export const SuperfluidContracts = {
  // Mainnet addresses (example - verify from docs)
  cfaV1: "0xEb796bdb90fFA0f28255275e16936D25d3418603" as Address,
  host: "0x4C073B3baB6d8826b8C5b229f3cFdC1eC6E47E74" as Address,
  usdcx: "0x1BA8603DA702602A8657980e825A6DAa03Dee93a" as Address,
  // ... verify all addresses
}
```

## Security Checklist

### Before Going Live
- [ ] No private keys in code
- [ ] Environment variables properly secured
- [ ] No console.logs with sensitive data
- [ ] HTTPS enabled
- [ ] CSP headers configured
- [ ] Rate limiting implemented
- [ ] Input validation on all forms
- [ ] Error messages don't leak sensitive info
- [ ] Dependencies up to date
- [ ] Security audit completed

## Performance Optimization

### For Production
- [ ] Enable compression (gzip/brotli)
- [ ] Optimize images
- [ ] Enable caching headers
- [ ] Use CDN for static assets
- [ ] Lazy load heavy components
- [ ] Code splitting configured
- [ ] Remove unused dependencies

## Backup & Recovery

### Important Data
- [ ] Document employee data structure
- [ ] Create export functionality
- [ ] Set up regular backups (if using backend)
- [ ] Document recovery procedures

## Legal & Compliance

### Before Public Launch
- [ ] Terms of Service
- [ ] Privacy Policy
- [ ] Cookie consent (if applicable)
- [ ] GDPR compliance (if EU users)
- [ ] Financial regulations compliance
- [ ] User data handling policy

## Marketing & Launch

### Hackathon Submission
- [ ] Demo video prepared
- [ ] GitHub repository cleaned up
- [ ] README has clear instructions
- [ ] Screenshots added
- [ ] Live demo deployed
- [ ] Presentation slides ready

### Social Media
- [ ] Announcement post prepared
- [ ] Demo GIF/video created
- [ ] Documentation links ready
- [ ] Twitter/X thread planned

## Troubleshooting

### Common Issues

**Build Fails**
```bash
# Clear cache and reinstall
rm -rf node_modules .next
pnpm install
pnpm build
```

**Environment Variables Not Working**
- Ensure they start with `NEXT_PUBLIC_` for client-side
- Restart dev server after adding new env vars
- Check Vercel/Netlify dashboard for deployment env vars

**Wallet Connection Issues**
- Verify WalletConnect Project ID is correct
- Check network configuration
- Ensure HTTPS in production (required by some wallets)

**Transaction Fails**
- Verify contract addresses
- Check user has sufficient gas
- Verify network is correct
- Check Superfluid approval

## Support Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Deployment**: https://vercel.com/docs
- **Superfluid Docs**: https://docs.superfluid.finance/
- **Wagmi Docs**: https://wagmi.sh/
- **RainbowKit Docs**: https://www.rainbowkit.com/

---

## Quick Deploy Commands

### Testnet (Vercel)
```bash
# Install Vercel CLI
pnpm install -g vercel

# Login
vercel login

# Deploy
vercel

# Or production deploy
vercel --prod
```

### Build Locally
```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Test production build
pnpm start
```

---

**Last Updated**: October 23, 2025
**Status**: Ready for Deployment ✅

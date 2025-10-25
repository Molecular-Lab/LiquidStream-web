# SafeStream - Enterprise Payroll Streaming with PayPal USD

> **Real-time Salary Streaming Powered by PYUSD and Superfluid Protocol**

![ETHGlobal](https://img.shields.io/badge/ETHGlobal-2025-blue)
![PayPal Track](https://img.shields.io/badge/Track-PayPal%20USD-003087)
![Status](https://img.shields.io/badge/Status-Hackathon%20Ready-success)

SafeStream is a decentralized, enterprise-grade payroll streaming platform that enables companies to stream PYUSD (PayPal USD) payments directly to employees' wallets in real-time. Built for ETHGlobal's PayPal sponsor track, SafeStream combines the stability and trust of PayPal USD with Superfluid's revolutionary payment streaming technology and optional Safe multisig governance.

**Why SafeStream + PYUSD?**
- Stream salaries per-second instead of monthly batches
- Near-zero transaction fees with PYUSD stability
- Complete transparency with on-chain verification
- Enterprise-grade Safe multisig treasury governance
- Global payroll without wire transfer delays or currency conversion

## Table of Contents

- [PayPal USD Integration](#paypal-usd-integration)
- [Overview](#overview)
- [Key Features](#key-features)
- [How It Works](#how-it-works)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Architecture](#architecture)
- [Sponsor Track Alignment](#sponsor-track-alignment)
- [Future Roadmap](#future-roadmap)

## PayPal USD Integration

### Why PYUSD for Payroll?

SafeStream was built from the ground up with PayPal USD as the primary payment currency:

**1. Trust & Brand Recognition**
- Backed by PayPal's 430M+ active user base
- Issued by Paxos, regulated by NYDFS
- 1:1 USD backing with full transparency

**2. Stability & Compliance**
- Price stability crucial for payroll operations
- Regulatory compliance reduces enterprise adoption barriers
- Seamless integration with existing PayPal ecosystem

**3. Cost Efficiency**
- Low transaction fees for high-volume payroll
- No currency conversion costs
- Eliminates traditional wire transfer fees (2-5% savings)

**4. Real-World Utility**
- Employees can easily convert to fiat via PayPal
- Direct spending through Venmo integration
- Bridge between traditional finance and Web3

### Implementation Details

**Token Configuration** (`/src/config/currency.ts`)

```typescript
export const PYUSD_ADDRESS = '0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9' // Sepolia
export const PYUSDX_ADDRESS = '0x...' // Superfluid-wrapped PYUSD

// Automatic wrapping for streaming
PYUSD → PYUSDx (Super Token) → Real-time streaming
```

**Smart Contract Integration:**
- **Superfluid CFA (Constant Flow Agreement)** - Enables continuous payment streams
- **Token Wrapping** - PYUSD ↔ PYUSDx conversions for streaming
- **Safe Protocol** - Multisig treasury management for enterprise security

**Supported Networks:**
- Ethereum Sepolia (Primary)
- Scroll Sepolia
- Optimism Sepolia
- Base Sepolia

## Overview

SafeStream transforms how companies compensate their workforce by leveraging blockchain technology and money streaming protocols. Instead of monthly or bi-weekly paychecks, employees receive a continuous stream of PayPal USD (PYUSD) directly to their wallets, unlocking true financial flexibility.

### Traditional Payroll vs. SafeStream

**Traditional Payroll:**
```
Company → Bank → Wire Transfer (2-5 days) → Employee Bank → Fees (2-5%)
```

**SafeStream with PYUSD:**
```
Company Treasury → Superfluid Stream → Employee Wallet (Real-time, ~0% fees)
```

## Key Features

### Core Functionality

**Real-Time Payment Streaming**
- Salaries stream per-second, not monthly batches
- Automatic flow rate calculations from annual salaries (e.g., $120,000/year → 3.8 PYUSD/second)
- Instant updates to stream rates when salary changes
- Real-time balance tracking for employees

**Dual Workspace Modes**
1. **Single Wallet Mode** - Direct operations for small teams and quick setup
2. **Safe Multisig Mode** - Enterprise-grade governance with:
   - Configurable signature thresholds (e.g., 2-of-3, 3-of-5)
   - Multiple signer management
   - Transaction approval workflows
   - Pending signature tracking and status

**Enterprise Dashboard**
- Active employee count and stream statistics
- Monthly burn rate calculations
- Annual payroll totals
- Real-time PYUSD/PYUSDx balance tracking
- Transaction history with execution status
- Workspace mode switching

**Employee Management**
- Add/remove employees with wallet addresses
- Configure roles, departments, and metadata
- Set annual salaries with automatic flow rate conversion
- Track individual stream status (active, paused, ended)
- Batch operations support

**Token Operations**
- PYUSD → PYUSDx wrapping for streaming capability
- PYUSDx → PYUSD unwrapping for withdrawals
- Real-time balance queries across multiple tokens
- Buffer management warnings for Superfluid requirements

**Safe Multisig Features**
- Create new Safe wallets with custom configurations
- Import existing Safe contracts
- Multi-signature transaction proposals
- Signer approval tracking
- On-chain execution after threshold met
- Complete transaction history

## How It Works

### Payment Flow

1. **Company Setup**
   - Connect wallet or create Safe multisig
   - Load treasury with PYUSD on supported networks
   - Wrap PYUSD → PYUSDx for streaming capability

2. **Employee Onboarding**
   - Add employee with wallet address
   - Set annual salary (e.g., $120,000/year)
   - System calculates flow rate (e.g., 3.8 PYUSD/second)

3. **Stream Initiation**
   - Create payment stream from dashboard
   - For Safe: Transaction awaits required approvals
   - For Single Wallet: Immediate execution
   - Stream begins flowing per-second automatically

4. **Employee Receiving**
   - Wallet balance increases every second
   - Withdraw anytime to PayPal/Venmo
   - Complete transparency on-chain

### Stream Calculation Example

```typescript
Annual Salary: $120,000
Flow Rate: $120,000 / 365 days / 24 hours / 60 min / 60 sec
         = ~3.8 PYUSD per second
         = ~$10,000 per month (automatic)
         = Employee earns continuously, 24/7
```

### Safe Multisig Workflow

```typescript
// Example configuration
Signers: ['0xAddress1', '0xAddress2', '0xAddress3']
Threshold: 2 // 2-of-3 signatures required

// Creating a stream creates pending transaction
// Signers review and approve independently
// Once threshold met, any signer can execute
// Transaction is recorded on-chain
```

## Technology Stack

### Frontend
- **Framework:** Next.js 15.2.4 with React 19.1.0
- **Language:** TypeScript 5.8.2
- **Styling:** Tailwind CSS 4.1.2
- **UI Components:** Shadcn/ui + Radix UI primitives
- **Icons:** Lucide React 0.487.0

### Web3 & Blockchain
- **Wallet Connection:** RainbowKit 2.2.4
- **Contract Interaction:** Wagmi 2.15.2 + Viem 2.x
- **Streaming Protocol:** Superfluid Protocol v1 (Constant Flow Agreement)
- **Safe Wallet SDK:**
  - `@safe-global/protocol-kit` 6.1.1
  - `@safe-global/api-kit` 4.0.0
  - `@safe-global/safe-apps-sdk` 9.1.0
  - `@safe-global/safe-react-hooks` 0.3.0

### State Management & Forms
- **State:** Zustand 5.0.4 with localStorage persistence
- **Data Fetching:** TanStack React Query 5.75.7
- **Forms:** React Hook Form 7.56.3 + Zod 3.24.2 validation
- **Notifications:** Sonner 2.0.3

### Utilities
- **Date Handling:** date-fns 4.1.0
- **Math Operations:** BigNumber.js 9.3.0
- **Utilities:** Lodash 4.17.21

### Smart Contracts
- **Superfluid CFA (Constant Flow Agreement)** - Manages continuous payment streaming
- **Super Tokens** - Wrapped token abstraction (PYUSDx from PYUSD)
- **Safe Protocol** - Multisig wallet infrastructure for treasury management

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm/yarn
- MetaMask or compatible Web3 wallet
- Testnet ETH for gas fees (Sepolia faucet)
- Testnet PYUSD for testing (see documentation)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/safestream.git
cd safestream

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Configuration

```env
# Add to .env.local
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_ENABLE_TESTNETS=true
```

### Run Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000`

### Build for Production

```bash
pnpm build
pnpm start
```

## Usage Guide

### For Companies

**1. Choose Workspace Mode**
- **Single Wallet**: Quick setup for small teams, direct control
- **Safe Multisig**: Enterprise governance for larger organizations

**2. Fund Your Treasury**
- Acquire PYUSD on supported networks (Sepolia for testing)
- Use the dashboard to wrap PYUSD → PYUSDx
- Ensure sufficient balance for payroll + Superfluid buffer (~8 hours)

**3. Add Employees**
- Navigate to Employee Management section
- Add wallet address, name, role, annual salary
- Employees are ready to receive payment streams

**4. Start Payment Streams**
- Select employee from list
- Choose token (PYUSD/PYUSDx)
- Confirm calculated flow rate
- Approve transaction (multisig requires multiple signatures)

**5. Monitor & Manage**
- Dashboard shows real-time statistics
- Update stream rates or stop streams as needed
- Track treasury balance and monthly burn rate

### For Employees

1. Connect wallet to view incoming stream
2. Balance increases per-second automatically
3. Unwrap PYUSDx → PYUSD anytime
4. Withdraw to PayPal/Venmo or use directly on-chain

## Architecture

### Project Structure

```
src/
├── app/                    # Next.js pages & routing
│   ├── page.tsx           # Landing page
│   ├── layout.tsx         # Root layout with providers
│   ├── workspace/         # Main application workspace
│   │   ├── page.tsx       # Workspace hub (mode selection)
│   │   ├── single/        # Single wallet workspace
│   │   └── multisig/      # Safe multisig workspace
│   └── setup-safe/        # Safe wallet configuration
├── components/
│   ├── ui/                # Base Shadcn/ui components
│   ├── dashboard/         # Dashboard widgets
│   │   ├── dashboard-stats.tsx
│   │   ├── balance-cards.tsx
│   │   ├── streaming-stats.tsx
│   │   └── workspace-tabs.tsx
│   ├── employees/         # Employee management
│   │   ├── add-employee-dialog.tsx
│   │   └── employee-list.tsx
│   ├── streams/           # Stream operations
│   │   ├── start-stream-dialog.tsx
│   │   └── streams-list.tsx
│   ├── swap/              # Token wrapping/unwrapping
│   │   ├── upgrade-downgrade-card.tsx
│   │   └── single-wallet-upgrade-downgrade-card.tsx
│   └── providers.tsx      # App-level providers (Wagmi, RainbowKit, etc.)
├── hooks/                 # Custom React hooks
│   ├── use-streams.tsx            # Stream CRUD operations
│   ├── use-token-balances.tsx     # Token balance queries
│   ├── use-safe-operations.tsx    # Safe transaction management
│   ├── use-safe-apps-sdk.tsx      # Safe Apps SDK integration
│   └── use-stream-info.tsx        # Stream information queries
├── store/                 # Zustand state management
│   ├── employees.ts       # Employee data & operations
│   ├── streams.ts         # Payment stream state
│   ├── safe.ts            # Safe wallet & transactions
│   ├── workspace.ts       # Workspace metadata
│   └── wallet-mode.ts     # Workspace mode selection
├── config/
│   ├── currency.ts        # PYUSD/PYUSDx token config
│   ├── wallet.ts          # Wagmi/chain configuration
│   └── site.ts            # Site metadata
├── lib/
│   └── contract.ts        # Smart contract ABIs & utilities
├── asset/
│   └── abi.ts             # Contract ABIs (Superfluid, Safe)
└── styles/
    └── globals.css        # Global styles & Tailwind
```

### State Management (Zustand Stores)

**`useEmployeeStore`** - Employee data management
- CRUD operations for employees
- Role-based categorization
- Salary configuration
- Active employee filtering

**`useStreamStore`** - Payment stream tracking
- Active payment streams
- Stream status (active, paused, ended)
- Flow rate calculations
- Employee-specific streams
- Total flow rate aggregation

**`useSafe`** - Safe wallet management
- Safe configuration (signers, threshold)
- Pending transactions with signature tracking
- Signer information and permissions
- Transaction signing & execution workflows

**`useWalletMode`** - Workspace mode selection
- Single wallet vs multisig mode
- Mode persistence across sessions

**`useWorkspace`** - Workspace metadata
- Workspace information and configuration

All stores persist to localStorage for seamless UX.

### Smart Contract Interactions

**Key Functions:**

```typescript
// Superfluid CFA - Stream Management
createFlow(receiver: address, token: address, flowRate: int96)
updateFlow(receiver: address, token: address, newFlowRate: int96)
deleteFlow(receiver: address, token: address)
getFlow(sender: address, receiver: address, token: address)

// Super Token - PYUSD Wrapping
upgrade(amount: uint256)          // PYUSD → PYUSDx
downgrade(amount: uint256)        // PYUSDx → PYUSD
balanceOf(account: address)

// Safe - Multisig Operations
proposeTransaction(to, data, value)
confirmTransaction(safeTxHash)
executeTransaction(safeTxHash)
getThreshold()
getOwners()
```

## Sponsor Track Alignment

### PayPal USD (PYUSD) Track

SafeStream was purpose-built to showcase PYUSD's utility in real-world enterprise applications:

**1. Driving PYUSD Adoption**
- Creates recurring, high-volume transaction flow through monthly salaries
- Positions PYUSD as the default payroll currency for Web3 companies
- Estimated addressable market: $10T+ global payroll industry

**2. Network Effects**
- Companies hold PYUSD in treasuries for operational needs
- Employees become PYUSD holders and active users
- Strengthens PayPal ecosystem integration (PayPal, Venmo)

**3. Competitive Advantages of PYUSD**
- **Stability** - No volatility risk unlike BTC/ETH salaries
- **Trust** - PayPal brand recognition overcomes crypto hesitation
- **Compliance** - Regulated stablecoin (Paxos/NYDFS) eases enterprise adoption
- **Liquidity** - Easy conversion to fiat via PayPal/Venmo

**4. Strategic Impact**
- Makes crypto useful for everyday operations, not just speculation
- Bridges traditional finance (PayPal) with DeFi (Superfluid)
- Demonstrates enterprise-grade use case for stablecoins
- Solves real pain points: slow wire transfers, high fees, opacity

**5. Innovation Beyond Existing Solutions**
- **Traditional payroll:** Slow (2-5 days), expensive (2-5% fees), opaque
- **Basic crypto payments:** Volatile, one-time transfers, no governance
- **SafeStream:** Stable (PYUSD), streaming (24/7), transparent (on-chain), governed (Safe multisig)

### Market Opportunity

**Problem Statement:**
- Traditional payroll is slow (2-5 business days)
- High wire transfer fees (especially international)
- Complex multi-currency conversions
- Limited transparency for employees
- Inflexible fixed payment schedules

**SafeStream Solution Value:**
- Real-time payment finality (per-second)
- Near-zero transaction fees
- Single stable currency (PYUSD)
- Complete on-chain transparency
- Flexible, continuous payment streams
- Global payroll without geographic restrictions

**Target Market:**
- Enterprises with remote/global teams
- DAOs and crypto-native companies
- Companies seeking Web3 treasury management
- Payroll service providers
- Freelance and contractor networks

## Future Roadmap

### Phase 2: Enhanced Integration (Q2 2025)
- **Direct PayPal Withdrawals** - One-click PYUSD → PayPal balance transfer
- **Bank Account Integration** - ACH withdrawals for non-crypto users
- **Mobile App** - iOS/Android native apps for employee access
- **Smart Notifications** - Email/SMS alerts for stream events
- **Accounting Integration** - QuickBooks, Xero export

### Phase 3: DCA (Dollar-Cost Averaging) (Q3 2025)
- **Automated PYUSD → ETH Conversion** - Employees opt-in to auto-DCA
- **Customizable Schedules** - Daily/weekly/monthly buy schedules
- **Price Tracking** - Historical DCA performance analytics
- **Multi-Asset Support** - BTC, ETH, and other tokens
- **Tax Reporting** - Cost basis tracking

### Phase 4: Yield Aggregation (Q4 2025)
- **DeFi Integration** - Aave, Compound, Yearn Finance
- **Auto-Routing** - Best yield optimization algorithms
- **Risk Assessment** - Risk-adjusted returns dashboard
- **Compound Rewards** - Maximize treasury efficiency
- **Insurance** - Protocol risk coverage

### Additional Features
- Stream history with CSV export for accounting
- Advanced analytics dashboard with charts
- Batch employee operations (bulk add/update)
- Custom approval workflows for different transaction types
- Role-based access control (admin, manager, employee)
- Tax document generation (W-2, 1099 equivalent)

## Documentation

Comprehensive documentation available:

- [Project Summary](./PROJECT_SUMMARY.md) - High-level overview of accomplishments
- [Implementation Details](./IMPLEMENTATION.md) - Technical deep dive
- [PayPal Pitch](./PAYPAL_PITCH.md) - Sponsor track pitch deck
- [Page Structure](./PAGES_DOCUMENTATION.md) - UI/UX flow documentation
- [Safe Testing Guide](./SAFE_TESTING_GUIDE.md) - Multisig testing instructions
- [Safe Integration](./SAFE_REACT_HOOKS_INTEGRATION.md) - Safe SDK integration guide

## Security Considerations

- **Smart Contract Security**: Built on audited protocols (Superfluid, Safe)
- **Private Key Management**: Never stores or requests private keys
- **Multisig Governance**: Optional Safe integration for enterprise security
- **Buffer Management**: Automatic Superfluid buffer requirements (~8 hours)
- **On-chain Transparency**: All transactions verifiable on block explorer
- **Role-based Access**: Only authorized signers can execute transactions

## Use Cases

1. **Global Remote Teams** - Pay employees worldwide without international wire fees
2. **Freelancers & Contractors** - Continuous compensation for ongoing work
3. **DAOs** - Transparent contributor payments with multisig governance
4. **Gig Economy** - Real-time payment for service providers
5. **Salary Advances** - Employees access earned wages anytime without loans

## Contributing

This is a hackathon project built for ETHGlobal 2025. Contributions, issues, and feature requests are welcome!

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Acknowledgments

- **PayPal** - For PYUSD and supporting Web3 innovation
- **Superfluid** - For revolutionary streaming payment protocol
- **Safe** - For enterprise-grade multisig infrastructure
- **ETHGlobal** - For hosting the hackathon and fostering innovation
- **RainbowKit** - For excellent wallet connection UX
- **Shadcn/ui** - For beautiful, accessible UI components

## Team

SafeStream was built for ETHGlobal 2025 by passionate builders committed to making crypto useful for everyday business operations and bridging traditional finance with Web3 technology.

---

**Built with PYUSD for ETHGlobal 2025**

*Empowering the future of work with real-time, transparent, and stable payroll streaming.*

For questions, issues, or collaboration inquiries, please open an issue on GitHub.

# LiquidStream

> **Real-time Payroll Streaming for the Modern Enterprise**

LiquidStream is a decentralized payroll streaming platform built on Superfluid protocol, enabling enterprises to stream stablecoin payments to employees in real-time. Say goodbye to traditional payroll cycles and hello to continuous, transparent compensation.

## 🌟 Overview

LiquidStream transforms how companies compensate their workforce by leveraging blockchain technology and money streaming protocols. Instead of monthly or bi-weekly paychecks, employees receive a continuous stream of PayPal USD (PYUSD) directly to their wallets, unlocking true financial flexibility.

### Core Features (Current Phase - Hackathon)

- **🏢 Enterprise Dashboard**: Intuitive interface for managing your workforce and payment streams
- **👥 Employee Management**: Add, organize, and manage employees with role-based structure
- **💰 Real-time Payment Streaming**: Create continuous PYUSD payment streams using Superfluid
- **⏸️ Stream Control**: Start, pause, modify, and stop payment streams on-demand
- **💳 PayPal USD Integration**: Stream payments in PYUSD, PayPal's trusted stablecoin
- **📊 Analytics & Monitoring**: Track active streams, payment history, and cash flow
- **🔒 Wallet Integration**: Seamless Web3 wallet connection via RainbowKit
- **⚡ Real-time Updates**: Live stream status and balance updates

### Future Roadmap (Post-Hackathon)

#### Phase 2: DCA Integration
- **📈 PYUSD-to-ETH DCA**: Automatic dollar-cost averaging from PayPal USD into ETH
- **🔄 Flexible Conversion Schedules**: Customize DCA frequency and amounts
- **💱 Multi-asset Support**: Expand to other crypto assets beyond ETH

#### Phase 3: Yield Aggregator ("Earn" Feature)
- **🌾 Auto-yield Farming**: Automatically route idle PYUSD to optimal yield sources
- **📊 Yield Optimization**: Smart routing across DeFi protocols
- **💎 Compound Growth**: Automatic reward compounding
- **🛡️ Risk Management**: Diversified strategies for capital preservation

## 🏗️ Technical Stack

### Frontend
- **Framework**: Next.js 15 (React 19)
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Shadcn/ui (Radix UI)
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation

### Web3 Integration
- **Wallet Connection**: RainbowKit + Wagmi 2.x
- **Blockchain Interaction**: Viem 2.x
- **Smart Contracts**: Superfluid Protocol
- **Chain Support**: Ethereum Sepolia, Scroll Sepolia (testnet)

### Developer Tools
- **TypeScript**: Type-safe development
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **pnpm**: Fast, efficient package management

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Web3 wallet (MetaMask, Coinbase Wallet, etc.)

### Installation

```bash
# Clone the repository
git clone https://github.com/Molecular-Lab/LiquidStream-web.git
cd LiquidStream-web

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run development server
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📦 Project Structure

```
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── page.tsx           # Enterprise dashboard
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── ui/               # Shadcn/ui components
│   │   ├── dashboard/        # Dashboard-specific components
│   │   ├── employees/        # Employee management components
│   │   └── streams/          # Stream management components
│   ├── hooks/                # Custom React hooks
│   │   ├── use-streams.tsx   # Stream operations
│   │   └── use-employees.tsx # Employee management
│   ├── lib/                  # Utility functions
│   │   ├── contract.ts       # Superfluid contract config
│   │   └── utils.ts          # Helper functions
│   ├── config/               # App configuration
│   │   ├── wallet.ts         # Wallet/chain config
│   │   └── currency.ts       # Token configuration
│   └── store/                # Zustand state stores
│       ├── employees.ts      # Employee state
│       └── streams.ts        # Stream state
├── public/                    # Static assets
└── package.json              # Dependencies
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_GA_ID=your_google_analytics_id (optional)
```

### Network Configuration

The application is configured for testnet deployment. Update `src/config/wallet.ts` for mainnet:

```typescript
import { mainnet, optimism, polygon } from "wagmi/chains"

export const config = createConfig({
  chains: [mainnet, optimism, polygon],
  // ... rest of config
})
```

## 🎯 Key Features Explained

### Superfluid Integration

LiquidStream leverages Superfluid's Constant Flow Agreement (CFA) to enable:

- **Per-second Streaming**: Funds flow continuously, not in discrete transactions
- **Gas Efficiency**: Single transaction to start/stop streams
- **Composability**: Integrate with other DeFi protocols
- **Buffer Management**: Automatic security deposits for stream reliability

### Employee Management

- **Role-based Organization**: Categorize employees by department, level, or custom roles
- **Batch Operations**: Add multiple employees at once
- **Profile Management**: Store metadata like names, titles, start dates
- **Wallet Verification**: Ensure correct payment destinations

### Stream Control

- **Flexible Flow Rates**: Set salary amounts (annual, monthly, hourly)
- **Instant Start/Stop**: No waiting periods for payroll changes
- **Stream Modification**: Adjust rates without stopping streams
- **Bulk Management**: Start/stop multiple streams simultaneously

## 🔐 Security Considerations

- **Smart Contract Audits**: Built on audited Superfluid protocol
- **Private Key Management**: Never stores private keys
- **Role-based Access**: Only authorized addresses can manage streams
- **Stream Buffers**: Automatic deposit requirements prevent stream failures

## 📊 Use Cases

1. **Remote Teams**: Pay global employees without international wire fees
2. **Freelancers**: Continuous compensation for ongoing work
3. **DAOs**: Transparent contributor payments
4. **Gig Economy**: Real-time payment for service providers
5. **Salary Advances**: Employees access earned wages anytime

## 🤝 Contributing

This is a hackathon project built for ETHGlobal. Contributions, issues, and feature requests are welcome!

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **PayPal**: For PYUSD - bringing trusted stablecoin infrastructure to Web3
- **Superfluid Protocol**: For enabling money streaming
- **RainbowKit**: For excellent wallet connection UX
- **Shadcn/ui**: For beautiful, accessible UI components
- **Viem**: For type-safe Ethereum interactions

## 📞 Contact & Links

- **GitHub**: [Molecular-Lab/LiquidStream-web](https://github.com/Molecular-Lab/LiquidStream-web)

---

**Built with ❤️ for ETHGlobal Hackathon**

*Empowering the future of work, one stream at a time.*

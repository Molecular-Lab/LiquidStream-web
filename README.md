# SafeStream

> **Streaming Payroll Infrastructure for Next-Generation Enterprises**

SafeStream transforms enterprise payroll management by enabling automated, real-time PYUSD streaming through Safe multisig wallets—making PYUSD the backbone of next-generation payroll systems.

[![Live Demo](https://img.shields.io/badge/Demo-Live-green)](https://safe-stream.vercel.app) [![Safe App](https://img.shields.io/badge/Safe_App-Live-00E673)](https://app.safe.global/share/safe-app?appUrl=https%3A%2F%2Fsafe-stream.vercel.app&chain=sep) [![ETHGlobal](https://img.shields.io/badge/ETHGlobal-2025-blue)](https://ethglobal.com/showcase/safestream-dxmwb) [![License](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

## Table of Contents

- [Vision](#-vision)
- [Live Demo](#-live-demo)
- [Why These Technologies?](#why-these-technologies)
- [Core Features](#-core-features)
- [How It Works](#how-it-works)
- [Quick Start](#quick-start)
- [Documentation](#-documentation)

---

## 🎯 Vision

**We're building the streaming payroll infrastructure for the enterprise payroll market, leveraging PYUSD's regulatory compliance to enable second-by-second salary distributions—driving mass stablecoin adoption where it matters most: everyday business operations for next-generation payroll systems.**

### The Problem

Traditional enterprise payroll is fundamentally broken:

- **Slow & Inefficient**: 2-5 business days for wire transfers, locking capital
- **Expensive**: 2-5% fees on international payments, eating into margins
- **Opaque**: No real-time visibility for employees or finance teams
- **Inflexible**: Fixed monthly/bi-weekly schedules don't match modern work
- **Complex**: Multi-currency conversions, compliance overhead, banking intermediaries

### The SafeStream Solution

Real-time PYUSD streaming that revolutionizes payroll:

- **Instant**: Per-second payment flows matching actual work performed
- **Efficient**: Near-zero transaction fees with PYUSD on-chain
- **Transparent**: Complete on-chain auditability for compliance
- **Flexible**: Employees access earned wages anytime—no loans, no waiting
- **Simple**: Single stable currency with regulatory clarity

---

## 🎬 Live Demo

**Try it now**:
- **Standalone App**: [safe-stream.vercel.app](https://safe-stream.vercel.app)
- **Safe App (Multisig)**: [Open in Safe](https://app.safe.global/share/safe-app?appUrl=https%3A%2F%2Fsafe-stream.vercel.app&chain=sep)
- **ETHGlobal Showcase**: [View Project](https://ethglobal.com/showcase/safestream-dxmwb)

### Key User Flows

**For Companies:**
1. Connect wallet → Create workspace (Single or Safe multisig)
2. Fund treasury with PYUSD → Wrap to PYUSDx
3. Add employees with salaries → Start streaming payroll
4. Monitor dashboard → Real-time analytics and burn rate

**For Employees:**
1. Receive wallet address from employer
2. Watch balance increase every second
3. Unwrap PYUSDx → PYUSD anytime
4. Withdraw or use PYUSD as needed

### What Makes It Special

```
Traditional Payroll:
Month 1: Work 30 days → Wait → Get paid on day 30 → Access money
         [██████████████████████████████] 30 days later

SafeStream:
Day 1:   Work → Money streams → Access anytime → Withdraw instantly
         [█] [█] [█] [█] ... every second
```

**Example**:
- Employee earns $120,000/year
- SafeStream calculates: **3.8 PYUSD flowing per second**
- After 10 days worked: **$3,287.67 available** (vs. $0 with traditional)
- Employee can withdraw any amount, anytime

---

## Why These Technologies?

### ⚡ Superfluid Protocol

**The Streaming Money Infrastructure**
- **Continuous Streams** - Money flows per-second, not monthly batches
- **Programmable** - Start/stop/update streams programmatically
- **Gas Efficient** - One transaction creates perpetual stream
- **Real-time Balance** - Employees see balance increase every second
- **Proven Protocol** - Battle-tested, audited, $100M+ TVL

**Why Superfluid?**
- Traditional transfers: One-time, manual, slow
- Superfluid streams: Continuous, automated, instant
- Enables "Earned Wage Access" - withdraw anytime, no loans

**Technical Advantage:**
```
Traditional: Company → Monthly Batch → Employee (30+ day wait)
SafeStream:  Company → 24/7 Stream → Employee (0 wait, per-second)
```

### 🔐 Safe Protocol

**Enterprise-Grade Treasury Management**

- **Multisig Security** - Require 2-of-3, 3-of-5 signatures (configurable)
- **Transparent Governance** - On-chain approval workflows
- **Battle-Tested** - Securing $100B+ in assets across 10M+ Safes
- **Compliance Ready** - Audit trails, multi-party authorization
- **Standard** - Industry standard for DAO/corporate treasuries

**Why Safe?**
- Single wallet: Too risky for large treasuries
- EOA: No governance, single point of failure
- Safe: Enterprise standard, trusted by top DAOs/companies

**Use Case:**
```
CFO proposes $500K payroll → 
COO reviews & approves → 
CEO provides final signature → 
Transaction executes automatically
```

---

## ✨ Core Features

### 💰 Real-Time Streaming Payroll
Stream salaries continuously, not in monthly batches:
- **Per-Second Precision**: $120K/year = 3.8 PYUSD flowing every second
- **Earned Wage Access**: Employees withdraw earned salary anytime, no loans or advances
- **Zero Wait Time**: Eliminate 30-day paycheck cycles
- **Auto-calculated Flow Rates**: Enter annual salary, system handles wei conversion

### 🏢 Dual Workspace Architecture
Choose the right security model for your organization:

**Single Wallet Mode**
- Direct treasury control from one address
- Instant transaction execution
- Perfect for small teams and startups
- Quick onboarding (< 5 minutes)

**Safe Multisig Mode**
- Enterprise-grade multi-signature security
- Configurable thresholds (2-of-3, 3-of-5, custom)
- On-chain approval workflows with audit trails
- Compliance-ready for regulated enterprises

### 📊 Enterprise Treasury Dashboard
Real-time visibility into your streaming payroll:
- **Live Treasury Balance**: Current PYUSD/PYUSDx holdings
- **Monthly Burn Rate**: Automatic calculation of outgoing streams
- **Active Employee Count**: Track headcount and stream status
- **Transaction History**: Complete audit trail with timestamps
- **Stream Analytics**: Total outflows, per-employee breakdowns

### 👥 Smart Employee Management
Streamlined payroll operations:
- **Batch Operations**: Add multiple employees in one transaction
- **Automatic Calculations**: Annual salary → flow rate → wei conversion
- **Role & Department Tags**: Organize by team structure
- **Stream Controls**: Start, pause, update, or delete streams
- **Wallet Integration**: Support for EOA and Smart Contract wallets

### 🔄 Seamless Token Operations
One-click PYUSD ↔ PYUSDx conversion:
- **Wrap for Streaming**: Convert PYUSD to PYUSDx (Superfluid-enabled)
- **Unwrap for Withdrawals**: PYUSDx → PYUSD for easy access
- **Automatic Approvals**: Smart allowance management
- **Buffer Tracking**: Monitor streaming buffer requirements

---

## How It Works

```
1. Company Setup
   └─ Load treasury with PYUSD
   └─ Wrap to PYUSDx (streaming-capable)
   └─ Choose Single or Safe multisig mode

2. Add Employees
   └─ Enter wallet address + annual salary
   └─ System calculates flow rate automatically
   └─ (e.g., $120K/year → 3.8 PYUSD/second)

3. Start Streams
   └─ One transaction creates perpetual stream
   └─ Safe mode: Requires multi-signature approval
   └─ Money flows per-second automatically

4. Employees Receive
   └─ Balance increases every second
   └─ Unwrap and withdraw PYUSD anytime
   └─ Complete transparency on-chain
```

---

## Project Structure

```
SafeStream/
├── SafeStream-web/          # Next.js application
│   ├── src/app/             # Pages & routing
│   ├── src/components/      # UI components
│   ├── src/hooks/           # Custom hooks
│   ├── src/store/           # Zustand stores
│   └── src/config/          # Configuration
│
└── SafeStream-contract/     # Hardhat contracts
    ├── contracts/           # Superfluid interfaces
    ├── scripts/             # Deployment scripts
    ├── abi/                 # Contract ABIs
    └── makefile             # Easy commands
```

---

## Quick Start

### Web Application

```bash
cd SafeStream-web
pnpm install
pnpm dev
```

Visit `http://localhost:3000`

## 📚 Documentation

- **[Smart Contracts](./SafeStream-contract/README.md)**: Contract architecture & deployment
- **[Quick Start Guide](./SafeStream-contract/docs/QUICKSTART.md)**: 5-minute setup tutorial

---


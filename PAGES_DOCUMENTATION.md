# LiquidStream - Page Structure & Flow Documentation

## Overview
LiquidStream is a real-time payroll streaming platform built on Superfluid protocol with Safe multisig wallet integration. This document outlines the complete page structure and user flows.

## Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Web3**: Wagmi 2.x, Viem 2.x, RainbowKit
- **Streaming**: Superfluid Protocol (CFA, Super Tokens)
- **Security**: Gnosis Safe (Multisig wallets)
- **Token**: PYUSD (PayPal USD) & PYUSDx (Super Token)

## Page Structure

### 1. Landing Page (`/landing`)
**Purpose**: Marketing page to showcase the platform and convert visitors

**Features**:
- Hero section with value proposition
- Feature highlights (Real-time streaming, Safe multisig, Team collaboration)
- "How It Works" section with 4-step process
- Benefits for employers, employees, and finance teams
- CTA buttons to register or view demo

**User Actions**:
- Click "Start Your Workspace" → `/register`
- Click "View Demo" → `/dashboard` (old demo, kept for reference)

---

### 2. Workspace Registration (`/register`)
**Purpose**: Multi-step onboarding for new companies

**Step 1: Company Information**
- Company name (required)
- Industry (required)
- Company size (optional)
- Country (optional)

**Step 2: Operation Team**
- Add operation team members who will be Safe signers
- Name, email, and role for each member
- Can add multiple team members
- Minimum 1 member (owner + additional members)

**Step 3: Review & Invite**
- Review all entered information
- Shows summary of company details
- Lists all operation team members
- Sends invitation emails to team members
- Creates workspace in backend

**User Actions**:
- Complete registration → `/setup-safe`

**Technical Notes**:
- TODO: Backend integration to store workspace data
- TODO: Email service integration for invitations
- Uses client-side state management during registration

---

### 3. Safe Wallet Setup (`/setup-safe`)
**Purpose**: Create Gnosis Safe multisig wallet for the workspace

**Features**:
- Owner wallet automatically added as first signer
- Add additional signers (operation team members)
- Configure signature threshold (1 to N signers)
- Visual threshold selector with security levels:
  - Low Security: 1 signature
  - Recommended: 2+ but not all
  - Maximum Security: All signatures required
- Shows "How It Works" and "Security Benefits" info

**Configuration**:
- Signers: Add name and wallet address for each signer
- Threshold: Slider to set minimum required signatures
- Safe deployment happens on submission

**User Actions**:
- Configure Safe → Create Safe Wallet
- After creation → "Go to Workspace" → `/workspace`

**Technical Notes**:
- TODO: Integrate Safe SDK for actual Safe creation
- Currently mocks Safe creation with simulated delay
- TODO: Store Safe address in workspace data
- TODO: Notify all signers about Safe creation

---

### 4. Workspace Dashboard (`/workspace`)
**Purpose**: Main operational dashboard for payroll management

**Layout**:
- **Header**: Sticky header with navigation, Safe info, notifications, wallet connect
- **Safe Banner**: Shows Safe multisig status and pending signatures alert
- **Superfluid Dashboard**: Real-time balance, flow rates, burn rates
- **Upgrade/Downgrade Card**: PYUSD ↔ PYUSDx conversion
- **Active Streams**: Database-less list reading from blockchain
- **Team Members**: Employee list with start/stop stream actions

**Navigation**:
- Dashboard (current page)
- Signatures (with badge showing pending count)
- Settings (future)

**Key Features**:
1. **Safe Context**: All operations happen through Safe multisig
2. **Real-time Updates**: Balance and streams update live
3. **Pending Notifications**: Visual indicators for actions requiring signatures
4. **Stream Management**: Start/stop streams (creates pending Safe transactions)

**User Actions**:
- Add employee → Opens add employee dialog
- Start stream → Creates Safe transaction (requires signatures)
- Stop stream → Creates Safe transaction (requires signatures)
- Upgrade/Downgrade tokens → Wallet interactions
- View pending signatures → `/workspace/signatures`

**Technical Notes**:
- Uses Superfluid hooks for real-time data
- Stream operations create Safe transactions instead of direct execution
- TODO: Integrate Safe SDK for transaction proposals

---

### 5. Pending Signatures (`/workspace/signatures`)
**Purpose**: Review and sign Safe multisig transactions

**Features**:
- **Stats Cards**: Pending transactions, awaiting your signature, ready to execute
- **Transaction List**: All pending Safe transactions with details
- **Transaction Details**: 
  - Type (start stream, stop stream, add employee, fund safe)
  - Description and proposer
  - Transaction parameters (employee, amount, frequency)
  - Signature progress (who signed, who hasn't)
  - Visual timeline of signatures

**Transaction Flow**:
1. Transaction proposed by one signer
2. Shows in pending list for all signers
3. Each signer reviews and signs
4. When threshold reached, "Execute" button appears
5. Any signer can execute the transaction

**User Actions**:
- Sign Transaction → Adds user's signature
- Execute Transaction → Executes when threshold met (only shown if user already signed)
- Back to Dashboard → `/workspace`

**Technical Notes**:
- TODO: Integrate Safe SDK for:
  - Fetching pending transactions
  - Creating signatures
  - Executing transactions
- Currently shows mock transaction data
- Supports different transaction types with color coding

---

### 6. Invitation Page (`/invite?token=xxx`)
**Purpose**: Operation team members join workspace via invitation link

**Features**:
- Validates invitation token from URL
- Shows workspace details (name, company, invited by)
- Shows Safe wallet info (address, signers, threshold)
- Lists responsibilities of being a signer
- Wallet connection required to join

**Flow**:
1. Team member receives email with invitation link
2. Clicks link → `/invite?token=xxx`
3. Connects wallet
4. Reviews workspace and responsibilities
5. Clicks "Join Workspace"
6. Added as signer to Safe wallet
7. Redirected to pending signatures page

**User Actions**:
- Connect Wallet → RainbowKit modal
- Join Workspace → Adds to workspace, redirects to `/workspace/signatures`

**Technical Notes**:
- TODO: Backend API for:
  - Token validation
  - Workspace data retrieval
  - Adding user to workspace
- TODO: Safe SDK integration to add user as signer
- Uses URL search params for token

---

## User Flows

### Flow 1: New Company Onboarding
```
/landing
  → Click "Start Your Workspace"
  → /register
    Step 1: Enter company info
    Step 2: Add operation team members
    Step 3: Review and send invites
  → /setup-safe
    Configure signers and threshold
    Create Safe wallet
  → /workspace
    Fund Safe with PYUSD
    Upgrade to PYUSDx
    Add employees
    Start streaming
```

### Flow 2: Operation Team Member Joining
```
Email Invitation
  → Click invitation link
  → /invite?token=xxx
    Review workspace details
    Connect wallet
    Join workspace
  → /workspace/signatures
    View pending transactions
    Sign transactions
```

### Flow 3: Starting a Payroll Stream (Multisig)
```
/workspace
  → Add employee (if new)
  → Click "Start Stream" on employee
  → Configure stream details
  → Submit → Creates Safe transaction
  → /workspace/signatures (automatic or manual navigation)
  → Owner reviews and signs
  → Other operation team members sign
  → When threshold met: Execute transaction
  → Stream starts on blockchain
  → Shows in Active Streams section
```

### Flow 4: Stopping a Payroll Stream (Multisig)
```
/workspace
  → Find active stream in Streams List
  → Click "Stop Stream"
  → Creates Safe transaction for deletion
  → Requires signatures from operation team
  → Execute when threshold met
  → Stream stops on blockchain
```

---

## Safe Multisig Integration Points

### Critical Integration Areas (TODO)

1. **Safe Creation** (`/setup-safe`)
   - Use Safe SDK to deploy Safe contract
   - Pass signers array and threshold
   - Get deployed Safe address
   - Store in workspace data

2. **Transaction Proposals** (`/workspace`)
   - When starting/stopping streams
   - Create Safe transaction instead of direct execution
   - Store transaction in Safe queue
   - Notify all signers

3. **Signature Collection** (`/workspace/signatures`)
   - Fetch pending transactions from Safe
   - Display signature status
   - Sign transaction with connected wallet
   - Track signature threshold

4. **Transaction Execution** (`/workspace/signatures`)
   - Execute when threshold met
   - Any signer can execute
   - Transaction executes Superfluid operation
   - Update UI with confirmation

---

## Key Features

### 1. Real-Time Balance Updates
- `useRealtimeBalance` hook updates every 10-15 seconds
- Shows live streaming balance with animations
- Updates per second, day, month, year rates

### 2. Database-less Architecture
- No backend database for streams
- All data read directly from blockchain
- Uses Superfluid CFA contract `getFlow` function
- Real-time synchronization with on-chain state

### 3. Safe Multisig Security
- All payroll operations require multiple signatures
- Configurable threshold (1-N signers)
- Transparent audit trail
- No single point of failure

### 4. Token Management
- PYUSD: Base token (6 decimals)
- PYUSDx: Super Token for streaming (18 decimals)
- Upgrade: PYUSD → PYUSDx (requires approval)
- Downgrade: PYUSDx → PYUSD (no approval needed)

### 5. Streaming Frequencies
- Daily (86,400 seconds)
- Weekly (604,800 seconds)
- Monthly (2,629,800 seconds = 30.4375 days)
- Annual (31,557,600 seconds = 365.25 days)

---

## Navigation Structure

```
/
├── / (root) → redirects to /landing
├── /landing (marketing page)
├── /register (workspace creation)
├── /setup-safe (Safe wallet setup)
├── /workspace (main dashboard)
│   ├── /workspace/signatures (pending transactions)
│   └── /workspace/settings (future)
├── /invite (join workspace)
└── /dashboard (old demo, kept for reference)
```

---

## State Management

### Client-Side State (Zustand)
- Employee list (localStorage persistence)
- Stream configurations (localStorage persistence)
- UI state (dialogs, selections)

### Blockchain State (Read)
- Real-time balances (useRealtimeBalance)
- Flow rates (useStreamInfo)
- Net flow (useIncomingStreams)

### Safe State (TODO)
- Pending transactions
- Signature status
- Signer list
- Threshold configuration

---

## Implementation Status

### ✅ Completed
- Landing page with marketing content
- Multi-step registration flow
- Safe wallet setup UI
- Workspace dashboard with Safe context
- Pending signatures page
- Invitation system UI
- Real-time streaming dashboard
- Token swap (upgrade/downgrade)
- Superfluid batchCall integration

### 🔄 In Progress
- Safe SDK integration for multisig operations
- Backend API for workspace data
- Email service for invitations

### 📋 TODO
- Safe wallet creation integration
- Safe transaction proposal system
- Safe signature collection mechanism
- Workspace data persistence (backend)
- Invitation token validation (backend)
- Email notifications for signatures
- Settings page for workspace management
- Audit log for all operations

---

## Security Considerations

1. **Multisig Requirements**
   - All payroll operations require multiple signatures
   - Threshold should be set to at least 2 for production
   - Consider odd numbers to avoid ties

2. **Wallet Security**
   - Operation team members must secure their private keys
   - Use hardware wallets for signers
   - Regular security audits

3. **Token Approval**
   - Upgrade requires PYUSD approval for PYUSDx contract
   - Set approval to exact amount (not unlimited)
   - Approval transaction confirmed before upgrade

4. **Safe Best Practices**
   - Use time locks for large operations (future feature)
   - Implement daily spending limits (future feature)
   - Regular review of signer list

---

## Future Enhancements

1. **Advanced Safe Features**
   - Transaction batching (execute multiple at once)
   - Time-locked transactions
   - Spending limits per period

2. **Enhanced Notifications**
   - Email alerts for pending signatures
   - Push notifications for mobile
   - Slack/Discord integration

3. **Analytics Dashboard**
   - Historical stream data
   - Cost projections
   - Employee payment history

4. **Mobile Support**
   - Responsive design improvements
   - Mobile wallet support (WalletConnect)
   - Native mobile app (future)

5. **Governance Features**
   - Voting on policy changes
   - Proposal system for new features
   - DAO-like governance structure

---

## Testing Checklist

### Registration Flow
- [ ] Company registration with all fields
- [ ] Adding multiple operation team members
- [ ] Form validation and error handling
- [ ] Email invitation sending

### Safe Setup
- [ ] Safe creation with multiple signers
- [ ] Threshold configuration
- [ ] Safe address retrieval
- [ ] Signer notification

### Workspace Operations
- [ ] Add employee
- [ ] Start stream (creates Safe transaction)
- [ ] Stop stream (creates Safe transaction)
- [ ] Token upgrade/downgrade

### Signature Flow
- [ ] View pending transactions
- [ ] Sign transaction
- [ ] Execute transaction when threshold met
- [ ] Transaction confirmation

### Invitation Flow
- [ ] Token validation
- [ ] Workspace details display
- [ ] Join workspace with wallet
- [ ] Redirect to signatures

---

## Support & Maintenance

For questions or issues:
1. Check this documentation first
2. Review Safe SDK documentation
3. Review Superfluid documentation
4. Contact the development team

Last Updated: October 24, 2025

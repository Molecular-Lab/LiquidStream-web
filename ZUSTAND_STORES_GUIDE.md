# Zustand Stores Implementation Guide

## Overview
SafeStream now uses Zustand for state management with localStorage persistence. This enables a serverless demo experience with full Safe multisig workflow.

## Stores Created

### 1. **useWorkspaceRegistration** (`src/store/workspace.ts`)
Manages workspace registration data from the onboarding flow.

**State:**
```typescript
{
  registration: {
    company: {
      name: string
      industry: string
      size: string
      country: string
    }
    team: TeamMember[]
    createdAt: string
  } | null
}
```

**Actions:**
- `setRegistration(registration)` - Save workspace data
- `clearRegistration()` - Clear workspace data
- `updateTeamMemberWallet(email, walletAddress)` - Update team member wallet

**Usage:**
```typescript
const { registration, setRegistration } = useWorkspaceRegistration()
```

### 2. **useSafe** (`src/store/safe.ts`)
Manages Safe wallet configuration and pending transactions for multisig workflow.

**State:**
```typescript
{
  safeConfig: {
    address: string
    signers: SafeSigner[]
    threshold: number
    chainId: number
    createdAt: string
    createdBy: string
    workspaceName?: string
  } | null
  
  pendingTransactions: PendingTransaction[]
}
```

**Actions:**
- `setSafeConfig(config)` - Save Safe configuration
- `clearSafeConfig()` - Clear Safe data
- `addPendingTransaction(tx)` - Add new transaction requiring signatures
- `signTransaction(txId, signerAddress)` - Mark transaction as signed by signer
- `executeTransaction(txId)` - Mark transaction as executed
- `removePendingTransaction(txId)` - Remove transaction
- `isSigner(address)` - Check if address is a signer
- `getSignerInfo(address)` - Get signer details
- `getPendingForSigner(address)` - Get transactions awaiting specific signer

**Usage:**
```typescript
const { 
  safeConfig, 
  pendingTransactions, 
  addPendingTransaction, 
  signTransaction 
} = useSafe()
```

## Flow Integration

### 1. Registration Flow (`/register`)
```typescript
// Save workspace data when registration completes
const { setRegistration } = useWorkspaceRegistration()

const workspaceData = {
  company: companyInfo,
  team: teamMembers,
  createdAt: new Date().toISOString(),
}

setRegistration(workspaceData)
// Redirects to /setup-safe
```

### 2. Safe Setup Flow (`/setup-safe`)
```typescript
// Auto-load workspace data and populate signers
const { registration } = useWorkspaceRegistration()
const { setSafeConfig } = useSafe()

useEffect(() => {
  if (registration) {
    // Auto-populate signers from team
    const teamSigners = registration.team.map(member => ({
      address: "", // Will be filled by user
      name: member.name,
      email: member.email,
      role: member.role,
    }))
    
    setSigners([owner, ...teamSigners])
  }
}, [registration])

// Save Safe config after creation
setSafeConfig({
  address: safeAddress,
  signers: safeSigners,
  threshold: threshold,
  chainId: chain?.id || 1,
  createdAt: new Date().toISOString(),
  createdBy: address,
  workspaceName: registration?.company.name,
})
```

### 3. Transaction Creation (Workspace)
```typescript
// When creating a new stream/transaction
const { safeConfig, addPendingTransaction } = useSafe()

addPendingTransaction({
  type: "start_stream",
  description: "Start payment stream to Alice",
  to: employeeAddress,
  value: "1000 PYUSDx",
  signatures: [address.toLowerCase()], // Creator auto-signs
  requiredSignatures: safeConfig.threshold,
  createdBy: address,
  nonce: Date.now(),
  status: "pending",
})
```

### 4. Signer Dashboard (`/signer-dashboard`)
```typescript
// View pending transactions for current signer
const { address } = useAccount()
const { getPendingForSigner, pendingTransactions } = useSafe()

const awaitingSignature = getPendingForSigner(address)
// Shows only transactions user hasn't signed yet

const allPending = pendingTransactions.filter(tx => tx.status !== "executed")
// Shows all active transactions
```

### 5. Signing Flow (`/workspace/signatures`)
```typescript
// Sign a pending transaction
const { signTransaction, executeTransaction } = useSafe()

const handleSign = async (txId: string) => {
  // TODO: Integrate Safe SDK signing
  await safeSDK.signTransaction(txId)
  
  // Update store
  signTransaction(txId, address.toLowerCase())
  
  // Status automatically updates to "ready" when threshold met
}

const handleExecute = async (txId: string) => {
  // TODO: Integrate Safe SDK execution
  await safeSDK.executeTransaction(txId)
  
  // Update store
  executeTransaction(txId)
}
```

## Pages & Routes

### New Page: `/signer-dashboard`
Purpose: Simple dashboard for signers to view pending transactions and navigate to sign them.

Features:
- Shows signer info and Safe details
- Displays 3 stat cards: Total Pending, Awaiting Your Signature, Ready to Execute
- Lists transactions in 2 sections:
  - **Awaiting Your Signature** - Urgent, needs user action
  - **All Pending Transactions** - Full list with status badges
- One-click navigation to `/workspace/signatures?highlight={txId}` to sign

Access Control:
- Requires wallet connection
- Checks if user is a signer on the Safe
- Shows appropriate error messages for unauthorized access

## Demo Workflow

### For Owner (Workspace Creator):
1. Visit `/register` → Create workspace
2. Redirected to `/setup-safe` → Team auto-loaded, configure Safe
3. Visit `/workspace` → Manage employees, create streams
4. Creating stream → Adds pending transaction to store
5. Visit `/workspace/signatures` → Sign own transaction
6. Wait for other signers...

### For Other Signers (Operation Team):
1. Visit `/signer-dashboard` with wallet connected
2. See pending transactions awaiting signature
3. Click "Sign Transaction" → Redirected to `/workspace/signatures?highlight={txId}`
4. Sign the transaction
5. If threshold met → Any signer can execute

## Persistence

Both stores use Zustand's `persist` middleware with localStorage:
- **workspace-registration** - Persists registration data
- **safe-store** - Persists Safe config and pending transactions

Data survives page refresh and browser restart (until localStorage is cleared).

Also maintains backward compatibility with sessionStorage for some legacy flows.

## TODO: Safe SDK Integration

Current implementation uses mock data and simulated signing. To integrate real Safe SDK:

1. **Safe Creation** (`/setup-safe`)
   ```typescript
   import Safe from '@safe-global/protocol-kit'
   
   const safe = await Safe.create({
     ethAdapter,
     safeAddress: safeConfig.address
   })
   ```

2. **Transaction Proposal** (Workspace)
   ```typescript
   const safeTransaction = await safe.createTransaction({ safeTransactionData })
   const safeTxHash = await safe.getTransactionHash(safeTransaction)
   const signature = await safe.signTransactionHash(safeTxHash)
   ```

3. **Signing** (`/workspace/signatures`)
   ```typescript
   const signature = await safe.signTransactionHash(txHash)
   await apiService.addSignature(safeTxHash, signature)
   ```

4. **Execution** (`/workspace/signatures`)
   ```typescript
   const executeTxResponse = await safe.executeTransaction(safeTransaction)
   await executeTxResponse.transactionResponse?.wait()
   ```

See `SAFE_INTEGRATION_GUIDE.md` for detailed code examples.

## Testing

### Test Registration → Safe Setup Flow:
1. Go to `/register`
2. Fill company info
3. Add 2-3 team members
4. Complete registration
5. Check: Should auto-redirect to `/setup-safe` with team members loaded

### Test Signer Dashboard:
1. Create Safe wallet (save address)
2. Add pending transaction to store (manually or via workspace)
3. Connect wallet as one of the signers
4. Visit `/signer-dashboard`
5. Check: Should show pending transactions
6. Click "Sign Transaction"
7. Check: Should redirect to `/workspace/signatures?highlight={txId}`

### Test Signing Flow:
1. Create pending transaction in workspace
2. Visit `/workspace/signatures`
3. Click "Sign Transaction"
4. Check: Transaction should update with your signature
5. Check: If threshold met, "Execute" button should appear
6. Click "Execute"
7. Check: Transaction should be marked as executed

## Benefits

✅ **Serverless Demo** - No backend required for hackathon
✅ **Persistent State** - Data survives refresh
✅ **Multi-Signer Support** - Different users can sign same transactions
✅ **Real-time Updates** - Store updates reflect immediately in UI
✅ **Type Safety** - Full TypeScript support
✅ **Easy Testing** - Can simulate multi-signer workflow in browser
✅ **Production Ready** - Can replace localStorage with API calls later

## Migration to Backend

When ready to add backend, keep Zustand stores and:
1. Replace `persist` with API sync
2. Add WebSocket for real-time updates
3. Use stores as client-side cache
4. Keep same component interfaces

```typescript
// Before: localStorage
persist((set) => ({ /* state */ }), { name: "safe-store" })

// After: API sync
const useSafe = create((set) => {
  // Load initial from API
  loadFromAPI().then(data => set(data))
  
  // Subscribe to WebSocket
  subscribeToUpdates((update) => set(update))
  
  return { /* state and actions */ }
})
```

## Summary

The Zustand stores provide a complete state management solution for SafeStream's multisig workflow. Registration data flows seamlessly into Safe setup, and the Safe store manages the entire transaction lifecycle from proposal to execution. The signer dashboard gives operation team members a clean interface to review and sign pending transactions, creating a smooth collaborative workflow.

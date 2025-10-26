# Safe React Hooks Integration Plan

## Overview

After reviewing the [Safe React Hooks documentation](https://docs.safe.global/reference-sdk-react-hooks/safeprovider), we discovered that Safe already provides:
- `useSafe()` hook with built-in methods
- `useSendTransaction()` for creating/executing transactions
- `useConfirmTransaction()` for signing pending transactions
- Transaction service integration for multisig workflow

**This means we should:**
1. Keep our custom Zustand `useSafe` store (rename it to avoid conflicts)
2. Use Safe's official hooks for actual Safe operations
3. Use our store for UI state and demo data

## Safe React Hooks - What's Provided

### 1. **`useSafe()` Hook**

Provides access to Safe information and utilities:

```typescript
import { useSafe } from '@safe-global/safe-react-hooks'

const {
  isInitialized,           // Check if Safe is initialized
  connect,                 // Connect to Safe
  disconnect,              // Disconnect from Safe
  isOwnerConnected,        // Check if current user is owner
  isSignerConnected,       // Check if current user is signer
  getBalance,              // Get Safe balance
  getChain,                // Get chain info
  getTransaction,          // Get single transaction
  getTransactions,         // Get all transactions
  getPendingTransactions,  // ⭐ Get pending transactions!
  getSafeInfo,             // Get Safe config (owners, threshold, etc)
  getSignerAddress         // Get current signer address
} = useSafe()
```

### 2. **`useSendTransaction()` Hook**

Creates and sends transactions:

```typescript
import { useSendTransaction } from '@safe-global/safe-react-hooks'

const { sendTransaction, data, isPending, isSuccess, isError } = useSendTransaction()

// Automatic behavior:
// - If threshold > 1: Creates tx and sends to Safe Transaction Service
// - If threshold = 1: Executes immediately
// - If Safe not deployed: Deploys first, then executes/proposes

sendTransaction({
  transactions: [{
    to: '0x...',
    value: '123',
    data: '0x...'
  }]
})
```

### 3. **`useConfirmTransaction()` Hook**

Signs and executes pending transactions:

```typescript
import { useConfirmTransaction } from '@safe-global/safe-react-hooks'

const { confirmTransaction, data, isPending } = useConfirmTransaction()

// Automatic behavior:
// - If signatures < threshold: Adds signature
// - If signatures >= threshold: Executes transaction

confirmTransaction({
  safeTxHash: '0x...'
})
```

### 4. **`SafeProvider` Setup**

Wrap app with SafeProvider:

```typescript
import { createConfig, SafeProvider } from '@safe-global/safe-react-hooks'
import { sepolia } from 'viem/chains'

const config = createConfig({
  chain: sepolia,
  provider,
  signer,
  safeOptions: {
    owners: ['0x...', '0x...'],
    threshold: 2
  }
})

<SafeProvider config={config}>
  <App />
</SafeProvider>
```

## Revised Architecture

### Our Custom Stores (Keep & Rename)

**1. `useWorkspace()` Store** - Keep as is
- Manages workspace registration data
- Stores company info and operators
- `getOperators()` method for operator selection

**2. `useSafeConfig()` Store** - Rename from `useSafe`
- Stores Safe configuration for UI/demo purposes
- Tracks which Safe we're working with
- Provides fallback data for development

```typescript
// Rename src/store/safe.ts exports
export const useSafeConfig = create<SafeConfigStore>()(
  persist(
    (set, get) => ({
      safeConfig: null,
      tempPendingTransactions: [], // For demo/UI only
      
      setSafeConfig: (config) => set({ safeConfig: config }),
      // ... other UI state methods
    }),
    { name: "safe-config-store" }
  )
)
```

### Integration Strategy

**Use Official Safe Hooks for:**
- ✅ Getting pending transactions (`getPendingTransactions`)
- ✅ Creating transactions (`useSendTransaction`)
- ✅ Signing transactions (`useConfirmTransaction`)
- ✅ Getting Safe info (`getSafeInfo`)
- ✅ Checking signer status (`isOwnerConnected`, `isSignerConnected`)

**Use Our Custom Stores for:**
- ✅ Workspace registration data (`useWorkspace`)
- ✅ UI state and navigation
- ✅ Demo fallback data (when Safe not connected)
- ✅ Safe configuration tracking

## Implementation Plan

### Step 1: Install Safe React Hooks

```bash
pnpm add @safe-global/safe-react-hooks
```

### Step 2: Rename Our Store

```typescript
// src/store/safe.ts
export const useSafeConfig = create<SafeConfigStore>()(...) // Renamed from useSafe
```

Update all imports:
- `src/app/setup-safe/page.tsx`
- `src/app/workspace/signatures/page.tsx`
- `src/app/signer-dashboard/page.tsx`

### Step 3: Setup SafeProvider

```typescript
// src/app/providers.tsx
import { SafeProvider } from '@safe-global/safe-react-hooks'
import { useSafeConfig } from '@/store/safe'

export function Providers({ children }: { children: React.ReactNode }) {
  const { safeConfig } = useSafeConfig()
  
  // Create Safe config from our stored data
  const config = safeConfig ? createConfig({
    chain: wagmiConfig.chains[0],
    provider: wagmiConfig.provider,
    signer: wagmiConfig.signer,
    safeAddress: safeConfig.address, // Use existing Safe
    // OR for new Safe:
    safeOptions: {
      owners: safeConfig.signers.map(s => s.address),
      threshold: safeConfig.threshold
    }
  }) : null

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {config ? (
            <SafeProvider config={config}>
              {children}
            </SafeProvider>
          ) : (
            children
          )}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
```

### Step 4: Update Signatures Page

Replace mock transaction logic with real Safe hooks:

```typescript
// src/app/workspace/signatures/page.tsx
import { useSafe as useSafeHooks, useConfirmTransaction } from '@safe-global/safe-react-hooks'
import { useSafeConfig } from '@/store/safe'

export default function SignaturesPage() {
  const { address } = useAccount()
  
  // Official Safe hooks
  const { 
    getPendingTransactions, 
    isOwnerConnected,
    getSafeInfo 
  } = useSafeHooks()
  
  const { 
    confirmTransaction, 
    isPending: isConfirming 
  } = useConfirmTransaction()
  
  // Our custom store (for UI state)
  const { safeConfig } = useSafeConfig()
  
  // Get real pending transactions from Safe Transaction Service
  const { data: pendingTxs } = useQuery({
    queryKey: ['pendingTransactions'],
    queryFn: async () => {
      const txs = await getPendingTransactions()
      return txs
    },
    enabled: !!safeConfig?.address
  })
  
  const handleSign = async (safeTxHash: string) => {
    try {
      await confirmTransaction({ safeTxHash })
      toast.success("Transaction signed!")
    } catch (error) {
      toast.error("Failed to sign transaction")
    }
  }
  
  return (
    // Render pending transactions from Safe Transaction Service
    <div>
      {pendingTxs?.map(tx => (
        <TransactionCard 
          key={tx.safeTxHash}
          transaction={tx}
          onSign={() => handleSign(tx.safeTxHash)}
        />
      ))}
    </div>
  )
}
```

### Step 5: Update Workspace Page

Use `useSendTransaction` for creating streams:

```typescript
// src/app/workspace/page.tsx
import { useSendTransaction } from '@safe-global/safe-react-hooks'

export default function WorkspacePage() {
  const { sendTransaction, isPending } = useSendTransaction()
  const { safeConfig } = useSafeConfig()
  
  const handleCreateStream = async (employee: Employee) => {
    try {
      // Create Superfluid stream transaction
      const tx = await superfluidContract.createFlow(
        employee.address,
        flowRate
      )
      
      // Send to Safe (auto-proposes if threshold > 1)
      await sendTransaction({
        transactions: [{
          to: superfluidContract.address,
          value: '0',
          data: tx.data
        }]
      })
      
      toast.success(
        safeConfig.threshold > 1
          ? "Stream proposal created! Awaiting signatures..."
          : "Stream started successfully!"
      )
    } catch (error) {
      toast.error("Failed to create stream")
    }
  }
  
  return (
    // UI...
  )
}
```

### Step 6: Update Signer Dashboard

Use real Safe data:

```typescript
// src/app/signer-dashboard/page.tsx
import { useSafe as useSafeHooks } from '@safe-global/safe-react-hooks'

export default function SignerDashboardPage() {
  const { address } = useAccount()
  const { 
    getPendingTransactions,
    isOwnerConnected,
    getSafeInfo 
  } = useSafeHooks()
  
  const { data: safeInfo } = useQuery({
    queryKey: ['safeInfo'],
    queryFn: getSafeInfo
  })
  
  const { data: pendingTxs } = useQuery({
    queryKey: ['pendingTransactions'],
    queryFn: getPendingTransactions
  })
  
  // Filter transactions awaiting current signer
  const awaitingSignature = pendingTxs?.filter(tx => 
    !tx.confirmations?.some(c => c.owner === address)
  )
  
  return (
    <div>
      <h1>Signer Dashboard</h1>
      <div>Safe: {safeInfo?.address}</div>
      <div>Threshold: {safeInfo?.threshold} of {safeInfo?.owners.length}</div>
      
      <h2>Awaiting Your Signature ({awaitingSignature?.length})</h2>
      {awaitingSignature?.map(tx => (
        <TransactionCard key={tx.safeTxHash} transaction={tx} />
      ))}
    </div>
  )
}
```

## Benefits of This Approach

✅ **Official SDK** - Uses Safe's battle-tested hooks
✅ **Transaction Service** - Automatic integration with Safe Transaction Service
✅ **Real Multisig** - Actual signature collection workflow
✅ **Type Safety** - Full TypeScript support from Safe SDK
✅ **Auto Execution** - Smart threshold handling
✅ **Keep Our UX** - Maintain our custom UI/workspace flow
✅ **Gradual Migration** - Can implement piece by piece

## Migration Checklist

- [ ] Install `@safe-global/safe-react-hooks`
- [ ] Rename `useSafe` store to `useSafeConfig`
- [ ] Update all store imports across pages
- [ ] Setup `SafeProvider` in providers.tsx
- [ ] Update `/workspace/signatures` to use `useConfirmTransaction`
- [ ] Update `/workspace` to use `useSendTransaction`
- [ ] Update `/signer-dashboard` to use `getPendingTransactions`
- [ ] Update `/setup-safe` to actually deploy Safe
- [ ] Test multisig workflow end-to-end
- [ ] Remove mock transaction data

## Example: Complete Flow

### 1. Owner Creates Stream Proposal
```typescript
// In /workspace
const { sendTransaction } = useSendTransaction()

// Creates tx, sends to Safe Transaction Service
await sendTransaction({
  transactions: [superfluidStreamTx]
})
// Result: safeTxHash = '0xabc...'
```

### 2. Signer Views Pending Transaction
```typescript
// In /signer-dashboard
const { getPendingTransactions } = useSafe()

const pendingTxs = await getPendingTransactions()
// Returns: [{ safeTxHash: '0xabc...', confirmations: [owner], ... }]
```

### 3. Signer Signs Transaction
```typescript
// In /workspace/signatures
const { confirmTransaction } = useConfirmTransaction()

await confirmTransaction({ safeTxHash: '0xabc...' })
// Adds signature, executes if threshold met
```

### 4. Stream Executes
```
- If threshold = 2 and 2 signatures collected → Auto executes
- Superfluid stream starts
- Transaction marked as executed in Safe Transaction Service
```

## Demo vs Production

**For Hackathon Demo (Current):**
- Can use our custom store with mock data
- Simulates multisig workflow
- Works without backend

**For Production (With Safe Hooks):**
- Replace mocks with real Safe hooks
- Connects to Safe Transaction Service
- Real multisig with actual signatures
- Works with deployed Safes on-chain

## Summary

The Safe React Hooks SDK provides exactly what we need for production multisig. Our custom stores should focus on:
1. **Workspace/operator management** (our domain logic)
2. **UI state** (navigation, modals, etc)
3. **Demo fallbacks** (when Safe not connected)

The Safe hooks handle:
1. **Transaction creation** (via Safe Transaction Service)
2. **Signature collection** (multisig workflow)
3. **Execution** (when threshold met)
4. **Safe deployment** (if not exists)

This gives us the best of both worlds - our custom UX flow with Safe's production-ready multisig infrastructure! 🎉

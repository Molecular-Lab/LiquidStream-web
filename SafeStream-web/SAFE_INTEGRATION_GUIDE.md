# Safe SDK Integration Guide

## Overview
This guide outlines how to integrate Gnosis Safe SDK into LiquidStream for multisig payroll operations.

## Installation

```bash
pnpm add @safe-global/protocol-kit @safe-global/api-kit @safe-global/safe-core-sdk-types
```

## Core Integration Points

### 1. Safe Wallet Creation (`/setup-safe`)

**Location**: `src/app/setup-safe/page.tsx` → `handleCreateSafe` function

**Implementation**:
```typescript
import { Safe, SafeFactory } from '@safe-global/protocol-kit'
import { EthersAdapter } from '@safe-global/protocol-kit'
import { ethers } from 'ethers'

const createSafe = async (signers: string[], threshold: number) => {
  // Setup ethers adapter
  const provider = new ethers.BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()
  const ethAdapter = new EthersAdapter({ ethers, signerOrProvider: signer })

  // Create Safe factory
  const safeFactory = await SafeFactory.create({ ethAdapter })

  // Configure Safe
  const safeAccountConfig = {
    owners: signers, // Array of signer addresses
    threshold: threshold, // Minimum signatures required
  }

  // Deploy Safe
  const safeSdk = await safeFactory.deploySafe({ safeAccountConfig })
  const safeAddress = await safeSdk.getAddress()

  return { safeAddress, safeSdk }
}
```

**What to do**:
- Replace mock Safe creation with actual Safe SDK deployment
- Pass configured signers array and threshold
- Return deployed Safe address
- Store Safe address in workspace data
- Show transaction confirmation to user

---

### 2. Propose Stream Transaction (`/workspace`)

**Location**: Multiple places:
- `src/components/streams/start-stream-dialog.tsx` → `handleStartStream`
- `src/hooks/use-streams.tsx` → `useCreateStream`

**Current Flow**: Direct transaction to Superfluid Host contract

**New Flow**: Propose Safe transaction instead

**Implementation**:
```typescript
import { Safe } from '@safe-global/protocol-kit'
import { MetaTransactionData } from '@safe-global/safe-core-sdk-types'

const proposeSafeTransaction = async (
  safeAddress: string,
  to: string, // Superfluid Host contract
  data: string, // Encoded batchCall data
  value: string = '0'
) => {
  const provider = new ethers.BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()
  const ethAdapter = new EthersAdapter({ ethers, signerOrProvider: signer })

  // Load existing Safe
  const safeSdk = await Safe.create({ ethAdapter, safeAddress })

  // Create transaction
  const safeTransactionData: MetaTransactionData = {
    to: to, // Superfluid Host address
    data: data, // Encoded operation
    value: value,
  }

  const safeTransaction = await safeSdk.createTransaction({
    transactions: [safeTransactionData],
  })

  // Sign transaction
  const signedTransaction = await safeSdk.signTransaction(safeTransaction)

  // Propose to Safe (using Safe API Kit)
  const txHash = await safeSdk.getTransactionHash(signedTransaction)
  
  // TODO: Store transaction in Safe service
  // This allows other signers to see and sign it
  
  return { txHash, safeTransaction }
}
```

**What to do**:
- Modify `useCreateStream` to propose Safe transaction instead of direct execution
- Store transaction hash in Safe transaction service
- Show success message: "Transaction proposed, awaiting signatures"
- Don't mark stream as active until transaction executes

---

### 3. Fetch Pending Transactions (`/workspace/signatures`)

**Location**: `src/app/workspace/signatures/page.tsx`

**Implementation**:
```typescript
import { SafeApiKit } from '@safe-global/api-kit'

const fetchPendingTransactions = async (safeAddress: string) => {
  const apiKit = new SafeApiKit({
    chainId: BigInt(11155420), // Your chain ID (Optimism Sepolia)
  })

  // Get pending transactions
  const pendingTxs = await apiKit.getPendingTransactions(safeAddress)

  return pendingTxs.results.map((tx) => ({
    safeTxHash: tx.safeTxHash,
    to: tx.to,
    data: tx.data,
    value: tx.value,
    confirmations: tx.confirmations,
    confirmationsRequired: tx.confirmationsRequired,
    isExecuted: tx.isExecuted,
    submissionDate: tx.submissionDate,
  }))
}
```

**What to do**:
- Replace mock `pendingTransactions` with real data from Safe API
- Parse transaction data to extract stream details (decode Superfluid operations)
- Show signature status for each transaction
- Update UI with real confirmation counts

---

### 4. Sign Transaction (`/workspace/signatures`)

**Location**: `src/app/workspace/signatures/page.tsx` → `handleSign`

**Implementation**:
```typescript
const signSafeTransaction = async (
  safeAddress: string,
  safeTxHash: string
) => {
  const provider = new ethers.BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()
  const ethAdapter = new EthersAdapter({ ethers, signerOrProvider: signer })

  const safeSdk = await Safe.create({ ethAdapter, safeAddress })
  const apiKit = new SafeApiKit({
    chainId: BigInt(11155420),
  })

  // Get transaction details
  const transaction = await apiKit.getTransaction(safeTxHash)
  
  // Sign transaction
  const signature = await safeSdk.signHash(safeTxHash)

  // Submit signature to Safe service
  await apiKit.confirmTransaction(safeTxHash, signature.data)

  // Check if threshold is met
  const updatedTx = await apiKit.getTransaction(safeTxHash)
  const isReadyToExecute = 
    updatedTx.confirmations?.length >= transaction.confirmationsRequired

  return { signature, isReadyToExecute }
}
```

**What to do**:
- Replace mock signing with actual Safe transaction signing
- Submit signature to Safe service
- Update UI to show new signature count
- Enable "Execute" button if threshold is met

---

### 5. Execute Transaction (`/workspace/signatures`)

**Location**: `src/app/workspace/signatures/page.tsx` → `handleExecute`

**Implementation**:
```typescript
const executeSafeTransaction = async (
  safeAddress: string,
  safeTxHash: string
) => {
  const provider = new ethers.BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()
  const ethAdapter = new EthersAdapter({ ethers, signerOrProvider: signer })

  const safeSdk = await Safe.create({ ethAdapter, safeAddress })
  const apiKit = new SafeApiKit({
    chainId: BigInt(11155420),
  })

  // Get transaction
  const transaction = await apiKit.getTransaction(safeTxHash)

  // Verify threshold is met
  if (transaction.confirmations.length < transaction.confirmationsRequired) {
    throw new Error('Not enough signatures to execute')
  }

  // Execute transaction
  const executeTxResponse = await safeSdk.executeTransaction(transaction)
  const receipt = await executeTxResponse.transactionResponse?.wait()

  return { receipt, executed: true }
}
```

**What to do**:
- Replace mock execution with actual Safe transaction execution
- Verify threshold before execution
- Wait for blockchain confirmation
- Update UI to remove from pending list
- Show success message with transaction hash

---

## Data Structure Mapping

### Decode Superfluid Operations from Safe Transactions

When fetching pending transactions, you need to decode the transaction data to show user-friendly details:

```typescript
import { decodeFunctionData } from 'viem'
import { HOST_ABI, CFA_ABI } from '@/asset/abi'

const decodeSuperfuidOperation = (data: string) => {
  // Decode Host.batchCall
  const { args } = decodeFunctionData({
    abi: HOST_ABI,
    data: data as `0x${string}`,
  })

  // args[0] is the array of operations
  const operations = args[0] as Array<{
    operationType: number
    target: string
    data: string
  }>

  // Decode each operation
  return operations.map((op) => {
    if (op.operationType === 201) {
      // SUPERFLUID_CALL_AGREEMENT
      // Decode the CFA call
      const { functionName, args: cfaArgs } = decodeFunctionData({
        abi: CFA_ABI,
        data: op.data as `0x${string}`,
      })

      return {
        type: functionName, // 'createFlow', 'updateFlow', 'deleteFlow'
        token: cfaArgs[0],
        sender: cfaArgs[1],
        receiver: cfaArgs[2],
        flowRate: cfaArgs[3],
      }
    }
  })
}
```

---

## Workspace Data Storage

You'll need to store workspace metadata somewhere. Options:

### Option 1: IPFS + On-chain
```typescript
// Store on IPFS
const workspaceData = {
  companyName: "Acme Inc",
  safeAddress: "0x...",
  operationTeam: [
    { address: "0x...", name: "John", role: "Owner" }
  ],
  createdAt: Date.now()
}

const ipfsHash = await uploadToIPFS(workspaceData)

// Store IPFS hash on-chain (in a registry contract or Safe metadata)
```

### Option 2: Backend Database
```typescript
// POST /api/workspaces
const response = await fetch('/api/workspaces', {
  method: 'POST',
  body: JSON.stringify({
    companyInfo,
    teamMembers,
    safeAddress,
  })
})

const { workspaceId } = await response.json()
```

### Option 3: Safe Metadata
```typescript
// Use Safe's built-in metadata storage
// Store workspace info in Safe's transaction metadata
```

---

## Invitation System

### Generate Invitation Token

```typescript
// Backend endpoint: POST /api/invitations
const createInvitation = async (
  workspaceId: string,
  inviteeEmail: string,
  role: string
) => {
  const token = crypto.randomUUID() // Or use JWT
  
  // Store in database
  await db.invitations.create({
    token,
    workspaceId,
    inviteeEmail,
    role,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  })

  // Send email with invitation link
  await sendEmail({
    to: inviteeEmail,
    subject: 'Join LiquidStream Workspace',
    body: `Click here to join: ${BASE_URL}/invite?token=${token}`,
  })

  return token
}
```

### Validate and Use Token

```typescript
// Backend endpoint: GET /api/invitations/:token
const validateInvitation = async (token: string) => {
  const invitation = await db.invitations.findOne({ token })
  
  if (!invitation) {
    throw new Error('Invalid invitation')
  }
  
  if (invitation.expiresAt < Date.now()) {
    throw new Error('Invitation expired')
  }

  const workspace = await db.workspaces.findById(invitation.workspaceId)
  
  return {
    workspace,
    role: invitation.role,
  }
}
```

---

## Environment Variables

Add to `.env.local`:

```bash
# Safe Configuration
NEXT_PUBLIC_SAFE_CHAIN_ID=11155420 # Optimism Sepolia
NEXT_PUBLIC_SAFE_SERVICE_URL=https://safe-transaction-optimism-sepolia.safe.global

# Workspace Backend (if using)
NEXT_PUBLIC_API_URL=https://api.liquidstream.io
```

---

## Testing Checklist

### Safe Creation
- [ ] Deploy Safe with multiple signers
- [ ] Verify Safe address on block explorer
- [ ] Check signer list on Safe UI
- [ ] Verify threshold configuration

### Transaction Proposal
- [ ] Propose stream transaction
- [ ] Verify shows in Safe transaction queue
- [ ] Check all signers can see it

### Signature Collection
- [ ] Sign with first signer
- [ ] Sign with second signer
- [ ] Verify signature count updates
- [ ] Check "Execute" appears at threshold

### Execution
- [ ] Execute transaction
- [ ] Verify stream created on Superfluid
- [ ] Check balance updates
- [ ] Verify transaction disappears from pending

---

## Common Issues & Solutions

### Issue 1: Safe not found
**Solution**: Ensure Safe is deployed on the correct chain. Check `NEXT_PUBLIC_SAFE_CHAIN_ID`.

### Issue 2: Transaction execution fails
**Solution**: Verify:
- Threshold is met
- Safe has enough funds for gas
- Transaction data is correctly encoded

### Issue 3: Signatures not appearing
**Solution**: 
- Check Safe API endpoint is correct
- Verify network connectivity
- Ensure transaction was proposed to Safe service

### Issue 4: Wrong chain
**Solution**: 
- Use `wagmi`'s chain switching
- Prompt user to switch to correct network
- Check `publicClient.chain.id`

---

## Next Steps

1. **Install Safe SDK packages**
   ```bash
   pnpm add @safe-global/protocol-kit @safe-global/api-kit @safe-global/safe-core-sdk-types
   ```

2. **Create Safe service utility**
   - File: `src/lib/safe.ts`
   - Export helper functions for all Safe operations

3. **Update hooks**
   - Modify `use-streams.tsx` to use Safe proposals
   - Add new hooks: `useSafeTransactions`, `useSignTransaction`, `useExecuteTransaction`

4. **Test incrementally**
   - Start with Safe creation
   - Then transaction proposal
   - Then signature flow
   - Finally execution

5. **Add error handling**
   - Network errors
   - Insufficient signatures
   - Invalid transactions
   - User rejection

---

## Resources

- [Safe Protocol Kit Docs](https://docs.safe.global/safe-core-aa-sdk/protocol-kit)
- [Safe API Kit Docs](https://docs.safe.global/safe-core-aa-sdk/api-kit)
- [Safe Web App](https://app.safe.global) - For testing Safe operations
- [Superfluid Docs](https://docs.superfluid.finance)

---

Last Updated: October 24, 2025

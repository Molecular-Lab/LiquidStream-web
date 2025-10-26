# Operator Selection in Safe Setup

## Overview
The Safe setup page now supports selecting operators from the workspace registration as signers using a dropdown menu. This provides a seamless flow from workspace creation to Safe configuration.

## New Features

### 1. **useWorkspace() Hook**
Added as an alias to `useWorkspaceRegistration` for convenience.

**New Method:**
```typescript
getOperators: () => TeamMember[]
```

Returns all operators (team members) from the workspace registration.

**Usage:**
```typescript
import { useWorkspace } from "@/store/workspace"

const { getOperators } = useWorkspace()
const operators = getOperators()
```

### 2. **Dropdown Operator Selection**

Instead of manually entering each signer's details, you can now select from workspace operators using a dropdown menu.

**Features:**
- Shows all available operators from workspace registration
- Displays operator name, role, and email
- Automatically populates name, email, and role fields
- Tracks which operators are already added (prevents duplicates)
- Only shows unused operators in the dropdown

**UI Flow:**
1. Click "Add Operator as Signer" button
2. Dropdown shows available operators with their details
3. Click an operator to add them as a signer
4. Operator's name, role, and email are auto-filled
5. Only wallet address needs to be provided

### 3. **Two Ways to Add Signers**

#### Option A: Add Workspace Operator
- Click "Add Operator as Signer" dropdown
- Select from registered operators
- Auto-fills: name, role, email
- Manual input needed: wallet address

#### Option B: Add Custom Signer
- Click "Add Custom Signer" button
- Manual input for: name, wallet address
- Use for external signers not in workspace

### 4. **Visual Indicators**

**Operator Signers:**
- Display name and role badge
- Show "From workspace operators" label
- Display email address
- Wallet address input field

**Custom Signers:**
- Full form with name and wallet address inputs
- No role/email fields

## Code Examples

### Adding Operator as Signer
```typescript
const addOperatorAsSigner = (operator: TeamMember) => {
  // Check if already added
  const alreadyAdded = signers.some((s) => s.email === operator.email)
  if (alreadyAdded) {
    toast.error(`${operator.name} is already added as a signer`)
    return
  }

  const newSigner: Signer = {
    address: operator.walletAddress || "",
    name: operator.name,
    email: operator.email,
    role: operator.role,
    operatorId: operator.email, // Track as operator
  }

  setSigners([...signers, newSigner])
  toast.success(`Added ${operator.name} as signer`)
}
```

### Filtering Unused Operators
```typescript
const getUnusedOperators = () => {
  return availableOperators.filter(
    (op) => !signers.some((s) => s.email === op.email)
  )
}
```

### Dropdown Component
```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" className="w-full">
      <Users className="mr-2 h-4 w-4" />
      Add Operator as Signer
      <ChevronDown className="ml-auto h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent className="w-full" align="start">
    {getUnusedOperators().map((operator) => (
      <DropdownMenuItem
        key={operator.email}
        onClick={() => addOperatorAsSigner(operator)}
      >
        <div className="flex flex-col">
          <div className="font-medium">{operator.name}</div>
          <div className="text-xs text-muted-foreground">
            {operator.role} • {operator.email}
          </div>
        </div>
      </DropdownMenuItem>
    ))}
  </DropdownMenuContent>
</DropdownMenu>
```

## User Flow

### Complete Workflow: Registration → Safe Setup

1. **Register Workspace** (`/register`)
   ```
   Company: Acme Inc.
   Operators:
   - Alice Chen (alice@acme.com) - CFO
   - Bob Smith (bob@acme.com) - Operations Manager
   - Carol Davis (carol@acme.com) - Finance Lead
   ```

2. **Navigate to Safe Setup** (`/setup-safe`)
   - Operators automatically loaded from workspace
   - See: "Loaded 3 operators from workspace"

3. **Configure Safe Signers**
   - Owner (You) - auto-added as primary signer
   - Click "Add Operator as Signer" dropdown
   - See: Alice Chen (CFO • alice@acme.com)
   - See: Bob Smith (Operations Manager • bob@acme.com)
   - See: Carol Davis (Finance Lead • carol@acme.com)

4. **Add Alice as Signer**
   - Click "Alice Chen" from dropdown
   - Signer card appears with:
     - Name: Alice Chen
     - Role: CFO
     - Email: alice@acme.com
     - Label: "From workspace operators"
   - Input: Alice's wallet address (0x...)

5. **Add Bob as Signer**
   - Click dropdown again
   - Alice no longer appears (already added)
   - Click "Bob Smith"
   - Signer card appears
   - Input: Bob's wallet address

6. **Set Threshold**
   - Slider shows: "2 out of 3 signers"
   - Recommended: at least 2 signatures

7. **Create Safe**
   - All signers configured
   - Safe deployed with operator roles preserved

## Benefits

✅ **Seamless Integration** - Workspace operators flow directly into Safe setup
✅ **Reduced Input** - No re-entering names, roles, emails
✅ **Duplicate Prevention** - Can't add same operator twice
✅ **Clear Visibility** - See which signers are workspace operators vs custom
✅ **Flexible** - Can still add custom signers for external parties
✅ **Role Tracking** - Operator roles preserved in Safe configuration
✅ **Type Safety** - Full TypeScript support with interfaces

## Interface Updates

### Updated Signer Interface
```typescript
interface Signer {
  address: string
  name: string
  email?: string
  role?: string
  operatorId?: string // Tracks if signer is from workspace operators
}
```

### TeamMember Interface
```typescript
export interface TeamMember {
  name: string
  email: string
  role: string
  walletAddress?: string
}
```

## Validation

### Checks Performed:
1. ✅ Duplicate prevention (same email)
2. ✅ Required wallet address for all signers
3. ✅ Owner cannot be removed
4. ✅ Threshold cannot exceed signer count
5. ✅ Minimum 1 signer (owner)

### Error Messages:
- "Alice Chen is already added as a signer" (duplicate)
- "Please fill in all signer addresses" (missing wallet)
- "Please connect your wallet first" (no owner wallet)

## Testing

### Test Scenario 1: Add All Operators
1. Register workspace with 3 operators
2. Go to Safe setup
3. Click "Add Operator as Signer" 3 times
4. Select each operator from dropdown
5. Verify: All 3 appear with correct details
6. Verify: Dropdown is empty after all added

### Test Scenario 2: Mix Operators and Custom
1. Register workspace with 2 operators
2. Go to Safe setup
3. Add 1 operator via dropdown
4. Add 1 custom signer via button
5. Add 1 more operator via dropdown
6. Verify: 4 total signers (owner + 2 operators + 1 custom)

### Test Scenario 3: Duplicate Prevention
1. Add operator "Alice" from dropdown
2. Try to add "Alice" again
3. Verify: Error toast appears
4. Verify: Alice not duplicated in list

## Future Enhancements

### Potential Improvements:
1. **Auto-invite operators** - Send email/notification to operators to provide wallet
2. **Wallet validation** - Check if address is valid Ethereum address
3. **Operator status** - Show if operator has connected wallet
4. **Bulk import** - Select multiple operators at once
5. **ENS support** - Allow ENS names instead of addresses
6. **Address book** - Save commonly used addresses

### Backend Integration:
When adding backend:
```typescript
// Fetch operators from API
const operators = await fetchWorkspaceOperators(workspaceId)

// Notify operators they've been added
await notifyOperator(operator.email, {
  safeAddress,
  role: 'signer',
  threshold
})
```

## Summary

The operator selection feature streamlines Safe setup by:
- Eliminating manual re-entry of operator details
- Providing clear visibility into workspace structure
- Maintaining role information throughout the flow
- Preventing duplicate additions
- Supporting both workspace operators and custom signers

This creates a cohesive experience from workspace registration to Safe configuration, making it easy for teams to set up multisig wallets with the right people in the right roles.

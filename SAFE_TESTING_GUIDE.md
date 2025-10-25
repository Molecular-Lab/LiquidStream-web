# 🔧 Safe Apps SDK Testing Guide

## Why Transactions Don't Appear in Safe

**The issue:** Safe Apps SDK only works when running **inside** the Safe interface, not when accessed directly via `localhost`.

## How to Test Safe Integration

### Method 1: Add App to Safe (Recommended) ✅

1. **Go to Safe Web App**
   ```
   https://app.safe.global
   ```

2. **Connect Your Wallet**
   - Connect the wallet that has access to your Safe
   - Select your Safe wallet

3. **Add Custom App**
   - Navigate to **Apps** section
   - Click **"Add Custom App"** or **"+"**
   - Enter your local development URL:
     ```
     http://localhost:3001
     ```
   - Click **"Add"**

4. **Open App in Safe**
   - Click on your added app
   - The app will load inside Safe's iframe
   - Navigate to `/workspace/multisig`

5. **Test Transaction Creation**
   - Try the upgrade/downgrade operations
   - Transactions should now appear in Safe's queue
   - Check **Transactions** tab in Safe

### Method 2: Development Testing 🧪

Visit `http://localhost:3001/workspace/multisig` directly:
- You'll see a **Safe Apps SDK Tester** component
- It shows your current context (iframe vs direct)
- Provides step-by-step instructions
- Test connection button to verify SDK status

## Expected Behavior

### ✅ When in Safe Context:
- Safe Apps SDK Tester shows "In Safe Context" ✅
- Upgrade/downgrade creates transactions in Safe queue
- Toast notifications with "View in Safe" actions
- Transactions appear in Safe's **Transactions** tab

### ❌ When NOT in Safe Context:
- Safe Apps SDK Tester shows "Not in Safe" ❌
- Detailed error message with instructions
- No transactions created (expected behavior)
- Fallback to direct wallet operations (if configured)

## Troubleshooting

### Issue: "Not in Safe Context"
**Solution:** You're accessing the app directly. Use Method 1 above.

### Issue: "Connection failed" 
**Solution:** 
1. Ensure you're inside Safe iframe
2. Check that Safe supports your network
3. Verify wallet is connected to Safe

### Issue: Transactions not appearing
**Solution:**
1. Check Safe's **Transactions** tab
2. Verify you're a signer on the Safe
3. Check console for SDK errors
4. Ensure Safe has sufficient permissions

## Development Notes

- **Local URL:** `http://localhost:3001`
- **Safe Context Detection:** Automatically detects iframe environment
- **Fallback Behavior:** Shows instructions when not in Safe
- **Error Handling:** Descriptive messages for troubleshooting

## Quick Test Checklist

- [ ] App loads in Safe interface
- [ ] Safe Apps SDK Tester shows "In Safe Context"
- [ ] Can create upgrade/downgrade transactions
- [ ] Transactions appear in Safe queue
- [ ] Toast notifications work properly
- [ ] No console errors related to SDK
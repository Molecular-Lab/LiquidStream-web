# Superfluid Interface Reference

This folder contains all Superfluid protocol interface contracts for reference and custom implementations.

## Structure

```
interfaces/
├── superfluid/           # Core protocol interfaces
│   ├── ISuperfluid.sol       # Main protocol host
│   ├── ISuperToken.sol       # SuperToken standard
│   ├── ISuperfluidToken.sol  # Token streaming logic
│   ├── ISuperTokenFactory.sol # Factory for creating SuperTokens
│   ├── ISuperfluidGovernance.sol
│   ├── ISuperAgreement.sol
│   ├── ISuperApp.sol         # For building Super Apps
│   ├── CustomSuperTokenBase.sol
│   └── Definitions.sol
│
├── agreements/           # Streaming agreements
│   ├── IConstantFlowAgreementV1.sol  # CFA - continuous streams
│   ├── IInstantDistributionAgreementV1.sol  # IDA - instant distribution
│   └── gdav1/            # General Distribution Agreement V1
│       ├── IGeneralDistributionAgreementV1.sol
│       ├── ISuperfluidPool.sol
│       ├── IPoolAdminNFT.sol
│       ├── IPoolMemberNFT.sol
│       └── IPoolNFTBase.sol
│
├── tokens/               # Token types
│   ├── IPureSuperToken.sol   # Native SuperTokens
│   └── ISETH.sol             # Super ETH wrapper
│
└── utils/                # Utility interfaces
    ├── IResolver.sol
    ├── IMultiSigWallet.sol
    ├── ISafe.sol
    ├── IRelayRecipient.sol
    └── IUserDefinedMacro.sol
```

## Key Interfaces for SafeStream

### ISuperToken.sol
The main SuperToken interface with:
- **ERC20** functions (transfer, approve, etc.)
- **ERC777** hooks (tokensToSend, tokensReceived)
- **Streaming** functions (upgrade, downgrade)
- **Real-time balance** queries
- **Agreement management**

```solidity
interface ISuperToken {
    // Wrap ERC20 → SuperToken
    function upgrade(uint256 amount) external;
    
    // Unwrap SuperToken → ERC20
    function downgrade(uint256 amount) external;
    
    // Get real-time balance (includes active streams)
    function realtimeBalanceOf(address account, uint256 timestamp)
        external view returns (int256 availableBalance, uint256 deposit, uint256 owedDeposit);
    
    // Get underlying ERC20
    function getUnderlyingToken() external view returns (address);
}
```

### IConstantFlowAgreementV1.sol (CFA)
Continuous streaming agreement:
```solidity
interface IConstantFlowAgreementV1 {
    // Create a stream
    function createFlow(
        ISuperToken token,
        address receiver,
        int96 flowRate,
        bytes calldata ctx
    ) external returns (bytes memory newCtx);
    
    // Update flow rate
    function updateFlow(
        ISuperToken token,
        address receiver,
        int96 flowRate,
        bytes calldata ctx
    ) external returns (bytes memory newCtx);
    
    // Delete stream
    function deleteFlow(
        ISuperToken token,
        address sender,
        address receiver,
        bytes calldata ctx
    ) external returns (bytes memory newCtx);
    
    // Get flow info
    function getFlow(
        ISuperToken token,
        address sender,
        address receiver
    ) external view returns (
        uint256 timestamp,
        int96 flowRate,
        uint256 deposit,
        uint256 owedDeposit
    );
}
```

### ISuperfluid.sol
Main protocol host:
```solidity
interface ISuperfluid {
    // Get CFA agreement
    function getAgreementClass(bytes32 agreementType) 
        external view returns (ISuperAgreement);
    
    // Get SuperToken factory
    function getSuperTokenFactory() 
        external view returns (ISuperTokenFactory);
    
    // Batch call multiple operations
    function batchCall(Operation[] calldata operations) 
        external;
    
    // Call agreement with context
    function callAgreement(
        ISuperAgreement agreementClass,
        bytes calldata callData,
        bytes calldata userData
    ) external returns (bytes memory returnedData);
}
```

## Usage in SafeStream

### 1. Deployment Scripts
The deployment script uses these interfaces via ABIs:
```typescript
// scripts/supertoken/registration/deployWrappedSuperToken.ts
const factory = await viem.getContractAt(
  iSuperTokenFactoryAbi,
  factoryAddress
)
await factory.write.createERC20Wrapper([...])
```

### 2. Custom Contracts (Future)
If you build custom SafeStream contracts, import these interfaces:
```solidity
// contracts/custom/PayrollManager.sol
import "../interfaces/superfluid/ISuperToken.sol";
import "../interfaces/agreements/IConstantFlowAgreementV1.sol";

contract PayrollManager {
    ISuperToken public paymentToken;
    IConstantFlowAgreementV1 public cfa;
    
    function startSalaryStream(address employee, int96 flowRate) external {
        // Use the interfaces
    }
}
```

### 3. Web App Integration
The web app uses these via ABIs in `abi/abis.ts`:
```typescript
import { SuperToken_ABI } from '@/asset/abi'
const contract = getContract({
  address: PYUSDX_ADDRESS,
  abi: SuperToken_ABI,
  client: publicClient
})
```

## Flow Rate Calculation

Superfluid uses `int96 flowRate` = tokens per second (in wei)

```
Annual Salary = $50,000
→ Per second = 50000 / (365 * 24 * 60 * 60) = 0.001585489...
→ In wei (18 decimals) = 1585489599188640 wei/sec
```

Example:
```typescript
// $100/month = $3.33/day = $0.1388/hour = $0.00231/min = $0.0000385/sec
const monthlyAmount = parseUnits("100", 18)  // 100 tokens with 18 decimals
const flowRate = monthlyAmount / BigInt(30 * 24 * 60 * 60)  // per second
```

## Resources

- [Superfluid Docs](https://docs.superfluid.finance/)
- [Superfluid GitHub](https://github.com/superfluid-finance/protocol-monorepo)
- [CFA Guide](https://docs.superfluid.finance/docs/protocol/money-streaming/overview)
- [SuperToken Guide](https://docs.superfluid.finance/docs/protocol/super-tokens/overview)
- [Web App Integration](../docs/STREAMING_README.md)

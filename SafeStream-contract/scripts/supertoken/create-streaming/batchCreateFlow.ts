import { network } from 'hardhat'
import { Address, formatEther, encodeFunctionData, parseAbi, getContract, encodeAbiParameters, parseAbiParameters } from 'viem'
import * as dotenv from 'dotenv'

dotenv.config()

/**
 * @title Batch Create Superfluid Stream using batchCall (Hardhat v3 + Viem)
 *
 * This uses Superfluid.batchCall() to execute operations in a single transaction.
 * Useful for combining multiple operations like: upgrade + createFlow
 *
 * Usage:
 *   npx hardhat run scripts/batchCreateFlow.ts --network sepolia
 *
 * Environment Variables (.env):
 *   SUPER_TOKEN  - SuperToken address
 *   RECEIVER     - Address receiving the stream
 *   FLOW_RATE    - Flow rate in tokens/second (wei)
 *
 * Batch Operation Types (from Superfluid.sol):
 *   301 = OPERATION_TYPE_SUPERTOKEN_UPGRADE
 *   201 = OPERATION_TYPE_SUPERFLUID_CALL_AGREEMENT
 */

interface NetworkConfig {
  superfluidHost: Address
  cfa: Address
  networkName: string
}

interface Operation {
  operationType: number
  target: Address
  data: `0x${string}`
}

function getNetworkConfig(chainId: number): NetworkConfig {
  const configs: { [key: number]: NetworkConfig } = {
    8453: {
      superfluidHost: '0x4C073B3baB6d8826b8C5b229f3cfdC1eC6E47E74',
      cfa: '0x19ba78B9cDB05A877718841c574325fdB53601bb',
      networkName: 'Base Mainnet',
    },
    11155111: {
      superfluidHost: '0x109412E3C84f0539b43d39dB691B08c90f58dC7c',
      cfa: '0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef',
      networkName: 'Sepolia Testnet',
    },
    84532: {
      superfluidHost: '0x109412E3C84f0539b43d39dB691B08c90f58dC7c',
      cfa: '0xcfA132E353cB4E398080B9700609bb008eceB125',
      networkName: 'Base Sepolia',
    },
  }

  const config = configs[chainId]
  if (!config) {
    throw new Error(`Unsupported network with chainId: ${chainId}`)
  }

  return config
}

// ABI definitions
const superTokenAbi = parseAbi([
  'function balanceOf(address account) view returns (uint256)',
])

const superfluidHostAbi = parseAbi([
  'function batchCall((uint32 operationType, address target, bytes data)[] operations) payable',
])

const cfaAbi = parseAbi([
  'function createFlow(address token, address receiver, int96 flowRate, bytes ctx) returns (bytes newCtx)',
])

async function main() {
  console.log('=== Batch Create Superfluid Stream (Viem) ===\n')

  // Get environment variables
  const superTokenAddr = (process.env.SUPERTOKEN_ADDRESS || '0x30a6933ca9230361972e413a15dc8114c952414e') as Address
  const receiver = (process.env.RECEIVER || '0xbBdb0a2F77636F819CFb02F528ba91775f1Aaf9E') as Address
  const flowRateStr = process.env.FLOW_RATE || '166666666666'

  const flowRate = BigInt(flowRateStr)

  // Connect to network and get clients
  const { viem } = await network.connect({
    network: 'sepolia',
    chainType: 'l1',
  })

  const [deployer] = await viem.getWalletClients()
  const publicClient = await viem.getPublicClient()

  // Get network info
  const chainId = await publicClient.getChainId()
  const config = getNetworkConfig(chainId)

  console.log('Network:', config.networkName)
  console.log('Chain ID:', chainId)
  console.log('Host:', config.superfluidHost)
  console.log('CFA:', config.cfa)
  console.log('')
  console.log('SuperToken:', superTokenAddr)
  console.log('Receiver:', receiver)
  console.log('Flow Rate:', flowRate.toString(), 'wei/second')
  console.log('Sender:', deployer.account.address)
  console.log('')

  // Get contract instances
  const superToken = getContract({
    address: superTokenAddr,
    abi: superTokenAbi,
    client: { public: publicClient, wallet: deployer },
  })

  const host = getContract({
    address: config.superfluidHost,
    abi: superfluidHostAbi,
    client: { public: publicClient, wallet: deployer },
  })

  // Check balance
  const balance = await superToken.read.balanceOf([deployer.account.address])
  console.log('Your SuperToken balance:', formatEther(balance))

  if (balance === 0n) {
    throw new Error('You need SuperTokens to create a stream!')
  }

  // ========================================
  // BUILD BATCH OPERATIONS
  // ========================================

  // Step 1: Encode createFlow call
  const createFlowCallData = encodeFunctionData({
    abi: cfaAbi,
    functionName: 'createFlow',
    args: [
      superTokenAddr,
      receiver,
      flowRate as any, // int96
      '0x', // empty context
    ],
  })

  console.log('CreateFlow CallData:', createFlowCallData)

  // Step 2: Encode operation data (callData + userData)
  // This is what goes into operations[].data
  // Format: abi.encode(bytes callData, bytes userData)
  const operationData = encodeAbiParameters(
    parseAbiParameters('bytes, bytes'),
    [createFlowCallData, '0x'] // userData is empty
  )

  console.log('Operation Data (encoded):', operationData)
  console.log('')

  // Step 3: Build operations array
  const operations: Operation[] = [
    {
      operationType: 201, // OPERATION_TYPE_SUPERFLUID_CALL_AGREEMENT
      target: config.cfa,
      data: operationData,
    },
  ]

  console.log('=== Batch Operations ===')
  console.log('Number of operations:', operations.length)
  console.log('Operation 0:')
  console.log('  Type:', operations[0].operationType)
  console.log('  Target:', operations[0].target)
  console.log('  Data length:', operations[0].data.length)
  console.log('')

  // ========================================
  // EXECUTE BATCH CALL
  // ========================================

  console.log('Executing batchCall...\n')

  const hash = await host.write.batchCall([
    operations.map(op => ({
      operationType: op.operationType,
      target: op.target,
      data: op.data,
    }))
  ])

  console.log('Transaction hash:', hash)
  console.log('Waiting for confirmation...')

  const receipt = await publicClient.waitForTransactionReceipt({ hash })
  console.log('Confirmed in block:', receipt.blockNumber)

  console.log('\n=== SUCCESS ===')
  console.log('Stream created via batchCall! Money is now flowing continuously.')
  console.log('No more transactions needed - balance updates automatically!')
  console.log('')

  // Calculate flows
  const perSecond = flowRate
  const perDay = flowRate * 86400n
  const perMonth = flowRate * 2592000n

  console.log('Flow rate:', formatEther(perSecond), 'tokens/sec')
  console.log('Daily flow:', formatEther(perDay), 'tokens/day')
  console.log('Monthly flow:', formatEther(perMonth), 'tokens/month')
}

main().catch((error) => {
  console.error('\n=== BATCH CALL FAILED ===')
  console.error(error)
  process.exitCode = 1
})

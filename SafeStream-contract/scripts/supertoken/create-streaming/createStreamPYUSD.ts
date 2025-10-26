/**
 * @title Create Stream with PYUSD SuperToken
 * @notice Creates a Superfluid stream using already wrapped PYUSD SuperTokens
 *
 * Usage:
 *   npx hardhat run scripts/createStreamPYUSD.ts --network sepolia
 *
 * Prerequisites:
 *   - You must have PYUSD SuperTokens already (run upgradePYUSDSimple.ts first)
 *
 * Environment Variables:
 *   RECEIVER - Address to stream to (optional)
 *   FLOW_RATE - Flow rate in wei/second (optional, defaults to ~10 PYUSD/month)
 */

import { network } from 'hardhat'
import { Address, formatEther, getContract, parseAbi, encodeFunctionData, encodeAbiParameters, parseAbiParameters } from 'viem'

interface NetworkConfig {
  superfluidHost: Address
  cfa: Address
  networkName: string
}

function getNetworkConfig(chainId: number): NetworkConfig {
  const configs: { [key: number]: NetworkConfig } = {
    11155111: {
      superfluidHost: '0x109412E3C84f0539b43d39dB691B08c90f58dC7c',
      cfa: '0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef',
      networkName: 'Sepolia Testnet',
    },
  }

  const config = configs[chainId]
  if (!config) {
    throw new Error(`Unsupported network with chainId: ${chainId}`)
  }

  return config
}

interface Operation {
  operationType: number
  target: Address
  data: `0x${string}`
}

async function main() {
  console.log('=== Create PYUSD SuperToken Stream (BatchCall) ===\n')

  // Addresses and parameters
  const SUPERTOKEN_ADDRESS = '0x8fece7605C7475cc5f1d697D8915408986CA9fB6' as Address
  const RECEIVER = (process.env.RECEIVER || '0xbBdb0a2F77636F819CFb02F528ba91775f1Aaf9E') as Address
  const FLOW_RATE = BigInt(process.env.FLOW_RATE || '166666666') // ~10 PYUSD/month

  console.log('SuperToken Address:', SUPERTOKEN_ADDRESS)
  console.log('Stream Receiver:', RECEIVER)
  console.log('Flow Rate:', FLOW_RATE.toString(), 'wei/sec')
  console.log('Monthly Flow:', formatEther(FLOW_RATE * 2592000n), 'tokens/month')
  console.log('')

  // Connect to network
  const { viem } = await network.connect({
    network: 'sepolia',
    chainType: 'l1',
  })

  const [signer] = await viem.getWalletClients()
  const publicClient = await viem.getPublicClient()
  const chainId = await publicClient.getChainId()
  const config = getNetworkConfig(chainId)

  console.log('Network:', config.networkName)
  console.log('Sender:', signer.account.address)
  console.log('')

  // Define ABIs
  const superTokenAbi = parseAbi([
    'function balanceOf(address) view returns (uint256)',
  ])

  const hostAbi = parseAbi([
    'function batchCall((uint32 operationType, address target, bytes data)[] operations) payable',
  ])

  const cfaAbi = parseAbi([
    'function createFlow(address token, address receiver, int96 flowRate, bytes ctx) returns (bytes newCtx)',
  ])

  // Get contracts
  const superToken = getContract({
    address: SUPERTOKEN_ADDRESS,
    abi: superTokenAbi,
    client: { public: publicClient, wallet: signer },
  })

  const host = getContract({
    address: config.superfluidHost,
    abi: hostAbi,
    client: { public: publicClient, wallet: signer },
  })

  // Check SuperToken balance
  console.log('--- CHECKING BALANCE ---')
  const balance = await superToken.read.balanceOf([signer.account.address])
  console.log('Your SuperToken Balance:', formatEther(balance))
  console.log('')

  if (balance === 0n) {
    console.error('❌ You have no SuperTokens!')
    console.error('Please run upgradePYUSDSimple.ts first to wrap your PYUSD')
    process.exit(1)
  }

  // Build createFlow operation
  console.log('--- BUILDING BATCH OPERATION ---')

  const createFlowCallData = encodeFunctionData({
    abi: cfaAbi,
    functionName: 'createFlow',
    args: [SUPERTOKEN_ADDRESS, RECEIVER, FLOW_RATE as any, '0x'],
  })

  const createFlowOperationData = encodeAbiParameters(
    parseAbiParameters('bytes, bytes'),
    [createFlowCallData, '0x']
  )

  const operations: Operation[] = [
    {
      operationType: 201, // SUPERFLUID_CALL_AGREEMENT (createFlow)
      target: config.cfa,
      data: createFlowOperationData,
    },
  ]

  console.log('Operation: CREATE_FLOW')
  console.log('  Type:', operations[0].operationType)
  console.log('  Target (CFA):', operations[0].target)
  console.log('  To:', RECEIVER)
  console.log('  Flow Rate:', FLOW_RATE.toString(), 'wei/sec')
  console.log('  Monthly:', formatEther(FLOW_RATE * 2592000n), 'tokens/month')
  console.log('')

  // Execute batch call
  console.log('--- EXECUTING BATCH CALL ---')
  console.log('🚀 Creating stream...\n')

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
  console.log('✓ Confirmed in block:', receipt.blockNumber)
  console.log('')

  // Check balance after (will show deposit deducted)
  console.log('--- AFTER ---')
  const balanceAfter = await superToken.read.balanceOf([signer.account.address])
  console.log('SuperToken Balance:', formatEther(balanceAfter))
  console.log('Deposit Used:', formatEther(balance - balanceAfter))
  console.log('')

  // Summary
  console.log('=== SUCCESS ===')
  console.log('✅ Stream created successfully!')
  console.log('')
  console.log('Stream Details:')
  console.log('  From:', signer.account.address)
  console.log('  To:', RECEIVER)
  console.log('  Flow Rate:', formatEther(FLOW_RATE), 'tokens/sec')
  console.log('  Daily:', formatEther(FLOW_RATE * 86400n), 'tokens/day')
  console.log('  Monthly:', formatEther(FLOW_RATE * 2592000n), 'tokens/month')
  console.log('')
  console.log('💰 Money is now streaming continuously!')
  console.log('💡 No more transactions needed - balance updates automatically!')
}

main().catch((error) => {
  console.error('\n=== STREAM CREATION FAILED ===')
  console.error(error)
  process.exitCode = 1
})

import { network } from 'hardhat'
import { Address, formatEther, encodeFunctionData, parseAbi, getContract } from 'viem'
import * as dotenv from 'dotenv'

dotenv.config()

/**
 * @title Create Superfluid Stream (Hardhat v3 + Viem)
 *
 * Usage:
 *   npx hardhat run scripts/createFlow.ts --network sepolia
 *   npx hardhat run scripts/createFlow.ts --network baseSepolia
 *
 * Environment Variables (.env):
 *   SUPER_TOKEN  - SuperToken address
 *   RECEIVER     - Address receiving the stream
 *   FLOW_RATE    - Flow rate in tokens/second (wei)
 *                  Examples:
 *                  - 1000 tokens/month  ≈ 385802469135 wei/sec
 *                  - 2000 tokens/month  ≈ 771604938271 wei/sec
 *
 * Flow Rate Calculator:
 *   flowRate = (tokensPerMonth / 2592000) * 10^18
 */

interface NetworkConfig {
  superfluidHost: Address
  cfa: Address
  networkName: string
}

function getNetworkConfig(chainId: number): NetworkConfig {
  const configs: { [key: number]: NetworkConfig } = {
    // Base Mainnet
    8453: {
      superfluidHost: '0x4C073B3baB6d8826b8C5b229f3cfdC1eC6E47E74',
      cfa: '0x19ba78B9cDB05A877718841c574325fdB53601bb',
      networkName: 'Base Mainnet',
    },
    // Sepolia Testnet
    11155111: {
      superfluidHost: '0x109412E3C84f0539b43d39dB691B08c90f58dC7c',
      cfa: '0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef',
      networkName: 'Sepolia Testnet',
    },
    // Base Sepolia
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

// ABI definitions using parseAbi
const superTokenAbi = parseAbi([
  'function balanceOf(address account) view returns (uint256)',
])

const superfluidHostAbi = parseAbi([
  'function callAgreement(address agreementClass, bytes callData, bytes userData) returns (bytes returnedData)',
])

const cfaAbi = parseAbi([
  'function createFlow(address token, address receiver, int96 flowRate, bytes ctx) returns (bytes newCtx)',
])

async function main() {
  console.log('=== Creating Superfluid Stream (Viem) ===\n')

  // Get environment variables
  const superTokenAddr = "0x8fece7605C7475cc5f1d697D8915408986CA9fB6"
  // const superTokenAddr = "0x30a6933ca9230361972e413a15dc8114c952414e"
  const receiver = "0xbBdb0a2F77636F819CFb02F528ba91775f1Aaf9E"
  const flowRateStr = "166666666666"

  const flowRate = BigInt(flowRateStr)

  // Connect to network and get clients (Hardhat v3 pattern)
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

  // Get contract instances using getContract
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

  // Encode createFlow call
  const createFlowData = encodeFunctionData({
    abi: cfaAbi,
    functionName: 'createFlow',
    args: [
      superTokenAddr,
      receiver,
      flowRate as any, // int96
      '0x', // empty context
    ],
  })

  console.log('Creating stream via Superfluid Host...\n')

  // Create the stream
  const hash = await host.write.callAgreement([
    config.cfa,
    createFlowData,
    '0x', // empty user data
  ])

  console.log('Transaction hash:', hash)
  console.log('Waiting for confirmation...')

  const receipt = await publicClient.waitForTransactionReceipt({ hash })
  console.log('Confirmed in block:', receipt.blockNumber)

  console.log('\n=== SUCCESS ===')
  console.log('Stream created! Money is now flowing continuously.')
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
  console.error('\n=== STREAM CREATION FAILED ===')
  console.error(error)
  process.exitCode = 1
})

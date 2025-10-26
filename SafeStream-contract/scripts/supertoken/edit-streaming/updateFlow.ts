import { network } from 'hardhat'
import { Address, formatEther, encodeFunctionData, parseAbi, getContract } from 'viem'
import * as dotenv from 'dotenv'

dotenv.config()

/**
 * @title Update Superfluid Stream (Hardhat v3 + Viem)
 *
 * Usage:
 *   npx hardhat run scripts/updateFlow.ts --network sepolia
 *
 * Environment Variables (.env):
 *   SUPER_TOKEN  - SuperToken address
 *   RECEIVER     - Address receiving the stream
 *   FLOW_RATE    - New flow rate in tokens/second (wei)
 */

interface NetworkConfig {
  superfluidHost: Address
  cfa: Address
  networkName: string
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

const superfluidHostAbi = parseAbi([
  'function callAgreement(address agreementClass, bytes callData, bytes userData) returns (bytes returnedData)',
])

const cfaAbi = parseAbi([
  'function updateFlow(address token, address receiver, int96 flowRate, bytes ctx) returns (bytes newCtx)',
])

async function main() {
  console.log('=== Updating Superfluid Stream (Viem) ===\n')

  // Get environment variables
  const superTokenAddr = process.env.SUPER_TOKEN as Address
  const receiver = process.env.RECEIVER as Address
  const flowRateStr = process.env.FLOW_RATE

  if (!superTokenAddr || !receiver || !flowRateStr) {
    throw new Error(
      'Missing required environment variables: SUPER_TOKEN, RECEIVER, FLOW_RATE'
    )
  }

  const newFlowRate = BigInt(flowRateStr)

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
  console.log('Sender:', deployer.account.address)
  console.log('Receiver:', receiver)
  console.log('New Flow Rate:', newFlowRate.toString(), 'wei/second')
  console.log('')

  // Get contract instance
  const host = getContract({
    address: config.superfluidHost,
    abi: superfluidHostAbi,
    client: { public: publicClient, wallet: deployer },
  })

  // Encode updateFlow call
  const updateFlowData = encodeFunctionData({
    abi: cfaAbi,
    functionName: 'updateFlow',
    args: [
      superTokenAddr,
      receiver,
      newFlowRate as any, // int96
      '0x', // empty context
    ],
  })

  console.log('Updating stream...')

  // Update the stream
  const hash = await host.write.callAgreement([
    config.cfa,
    updateFlowData,
    '0x', // empty user data
  ])

  console.log('Transaction hash:', hash)
  console.log('Waiting for confirmation...')

  const receipt = await publicClient.waitForTransactionReceipt({ hash })
  console.log('Confirmed in block:', receipt.blockNumber)

  console.log('\n=== SUCCESS ===')
  console.log('Stream updated!')
  console.log('New flow rate:', formatEther(newFlowRate), 'tokens/sec')
}

main().catch((error) => {
  console.error('\n=== UPDATE FAILED ===')
  console.error(error)
  process.exitCode = 1
})

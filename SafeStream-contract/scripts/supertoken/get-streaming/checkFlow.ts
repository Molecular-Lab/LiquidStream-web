import { network } from 'hardhat'
import { Address, formatEther, parseAbi, getContract } from 'viem'
import * as dotenv from 'dotenv'

dotenv.config()

/**
 * @title Check Superfluid Stream Info (Hardhat v3 + Viem)
 *
 * Usage:
 *   npx hardhat run scripts/checkFlow.ts --network sepolia
 *
 * Environment Variables (.env):
 *   SUPER_TOKEN  - SuperToken address
 *   RECEIVER     - Address receiving the stream
 *   SENDER       - (Optional) Sender address to check
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

const superTokenAbi = parseAbi([
  'function balanceOf(address account) view returns (uint256)',
  'function realtimeBalanceOfNow(address account) view returns (int256 availableBalance, uint256 deposit, uint256 owedDeposit, uint256 timestamp)',
])

const cfaAbi = parseAbi([
  'function getFlow(address token, address sender, address receiver) view returns (uint256 timestamp, int96 flowRate, uint256 deposit, uint256 owedDeposit)',
])

async function main() {
  console.log('=== Stream Info (Viem) ===\n')

  // Get environment variables
  const superTokenAddr = (process.env.SUPERTOKEN_ADDRESS || '0x30a6933ca9230361972e413a15dc8114c952414e') as Address
  const receiver = (process.env.RECEIVER || '0xbBdb0a2F77636F819CFb02F528ba91775f1Aaf9E') as Address

  if (!superTokenAddr || !receiver) {
    throw new Error(
      'Missing required environment variables: SUPERTOKEN_ADDRESS, RECEIVER'
    )
  }

  // Connect to network and get clients
  const { viem } = await network.connect({
    network: 'sepolia',
    chainType: 'l1',
  })

  const [deployer] = await viem.getWalletClients()
  const publicClient = await viem.getPublicClient()

  const sender = (process.env.SENDER as Address) || '0x41649a1F8B2499e2F7884184D062639CEF9d0601' as Address

  // Get network info
  const chainId = await publicClient.getChainId()
  const config = getNetworkConfig(chainId)

  console.log('Network:', config.networkName)
  console.log('Chain ID:', chainId)
  console.log('Sender:', sender)
  console.log('Receiver:', receiver)
  console.log('SuperToken:', superTokenAddr)
  console.log('')

  // Get contract instances
  const cfa = getContract({
    address: config.cfa,
    abi: cfaAbi,
    client: { public: publicClient },
  })

  const superToken = getContract({
    address: superTokenAddr,
    abi: superTokenAbi,
    client: { public: publicClient },
  })

  // Get flow info
  const flowInfo = await cfa.read.getFlow([superTokenAddr, sender, receiver])

  const timestamp = flowInfo[0]
  const flowRate = flowInfo[1]
  const deposit = flowInfo[2]
  const owedDeposit = flowInfo[3]

  if (flowRate === 0n) {
    console.log('❌ No active stream found.')
  } else {
    console.log('✅ Active stream found!')
    console.log('')
    console.log('Flow Rate:', flowRate.toString(), 'wei/sec')
    console.log(
      'Last Updated:',
      new Date(Number(timestamp) * 1000).toISOString()
    )
    console.log('Deposit:', formatEther(deposit), 'tokens')
    console.log('Owed Deposit:', formatEther(owedDeposit), 'tokens')
    console.log('')

    // Calculate flows
    const perSecond = flowRate
    const perDay = flowRate * 86400n
    const perMonth = flowRate * 2592000n

    console.log('=== Calculated Flows ===')
    console.log('Per second:', formatEther(perSecond), 'tokens')
    console.log('Per day:   ', formatEther(perDay), 'tokens')
    console.log('Per month: ', formatEther(perMonth), 'tokens')
  }

  // Get balances
  console.log('')
  console.log('=== Balances ===')

  const senderBalance = await superToken.read.balanceOf([sender])
  const receiverBalance = await superToken.read.balanceOf([receiver])

  console.log('Sender balance:  ', formatEther(senderBalance), 'tokens')
  console.log('Receiver balance:', formatEther(receiverBalance), 'tokens')

  // Get real-time balance with streaming
  try {
    const realtimeBalance = await superToken.read.realtimeBalanceOfNow([sender])

    console.log('')
    console.log('=== Real-time Balance (with active streams) ===')
    console.log(
      'Available balance:',
      formatEther(realtimeBalance[0] > 0n ? realtimeBalance[0] : 0n),
      'tokens'
    )
    console.log('Deposit:', formatEther(realtimeBalance[1]), 'tokens')
    console.log('Owed deposit:', formatEther(realtimeBalance[2]), 'tokens')
  } catch (error) {
    console.log('')
    console.log('(Real-time balance not available)')
  }
}

main().catch((error) => {
  console.error('\n=== CHECK FAILED ===')
  console.error(error)
  process.exitCode = 1
})

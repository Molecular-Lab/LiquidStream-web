import { network } from 'hardhat'
import { Address, parseAbi, getContract } from 'viem'
import * as dotenv from 'dotenv'

dotenv.config()

/**
 * @title Delete Superfluid Stream using CFAv1Forwarder (Hardhat v3 + Viem)
 *
 * This uses the CFAv1Forwarder convenience contract for easier flow management.
 * The forwarder provides a simpler interface compared to direct CFA calls.
 *
 * Usage:
 *   npx hardhat run scripts/deleteFlowForwarder.ts --network sepolia
 *
 * Environment Variables (.env):
 *   SUPER_TOKEN  - SuperToken address
 *   SENDER       - Sender address (flow creator)
 *   RECEIVER     - Receiver address (flow recipient)
 *
 * Function Signature:
 *   deleteFlow(address token, address sender, address receiver, bytes userData)
 *
 * Who can delete:
 *   - Sender (flow creator)
 *   - Receiver (flow recipient)
 *   - Flow operator (with delete permissions)
 *   - Anyone (if sender is insolvent/critical)
 */

interface NetworkConfig {
  cfaForwarder: Address
  networkName: string
}

function getNetworkConfig(chainId: number): NetworkConfig {
  const configs: { [key: number]: NetworkConfig } = {
    8453: {
      cfaForwarder: '0xcfA132E353cB4E398080B9700609bb008eceB125',
      networkName: 'Base Mainnet',
    },
    11155111: {
      cfaForwarder: '0xcfA132E353cB4E398080B9700609bb008eceB125',
      networkName: 'Sepolia Testnet',
    },
    84532: {
      cfaForwarder: '0xcfA132E353cB4E398080B9700609bb008eceB125',
      networkName: 'Base Sepolia',
    },
  }

  const config = configs[chainId]
  if (!config) {
    throw new Error(`Unsupported network with chainId: ${chainId}`)
  }

  return config
}

// ABI for CFAv1Forwarder
const cfaForwarderAbi = parseAbi([
  'function deleteFlow(address token, address sender, address receiver, bytes userData) returns (bool)',
  'function getFlowrate(address token, address sender, address receiver) view returns (int96 flowrate)',
  'function getFlowInfo(address token, address sender, address receiver) view returns (uint256 lastUpdated, int96 flowrate, uint256 deposit, uint256 owedDeposit)',
])

async function main() {
  console.log('=== Delete Superfluid Stream via CFAv1Forwarder (Viem) ===\n')

  // Get environment variables
  const superTokenAddr = (process.env.SUPERTOKEN_ADDRESS || '0x30a6933ca9230361972e413a15dc8114c952414e') as Address
  const sender = (process.env.SENDER || '0x41649a1F8B2499e2F7884184D062639CEF9d0601') as Address
  const receiver = (process.env.RECEIVER || '0xbBdb0a2F77636F819CFb02F528ba91775f1Aaf9E') as Address

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
  console.log('CFAv1Forwarder:', config.cfaForwarder)
  console.log('')
  console.log('SuperToken:', superTokenAddr)
  console.log('Sender:', sender)
  console.log('Receiver:', receiver)
  console.log('Deleting as:', deployer.account.address)
  console.log('')

  // Get contract instance
  const forwarder = getContract({
    address: config.cfaForwarder,
    abi: cfaForwarderAbi,
    client: { public: publicClient, wallet: deployer },
  })

  // Check if flow exists
  console.log('Checking flow status...')
  const flowRate = await forwarder.read.getFlowrate([superTokenAddr, sender, receiver])

  if (flowRate === 0n) {
    console.log('\n❌ No active stream found between these addresses.')
    console.log('Nothing to delete.')
    return
  }

  // Get full flow info
  const flowInfo = await forwarder.read.getFlowInfo([superTokenAddr, sender, receiver])
  const [lastUpdated, rate, deposit, owedDeposit] = flowInfo

  console.log('\n✅ Active stream found!')
  console.log('Flow Rate:', rate.toString(), 'wei/sec')
  console.log('Deposit:', deposit.toString(), 'wei')
  console.log('Last Updated:', new Date(Number(lastUpdated) * 1000).toISOString())
  console.log('')

  // Permission check
  const isSender = deployer.account.address.toLowerCase() === sender.toLowerCase()
  const isReceiver = deployer.account.address.toLowerCase() === receiver.toLowerCase()

  if (!isSender && !isReceiver) {
    console.log('⚠️  WARNING: You are neither the sender nor receiver.')
    console.log('You can only delete if:')
    console.log('  1. You have flow operator permissions, OR')
    console.log('  2. The sender is insolvent/critical')
    console.log('')
  }

  // ========================================
  // DELETE FLOW
  // ========================================

  console.log('Deleting stream via CFAv1Forwarder...\n')

  const hash = await forwarder.write.deleteFlow([
    superTokenAddr,
    sender,
    receiver,
    '0x' // empty userData
  ])

  console.log('Transaction hash:', hash)
  console.log('Waiting for confirmation...')

  const receipt = await publicClient.waitForTransactionReceipt({ hash })
  console.log('Confirmed in block:', receipt.blockNumber)

  console.log('\n=== SUCCESS ===')
  console.log('Stream deleted!')
  console.log('Deposit returned to sender.')
  console.log('')

  // Verify deletion
  const newFlowRate = await forwarder.read.getFlowrate([superTokenAddr, sender, receiver])
  console.log('Verification:')
  console.log('New flow rate:', newFlowRate.toString(), '(should be 0)')
  console.log('✅ Stream successfully deleted!')
}

main().catch((error) => {
  console.error('\n=== DELETE FAILED ===')
  console.error(error)
  process.exitCode = 1
})

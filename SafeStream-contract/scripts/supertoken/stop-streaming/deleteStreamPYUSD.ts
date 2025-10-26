/**
 * @title Delete PYUSD SuperToken Stream
 * @notice Stops a Superfluid stream using CFAv1Forwarder
 *
 * Usage:
 *   npx hardhat run scripts/deleteStreamPYUSD.ts --network sepolia
 *
 * What it does:
 *   - Stops the stream immediately
 *   - Returns the deposit to sender
 *   - Final settlement of any streamed balance
 *
 * Who can delete:
 *   - Sender (stream creator)
 *   - Receiver (stream recipient)
 *   - Flow operator (with permissions)
 *   - Anyone (if sender is insolvent)
 *
 * Environment Variables:
 *   SENDER - Sender address (optional, defaults to your address)
 *   RECEIVER - Receiver address (optional, defaults to test address)
 */

import { network } from 'hardhat'
import { Address, parseAbi, getContract, formatEther } from 'viem'

interface NetworkConfig {
  cfaForwarder: Address
  networkName: string
}

function getNetworkConfig(chainId: number): NetworkConfig {
  const configs: { [key: number]: NetworkConfig } = {
    11155111: {
      cfaForwarder: '0xcfA132E353cB4E398080B9700609bb008eceB125',
      networkName: 'Sepolia Testnet',
    },
  }

  const config = configs[chainId]
  if (!config) {
    throw new Error(`Unsupported network with chainId: ${chainId}`)
  }

  return config
}

async function main() {
  console.log('=== Delete PYUSD SuperToken Stream ===\n')

  // Addresses
  const SUPERTOKEN_ADDRESS = '0x8fece7605C7475cc5f1d697D8915408986CA9fB6' as Address
  const RECEIVER = (process.env.RECEIVER || '0xbBdb0a2F77636F819CFb02F528ba91775f1Aaf9E') as Address

  console.log('SuperToken Address:', SUPERTOKEN_ADDRESS)
  console.log('Receiver:', RECEIVER)
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

  const sender = (process.env.SENDER || signer.account.address) as Address

  console.log('Network:', config.networkName)
  console.log('CFAv1Forwarder:', config.cfaForwarder)
  console.log('Sender:', sender)
  console.log('Deleting as:', signer.account.address)
  console.log('')

  // Define ABIs
  const cfaForwarderAbi = parseAbi([
    'function deleteFlow(address token, address sender, address receiver, bytes userData) returns (bool)',
    'function getFlowrate(address token, address sender, address receiver) view returns (int96 flowrate)',
    'function getFlowInfo(address token, address sender, address receiver) view returns (uint256 lastUpdated, int96 flowrate, uint256 deposit, uint256 owedDeposit)',
  ])

  const superTokenAbi = parseAbi([
    'function balanceOf(address) view returns (uint256)',
  ])

  // Get contracts
  const forwarder = getContract({
    address: config.cfaForwarder,
    abi: cfaForwarderAbi,
    client: { public: publicClient, wallet: signer },
  })

  const superToken = getContract({
    address: SUPERTOKEN_ADDRESS,
    abi: superTokenAbi,
    client: { public: publicClient, wallet: signer },
  })

  // Check if flow exists
  console.log('--- CHECKING FLOW STATUS ---')
  const flowRate = await forwarder.read.getFlowrate([SUPERTOKEN_ADDRESS, sender, RECEIVER])

  if (flowRate === 0n) {
    console.log('❌ No active stream found between these addresses.')
    console.log('Nothing to delete.')
    console.log('')
    console.log('Details:')
    console.log('  From:', sender)
    console.log('  To:', RECEIVER)
    return
  }

  // Get full flow info
  const flowInfo = await forwarder.read.getFlowInfo([SUPERTOKEN_ADDRESS, sender, RECEIVER])
  const [lastUpdated, rate, deposit, owedDeposit] = flowInfo

  console.log('✅ Active stream found!')
  console.log('')
  console.log('Stream Details:')
  console.log('  Flow Rate:', rate.toString(), 'wei/sec')
  console.log('  Daily Flow:', formatEther(rate * 86400n), 'tokens/day')
  console.log('  Monthly Flow:', formatEther(rate * 2592000n), 'tokens/month')
  console.log('  Deposit Locked:', formatEther(deposit), 'tokens')
  console.log('  Last Updated:', new Date(Number(lastUpdated) * 1000).toISOString())
  console.log('')

  // Get balances before
  console.log('--- BEFORE DELETION ---')
  const senderBalanceBefore = await superToken.read.balanceOf([sender])
  const receiverBalanceBefore = await superToken.read.balanceOf([RECEIVER])
  console.log('Sender Balance:', formatEther(senderBalanceBefore))
  console.log('Receiver Balance:', formatEther(receiverBalanceBefore))
  console.log('')

  // Permission check
  const isSender = signer.account.address.toLowerCase() === sender.toLowerCase()
  const isReceiver = signer.account.address.toLowerCase() === RECEIVER.toLowerCase()

  if (!isSender && !isReceiver) {
    console.log('⚠️  WARNING: You are neither the sender nor receiver.')
    console.log('You can only delete if:')
    console.log('  1. You have flow operator permissions, OR')
    console.log('  2. The sender is insolvent/critical')
    console.log('')
  } else if (isSender) {
    console.log('✓ You are the sender - you can delete this stream')
    console.log('')
  } else if (isReceiver) {
    console.log('✓ You are the receiver - you can delete this stream')
    console.log('')
  }

  // Delete the flow
  console.log('--- DELETING STREAM ---')
  console.log('🛑 Stopping stream via CFAv1Forwarder...\n')

  const hash = await forwarder.write.deleteFlow([
    SUPERTOKEN_ADDRESS,
    sender,
    RECEIVER,
    '0x' // empty userData
  ])

  console.log('Transaction hash:', hash)
  console.log('Waiting for confirmation...')

  const receipt = await publicClient.waitForTransactionReceipt({ hash })
  console.log('✓ Confirmed in block:', receipt.blockNumber)
  console.log('')

  // Get balances after
  console.log('--- AFTER DELETION ---')
  const senderBalanceAfter = await superToken.read.balanceOf([sender])
  const receiverBalanceAfter = await superToken.read.balanceOf([RECEIVER])
  console.log('Sender Balance:', formatEther(senderBalanceAfter))
  console.log('Receiver Balance:', formatEther(receiverBalanceAfter))
  console.log('')

  // Calculate changes
  const senderChange = senderBalanceAfter - senderBalanceBefore
  const receiverChange = receiverBalanceAfter - receiverBalanceBefore

  console.log('Balance Changes:')
  console.log('  Sender:', senderChange >= 0n ? '+' : '', formatEther(senderChange), 'tokens')
  console.log('  Receiver:', receiverChange >= 0n ? '+' : '', formatEther(receiverChange), 'tokens')
  console.log('')

  // Verify deletion
  const newFlowRate = await forwarder.read.getFlowrate([SUPERTOKEN_ADDRESS, sender, RECEIVER])

  console.log('=== SUCCESS ===')
  console.log('✅ Stream deleted successfully!')
  console.log('')
  console.log('Verification:')
  console.log('  New flow rate:', newFlowRate.toString(), '(should be 0)')
  console.log('  Deposit returned:', formatEther(deposit), 'tokens')
  console.log('')
  console.log('Stream Details:')
  console.log('  From:', sender)
  console.log('  To:', RECEIVER)
  console.log('  Status: ❌ STOPPED')
  console.log('')
  console.log('💡 The stream has been permanently stopped.')
  console.log('💰 The deposit has been returned to the sender.')
  console.log('🔄 Final balances have been settled.')
}

main().catch((error) => {
  console.error('\n=== DELETE FAILED ===')
  console.error(error)
  process.exitCode = 1
})

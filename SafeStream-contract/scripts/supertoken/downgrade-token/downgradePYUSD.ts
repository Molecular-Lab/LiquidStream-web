/**
 * @title Downgrade SuperToken to PYUSD (Unwrap)
 * @notice This script unwraps SuperToken back to PYUSD
 *
 * Usage:
 *   npx hardhat run scripts/downgradePYUSD.ts --network sepolia
 *
 * Environment Variables Required:
 *   PYUSD_ADDRESS - Address of PYUSD token
 *   SUPERTOKEN_ADDRESS - Address of the deployed SuperToken
 *   PRIVKEY - Your private key
 */

import { network } from 'hardhat'
import { Address, formatUnits, getContract, parseAbi, parseUnits } from 'viem'

async function main() {
  console.log('=== Downgrading SuperToken to PYUSD ===\n')

  // Get addresses from environment
  const PYUSD_ADDRESS = process.env.PYUSD_ADDRESS as Address
  const SUPERTOKEN_ADDRESS = process.env.SUPERTOKEN_ADDRESS as Address

  if (!PYUSD_ADDRESS || !SUPERTOKEN_ADDRESS) {
    throw new Error(
      'Missing required environment variables: PYUSD_ADDRESS, SUPERTOKEN_ADDRESS'
    )
  }

  console.log('PYUSD Address:', PYUSD_ADDRESS)
  console.log('SuperToken Address:', SUPERTOKEN_ADDRESS)
  console.log('')

  // Connect to network
  const { viem } = await network.connect({
    network: 'sepolia',
    chainType: 'l1',
  })

  const [signer] = await viem.getWalletClients()
  const publicClient = await viem.getPublicClient()

  console.log('User Address:', signer.account.address)
  console.log('')

  // ⚠️ CHANGE THIS to the amount you want to unwrap
  const AMOUNT = parseUnits('5', 18) // 50 SuperToken (18 decimals)
  console.log('Amount to unwrap:', formatUnits(AMOUNT, 18), 'SuperToken')
  console.log('')

  // Define ABIs
  const pyusdAbi = parseAbi([
    'function balanceOf(address) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)',
  ])

  const superTokenAbi = parseAbi([
    'function downgrade(uint256 amount)',
    'function balanceOf(address) view returns (uint256)',
    'function getUnderlyingToken() view returns (address)',
    'function getUnderlyingDecimals() view returns (uint8)',
    'function symbol() view returns (string)',
    'function name() view returns (string)',
  ])

  // Get contracts
  const pyusd = getContract({
    address: PYUSD_ADDRESS,
    abi: pyusdAbi,
    client: { public: publicClient, wallet: signer },
  })

  const superToken = getContract({
    address: SUPERTOKEN_ADDRESS,
    abi: superTokenAbi,
    client: { public: publicClient, wallet: signer },
  })

  // Check balances before
  console.log('--- BEFORE ---')
  const pyusdBalance = await pyusd.read.balanceOf([signer.account.address])
  const superTokenBalance = await superToken.read.balanceOf([signer.account.address])
  const pyusdDecimals = await pyusd.read.decimals()
  const underlyingDecimals = await superToken.read.getUnderlyingDecimals()

  console.log('PYUSD Balance:', formatUnits(pyusdBalance, pyusdDecimals))
  console.log('SuperToken Balance:', formatUnits(superTokenBalance, 18))
  console.log('')

  // Verify user has enough SuperToken
  if (superTokenBalance < AMOUNT) {
    throw new Error(
      `Insufficient SuperToken balance. Have: ${formatUnits(superTokenBalance, 18)}, Need: ${formatUnits(AMOUNT, 18)}`
    )
  }

  // Downgrade (unwrap) SuperToken to PYUSD
  console.log('--- DOWNGRADE (Unwrap) ---')
  console.log('Downgrading', formatUnits(AMOUNT, 18), 'SuperToken to PYUSD...')

  const downgradeTx = await superToken.write.downgrade([AMOUNT])
  console.log('Downgrade TX:', downgradeTx)
  console.log('Waiting for confirmation...')
  await publicClient.waitForTransactionReceipt({ hash: downgradeTx })
  console.log('✓ Downgraded!')
  console.log('')

  // Check balances after
  console.log('--- AFTER ---')
  const pyusdBalanceAfter = await pyusd.read.balanceOf([signer.account.address])
  const superTokenBalanceAfter = await superToken.read.balanceOf([
    signer.account.address,
  ])

  console.log('PYUSD Balance:', formatUnits(pyusdBalanceAfter, pyusdDecimals))
  console.log('SuperToken Balance:', formatUnits(superTokenBalanceAfter, 18))
  console.log('')

  // Calculate how much PYUSD received
  const pyusdReceived = pyusdBalanceAfter - pyusdBalance
  const expectedPyusd = AMOUNT / BigInt(10 ** (18 - Number(underlyingDecimals)))

  // Summary
  console.log('=== SUCCESS ===')
  console.log('Unwrapped', formatUnits(AMOUNT, 18), 'SuperToken')
  console.log('Received', formatUnits(pyusdReceived, pyusdDecimals), 'PYUSD')
  console.log('Expected', formatUnits(expectedPyusd, pyusdDecimals), 'PYUSD')
  console.log('')
  console.log('You now have your PYUSD back!')
}

main().catch((error) => {
  console.error('\n=== FAILED ===')
  console.error(error)
  process.exitCode = 1
})

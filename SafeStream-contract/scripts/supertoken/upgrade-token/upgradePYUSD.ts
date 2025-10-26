/**
 * @title Upgrade PYUSD to SuperToken (Wrap)
 * @notice This script approves and wraps PYUSD into the SuperToken
 *
 * Usage:
 *   npx hardhat run scripts/upgradePYUSD.ts --network sepolia
 *
 * Environment Variables Required:
 *   PYUSD_ADDRESS - Address of PYUSD token
 *   SUPERTOKEN_ADDRESS - Address of the deployed SuperToken
 *   PRIVKEY - Your private key
 */

import { network } from 'hardhat'
import { Address, formatUnits, getContract, parseAbi, parseUnits } from 'viem'

async function main() {
  console.log('=== Upgrading PYUSD to SuperToken ===\n')

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

  // ⚠️ CHANGE THIS to the amount you want to wrap
  const AMOUNT = parseUnits('10', 6) // 100 PYUSD (6 decimals)
  console.log('Amount to wrap:', formatUnits(AMOUNT, 6), 'PYUSD')
  console.log('')

  // Define ABIs
  const pyusdAbi = parseAbi([
    'function balanceOf(address) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function approve(address spender, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function symbol() view returns (string)',
  ])

  const superTokenAbi = parseAbi([
    'function upgrade(uint256 amount)',
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
  console.log('PYUSD Decimals:', pyusdDecimals)
  console.log('SuperToken Underlying Decimals:', underlyingDecimals)
  console.log('')

  // Verify user has enough PYUSD
  if (pyusdBalance < AMOUNT) {
    throw new Error(
      `Insufficient PYUSD balance. Have: ${formatUnits(pyusdBalance, pyusdDecimals)}, Need: ${formatUnits(AMOUNT, pyusdDecimals)}`
    )
  }

  // Step 1: Check current allowance
  console.log('--- STEP 1: Check Allowance ---')
  const currentAllowance = await pyusd.read.allowance([
    signer.account.address,
    SUPERTOKEN_ADDRESS,
  ])
  console.log('Current Allowance:', formatUnits(currentAllowance, pyusdDecimals))

  if (currentAllowance < AMOUNT) {
    console.log('Need to approve SuperToken to spend PYUSD...')
    console.log('')

    // Step 2: Approve SuperToken to spend PYUSD
    console.log('--- STEP 2: Approve ---')
    console.log('Approving', formatUnits(AMOUNT, pyusdDecimals), 'PYUSD...')
    const approveTx = await pyusd.write.approve([SUPERTOKEN_ADDRESS, AMOUNT])
    console.log('Approval TX:', approveTx)
    console.log('Waiting for confirmation...')
    await publicClient.waitForTransactionReceipt({ hash: approveTx })
    console.log('✓ Approved!')
    console.log('')
  } else {
    console.log('✓ Already have sufficient allowance')
    console.log('')
  }

  // Step 3: Upgrade (wrap) PYUSD to SuperToken
  console.log('--- STEP 3: Upgrade (Wrap) ---')
  console.log('Upgrading', formatUnits(AMOUNT, pyusdDecimals), 'PYUSD to SuperToken...')

  // For 6 decimal underlying, need to convert to 18 decimal amount for upgrade
  const upgradeAmount = AMOUNT * BigInt(10 ** (18 - Number(underlyingDecimals)))
  console.log('Upgrade amount (18 decimals):', formatUnits(upgradeAmount, 18))

  const upgradeTx = await superToken.write.upgrade([upgradeAmount])
  console.log('Upgrade TX:', upgradeTx)
  console.log('Waiting for confirmation...')
  await publicClient.waitForTransactionReceipt({ hash: upgradeTx })
  console.log('✓ Upgraded!')
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

  // Summary
  console.log('=== SUCCESS ===')
  console.log('Wrapped', formatUnits(AMOUNT, pyusdDecimals), 'PYUSD')
  console.log(
    'Received',
    formatUnits(superTokenBalanceAfter - superTokenBalance, 18),
    'SuperToken'
  )
  console.log('')
  console.log('You can now use your SuperTokens for streaming!')
}

main().catch((error) => {
  console.error('\n=== FAILED ===')
  console.error(error)
  process.exitCode = 1
})

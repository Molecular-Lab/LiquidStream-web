/**
 * @title Check PYUSD and SuperToken Balances
 * @notice This script checks balances and allowances
 *
 * Usage:
 *   npx hardhat run scripts/checkBalances.ts --network sepolia
 *
 * Environment Variables Required:
 *   PYUSD_ADDRESS - Address of PYUSD token
 *   SUPERTOKEN_ADDRESS - Address of the deployed SuperToken
 *   PRIVKEY - Your private key
 */

import { network } from 'hardhat'
import { Address, formatUnits, getContract, parseAbi } from 'viem'

async function main() {
  console.log('=== Checking Balances ===\n')

  // Get addresses from environment
  const PYUSD_ADDRESS = process.env.PYUSD_ADDRESS as Address
  const SUPERTOKEN_ADDRESS = process.env.SUPERTOKEN_ADDRESS as Address

  if (!PYUSD_ADDRESS || !SUPERTOKEN_ADDRESS) {
    throw new Error(
      'Missing required environment variables: PYUSD_ADDRESS, SUPERTOKEN_ADDRESS'
    )
  }

  // Connect to network
  const { viem } = await network.connect({
    network: 'sepolia',
    chainType: 'l1',
  })

  const [signer] = await viem.getWalletClients()
  const publicClient = await viem.getPublicClient()

  console.log('--- Contract Addresses ---')
  console.log('PYUSD Address:', PYUSD_ADDRESS)
  console.log('SuperToken Address:', SUPERTOKEN_ADDRESS)
  console.log('User Address:', signer.account.address)
  console.log('')

  // Define ABIs
  const pyusdAbi = parseAbi([
    'function balanceOf(address) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function symbol() view returns (string)',
    'function name() view returns (string)',
  ])

  const superTokenAbi = parseAbi([
    'function balanceOf(address) view returns (uint256)',
    'function getUnderlyingToken() view returns (address)',
    'function getUnderlyingDecimals() view returns (uint8)',
    'function decimals() view returns (uint8)',
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

  // Get token info
  console.log('--- Token Information ---')
  const pyusdName = await pyusd.read.name()
  const pyusdSymbol = await pyusd.read.symbol()
  const pyusdDecimals = await pyusd.read.decimals()

  const superTokenName = await superToken.read.name()
  const superTokenSymbol = await superToken.read.symbol()
  const superTokenDecimals = await superToken.read.decimals()
  const underlyingDecimals = await superToken.read.getUnderlyingDecimals()
  const underlyingAddress = await superToken.read.getUnderlyingToken()

  console.log('PYUSD:')
  console.log('  Name:', pyusdName)
  console.log('  Symbol:', pyusdSymbol)
  console.log('  Decimals:', pyusdDecimals)
  console.log('')
  console.log('SuperToken:')
  console.log('  Name:', superTokenName)
  console.log('  Symbol:', superTokenSymbol)
  console.log('  Decimals:', superTokenDecimals)
  console.log('  Underlying Decimals:', underlyingDecimals)
  console.log('  Underlying Address:', underlyingAddress)
  console.log('')

  // Verify underlying token matches
  if (underlyingAddress.toLowerCase() !== PYUSD_ADDRESS.toLowerCase()) {
    console.log('⚠️  WARNING: Underlying token does not match PYUSD_ADDRESS!')
    console.log('')
  }

  // Get balances
  console.log('--- User Balances ---')
  const pyusdBalance = await pyusd.read.balanceOf([signer.account.address])
  const superTokenBalance = await superToken.read.balanceOf([signer.account.address])

  console.log('PYUSD Balance:', formatUnits(pyusdBalance, pyusdDecimals), pyusdSymbol)
  console.log('  Raw:', pyusdBalance.toString())
  console.log(
    'SuperToken Balance:',
    formatUnits(superTokenBalance, 18),
    superTokenSymbol
  )
  console.log('  Raw:', superTokenBalance.toString())
  console.log('')

  // Get allowance
  console.log('--- Approval Status ---')
  const allowance = await pyusd.read.allowance([
    signer.account.address,
    SUPERTOKEN_ADDRESS,
  ])
  console.log('Current Allowance:', formatUnits(allowance, pyusdDecimals), pyusdSymbol)
  console.log('  Raw:', allowance.toString())
  console.log('')

  // Recommendations
  console.log('--- Status ---')
  if (pyusdBalance === 0n) {
    console.log('❌ You have no PYUSD tokens')
    console.log('   → Get PYUSD tokens first')
  } else {
    console.log('✓ You have PYUSD tokens')
  }

  if (allowance === 0n) {
    console.log('❌ No approval set for SuperToken')
    console.log('   → Run: npx hardhat run scripts/upgradePYUSD.ts --network sepolia')
  } else if (allowance < pyusdBalance) {
    console.log('⚠️  Approval is less than your balance')
    console.log('   → Can wrap up to:', formatUnits(allowance, pyusdDecimals), pyusdSymbol)
  } else {
    console.log('✓ Sufficient approval to wrap all your PYUSD')
  }

  if (superTokenBalance === 0n) {
    console.log('ℹ️  You have no SuperTokens')
    console.log('   → Wrap PYUSD to get SuperTokens for streaming')
  } else {
    console.log('✓ You have SuperTokens (can stream!)')
  }
  console.log('')

  // Conversion examples
  console.log('--- Conversion Examples ---')
  if (pyusdBalance > 0n) {
    const convertedAmount = pyusdBalance * BigInt(10 ** (18 - Number(pyusdDecimals)))
    console.log('If you wrap all your PYUSD, you will get:')
    console.log('  ', formatUnits(convertedAmount, 18), superTokenSymbol)
  }
  if (superTokenBalance > 0n) {
    const convertedAmount =
      superTokenBalance / BigInt(10 ** (18 - Number(underlyingDecimals)))
    console.log('If you unwrap all your SuperToken, you will get:')
    console.log('  ', formatUnits(convertedAmount, pyusdDecimals), pyusdSymbol)
  }
  console.log('')

  // Next steps
  console.log('--- Next Steps ---')
  if (pyusdBalance > 0n && allowance === 0n) {
    console.log('1. Run upgrade script to wrap PYUSD:')
    console.log('   npx hardhat run scripts/upgradePYUSD.ts --network sepolia')
  } else if (superTokenBalance > 0n) {
    console.log('1. You can now stream SuperTokens')
    console.log('2. Or unwrap back to PYUSD:')
    console.log('   npx hardhat run scripts/downgradePYUSD.ts --network sepolia')
  } else {
    console.log('1. Get PYUSD tokens')
    console.log('2. Run upgrade script to wrap')
  }
}

main().catch((error) => {
  console.error('\n=== FAILED ===')
  console.error(error)
  process.exitCode = 1
})

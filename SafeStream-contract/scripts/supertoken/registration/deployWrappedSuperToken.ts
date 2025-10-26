import { promises as fs } from 'fs'
import { network } from 'hardhat'
import path from 'path'
import { fileURLToPath } from 'url'
import { Address, decodeEventLog, getContract } from 'viem'

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function main() {
  // 1. Get config from environment and chain
  const underlyingTokenAddress = '0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9'
  const { viem } = await network.connect({
    network: 'sepolia',
    chainType: 'l1',
  })
  if (
    !underlyingTokenAddress ||
    !/^0x[a-fA-F0-9]{40}$/.test(underlyingTokenAddress)
  ) {
    throw new Error(
      'UNDERLYING_TOKEN environment variable not set or invalid address.'
    )
  }

  const chainId = 11155111

  const networkConfig = {
    networkName: 'Sepolia Testnet',
    superfluidHost: '0x109412E3C84f0539b43d39dB691B08c90f58dC7c',
  }

  const superfluidHostAddress =
    process.env.SUPERFLUID_HOST || networkConfig.superfluidHost

  console.log('=== Deploying Wrapped SuperToken ===')
  console.log('Network:', networkConfig.networkName)
  console.log('Chain ID:', chainId)
  console.log('Superfluid Host:', superfluidHostAddress)
  console.log('Underlying Token:', underlyingTokenAddress)

  // 2. Get ABIs from local abi folder
  const getAbi = async (fileName: string) => {
    const abiPath = path.resolve(__dirname, '../../../abi', fileName)
    const abiFile = await fs.readFile(abiPath, 'utf-8')
    return JSON.parse(abiFile)
  }

  // Import minimal ABIs from local abi folder
  // These are sufficient for the deployment operations we need
  const iSuperfluidAbi = await getAbi('superfluid_host_abi.json')
  const iSuperTokenFactoryAbi = await getAbi('supertoken_factory_abi.json')
  const ierc20MetadataAbi = await getAbi('erc20_metadata_abi.json')
  const iSuperTokenAbi = await getAbi('supertoken_abi.json')

  // 3. Get contract instances and deployer
  const [deployer] = await viem.getWalletClients()
  const publicClient = await viem.getPublicClient()

  const underlyingToken = getContract({
    address: underlyingTokenAddress as `0x${string}`,
    abi: ierc20MetadataAbi,
    client: { public: publicClient, wallet: deployer }
  })

  // 4. Get token info
  let underlyingName: string
  let underlyingSymbol: string
  let underlyingDecimals: number

  try {
    underlyingName = await underlyingToken.read.name([]) as string
  } catch {
    underlyingName = 'Unknown Token'
  }

  try {
    underlyingSymbol = await underlyingToken.read.symbol([]) as string
  } catch {
    underlyingSymbol = 'UNKNOWN'
  }

  try {
    underlyingDecimals = await underlyingToken.read.decimals([]) as number
  } catch (e) {
    throw new Error(
      `Could not get decimals for underlying token ${underlyingTokenAddress}. Error: ${
        (e as Error).message
      }`
    )
  }

  console.log('Underlying Name:', underlyingName)
  console.log('Underlying Symbol:', underlyingSymbol)

  // 5. Prepare SuperToken metadata
  const superTokenName = process.env.TOKEN_NAME || `Super ${underlyingName}`
  const superTokenSymbol = process.env.TOKEN_SYMBOL || `${underlyingSymbol}x`
  const upgradability = parseInt(process.env.UPGRADABILITY || '1', 10) // 0=none, 1=semi, 2=full

  console.log('')
  console.log('Creating SuperToken:')
  console.log('  Name:', superTokenName)
  console.log('  Symbol:', superTokenSymbol)
  console.log('  Upgradability:', upgradability)
  console.log('  Deployer:', deployer.account.address)

  // 6. Deploy
  const superfluid = getContract({
    address: superfluidHostAddress as `0x${string}`,
    abi: iSuperfluidAbi,
    client: { public: publicClient, wallet: deployer }
  })
  
  const factoryAddress = await superfluid.read.getSuperTokenFactory([]) as Address
  const factory = getContract({
    address: factoryAddress,
    abi: iSuperTokenFactoryAbi,
    client: { public: publicClient, wallet: deployer }
  })

  console.log('\n--- createERC20Wrapper Parameters ---')
  console.log('  underlying (token):', underlyingToken.address)
  console.log('  underlying decimals:', underlyingDecimals)
  console.log('  upgradability:', upgradability)
  console.log('  superTokenName:', superTokenName)
  console.log('  superTokenSymbol:', superTokenSymbol)
  console.log('  admin address:', deployer.account.address)
  console.log('------------------------------------\n')

  const tx = await factory.write.createERC20Wrapper([
    underlyingToken.address,
    underlyingDecimals,
    upgradability as 0 | 1 | 2,
    superTokenName,
    superTokenSymbol,
    deployer.account.address,
  ])

  console.log('Transaction sent:', tx)
  const receipt = await publicClient.waitForTransactionReceipt({ hash: tx })
  console.log('Transaction mined.')

  // 7. Get new SuperToken address from events
  let superTokenAddress: `0x${string}` | undefined

  for (const log of receipt.logs) {
    try {
      const event = decodeEventLog({
        abi: iSuperTokenFactoryAbi,
        data: log.data,
        topics: log.topics,
      }) as any
      if (event.eventName === 'SuperTokenCreated') {
        superTokenAddress = event.args.token as `0x${string}`
        console.log('Found SuperTokenCreated event')
        break
      }
    } catch (e) {
      // ignore logs that don't match the ABI
    }
  }

  if (!superTokenAddress) {
    throw new Error('SuperTokenCreated event not found in transaction receipt.')
  }

  const superToken = getContract({
    address: superTokenAddress,
    abi: iSuperTokenAbi,
    client: { public: publicClient, wallet: deployer }
  })

  // 8. Display results
  console.log('')
  console.log('=== SUCCESS ===')
  console.log('SuperToken deployed at:', superToken.address)
  console.log('Name:', await superToken.read.name([]))
  console.log('Symbol:', await superToken.read.symbol([]))
  console.log('Underlying:', await superToken.read.getUnderlyingToken([]))
  console.log('')
  console.log('=== Next Steps ===')
  console.log('1. Verify on block explorer')
  console.log('2. Users can now wrap tokens:')
  console.log(`   underlying.approve(${superToken.address}, amount)`)
  console.log('   superToken.upgrade(amount)')
  console.log('')
  console.log('3. To unwrap:')
  console.log('   superToken.downgrade(amount)')
  console.log('')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

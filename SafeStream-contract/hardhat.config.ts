import type { HardhatUserConfig } from 'hardhat/config'
import 'dotenv/config'

import hardhatToolboxViemPlugin from '@nomicfoundation/hardhat-toolbox-viem'
import '@nomicfoundation/hardhat-ethers'
import '@nomicfoundation/hardhat-verify'
import { configVariable } from 'hardhat/config'

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    compilers: [
      {
        version: '0.8.28',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          evmVersion: 'paris',
        },
      },
      {
        version: '0.8.26',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          evmVersion: 'paris',
        },
      },
    ],
  },
  paths: {
    sources: './contracts',  // Empty folder - we don't compile, just deploy
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
  networks: {
    hardhatMainnet: {
      type: 'edr-simulated',
      chainType: 'l1',
    },
    hardhatOp: {
      type: 'edr-simulated',
      chainType: 'op',
    },
    sepolia: {
      type: 'http',
      chainType: 'l1',
      chainId: 11155111,
      url: process.env.SEPOLIA_RPC || configVariable('SEPOLIA_RPC'),
      // Accept either PRIVKEY or PRIVATE_KEY env var for convenience. PRIVKEY takes precedence.
      accounts: process.env.PRIVKEY
        ? [process.env.PRIVKEY]
        : process.env.PRIVATE_KEY
        ? [process.env.PRIVATE_KEY]
        : [configVariable('PRIVKEY')],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || '',
  },
}

export default config

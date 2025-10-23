import { cookieStorage, createConfig, createStorage, http } from "wagmi"
import { sepolia, scrollSepolia, optimismSepolia, baseSepolia } from "wagmi/chains"

export const config = createConfig({
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: {
    [sepolia.id]: http(),
    [scrollSepolia.id]: http(),
    [optimismSepolia.id]: http(),
    [baseSepolia.id]: http(),
  },
  chains: [sepolia, scrollSepolia, optimismSepolia, baseSepolia],
  ssr: true,
  batch: {
    multicall: true,
  },
})

declare module "wagmi" {
  interface Register {
    config: typeof config
  }
}

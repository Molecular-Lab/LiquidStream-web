import { QueryClient, useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"

import { publicClient, PYUSD_ADDRESS, PYUSDX_ADDRESS, SUPER_TOKEN_ABI } from "@/lib/contract"
import { ERC20_PYUSD_ABI } from "@/asset/abi"

export const refreshTokenBalances = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({
    predicate: (query) => query.queryKey[0] === "token-balances",
  })
}

export const useTokenBalances = () => {
  const { address } = useAccount()
  
  return useQuery({
    queryKey: ["token-balances", address],
    queryFn: async () => {
      if (!address) return { pyusdx: 0, pyusd: 0 }
      
      // Use separate readContract calls to avoid deep type instantiation
      const [pyusdxBalance, pyusdBalance] = await Promise.all([
        publicClient.readContract({
          abi: SUPER_TOKEN_ABI,
          address: PYUSDX_ADDRESS,
          functionName: "balanceOf",
          args: [address],
        } as any),
        publicClient.readContract({
          abi: ERC20_PYUSD_ABI,
          address: PYUSD_ADDRESS,
          functionName: "balanceOf",
          args: [address],
        } as any)
      ])
      
      return {
        pyusdx: pyusdxBalance ? Number(pyusdxBalance) / 1e18 : 0,
        pyusd: pyusdBalance ? Number(pyusdBalance) / 1e18 : 0,
      }
    },
    enabled: !!address,
    refetchInterval: 1000 * 10, // 10 seconds
  })
}

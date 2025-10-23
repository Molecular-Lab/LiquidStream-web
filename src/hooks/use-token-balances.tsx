import { QueryClient, useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"

import { client, contracts, SUPER_TOKEN_ABI } from "@/lib/contract"
import { Address } from "viem"

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
      if (!address) return { pyusdx: 0 }
      
      const results = await client.multicall({
        contracts: [
          {
            abi: SUPER_TOKEN_ABI,
            address: contracts.pyusdx,
            functionName: "balanceOf",
            args: [address],
          },
        ],
      })
      
      return {
        pyusdx: results[0].result ? Number(results[0].result) / 1e18 : 0,
      }
    },
    enabled: !!address,
    refetchInterval: 1000 * 10, // 10 seconds
  })
}

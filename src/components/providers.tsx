"use client"

import "@rainbow-me/rainbowkit/styles.css"

import { darkTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { State, WagmiProvider } from "wagmi"
import { createConfig as createSafeConfig, SafeProvider } from "@safe-global/safe-react-hooks"
import { sepolia } from "viem/chains"

import { config } from "@/config/wallet"
import { useSafeConfig } from "@/store/safe"
import { useEffect, useState } from "react"
import { SafeAppsProvider } from "@/components/safe-apps-provider"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      experimental_prefetchInRender: true,
    },
  },
})

function SafeProviderWrapper({ children }: { children: React.ReactNode }) {
  const { safeConfig } = useSafeConfig()

  // TEMPORARILY DISABLED - Testing Safe creation without SafeProvider
  // SafeProvider will be enabled once Safe is confirmed deployed
  console.log("SafeProviderWrapper - Safe config:", {
    exists: !!safeConfig,
    address: safeConfig?.address,
    isDeployed: safeConfig?.isDeployed,
  })

  // For now, just render children without SafeProvider
  // TODO: Re-enable after confirming Safe deployment works
  return <>{children}</>

  /* DISABLED CODE - Re-enable after testing
  const [safeSDKConfig, setSafeSDKConfig] = useState<any>(null)

  useEffect(() => {
    // Only initialize SafeProvider if Safe is confirmed deployed
    if (safeConfig && safeConfig.isDeployed && typeof window !== 'undefined') {
      const initializeSafe = async () => {
        try {
          console.log("🔄 Initializing SafeProvider for address:", safeConfig.address)
          
          const config = createSafeConfig({
            chain: sepolia,
            provider: window.ethereum,
            signer: window.ethereum,
            safeAddress: safeConfig.address,
          })
          
          setSafeSDKConfig(config)
          console.log("✅ Safe SDK initialized successfully")
        } catch (error: any) {
          console.error("❌ Failed to create Safe config:", error)
          setSafeSDKConfig(null)
        }
      }
      
      const timer = setTimeout(() => {
        initializeSafe()
      }, 500)
      
      return () => clearTimeout(timer)
    } else {
      setSafeSDKConfig(null)
      
      if (safeConfig && !safeConfig.isDeployed) {
        console.log("⏳ Safe exists but not deployed yet. Address:", safeConfig.address)
      }
    }
  }, [safeConfig?.address, safeConfig?.isDeployed])

  if (!safeConfig || !safeConfig.isDeployed || !safeSDKConfig) {
    return <>{children}</>
  }

  return (
    <SafeProvider config={safeSDKConfig}>
      {children}
    </SafeProvider>
  )
  */
}

export function Providers({
  children,
  initialState,
}: {
  children: React.ReactNode
  initialState?: State
}) {
  return (
    <WagmiProvider config={config} initialState={initialState} reconnectOnMount={true}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "rgba(8, 71, 247, 0.85)",
            accentColorForeground: "white",
            borderRadius: "large",
            fontStack: "system",
            overlayBlur: "large",
          })}
        >
          <SafeAppsProvider>
            <SafeProviderWrapper>
              {children}
            </SafeProviderWrapper>
          </SafeAppsProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

"use client"

// Blockscout explorer URLs for different networks
const BLOCKSCOUT_EXPLORERS = {
  sepolia: "https://eth-sepolia.blockscout.com",
  scrollSepolia: "https://sepolia.scrollscan.com",
  optimismSepolia: "https://sepolia-optimism.blockscout.com",
  baseSepolia: "https://sepolia.basescan.org",
} as const

export type SupportedNetwork = keyof typeof BLOCKSCOUT_EXPLORERS

/**
 * Helper to get Blockscout explorer URL
 */
export const getBlockscoutUrl = (
  type: "tx" | "address" | "token",
  identifier: string,
  network: SupportedNetwork = "sepolia"
): string => {
  const baseUrl = BLOCKSCOUT_EXPLORERS[network]

  switch (type) {
    case "tx":
      return `${baseUrl}/tx/${identifier}`
    case "address":
      return `${baseUrl}/address/${identifier}`
    case "token":
      return `${baseUrl}/token/${identifier}`
    default:
      return baseUrl
  }
}

/**
 * Helper to open Blockscout explorer in new tab
 */
export const openBlockscout = (
  type: "tx" | "address" | "token",
  identifier: string,
  network: SupportedNetwork = "sepolia"
) => {
  const url = getBlockscoutUrl(type, identifier, network)
  window.open(url, "_blank")
}

import { contracts } from "@/lib/contract"

export const currencies = {
  pyusdx: {
    key: "pyusdx",
    name: "Super PYUSD",
    symbol: "PYUSDx",
    decimals: 18,
    address: contracts.pyusdx,
    icon: "https://cryptologos.cc/logos/paypal-usd-pyusd-logo.png",
    description: "Superfluid wrapped PayPal USD for streaming payments",
  },
} as const

export type CurrencyKey = keyof typeof currencies

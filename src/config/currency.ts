import { PYUSD_ADDRESS, PYUSDX_ADDRESS } from "@/lib/contract"

export const currencies = {
  pyusd: {
    key: "pyusd",
    name: "PayPal USD",
    symbol: "PYUSD",
    decimals: 18,
    address: PYUSD_ADDRESS,
    icon: "https://cryptologos.cc/logos/paypal-usd-pyusd-logo.png?v=040",
    description: "PayPal USD - A regulated stablecoin by PayPal",
    isSuper: false,
  },
  pyusdx: {
    key: "pyusdx",
    name: "Super PYUSD",
    symbol: "PYUSDx",
    decimals: 18,
    address: PYUSDX_ADDRESS,
    icon: "https://cryptologos.cc/logos/paypal-usd-pyusd-logo.png?v=040",
    description: "Superfluid wrapped PayPal USD for streaming payments",
    isSuper: true,
    underlyingToken: PYUSD_ADDRESS,
  },
} as const

export type CurrencyKey = keyof typeof currencies

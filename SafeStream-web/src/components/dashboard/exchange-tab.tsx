"use client"

import { Card, CardContent } from "@/components/ui/card"
import { UpgradeDowngradeCard } from "@/components/swap/upgrade-downgrade-card"
import { SingleWalletUpgradeDowngradeCard } from "@/components/swap/single-wallet-upgrade-downgrade-card"
import { useWalletMode } from "@/store/wallet-mode"
import { useSafe } from "@/store/safe"

export function ExchangeTab() {
  const { isSafeMode } = useWalletMode()
  const { safeConfig } = useSafe()

  const isSafe = isSafeMode()

  return (
    <div className="space-y-6">
      {/* Upgrade/Downgrade Card - switches based on wallet mode */}
      {isSafe ? (
        <UpgradeDowngradeCard />
      ) : (
        <SingleWalletUpgradeDowngradeCard />
      )}

      {/* About Streamable PYUSD Info */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-white">
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg text-gray-900 mb-4">About Streamable PYUSD</h3>
          <div className="space-y-3 text-gray-600">
            <p>
              <strong className="text-gray-900">Streamable PYUSD</strong> (PYUSDx SuperToken) is enabled for real-time payment streaming via Superfluid Protocol.
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong>Upgrade:</strong> Convert PYUSD → Streamable PYUSD to enable streaming</li>
              <li><strong>Downgrade:</strong> Convert Streamable PYUSD → PYUSD to return to base token</li>
              <li><strong>1:1 Ratio:</strong> Always maintains equal value during conversion</li>
              {isSafe ? (
                <li><strong>Safe Multisig:</strong> Transactions require {safeConfig?.threshold}/{safeConfig?.signers.length} signatures before execution</li>
              ) : (
                <li><strong>Direct Wallet:</strong> Transactions execute immediately without approval delays</li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

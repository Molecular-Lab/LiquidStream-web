"use client"

import { Shield, Zap, Lock, Users } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useWalletMode } from "@/store/wallet-mode"
import { useSafe } from "@/store/safe"
import { useConnectedSafeInfo } from "@/hooks/use-safe-apps-sdk"

interface WalletModeBannerProps {
  showToggle?: boolean
  onToggleMode?: () => void
}

export function WalletModeBanner({ showToggle = false, onToggleMode }: WalletModeBannerProps) {
  const { isSafeMode } = useWalletMode()
  const { safeConfig } = useSafe()
  const { safeInfo, isInSafeContext } = useConnectedSafeInfo()

  const isSafe = isSafeMode()
  
  // Prioritize safe.global connection
  const activeSafeConfig = isInSafeContext && safeInfo ? {
    address: safeInfo.safeAddress,
    threshold: safeInfo.threshold,
    signers: safeInfo.owners.map((owner, idx) => ({ 
      address: owner, 
      name: `Signer ${idx + 1}`,
      role: "Signer" 
    }))
  } : safeConfig
  
  const isSafeConfigured = !!activeSafeConfig?.address

  if (isSafe && !isSafeConfigured) {
    // Safe mode but not configured - show setup required
    return (
      <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-orange-800">Safe Setup Required</h3>
              <p className="text-sm text-orange-700">
                Configure your Safe multisig wallet to enable secure payroll operations
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isSafe && isSafeConfigured) {
    // Safe mode with configuration - GREEN THEME
    return (
      <Card className="border-2 border-green-500/50 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-lg text-gray-900 mb-1 flex items-center gap-2">
                Safe Multisig Mode
                {isInSafeContext && (
                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                    Connected via safe.global
                  </Badge>
                )}
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                  {activeSafeConfig.threshold}/{activeSafeConfig.signers.length} signatures required
                </Badge>
              </div>
              <p className="text-gray-600 mb-2">
                All transactions require multiple signatures for enhanced security. Proposals will be created for signers to approve.
              </p>
              <div className="text-xs text-muted-foreground font-mono">
                Safe: {activeSafeConfig.address}
              </div>
              <div className="flex gap-2 mt-3">
                <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
                  <Lock className="mr-1 h-3 w-3" />
                  Secure
                </Badge>
                <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
                  <Users className="mr-1 h-3 w-3" />
                  {activeSafeConfig.signers.length} Signers
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Single wallet mode
  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-white">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-[#0070BA] rounded-xl flex items-center justify-center flex-shrink-0">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900 mb-1">Instant Execution Mode</h3>
            <p className="text-gray-600">
              All transactions execute immediately with your connected wallet. No approval delays, perfect for fast operations.
            </p>
            <div className="flex gap-2 mt-3">
              <Badge variant="outline" className="text-[#0070BA] border-blue-300">
                Low Gas Fees
              </Badge>
              <Badge variant="outline" className="text-[#0070BA] border-blue-300">
                Direct Control
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import Link from "next/link"
import { Shield, Wallet, Users, ArrowRight, Zap, Lock, DollarSign } from "lucide-react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useSafeConfig } from "@/store/safe"

export default function WorkspaceHub() {
  const { address } = useAccount()
  const { safeConfig } = useSafeConfig()
  const isSafeConfigured = !!safeConfig?.address

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/landing">
                <div className="text-2xl font-bold bg-gradient-to-r from-[#0070BA] to-[#009CDE] bg-clip-text text-transparent">
                  SafeStream
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <ConnectButton />
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#0070BA] to-[#009CDE] bg-clip-text text-transparent">
            Choose Your Workspace
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Select the right mode for your payroll streaming needs
          </p>
        </div>

        {/* Workspace Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Single Wallet Option */}
          <Card className="border-2 hover:border-green-300 transition-colors cursor-pointer group">
            <Link href="/workspace/single">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                  <Wallet className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl text-green-700">Single Wallet</CardTitle>
                <CardDescription className="text-base">
                  Fast and simple payroll management with your connected wallet
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="outline" className="text-green-700 border-green-300">
                    <Zap className="mr-1 h-3 w-3" />
                    Instant Execution
                  </Badge>
                  <Badge variant="outline" className="text-green-700 border-green-300">
                    <DollarSign className="mr-1 h-3 w-3" />
                    Low Gas Fees
                  </Badge>
                </div>

                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Perfect for:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Individual use</li>
                    <li>• Small teams</li>
                    <li>• Quick operations</li>
                  </ul>
                </div>

                <div className="pt-4 text-center">
                  <Button className="bg-green-600 hover:bg-green-700 text-white group-hover:bg-green-700">
                    Start with Single Wallet
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* Multisig Option */}
          <Card className="border-2 hover:border-[#0070BA] transition-colors cursor-pointer group">
            <Link href="/workspace/multisig">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-[#0070BA]/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#0070BA]/20 transition-colors">
                  <Shield className="h-8 w-8 text-[#0070BA]" />
                </div>
                <CardTitle className="text-2xl text-[#0070BA]">Safe Multisig</CardTitle>
                <CardDescription className="text-base">
                  Enterprise-grade security with multi-signature wallet protection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="outline" className="text-[#0070BA] border-[#0070BA]/30">
                    <Lock className="mr-1 h-3 w-3" />
                    Secure
                  </Badge>
                  <Badge variant="outline" className="text-[#0070BA] border-[#0070BA]/30">
                    <Users className="mr-1 h-3 w-3" />
                    Team-based
                  </Badge>
                  {isSafeConfigured && (
                    <Badge variant="outline" className="text-green-600 border-green-300">
                      ✓ Configured
                    </Badge>
                  )}
                </div>

                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Perfect for:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Large organizations</li>
                    <li>• Team oversight</li>
                    <li>• Enhanced security</li>
                  </ul>
                </div>

                <div className="pt-4 text-center">
                  <Button className="bg-[#0070BA] hover:bg-[#005A94] text-white group-hover:bg-[#005A94]">
                    {isSafeConfigured ? 'Open Multisig Workspace' : 'Setup Safe Multisig'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Current Status */}
        {address && (
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-muted-foreground">
                Connected: {address.slice(0, 6)}...{address.slice(-4)}
              </span>
              {isSafeConfigured && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">
                    Safe: {safeConfig.address.slice(0, 6)}...{safeConfig.address.slice(-4)}
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Features Overview */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Why Choose SafeStream?</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Real-time Streaming</h3>
              <p className="text-sm text-muted-foreground">
                Continuous payment flows using Superfluid protocol
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Enterprise Security</h3>
              <p className="text-sm text-muted-foreground">
                Multi-signature protection for large organizations
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Team Management</h3>
              <p className="text-sm text-muted-foreground">
                Easy employee onboarding and stream management
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

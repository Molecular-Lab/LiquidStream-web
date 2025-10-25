"use client"

import Link from "next/link"
import { ArrowRight, Shield, Zap, Building2, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center space-y-8 max-w-5xl mx-auto">
          <div className="inline-block px-4 py-2 bg-[#0070BA]/10 border border-[#0070BA]/20 rounded-full">
            <span className="text-sm font-medium text-[#0070BA]">
              Powered by PayPal USD & Superfluid
            </span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
            Real-Time Payroll
            <span className="block bg-gradient-to-r from-[#0070BA] to-[#009CDE] bg-clip-text text-transparent">
              Streaming Platform
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Pay your employees every second they work with PYUSD stablecoin streaming.
            Choose your security model.
          </p>
        </div>

        {/* Two Path Selection - Main CTAs */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mt-16">
          {/* Enterprise Path - Safe Multisig */}
          <Card className="border-4 border-[#0070BA] hover:shadow-2xl transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 bg-[#0070BA] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
              ENTERPRISE
            </div>
            <CardHeader className="pb-4 pt-8">
              <div className="w-16 h-16 bg-[#0070BA]/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Shield className="h-8 w-8 text-[#0070BA]" />
              </div>
              <CardTitle className="text-center text-2xl">
                Safe Multisig Workspace
              </CardTitle>
              <CardDescription className="text-center text-base">
                For teams requiring multi-signature approvals and audit trails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-[#0070BA]/5 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-[#0070BA] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Multisig Security:</span> Requires multiple team members to approve transactions
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Building2 className="h-4 w-4 text-[#0070BA] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Team Governance:</span> Operation team manages payroll together
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-[#0070BA] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Safe Integration:</span> Runs on Safe&apos;s proven multisig infrastructure
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/register" className="block">
                  <Button size="lg" className="w-full bg-[#0070BA] hover:bg-[#005A94] text-base h-12">
                    Create Enterprise Workspace
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <p className="text-xs text-center text-muted-foreground mt-3">
                  Setup Safe multisig wallet → Invite operation team → Start streaming
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Individual Path - Direct Wallet */}
          <Card className="border-4 border-green-500 hover:shadow-2xl transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
              INDIVIDUAL
            </div>
            <CardHeader className="pb-4 pt-8">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Zap className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-center text-2xl">
                Direct Wallet Workspace
              </CardTitle>
              <CardDescription className="text-center text-base">
                For individuals and small teams needing instant execution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-500/5 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <Zap className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Instant Execution:</span> Transactions execute immediately without signatures
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Simple Setup:</span> Just connect your wallet and start streaming
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Lower Gas Fees:</span> Direct wallet operations cost less
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/workspace/single" className="block">
                  <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-base h-12">
                    Start Individual Workspace
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <p className="text-xs text-center text-muted-foreground mt-3">
                  Connect wallet → Add employees → Start streaming instantly
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Join Existing Workspace CTA */}
        <div className="max-w-3xl mx-auto mt-12">
          <Card className="border-2 border-dashed border-muted-foreground/30 hover:border-[#0070BA] transition-colors">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  Already have an invitation code?
                </p>
                <Link href="/invite">
                  <Button variant="outline" size="lg" className="text-base">
                    Join Existing Workspace
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="container mx-auto px-6 py-16 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Choose Your Path</h2>
            <p className="text-muted-foreground">
              Both options use the same Superfluid streaming engine, just different execution models
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-[#0070BA]" />
                  <CardTitle className="text-lg">Enterprise Safe Path</CardTitle>
                </div>
                <CardDescription>Multisig governance workflow</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-[#0070BA] font-bold">1.</span>
                  <div>Register workspace & invite operation team</div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#0070BA] font-bold">2.</span>
                  <div>Setup Safe multisig on safe.global</div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#0070BA] font-bold">3.</span>
                  <div>Add SafeStream app to your Safe</div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#0070BA] font-bold">4.</span>
                  <div>Propose transactions → collect signatures → execute</div>
                </div>
                <div className="pt-3 border-t">
                  <span className="font-semibold">Best for:</span> Companies, DAOs, teams requiring audit trails
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-lg">Individual Direct Path</CardTitle>
                </div>
                <CardDescription>Instant execution workflow</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">1.</span>
                  <div>Connect your wallet</div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">2.</span>
                  <div>Add employees & configure streams</div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">3.</span>
                  <div>Start streaming immediately (no signatures)</div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">4.</span>
                  <div>Manage streams in real-time</div>
                </div>
                <div className="pt-3 border-t">
                  <span className="font-semibold">Best for:</span> Freelancers, solopreneurs, small teams
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              © 2025 SafeStream. Powered by PayPal USD & Superfluid.
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/workspace/single" className="hover:text-green-600 transition-colors">
                Direct Wallet
              </Link>
              <Link href="/register" className="hover:text-[#0070BA] transition-colors">
                Enterprise Setup
              </Link>
              <Link href="/invite" className="hover:text-[#0070BA] transition-colors">
                Join Team
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

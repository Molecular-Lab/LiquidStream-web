"use client"

import Link from "next/link"
import { ArrowRight, Shield, Zap, Users, CheckCircle2, Clock, DollarSign } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="inline-block px-4 py-2 bg-[#0070BA]/10 border border-[#0070BA]/20 rounded-full">
            <span className="text-sm font-medium text-[#0070BA]">
              Powered by PayPal USD & Superfluid
            </span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
            Real-Time Stablecoin
            <span className="block bg-gradient-to-r from-[#0070BA] to-[#009CDE] bg-clip-text text-transparent">
              Payroll Streaming
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Pay your employees every second they work. Built with Safe multisig security 
            and PYUSD stablecoin for enterprise payroll operations.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-[#0070BA] hover:bg-[#005A94] text-lg h-14 px-8">
                Start Your Workspace
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="text-lg h-14 px-8">
                View Demo
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto">
          <Card className="border-2">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl font-bold text-[#0070BA]">$0</div>
              <div className="text-sm text-muted-foreground mt-2">Setup Fees</div>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl font-bold text-[#0070BA]">24/7</div>
              <div className="text-sm text-muted-foreground mt-2">Streaming</div>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl font-bold text-[#0070BA]">100%</div>
              <div className="text-sm text-muted-foreground mt-2">Transparent</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Why SafeStream?</h2>
          <p className="text-xl text-muted-foreground">
            Modern payroll for modern teams
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="border-2 hover:border-[#0070BA]/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-[#0070BA]/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-[#0070BA]" />
              </div>
              <CardTitle>Real-Time Streaming</CardTitle>
              <CardDescription>
                Money flows continuously to employees. No more waiting for payday - 
                access earnings as they're earned.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-[#0070BA]/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-[#0070BA]/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-[#0070BA]" />
              </div>
              <CardTitle>Safe Multisig Security</CardTitle>
              <CardDescription>
                Enterprise-grade security with Gnosis Safe. Multiple signers required 
                for all payroll operations.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-[#0070BA]/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-[#0070BA]/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-[#0070BA]" />
              </div>
              <CardTitle>Team Collaboration</CardTitle>
              <CardDescription>
                Invite operation team members as signers. Approve payroll changes 
                together with built-in governance.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-6 py-20 bg-muted/30">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground">
            Get started in 4 simple steps
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#0070BA] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <CardTitle>Register Your Workspace</CardTitle>
                  <CardDescription className="mt-2">
                    Create your company workspace and invite your operation team members 
                    who will help manage payroll.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#0070BA] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <CardTitle>Create Safe Multisig Wallet</CardTitle>
                  <CardDescription className="mt-2">
                    Set up a Gnosis Safe wallet with your operation team as signers. 
                    Configure signature threshold for security.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#0070BA] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <CardTitle>Add Your Team</CardTitle>
                  <CardDescription className="mt-2">
                    Add employees, set their salaries, and configure payment schedules. 
                    All changes require multisig approval.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#0070BA] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <CardTitle>Start Streaming</CardTitle>
                  <CardDescription className="mt-2">
                    Approve streams with your operation team signatures. Money flows 
                    continuously to employees in real-time.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">Benefits for Everyone</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-[#0070BA] flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold">For Employers</div>
                  <div className="text-sm text-muted-foreground">
                    Reduce payroll overhead, increase transparency, and attract top talent 
                    with modern payment options.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-[#0070BA] flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold">For Employees</div>
                  <div className="text-sm text-muted-foreground">
                    Access earnings instantly, better cash flow management, and complete 
                    transparency of payment streams.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-[#0070BA] flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold">For Finance Teams</div>
                  <div className="text-sm text-muted-foreground">
                    Automated streaming with multisig security. Real-time visibility and 
                    audit trails for compliance.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Card className="border-2 p-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Clock className="h-8 w-8 text-[#0070BA]" />
                <div>
                  <div className="font-bold text-lg">Save Time</div>
                  <div className="text-sm text-muted-foreground">
                    Automate payroll processing
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <DollarSign className="h-8 w-8 text-[#0070BA]" />
                <div>
                  <div className="font-bold text-lg">Reduce Costs</div>
                  <div className="text-sm text-muted-foreground">
                    No intermediary fees
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Shield className="h-8 w-8 text-[#0070BA]" />
                <div>
                  <div className="font-bold text-lg">Stay Secure</div>
                  <div className="text-sm text-muted-foreground">
                    Enterprise-grade protection
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <Card className="border-2 bg-gradient-to-r from-[#0070BA]/10 to-[#009CDE]/10">
          <CardContent className="p-12 text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Payroll?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join the future of real-time payroll streaming. Set up your workspace 
              in minutes and start streaming today.
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-[#0070BA] hover:bg-[#005A94] text-lg h-14 px-8">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              © 2025 SafeStream. Powered by PayPal USD & Superfluid.
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/dashboard" className="hover:text-[#0070BA] transition-colors">
                Dashboard
              </Link>
              <Link href="/register" className="hover:text-[#0070BA] transition-colors">
                Register
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

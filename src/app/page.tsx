"use client"

import Link from "next/link"
import { ArrowRight, TrendingUp, Users, DollarSign, Shield, Zap, Clock, Globe, Building2, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-12">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#0070BA] rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">SafeStream</span>
              </Link>
              <div className="hidden md:flex items-center gap-8">
                <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-[#0070BA] transition-colors">
                  Features
                </Link>
                <Link href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-[#0070BA] transition-colors">
                  How It Works
                </Link>
                <Link href="#security" className="text-sm font-medium text-gray-600 hover:text-[#0070BA] transition-colors">
                  Security
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/workspace">
                <Button className="bg-[#0070BA] hover:bg-[#005A94] text-white shadow-sm">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 lg:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full">
                <Shield className="h-4 w-4 text-[#0070BA]" />
                <span className="text-sm font-medium text-[#0070BA]">
                  Powered by PayPal USD & Superfluid
                </span>
              </div>

              {/* Headline */}
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight leading-tight">
                  Real-Time Payroll
                  <span className="block text-[#0070BA]">Streaming Platform</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Stream PYUSD payments to your team in real-time using Superfluid Protocol. 
                  Built for ETHGlobal hackathon with PayPal USD integration.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/workspace">
                  <Button size="lg" className="bg-[#0070BA] hover:bg-[#005A94] text-white px-8 h-12 text-base font-medium shadow-sm">
                    Try Demo
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button size="lg" variant="outline" className="border-2 border-gray-300 text-gray-700 hover:border-[#0070BA] hover:text-[#0070BA] px-8 h-12 text-base font-medium">
                    Learn More
                  </Button>
                </Link>
              </div>

              {/* Tech Stack */}
              <div className="flex flex-wrap items-center gap-8 pt-8 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-600 font-medium">Superfluid Protocol</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-600 font-medium">Safe Multisig</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-600 font-medium">PYUSD Stablecoin</span>
                </div>
              </div>
            </div>

            {/* Right Column - Tech Stack */}
            <div className="grid grid-cols-2 gap-6">
              <Card className="border-2 border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <DollarSign className="h-8 w-8 text-[#0070BA] mb-3" />
                  <div className="text-2xl font-bold text-gray-900 mb-1">PYUSD</div>
                  <div className="text-sm text-gray-600">PayPal Stablecoin</div>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <Shield className="h-8 w-8 text-[#0070BA] mb-3" />
                  <div className="text-2xl font-bold text-gray-900 mb-1">Safe</div>
                  <div className="text-sm text-gray-600">Multisig Wallet</div>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <Zap className="h-8 w-8 text-[#0070BA] mb-3" />
                  <div className="text-2xl font-bold text-gray-900 mb-1">Superfluid</div>
                  <div className="text-sm text-gray-600">Streaming Protocol</div>
                </CardContent>
              </Card>

          <Card className="border-2 border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <Globe className="h-8 w-8 text-[#0070BA] mb-3" />
              <div className="text-2xl font-bold text-gray-900 mb-1">Trustless</div>
              <div className="text-sm text-gray-600">No Intermediaries</div>
            </CardContent>
          </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                What We Built
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                ETHGlobal hackathon project showcasing real-time payroll streaming
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-2 border-gray-200 shadow-sm hover:shadow-lg hover:border-[#0070BA] transition-all bg-white">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6 text-[#0070BA]" />
                  </div>
                  <CardTitle className="text-gray-900 text-xl">Real-Time Streaming</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    Continuous payment streaming using Superfluid Protocol. Payments flow every second instead of traditional batch processing.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200 shadow-sm hover:shadow-lg hover:border-[#0070BA] transition-all bg-white">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <DollarSign className="h-6 w-6 text-[#0070BA]" />
                  </div>
                  <CardTitle className="text-gray-900 text-xl">PYUSD Stablecoin</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    Integration with PayPal USD stablecoin for predictable value. Built specifically for the PayPal sponsor track.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200 shadow-sm hover:shadow-lg hover:border-[#0070BA] transition-all bg-white">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-[#0070BA]" />
                  </div>
                  <CardTitle className="text-gray-900 text-xl">Safe Multisig</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    Optional Safe multisig wallet integration for team-managed payroll. All transactions require multiple approvals.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200 shadow-sm hover:shadow-lg hover:border-[#0070BA] transition-all bg-white">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-[#0070BA]" />
                  </div>
                  <CardTitle className="text-gray-900 text-xl">Simple Setup</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    Connect your wallet, add team members, and configure payment streams. Designed for ease of use.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200 shadow-sm hover:shadow-lg hover:border-[#0070BA] transition-all bg-white">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-[#0070BA]" />
                  </div>
                  <CardTitle className="text-gray-900 text-xl">Cost Optimized</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    Efficient smart contract design for reduced transaction costs. Optimized for continuous streaming.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200 shadow-sm hover:shadow-lg hover:border-[#0070BA] transition-all bg-white">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-[#0070BA]" />
                  </div>
                  <CardTitle className="text-gray-900 text-xl">Workspace Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    Organize teams with workspace-based structure. Support for both single wallet and multisig configurations.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Simple flow to demonstrate real-time payroll streaming
              </p>
            </div>

            {/* Steps */}
            <div className="grid md:grid-cols-3 gap-12">
              {/* Step 1 */}
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-[#0070BA] text-white rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0">
                    1
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Connect Wallet</h3>
                </div>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Connect your wallet using RainbowKit. Choose between single wallet or Safe multisig setup.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>RainbowKit integration</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Safe Protocol support</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>On-chain transparency</span>
                  </li>
                </ul>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-[#0070BA] text-white rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0">
                    2
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Add Team</h3>
                </div>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Add team members with wallet addresses and configure their PYUSD payment amounts.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Employee management</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Salary configuration</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Zustand state management</span>
                  </li>
                </ul>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-[#0070BA] text-white rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0">
                    3
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Start Streaming</h3>
                </div>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Initiate Superfluid payment streams. PYUSD flows continuously to recipients in real-time.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Superfluid CFA streams</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Real-time payment flow</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>On-chain transparency</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-[#0070BA] shadow-xl bg-gradient-to-br from-blue-50 to-white p-12 text-center relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0070BA_1px,transparent_1px),linear-gradient(to_bottom,#0070BA_1px,transparent_1px)] bg-[size:20px_20px]" />
              </div>

              <div className="relative z-10 space-y-6">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                  Try the Demo
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Experience real-time PYUSD payroll streaming. Built for ETHGlobal hackathon showcasing PayPal USD integration.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Link href="/workspace">
                    <Button size="lg" className="bg-[#0070BA] hover:bg-[#005A94] text-white px-10 h-14 text-lg font-medium shadow-lg">
                      Launch Demo
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="https://github.com/Molecular-Lab/LiquidStream-web">
                    <Button size="lg" variant="outline" className="border-2 border-gray-300 text-gray-700 hover:border-[#0070BA] hover:text-[#0070BA] px-10 h-14 text-lg font-medium">
                      View Source
                    </Button>
                  </Link>
                </div>
                
                {/* Tech Badges */}
                <div className="flex flex-wrap items-center justify-center gap-6 pt-8 border-t border-gray-200 mt-8">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-600">Open Source</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-600">Hackathon Project</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-600">PayPal Sponsor Track</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#0070BA] rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">SafeStream</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Enterprise payroll streaming platform powered by PayPal USD and Superfluid Protocol. 
                Modern infrastructure for modern teams.
              </p>
              <div className="flex gap-4">
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link href="#security" className="hover:text-white transition-colors">Security</Link></li>
                <li><Link href="/workspace" className="hover:text-white transition-colors">Get Started</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-400">
              © 2025 SafeStream. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
              <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

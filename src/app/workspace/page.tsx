"use client"

import { useState } from "react"
import Link from "next/link"
import { Shield, Wallet, Users, ArrowRight, Zap, Lock, DollarSign, Check, Building2 } from "lucide-react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSafe } from "@/store/safe"

type WorkspaceType = "single" | "multisig"

export default function WorkspaceHub() {
  const { address } = useAccount()
  const { safeConfig } = useSafe()
  const isSafeConfigured = !!safeConfig?.address
  const [activeTab, setActiveTab] = useState<WorkspaceType>("single")

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="text-2xl font-bold text-[#0070BA]">
                SafeStream
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <ConnectButton />
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-6 text-gray-900">
            Choose Your Workspace
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Select the deployment mode that best fits your organization&apos;s needs
          </p>

          {/* Tabs */}
          <div className="inline-flex items-center bg-gray-100 rounded-full p-1.5 gap-2">
            <button
              onClick={() => setActiveTab("single")}
              className={`flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-base transition-all duration-200 ${
                activeTab === "single"
                  ? "bg-[#0070BA] text-white shadow-lg"
                  : "bg-transparent text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Wallet className="h-5 w-5" />
              Single Wallet
            </button>
            <button
              onClick={() => setActiveTab("multisig")}
              className={`flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-base transition-all duration-200 ${
                activeTab === "multisig"
                  ? "bg-green-600 text-white shadow-lg"
                  : "bg-transparent text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Shield className="h-5 w-5" />
              Safe Multisig
              {isSafeConfigured && (
                <Badge className="bg-green-500 text-white px-2 py-0.5 text-xs ml-1">
                  ✓
                </Badge>
              )}
            </button>
          </div>
        </div>

        {/* Workspace Card - Shows based on active tab */}
        <div className="mx-auto w-full">
          {activeTab === "single" && (
            <Link href="/workspace/single" className="block group">
              <div className="border-2 border-[#0070BA] rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 bg-white">
                <div className="grid md:grid-cols-2 min-h-[450px]">
                {/* Left Side - Content */}
                <div className="p-12 flex flex-col justify-between bg-gradient-to-br from-blue-50 to-white">
                  <div>
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-2xl mb-6 group-hover:bg-[#0070BA] transition-colors">
                      <Wallet className="h-10 w-10 text-[#0070BA] group-hover:text-white transition-colors" />
                    </div>
                    
                    <h2 className="text-4xl font-bold mb-4 text-gray-900">
                      Single Wallet
                    </h2>
                    
                    <p className="text-lg text-gray-600 mb-8">
                      Fast and simple payroll management with your connected wallet. Perfect for individuals and small teams who need quick operations.
                    </p>

                    <div className="flex flex-wrap gap-3 mb-8">
                      <Badge className="bg-blue-100 text-[#0070BA] hover:bg-blue-200 px-4 py-2 text-sm">
                        <Zap className="mr-2 h-4 w-4" />
                        Instant Execution
                      </Badge>
                      <Badge className="bg-blue-100 text-[#0070BA] hover:bg-blue-200 px-4 py-2 text-sm">
                        <DollarSign className="mr-2 h-4 w-4" />
                        Low Gas Fees
                      </Badge>
                    </div>
                  </div>

                  <Button 
                    size="lg"
                    className="bg-[#0070BA] hover:bg-[#005A94] text-white w-full md:w-auto px-8 py-6 text-lg group-hover:bg-[#005A94]"
                  >
                    Start with Single Wallet
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>

                {/* Right Side - Features List */}
                <div className="p-12 bg-gray-50 flex flex-col justify-center">
                  <h3 className="text-2xl font-semibold mb-6 text-gray-900">
                    Ideal For
                  </h3>
                  
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-[#0070BA] rounded-full flex items-center justify-center mt-0.5">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Individual Use</p>
                        <p className="text-sm text-gray-600">Freelancers and solo entrepreneurs</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-[#0070BA] rounded-full flex items-center justify-center mt-0.5">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Small Teams</p>
                        <p className="text-sm text-gray-600">Teams with 2-10 members</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-[#0070BA] rounded-full flex items-center justify-center mt-0.5">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Quick Operations</p>
                        <p className="text-sm text-gray-600">Immediate transaction execution</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-[#0070BA] rounded-full flex items-center justify-center mt-0.5">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Simple Workflows</p>
                        <p className="text-sm text-gray-600">No approval process required</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              </div>
            </Link>
          )}

          {activeTab === "multisig" && (
            <Link href={isSafeConfigured ? "/workspace/multisig" : "/setup-safe"} className="block group">
              <div className="border-2 border-green-600 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 bg-white">
                <div className="grid md:grid-cols-2 min-h-[450px]">
                {/* Left Side - Content */}
                <div className="p-12 flex flex-col justify-between bg-gradient-to-br from-green-50 to-white">
                  <div>
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-2xl mb-6 group-hover:bg-green-600 transition-colors">
                      <Shield className="h-10 w-10 text-green-600 group-hover:text-white transition-colors" />
                    </div>
                    
                    <div className="flex items-center gap-3 mb-4">
                      <h2 className="text-4xl font-bold text-gray-900">
                        Safe Multisig
                      </h2>
                      {isSafeConfigured && (
                        <Badge className="bg-green-500 text-white px-3 py-1">
                          ✓ Configured
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-lg text-gray-600 mb-8">
                      Enterprise-grade security with multi-signature wallet protection. Built for organizations that require team oversight and enhanced security.
                    </p>

                    <div className="flex flex-wrap gap-3 mb-8">
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-200 px-4 py-2 text-sm">
                        <Lock className="mr-2 h-4 w-4" />
                        Multi-Signature
                      </Badge>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-200 px-4 py-2 text-sm">
                        <Users className="mr-2 h-4 w-4" />
                        Team Governance
                      </Badge>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-200 px-4 py-2 text-sm">
                        <Building2 className="mr-2 h-4 w-4" />
                        Enterprise Ready
                      </Badge>
                    </div>
                  </div>

                  <Button 
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white w-full md:w-auto px-8 py-6 text-lg group-hover:bg-green-700"
                  >
                    {isSafeConfigured ? 'Open Multisig Workspace' : 'Setup Safe Multisig'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>

                {/* Right Side - Features List */}
                <div className="p-12 bg-gray-50 flex flex-col justify-center">
                  <h3 className="text-2xl font-semibold mb-6 text-gray-900">
                    Ideal For
                  </h3>
                  
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center mt-0.5">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Large Organizations</p>
                        <p className="text-sm text-gray-600">Companies with 10+ employees</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center mt-0.5">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Team Oversight</p>
                        <p className="text-sm text-gray-600">Multiple approval signatures required</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center mt-0.5">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Enhanced Security</p>
                        <p className="text-sm text-gray-600">Distribute trust across team members</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center mt-0.5">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Compliance & Audit</p>
                        <p className="text-sm text-gray-600">Complete transaction transparency</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              </div>
            </Link>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 mt-24">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-sm text-gray-600">
              © 2025 SafeStream. Built for ETHGlobal with PayPal USD & Superfluid.
            </div>
            <div className="flex gap-8 text-sm">
              <Link href="/workspace/single" className="text-gray-600 hover:text-[#0070BA] transition-colors font-medium">
                Single Wallet
              </Link>
              <Link href="/workspace/multisig" className="text-gray-600 hover:text-[#0070BA] transition-colors font-medium">
                Safe Multisig
              </Link>
              <Link href="/" className="text-gray-600 hover:text-[#0070BA] transition-colors font-medium">
                Home
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

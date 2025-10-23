"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Building2, Shield, CheckCircle2, Loader2, ArrowRight } from "lucide-react"
import { useAccount } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface InvitationData {
  workspaceName: string
  companyName: string
  invitedBy: string
  role: string
  safeAddress: string
  requiredSignatures: number
  totalSigners: number
}

export default function InvitePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { address, isConnected } = useAccount()
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Get invite token from URL
  const inviteToken = searchParams.get("token")

  useEffect(() => {
    const loadInvitation = async () => {
      if (!inviteToken) {
        setError("Invalid invitation link")
        setIsLoading(false)
        return
      }

      try {
        // TODO: Fetch invitation details from your backend/API
        // This would validate the token and return workspace info
        
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock data
        setInvitation({
          workspaceName: "Acme Inc Payroll",
          companyName: "Acme Inc",
          invitedBy: "John Doe",
          role: "Operation Manager",
          safeAddress: "0x1234...5678",
          requiredSignatures: 2,
          totalSigners: 3,
        })
      } catch (err: any) {
        console.error("Failed to load invitation:", err)
        setError("Failed to load invitation details")
      } finally {
        setIsLoading(false)
      }
    }

    loadInvitation()
  }, [inviteToken])

  const handleJoinWorkspace = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first")
      return
    }

    setIsJoining(true)

    try {
      // TODO: Join workspace flow
      // 1. Validate invitation token
      // 2. Add user's address to workspace as operation team member
      // 3. User becomes a signer on the Safe
      // 4. Redirect to pending signatures or dashboard

      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast.success("Successfully joined workspace!", {
        description: "You can now sign Safe transactions",
      })

      // Redirect to signatures page
      setTimeout(() => {
        router.push("/workspace/signatures")
      }, 1500)
    } catch (error: any) {
      console.error("Join workspace error:", error)
      toast.error("Failed to join workspace", {
        description: error.message || "Please try again",
      })
    } finally {
      setIsJoining(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#0070BA] mx-auto mb-4" />
          <div className="text-muted-foreground">Loading invitation...</div>
        </div>
      </div>
    )
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <Card className="max-w-md border-2 border-red-500/50">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-950 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Invalid Invitation</h2>
            <p className="text-muted-foreground mb-6">
              {error || "This invitation link is invalid or has expired"}
            </p>
            <Button onClick={() => router.push("/landing")}>
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-[#0070BA] to-[#009CDE] bg-clip-text text-transparent">
            SafeStream
          </div>
          <ConnectButton />
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-2xl">
        {/* Invitation Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[#0070BA]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-10 w-10 text-[#0070BA]" />
          </div>
          <h1 className="text-4xl font-bold mb-2">You're Invited!</h1>
          <p className="text-xl text-muted-foreground">
            Join {invitation.companyName}'s payroll workspace
          </p>
        </div>

        {/* Invitation Details */}
        <Card className="border-2 mb-8">
          <CardHeader>
            <CardTitle>Workspace Details</CardTitle>
            <CardDescription>
              You've been invited by {invitation.invitedBy}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Workspace Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Workspace</div>
                <div className="font-medium">{invitation.workspaceName}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Your Role</div>
                <div className="font-medium">{invitation.role}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-sm text-muted-foreground mb-1">Safe Wallet</div>
                <div className="font-mono text-sm">{invitation.safeAddress}</div>
              </div>
            </div>

            {/* Safe Info */}
            <div className="p-4 bg-[#0070BA]/10 border border-[#0070BA]/20 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-[#0070BA] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold mb-1">Multisig Signer</div>
                  <div className="text-sm text-muted-foreground">
                    You'll be one of {invitation.totalSigners} signers. {invitation.requiredSignatures} signatures
                    required to execute payroll transactions.
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Responsibilities */}
        <Card className="border-2 mb-8">
          <CardHeader>
            <CardTitle>Your Responsibilities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#0070BA] flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">Review Transactions</div>
                <div className="text-sm text-muted-foreground">
                  Check and approve payroll stream operations
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#0070BA] flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">Sign with Your Wallet</div>
                <div className="text-sm text-muted-foreground">
                  Use your connected wallet to sign Safe transactions
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#0070BA] flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">Collaborate with Team</div>
                <div className="text-sm text-muted-foreground">
                  Work with other signers to manage payroll operations
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connected Wallet Info */}
        {isConnected && address && (
          <Card className="border-2 border-green-500/50 bg-green-50/50 dark:bg-green-950/20 mb-8">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium">Wallet Connected</div>
                  <div className="text-sm text-muted-foreground font-mono">{address}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Join Button */}
        <div className="text-center">
          {!isConnected ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Connect your wallet to join the workspace
              </p>
              <ConnectButton />
            </div>
          ) : (
            <Button
              size="lg"
              onClick={handleJoinWorkspace}
              disabled={isJoining}
              className="bg-[#0070BA] hover:bg-[#005A94] text-lg h-14 px-12"
            >
              {isJoining ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Joining Workspace...
                </>
              ) : (
                <>
                  Join Workspace
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

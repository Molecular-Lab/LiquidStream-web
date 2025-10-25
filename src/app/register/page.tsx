"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Building2, Users, Mail, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useWorkspaceRegistration } from "@/store/workspace"

type Step = "company" | "team" | "invite"

interface CompanyInfo {
  name: string
  industry: string
  size: string
  country: string
}

interface TeamMember {
  email: string
  role: string
  name: string
}

export default function RegisterPage() {
  const router = useRouter()
  const { setRegistration } = useWorkspaceRegistration()
  const [step, setStep] = useState<Step>("company")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Company Info State
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: "",
    industry: "",
    size: "",
    country: "",
  })

  // Team Members State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { email: "", role: "Operation Manager", name: "" },
  ])

  const addTeamMember = () => {
    setTeamMembers([...teamMembers, { email: "", role: "Operation Team", name: "" }])
  }

  const removeTeamMember = (index: number) => {
    if (teamMembers.length > 1) {
      setTeamMembers(teamMembers.filter((_, i) => i !== index))
    }
  }

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
    const updated = [...teamMembers]
    updated[index][field] = value
    setTeamMembers(updated)
  }

  const handleCompanySubmit = () => {
    if (!companyInfo.name || !companyInfo.industry) {
      toast.error("Please fill in all required fields")
      return
    }
    setStep("team")
  }

  const handleTeamSubmit = () => {
    const hasEmptyFields = teamMembers.some((member) => !member.email || !member.name)
    if (hasEmptyFields) {
      toast.error("Please fill in all team member details")
      return
    }
    setStep("invite")
  }

  const handleFinalSubmit = async () => {
    setIsSubmitting(true)

    try {
      // Save workspace data to Zustand store (also syncs to sessionStorage)
      const workspaceData = {
        company: companyInfo,
        team: teamMembers,
        createdAt: new Date().toISOString(),
      }

      setRegistration(workspaceData)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // TODO: Send invitation emails to team members

      toast.success("Workspace created successfully!", {
        description: "Redirecting to Safe wallet setup...",
      })

      // Redirect to Safe setup page
      setTimeout(() => {
        router.push("/setup-safe")
      }, 1500)
    } catch (error) {
      console.error("Registration error:", error)
      toast.error("Failed to create workspace", {
        description: "Please try again",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/landing">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="text-2xl font-bold bg-gradient-to-r from-[#0070BA] to-[#009CDE] bg-clip-text text-transparent">
            SafeStream
          </div>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${step === "company"
                    ? "bg-[#0070BA] text-white"
                    : "bg-[#0070BA]/20 text-[#0070BA]"
                  }`}
              >
                1
              </div>
              <div className="text-sm mt-2 font-medium">Company Info</div>
            </div>
            <div className="flex-1 h-1 bg-border mx-4" />
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${step === "team" || step === "invite"
                    ? "bg-[#0070BA] text-white"
                    : "bg-border text-muted-foreground"
                  }`}
              >
                2
              </div>
              <div className="text-sm mt-2 font-medium">Operation Team</div>
            </div>
            <div className="flex-1 h-1 bg-border mx-4" />
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${step === "invite"
                    ? "bg-[#0070BA] text-white"
                    : "bg-border text-muted-foreground"
                  }`}
              >
                3
              </div>
              <div className="text-sm mt-2 font-medium">Review & Invite</div>
            </div>
          </div>

          {/* Step 1: Company Information */}
          {step === "company" && (
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#0070BA]/10 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-[#0070BA]" />
                  </div>
                  <div>
                    <CardTitle>Company Information</CardTitle>
                    <CardDescription>
                      Tell us about your organization
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">
                    Company Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="companyName"
                    placeholder="Acme Inc."
                    value={companyInfo.name}
                    onChange={(e) =>
                      setCompanyInfo({ ...companyInfo, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">
                    Industry <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="industry"
                    placeholder="Technology, Finance, Healthcare..."
                    value={companyInfo.industry}
                    onChange={(e) =>
                      setCompanyInfo({ ...companyInfo, industry: e.target.value })
                    }
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="size">Company Size</Label>
                    <Input
                      id="size"
                      placeholder="1-10, 11-50, 51-200..."
                      value={companyInfo.size}
                      onChange={(e) =>
                        setCompanyInfo({ ...companyInfo, size: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      placeholder="United States"
                      value={companyInfo.country}
                      onChange={(e) =>
                        setCompanyInfo({ ...companyInfo, country: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleCompanySubmit}
                    className="bg-[#0070BA] hover:bg-[#005A94]"
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Operation Team */}
          {step === "team" && (
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#0070BA]/10 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-[#0070BA]" />
                  </div>
                  <div>
                    <CardTitle>Operation Team</CardTitle>
                    <CardDescription>
                      Add team members who will manage payroll and sign transactions
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {teamMembers.map((member, index) => (
                  <div key={index} className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Team Member {index + 1}</div>
                      {teamMembers.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTeamMember(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        placeholder="John Doe"
                        value={member.name}
                        onChange={(e) =>
                          updateTeamMember(index, "name", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Email <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="email"
                        placeholder="john@company.com"
                        value={member.email}
                        onChange={(e) =>
                          updateTeamMember(index, "email", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Input
                        placeholder="Operation Manager, CFO..."
                        value={member.role}
                        onChange={(e) =>
                          updateTeamMember(index, "role", e.target.value)
                        }
                      />
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={addTeamMember}
                >
                  + Add Another Team Member
                </Button>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setStep("company")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleTeamSubmit}
                    className="bg-[#0070BA] hover:bg-[#005A94]"
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Review & Invite */}
          {step === "invite" && (
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#0070BA]/10 rounded-lg flex items-center justify-center">
                    <Mail className="h-6 w-6 text-[#0070BA]" />
                  </div>
                  <div>
                    <CardTitle>Review & Send Invitations</CardTitle>
                    <CardDescription>
                      Confirm your workspace details and invite your team
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Company Summary */}
                <div className="space-y-2">
                  <div className="font-semibold text-lg">Company Details</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{companyInfo.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Industry:</span>
                      <span className="font-medium">{companyInfo.industry}</span>
                    </div>
                    {companyInfo.size && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Size:</span>
                        <span className="font-medium">{companyInfo.size}</span>
                      </div>
                    )}
                    {companyInfo.country && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Country:</span>
                        <span className="font-medium">{companyInfo.country}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="font-semibold text-lg mb-4">
                    Operation Team ({teamMembers.length})
                  </div>
                  <div className="space-y-3">
                    {teamMembers.map((member, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {member.email}
                          </div>
                        </div>
                        <div className="text-sm text-[#0070BA] font-medium">
                          {member.role}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#0070BA]/10 border border-[#0070BA]/20 rounded-lg p-4">
                  <div className="text-sm">
                    <div className="font-semibold mb-2">Next Steps:</div>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Invitation emails will be sent to all team members</li>
                      <li>• You&apos;ll be redirected to set up your Safe multisig wallet</li>
                      <li>• Team members will need to join and sign to activate the Safe</li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setStep("team")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleFinalSubmit}
                    disabled={isSubmitting}
                    className="bg-[#0070BA] hover:bg-[#005A94]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Workspace...
                      </>
                    ) : (
                      <>
                        Create Workspace
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

"use client"

import { Users, Shield, Wallet } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AddEmployeeDialog } from "@/components/employees/add-employee-dialog"
import { EmployeeList } from "@/components/employees/employee-list"
import { Employee } from "@/store/employees"
import { useWalletMode } from "@/store/wallet-mode"
import { useSafe } from "@/store/safe"

interface EmployeesTabProps {
  onStartStream: (employee: Employee) => void
  onStopStream: (employeeId: string) => void
}

export function EmployeesTab({ onStartStream, onStopStream }: EmployeesTabProps) {
  const { isSafeMode } = useWalletMode()
  const { safeConfig } = useSafe()

  const isSafe = isSafeMode()
  const isSafeConfigured = !!safeConfig?.address
  const isInSafeMode = isSafe && isSafeConfigured

  // Color scheme based on wallet mode
  const accentColor = isInSafeMode ? "text-green-600" : "text-[#0070BA]"
  const iconColor = isInSafeMode ? "h-5 w-5 text-green-600" : "h-5 w-5 text-[#0070BA]"
  const bgColor = isInSafeMode ? "bg-green-100" : "bg-blue-100"
  const textColor = isInSafeMode ? "text-green-700" : "text-[#0070BA]"

  return (
    <div className="space-y-6">
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className={iconColor} />
                Employee Management
              </CardTitle>
              <CardDescription className="mt-2">
                {!isSafeConfigured && isSafe
                  ? "Configure Safe multisig to manage employee payment streams securely"
                  : isSafe
                    ? `Create, manage, and control payment streams (requires ${safeConfig?.threshold}/${safeConfig?.signers.length} signatures)`
                    : "Create, manage, and control payment streams for your team members"
                }
              </CardDescription>
            </div>
            <AddEmployeeDialog />
          </div>
        </CardHeader>
        <CardContent>
          <EmployeeList
            onStartStream={onStartStream}
            onStopStream={onStopStream}
          />
        </CardContent>
      </Card>

      {/* Stream Operations Info */}
      <Card className={`border-2 ${isInSafeMode ? 'border-green-200 bg-gradient-to-r from-green-50 to-white' : 'border-blue-200 bg-gradient-to-r from-blue-50 to-white'}`}>
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg text-gray-900 mb-4">Stream Operations</h3>
          <div className="space-y-3 text-gray-600">
            <div className="flex items-start gap-3">
              <div className={`w-6 h-6 ${isInSafeMode ? 'bg-green-500' : 'bg-green-500'} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <span className="text-white text-xs font-bold">+</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Create Stream</p>
                <p className="text-sm">
                  {isSafe
                    ? "Create a transaction proposal to start a payment stream with custom flow rate"
                    : "Add an employee and start a payment stream with custom flow rate"
                  }
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">×</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Delete Stream</p>
                <p className="text-sm">
                  {isSafe
                    ? "Create a proposal to stop an active stream - requires signatures before execution"
                    : "Stop an active stream - executes immediately with your wallet"
                  }
                </p>
              </div>
            </div>
            <div className={`mt-4 p-3 ${bgColor} rounded-lg flex items-center gap-2`}>
              {isSafe ? (
                <Shield className={`h-4 w-4 ${textColor}`} />
              ) : (
                <Wallet className={`h-4 w-4 ${textColor}`} />
              )}
              <p className={`text-sm ${textColor} font-medium`}>
                {isSafe
                  ? `💡 Tip: All operations require ${safeConfig?.threshold}/${safeConfig?.signers.length} signatures to execute`
                  : "💡 Tip: All operations execute instantly without approval delays"
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

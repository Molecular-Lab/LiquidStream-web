"use client"

import { useState } from "react"
import { Address, formatEther } from "viem"
import { useAccount } from "wagmi"
import { ArrowRightIcon, StopCircleIcon, Edit2Icon, ShieldIcon, AlertTriangleIcon } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useStreamInfo, formatFlowRate } from "@/hooks/use-stream-info"
import { PYUSDX_ADDRESS } from "@/lib/contract"
import { useEmployeeStore } from "@/store/employees"
import { useSafeConfig } from "@/store/safe"
import { cn } from "@/lib/utils"

interface StreamRowProps {
  receiverAddress: Address
  receiverName?: string
  token?: Address
  onStop?: () => void
  onUpdate?: () => void
}

function StreamRow({ receiverAddress, receiverName, token = PYUSDX_ADDRESS, onStop, onUpdate }: StreamRowProps) {
  const { address } = useAccount()
  const { safeConfig } = useSafeConfig()
  const { data: streamInfo, isLoading: loading } = useStreamInfo(token, address, receiverAddress)

  // Use Safe address if configured, otherwise use connected wallet address
  const senderAddress = safeConfig?.address || address

  if (loading) {
    return (
      <TableRow>
        <TableCell colSpan={6} className="text-center text-muted-foreground">
          Loading stream info...
        </TableCell>
      </TableRow>
    )
  }

  if (!streamInfo || !streamInfo.isActive) {
    return null
  }

  const flowRates = formatFlowRate(streamInfo.flowRate)
  const startDate = new Date(Number(streamInfo.timestamp) * 1000)

  return (
    <TableRow>
      <TableCell>
        <div>
          <div className="font-medium">{receiverName || "Unknown"}</div>
          <div className="text-xs text-muted-foreground font-mono">
            {receiverAddress.slice(0, 6)}...{receiverAddress.slice(-4)}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {safeConfig?.address ? (
            <Badge variant="secondary" className="text-xs">
              <ShieldIcon className="h-3 w-3 mr-1" />
              Safe Multisig
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs">
              <AlertTriangleIcon className="h-3 w-3 mr-1" />
              Direct Wallet
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="text-right tabular-nums">
        <div className="text-green-600 dark:text-green-400">
          {flowRates.perMonth}
        </div>
        <div className="text-xs text-muted-foreground">PYUSDx/mo</div>
      </TableCell>
      <TableCell className="text-right tabular-nums">
        <div>{flowRates.perDay}</div>
        <div className="text-xs text-muted-foreground">/day</div>
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {startDate.toLocaleDateString()} {startDate.toLocaleTimeString()}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          {onUpdate && (
            <Button variant="outline" size="sm" onClick={onUpdate}>
              <Edit2Icon className="h-3 w-3 mr-1" />
              {safeConfig?.address ? "Propose Edit" : "Edit"}
            </Button>
          )}
          {onStop && (
            <Button variant="destructive" size="sm" onClick={onStop}>
              <StopCircleIcon className="h-3 w-3 mr-1" />
              {safeConfig?.address ? "Propose Stop" : "Stop"}
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}

interface StreamsListProps {
  token?: Address
  onStopStream?: (receiver: Address) => void
  onUpdateStream?: (receiver: Address) => void
  className?: string
}

export function StreamsList({
  token = PYUSDX_ADDRESS,
  onStopStream,
  onUpdateStream,
  className
}: StreamsListProps) {
  const employees = useEmployeeStore((state) => state.employees)
  const { safeConfig } = useSafeConfig()
  const [activeTab, setActiveTab] = useState<"outgoing" | "incoming">("outgoing")

  // Filter employees with wallet addresses for outgoing streams
  const employeesWithWallets = employees.filter(emp => emp.walletAddress)

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Streams
              {safeConfig?.address && (
                <Badge variant="secondary" className="text-xs">
                  <ShieldIcon className="h-3 w-3 mr-1" />
                  Safe Protected
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {safeConfig?.address
                ? `View and manage streams via Safe multisig (${safeConfig.threshold}/${safeConfig.signers.length} signatures required)`
                : "View and manage active payment streams"
              }
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={activeTab === "outgoing" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("outgoing")}
            >
              Outgoing ({employeesWithWallets.length})
            </Button>
            <Button
              variant={activeTab === "incoming" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("incoming")}
            >
              Incoming
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {activeTab === "outgoing" ? (
          employeesWithWallets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ArrowRightIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No employees with wallet addresses yet.</p>
              <p className="text-sm">Add employees with wallet addresses to start streaming.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>To / From</TableHead>
                    <TableHead>Security</TableHead>
                    <TableHead className="text-right">Monthly Flow</TableHead>
                    <TableHead className="text-right">Daily Flow</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeesWithWallets.map((employee) => (
                    <StreamRow
                      key={employee.id}
                      receiverAddress={employee.walletAddress as Address}
                      receiverName={employee.name}
                      token={token}
                      onStop={() => onStopStream?.(employee.walletAddress as Address)}
                      onUpdate={() => onUpdateStream?.(employee.walletAddress as Address)}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <ArrowRightIcon className="h-12 w-12 mx-auto mb-4 opacity-50 rotate-180" />
            <p>No incoming streams yet.</p>
            <p className="text-sm">Incoming streams will appear here.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

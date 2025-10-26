"use client"

import { MoreVerticalIcon, PlayIcon, StopCircleIcon, TrashIcon, ShieldIcon, AlertTriangleIcon } from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Employee, useEmployeeStore } from "@/store/employees"
import { useStreamStore } from "@/store/streams"
import { useSafe } from "@/store/safe"

interface EmployeeListProps {
  onStartStream: (employee: Employee) => void
  onStopStream: (employeeId: string) => void
}

export function EmployeeList({ onStartStream, onStopStream }: EmployeeListProps) {
  const employees = useEmployeeStore((state) => state.employees)
  const removeEmployee = useEmployeeStore((state) => state.removeEmployee)
  const streams = useStreamStore((state) => state.streams)
  const { safeConfig } = useSafe()

  const isSafeConfigured = !!safeConfig?.address

  const getEmployeeStream = (employeeId: string) => {
    return streams.find(
      (stream) =>
        stream.employeeId === employeeId && stream.status === "active"
    )
  }

  const getRoleBadgeVariant = (role: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive" | "success" | "warning" | "info"> = {
      manager: "success",
      developer: "info",
      designer: "warning",
      marketing: "secondary",
      sales: "default",
      other: "outline",
    }
    return variants[role] || "outline"
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatSalary = (salary: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(Number(salary))
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Salary</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Security</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No employees found. Add your first employee to get started.
              </TableCell>
            </TableRow>
          ) : (
            employees.map((employee) => {
              const hasActiveStream = !!getEmployeeStream(employee.id)
              return (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={employee.avatarUrl} />
                        <AvatarFallback>
                          {getInitials(employee.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {employee.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(employee.role)}>
                      {employee.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell className="font-medium">
                    {formatSalary(employee.salary)}
                  </TableCell>
                  <TableCell>
                    {hasActiveStream ? (
                      <Badge variant="success">Streaming</Badge>
                    ) : (
                      <Badge variant="outline">Not Started</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {isSafeConfigured ? (
                      <Badge variant="secondary" className="text-xs">
                        <ShieldIcon className="h-3 w-3 mr-1" />
                        Safe Protected
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        <AlertTriangleIcon className="h-3 w-3 mr-1" />
                        Direct Wallet
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVerticalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {hasActiveStream ? (
                          <DropdownMenuItem
                            onClick={() => onStopStream(employee.id)}
                          >
                            <StopCircleIcon className="mr-2 h-4 w-4" />
                            {isSafeConfigured ? "Propose Stop Stream" : "Stop Stream"}
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => onStartStream(employee)}
                          >
                            <PlayIcon className="mr-2 h-4 w-4" />
                            {isSafeConfigured ? "Propose Start Stream" : "Start Stream"}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => {
                            if (hasActiveStream) {
                              toast.error("Cannot remove employee", {
                                description: "Please stop the active stream before removing this employee."
                              })
                            } else {
                              removeEmployee(employee.id)
                              toast.success("Employee removed successfully")
                            }
                          }}
                          className="text-destructive"
                          disabled={hasActiveStream}
                        >
                          <TrashIcon className="mr-2 h-4 w-4" />
                          Remove Employee
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}

"use client"

import { Activity, DollarSignIcon, TrendingUpIcon, UsersIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { flowRateToAnnualSalary } from "@/lib/contract"
import { useEmployeeStore } from "@/store/employees"
import { useStreamStore } from "@/store/streams"

export function DashboardStats() {
  const employees = useEmployeeStore((state) => state.employees)
  const streams = useStreamStore((state) => state.streams)
  const getTotalFlowRate = useStreamStore((state) => state.getTotalFlowRate)

  const activeEmployees = employees.filter((emp) => emp.isActive).length
  const activeStreams = streams.filter((s) => s.status === "active").length
  const totalFlowRate = getTotalFlowRate()
  const annualBurn = flowRateToAnnualSalary(totalFlowRate)
  const monthlyBurn = annualBurn / 12

  const stats = [
    {
      title: "Active Employees",
      value: activeEmployees,
      icon: UsersIcon,
      description: `${activeStreams} receiving payments`,
    },
    {
      title: "Active Streams",
      value: activeStreams,
      icon: Activity,
      description: `Out of ${employees.length} total`,
    },
    {
      title: "Monthly Burn",
      value: `$${monthlyBurn.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      icon: TrendingUpIcon,
      description: "Estimated monthly cost",
    },
    {
      title: "Annual Burn",
      value: `$${annualBurn.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      icon: DollarSignIcon,
      description: "Total annual payroll",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

"use client"

import { LayoutDashboard, ArrowLeftRight, Users } from "lucide-react"

export type TabType = "dashboard" | "exchange" | "employees"

interface WorkspaceTabsProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export function WorkspaceTabs({ activeTab, onTabChange }: WorkspaceTabsProps) {
  return (
    <div className="inline-flex items-center bg-gray-100 rounded-xl p-1.5 gap-2">
      <button
        onClick={() => onTabChange("dashboard")}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
          activeTab === "dashboard"
            ? "bg-white text-[#0070BA] shadow-md"
            : "bg-transparent text-gray-600 hover:bg-gray-200"
        }`}
      >
        <LayoutDashboard className="h-4 w-4" />
        Dashboard
      </button>
      <button
        onClick={() => onTabChange("exchange")}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
          activeTab === "exchange"
            ? "bg-white text-[#0070BA] shadow-md"
            : "bg-transparent text-gray-600 hover:bg-gray-200"
        }`}
      >
        <ArrowLeftRight className="h-4 w-4" />
        Exchange
      </button>
      <button
        onClick={() => onTabChange("employees")}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
          activeTab === "employees"
            ? "bg-white text-[#0070BA] shadow-md"
            : "bg-transparent text-gray-600 hover:bg-gray-200"
        }`}
      >
        <Users className="h-4 w-4" />
        Employees
      </button>
    </div>
  )
}

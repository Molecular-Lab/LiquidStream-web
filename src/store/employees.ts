import { create } from "zustand"
import { persist } from "zustand/middleware"

export type EmployeeRole =
  | "developer"
  | "designer"
  | "manager"
  | "marketing"
  | "sales"
  | "other"

export interface Employee {
  id: string
  name: string
  email: string
  walletAddress: `0x${string}`
  role: EmployeeRole
  department: string
  salary: string // Annual salary in USD
  startDate: Date
  isActive: boolean
  avatarUrl?: string
}

interface EmployeeState {
  employees: Employee[]
  addEmployee: (employee: Omit<Employee, "id">) => void
  updateEmployee: (id: string, employee: Partial<Employee>) => void
  removeEmployee: (id: string) => void
  getEmployee: (id: string) => Employee | undefined
  getActiveEmployees: () => Employee[]
}

export const useEmployeeStore = create<EmployeeState>()(
  persist(
    (set, get) => ({
      employees: [],

      addEmployee: (employee) =>
        set((state) => ({
          employees: [
            ...state.employees,
            {
              ...employee,
              id: crypto.randomUUID(),
            },
          ],
        })),

      updateEmployee: (id, updates) =>
        set((state) => ({
          employees: state.employees.map((emp) =>
            emp.id === id ? { ...emp, ...updates } : emp
          ),
        })),

      removeEmployee: (id) =>
        set((state) => ({
          employees: state.employees.filter((emp) => emp.id !== id),
        })),

      getEmployee: (id) => {
        return get().employees.find((emp) => emp.id === id)
      },

      getActiveEmployees: () => {
        return get().employees.filter((emp) => emp.isActive)
      },
    }),
    {
      name: "liquidstream-employees",
    }
  )
)

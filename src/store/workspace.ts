import { create } from "zustand"
import { persist } from "zustand/middleware"

// Simplified workspace registration (single wallet only)
export interface WorkspaceRegistration {
  name: string
  description?: string
  walletAddress: string
  createdAt: string
}

interface WorkspaceStore {
  registration: WorkspaceRegistration | null
  setRegistration: (registration: WorkspaceRegistration) => void
  clearRegistration: () => void
}

export const useWorkspaceRegistration = create<WorkspaceStore>()(
  persist(
    (set) => ({
      registration: null,

      setRegistration: (registration) => {
        set({ registration })
        // Also save to sessionStorage for backward compatibility
        sessionStorage.setItem("workspace_registration", JSON.stringify(registration))
      },

      clearRegistration: () => {
        set({ registration: null })
        sessionStorage.removeItem("workspace_registration")
      },
    }),
    {
      name: "workspace-registration",
    }
  )
)

// Convenience hook alias
export const useWorkspace = useWorkspaceRegistration

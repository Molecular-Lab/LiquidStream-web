import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface TeamMember {
  name: string
  email: string
  role: string
  walletAddress?: string
}

export interface CompanyInfo {
  name: string
  industry: string
  size: string
  country: string
}

export interface WorkspaceRegistration {
  company: CompanyInfo
  team: TeamMember[]
  createdAt: string
}

interface WorkspaceStore {
  registration: WorkspaceRegistration | null
  setRegistration: (registration: WorkspaceRegistration) => void
  clearRegistration: () => void
  updateTeamMemberWallet: (email: string, walletAddress: string) => void
  getOperators: () => TeamMember[]
}

export const useWorkspaceRegistration = create<WorkspaceStore>()(
  persist(
    (set, get) => ({
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

      updateTeamMemberWallet: (email, walletAddress) =>
        set((state) => {
          if (!state.registration) return state
          
          const updatedTeam = state.registration.team.map((member) =>
            member.email === email ? { ...member, walletAddress } : member
          )
          
          const updatedRegistration = {
            ...state.registration,
            team: updatedTeam,
          }
          
          // Update sessionStorage
          sessionStorage.setItem("workspace_registration", JSON.stringify(updatedRegistration))
          
          return { registration: updatedRegistration }
        }),

      getOperators: () => {
        const state = get()
        return state.registration?.team || []
      },
    }),
    {
      name: "workspace-registration",
    }
  )
)

// Convenience hook for accessing operators
export const useWorkspace = useWorkspaceRegistration

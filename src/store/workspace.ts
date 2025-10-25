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

// New simplified workspace registration (single wallet)
export interface SimpleWorkspaceRegistration {
  name: string
  description?: string
  walletAddress: string
  createdAt: string
}

// Legacy multisig workspace registration
export interface MultisigWorkspaceRegistration {
  company: CompanyInfo
  team: TeamMember[]
  createdAt: string
}

// Support both formats
export type WorkspaceRegistration = SimpleWorkspaceRegistration | MultisigWorkspaceRegistration

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
        // Support legacy multisig format
        if (state.registration && 'team' in state.registration) {
          return state.registration.team
        }
        return []
      },
    }),
    {
      name: "workspace-registration",
    }
  )
)

// Convenience hook for accessing operators
export const useWorkspace = useWorkspaceRegistration

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type WalletMode = "safe" | "single"

interface WalletModeState {
  mode: WalletMode
  setMode: (mode: WalletMode) => void
  isSafeMode: () => boolean
  isSingleMode: () => boolean
  toggleMode: () => void
}

/**
 * Zustand store for managing wallet mode (Safe multisig vs Single wallet)
 * This store provides global state management for wallet execution mode across the app
 */
export const useWalletMode = create<WalletModeState>()(
  persist<WalletModeState>(
    (set, get) => ({
      mode: "single",

      setMode: (mode) => set({ mode }),

      isSafeMode: () => get().mode === "safe",

      isSingleMode: () => get().mode === "single",

      toggleMode: () =>
        set((state) => ({
          mode: state.mode === "safe" ? "single" : "safe",
        })),
    }),
    {
      name: "wallet-mode-store",
    }
  )
)

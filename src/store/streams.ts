import { create } from "zustand"
import { persist } from "zustand/middleware"

export type StreamStatus = "active" | "paused" | "ended"

export interface PaymentStream {
  id: string
  employeeId: string
  employeeName: string
  employeeAddress: `0x${string}`
  token: `0x${string}` // Token address (e.g., USDC)
  tokenSymbol: string
  flowRate: string // Flow rate in wei per second
  startTime: number // Unix timestamp
  endTime?: number // Unix timestamp (optional)
  status: StreamStatus
  totalStreamed: string // Total amount streamed in wei
  lastUpdated: number // Unix timestamp
}

interface StreamState {
  streams: PaymentStream[]
  addStream: (stream: Omit<PaymentStream, "id" | "totalStreamed" | "lastUpdated">) => void
  updateStream: (id: string, updates: Partial<PaymentStream>) => void
  endStream: (id: string) => void
  getStream: (id: string) => PaymentStream | undefined
  getActiveStreams: () => PaymentStream[]
  getStreamsByEmployee: (employeeId: string) => PaymentStream[]
  getTotalFlowRate: () => bigint
}

export const useStreamStore = create<StreamState>()(
  persist<StreamState>(
    (set, get) => ({
      streams: [],

      addStream: (stream) =>
        set((state) => ({
          streams: [
            ...state.streams,
            {
              ...stream,
              id: crypto.randomUUID(),
              totalStreamed: "0",
              lastUpdated: Date.now(),
            },
          ],
        })),

      updateStream: (id, updates) =>
        set((state) => ({
          streams: state.streams.map((stream) =>
            stream.id === id
              ? { ...stream, ...updates, lastUpdated: Date.now() }
              : stream
          ),
        })),

      endStream: (id) =>
        set((state) => ({
          streams: state.streams.map((stream) =>
            stream.id === id
              ? {
                  ...stream,
                  status: "ended" as StreamStatus,
                  endTime: Date.now(),
                  lastUpdated: Date.now(),
                }
              : stream
          ),
        })),

      getStream: (id) => {
        return get().streams.find((stream) => stream.id === id)
      },

      getActiveStreams: () => {
        return get().streams.filter((stream) => stream.status === "active")
      },

      getStreamsByEmployee: (employeeId) => {
        return get().streams.filter(
          (stream) => stream.employeeId === employeeId
        )
      },

      getTotalFlowRate: () => {
        const activeStreams = get().getActiveStreams()
        return activeStreams.reduce(
          (total, stream) => total + BigInt(stream.flowRate),
          BigInt(0)
        )
      },
    }),
    {
      name: "liquidstream-streams",
    }
  )
)

import { create } from 'zustand'

interface AgentUiState {
  selectedQueryId: string | null
  setSelectedQueryId: (id: string | null) => void
}

export const useAgentUiStore = create<AgentUiState>((set) => ({
  selectedQueryId: null,
  setSelectedQueryId: (id) => set({ selectedQueryId: id }),
}))

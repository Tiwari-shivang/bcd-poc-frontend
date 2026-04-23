import { useEffect, useMemo, useRef, useState } from 'react'

import { ChatComposer } from '@/features/contract-agent/components/chat-composer'
import {
  ChatThread,
  type ChatMessage,
} from '@/features/contract-agent/components/chat-thread'
import { ChartsTab } from '@/features/contract-agent/components/charts/charts-tab'
import { InsightsTab } from '@/features/contract-agent/components/insights/insights-tab'
import { useContractsData } from '@/features/contract-agent/hooks/use-contracts-data'
import { useDemoQueries } from '@/features/contract-agent/hooks/use-demo-queries'
import { useRunQueryMutation } from '@/features/contract-agent/hooks/use-run-query-mutation'
import { useAgentUiStore } from '@/features/contract-agent/stores/agent-ui-store'
import {
  buildDynamicWelcome,
  getAtRiskContracts,
  getClientConcentration,
  getPortfolioHealth,
} from '@/features/contract-agent/utils/data-calculations'

type ActiveTab = 'chat' | 'insights' | 'charts'

const WELCOME_TEXT_STATIC =
  "I've been monitoring your **BCD contract portfolio**. Ask me anything about renewals, at-risk agreements, client concentration, or team workload.\n\nSelect a question from the dropdown below to get started, or switch to **Insights** to see what I've already found."

function makeWelcomeMessage(text = WELCOME_TEXT_STATIC): ChatMessage {
  return {
    id: 'welcome',
    role: 'assistant',
    kind: 'welcome',
    text,
    at: Date.now(),
  }
}

const TABS: { id: ActiveTab; label: string }[] = [
  { id: 'chat', label: 'Chat' },
  { id: 'insights', label: 'Insights' },
  { id: 'charts', label: 'Charts' },
]

export default function ContractAgentPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat')

  const { data: demoMap, isLoading, error: queriesErrorRaw } = useDemoQueries()
  const queriesError =
    queriesErrorRaw instanceof Error ? queriesErrorRaw : null
  const mutation = useRunQueryMutation()
  const { reset: resetMutation } = mutation
  const selectedQueryId = useAgentUiStore((s) => s.selectedQueryId)
  const setSelectedQueryId = useAgentUiStore((s) => s.setSelectedQueryId)

  const { data: contractRows } = useContractsData()

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    makeWelcomeMessage(),
  ])
  const [isAnalyzingDelay, setIsAnalyzingDelay] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const analyzeTimeoutRef = useRef<number | null>(null)

  // Once contract data loads, upgrade the welcome message with live portfolio intelligence
  useEffect(() => {
    if (!contractRows) return
    setMessages((prev) => {
      if (prev.length !== 1 || prev[0].id !== 'welcome') return prev
      const now = new Date()
      const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
      const health = getPortfolioHealth(contractRows, today)
      const atRisk = getAtRiskContracts(contractRows, today)
      const concentration = getClientConcentration(contractRows, today)
      const expired = concentration.top
        .filter((c) => c.hasExpiredAgreement)
        .map((c) => c.company)
      const text = buildDynamicWelcome(health, atRisk, expired)
      return [{ ...prev[0], text }]
    })
  }, [contractRows])

  useEffect(() => {
    resetMutation()
  }, [selectedQueryId, resetMutation])

  useEffect(() => {
    return () => {
      if (analyzeTimeoutRef.current) {
        window.clearTimeout(analyzeTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, mutation.isPending, isAnalyzingDelay])

  const items = useMemo(() => {
    if (!demoMap) {
      return []
    }
    return Object.values(demoMap).sort((a, b) => a.id.localeCompare(b.id))
  }, [demoMap])

  const selectedPrompt = useMemo(() => {
    if (!selectedQueryId || !demoMap) {
      return null
    }
    return demoMap[selectedQueryId]?.prompt ?? null
  }, [demoMap, selectedQueryId])

  const clearChat = () => {
    setMessages([makeWelcomeMessage()])
    mutation.reset()
    setIsAnalyzingDelay(false)
    if (analyzeTimeoutRef.current) {
      window.clearTimeout(analyzeTimeoutRef.current)
      analyzeTimeoutRef.current = null
    }
  }

  const run = () => {
    if (!selectedPrompt) {
      return
    }

    if (analyzeTimeoutRef.current) {
      window.clearTimeout(analyzeTimeoutRef.current)
      analyzeTimeoutRef.current = null
    }

    const now = Date.now()
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', text: selectedPrompt, at: now },
    ])
    setIsAnalyzingDelay(true)
    mutation.mutate(
      { query: selectedPrompt },
      {
        onSuccess: (data) => {
          analyzeTimeoutRef.current = window.setTimeout(() => {
            setMessages((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                role: 'assistant',
                kind: 'success',
                data,
                at: Date.now(),
              },
            ])
            setIsAnalyzingDelay(false)
            analyzeTimeoutRef.current = null
          }, 2000)
        },
        onError: (err) => {
          const message =
            err instanceof Error ? err.message : 'Request failed'
          analyzeTimeoutRef.current = window.setTimeout(() => {
            setMessages((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                role: 'assistant',
                kind: 'error',
                message,
                at: Date.now(),
              },
            ])
            setIsAnalyzingDelay(false)
            analyzeTimeoutRef.current = null
          }, 2000)
        },
      }
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Tab navigation */}
      <div
        className="mb-4 flex shrink-0 border-b border-[#E5E7EB] bg-[var(--oip-content-bg)]"
        role="tablist"
        aria-label="Contract Agent tabs"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={[
                'px-6 py-3 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06B6D4] focus-visible:ring-offset-1',
                isActive
                  ? 'border-b-2 border-[#06B6D4] text-[#1F2937]'
                  : 'border-b-2 border-transparent text-[#6B7280] hover:text-[#4B5563]',
              ].join(' ')}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab panels */}
      {activeTab === 'chat' && (
        <div className="flex min-h-0 flex-1 flex-col" role="tabpanel" aria-label="Chat">
          <div className="oip-chat-scroll min-h-0 flex-1 overflow-y-auto pr-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [-ms-overflow-style:none]">
            <ChatThread
              messages={messages}
              showTyping={mutation.isPending || isAnalyzingDelay}
            />
            <div ref={bottomRef} className="h-px w-full shrink-0" aria-hidden />
          </div>
          <div
            className="shrink-0 border-t border-[#E5E7EB] bg-[var(--oip-content-bg)] pt-4 shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.08)]"
            role="region"
            aria-label="Query composer"
          >
            <ChatComposer
              items={items}
              selectedId={selectedQueryId}
              onSelectId={(id) => setSelectedQueryId(id)}
              onRun={run}
              onClearChat={clearChat}
              isLoadingQueries={isLoading}
              isRunning={mutation.isPending || isAnalyzingDelay}
              queriesError={queriesError}
            />
          </div>
        </div>
      )}

      {activeTab === 'insights' && (
        <div
          className="oip-chat-scroll min-h-0 flex-1 overflow-y-auto pr-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [-ms-overflow-style:none]"
          role="tabpanel"
          aria-label="Insights"
        >
          <InsightsTab />
        </div>
      )}

      {activeTab === 'charts' && (
        <div
          className="oip-chat-scroll min-h-0 flex-1 overflow-y-auto pr-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [-ms-overflow-style:none]"
          role="tabpanel"
          aria-label="Charts"
        >
          <ChartsTab />
        </div>
      )}
    </div>
  )
}

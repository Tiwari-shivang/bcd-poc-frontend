import { useState, type ReactNode } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'

import { AnalysisMarkdown } from '@/features/contract-agent/components/analysis-markdown'
import { ChatAssistantAvatar } from '@/features/contract-agent/components/chat-assistant-avatar'
import { TechnicalDetails } from '@/features/contract-agent/components/technical-details'
import { cn } from '@/lib/utils'
import type { AgentResponse } from '@/types/agent-api'

export type ChatMessage =
  | { id: string; role: 'user'; text: string; at: number }
  | { id: string; role: 'assistant'; kind: 'welcome'; text: string; at: number }
  | {
      id: string
      role: 'assistant'
      kind: 'success'
      data: AgentResponse
      at: number
    }
  | { id: string; role: 'assistant'; kind: 'error'; message: string; at: number }

function formatMessageTime(ts: number) {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(ts))
}

function MessageTime({ at, align }: { at: number; align: 'end' | 'start' }) {
  return (
    <p
      className={cn(
        'mt-1 text-[11px] text-[#9CA3AF]',
        align === 'end' ? 'text-right' : 'text-left pl-11'
      )}
    >
      {formatMessageTime(at)}
    </p>
  )
}

function UserBubble({ text, at }: { text: string; at: number }) {
  return (
    <div className="message-enter flex flex-col items-end">
      <div
        className="max-w-[min(100%,32rem)] rounded-xl rounded-br-md bg-[#3B82F6] px-4 py-3 text-[14px] leading-snug text-white shadow-md transition-shadow hover:shadow-lg"
        style={{
          boxShadow:
            '0 4px 14px -2px rgba(59, 130, 246, 0.45), 0 2px 6px -2px rgba(0,0,0,0.08)',
        }}
      >
        <p>{text}</p>
      </div>
      <MessageTime at={at} align="end" />
    </div>
  )
}

function AssistantShell({
  children,
  className,
  wide,
}: {
  children: ReactNode
  className?: string
  wide?: boolean
}) {
  return (
    <div className={cn('flex gap-3', wide && 'w-full max-w-full')}>
      <ChatAssistantAvatar className="mt-1 shrink-0" />
      <div
        className={cn(
          'min-w-0 rounded-xl rounded-bl-md border border-[#E5E7EB] bg-[#F5F5F5] px-3.5 py-3 text-[14px] leading-snug text-[#374151] shadow-sm transition-shadow hover:shadow-md',
          wide
            ? 'max-w-full flex-1 lg:max-w-[min(100%,52rem)]'
            : 'max-w-[min(100%,36rem)]',
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}

function AssistantSuccessBody({ data }: { data: AgentResponse }) {
  const [technicalOpen, setTechnicalOpen] = useState(false)

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-[#E5E7EB] bg-white p-3.5 shadow-sm">
        <h3 className="mb-2 flex items-center gap-2 text-[15px] font-semibold text-[#111827]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" aria-hidden />
          Analysis
        </h3>
        <AnalysisMarkdown content={data.analysis} />
      </section>

      <TechnicalDetails
        open={technicalOpen}
        onOpenChange={setTechnicalOpen}
        data={data}
      />
    </div>
  )
}

export interface ChatThreadProps {
  messages: ChatMessage[]
  showTyping: boolean
}

export function ChatThread({ messages, showTyping }: ChatThreadProps) {
  return (
    <div className="space-y-6">
      {messages.map((m) => {
        if (m.role === 'user') {
          return <UserBubble key={m.id} text={m.text} at={m.at} />
        }
        if (m.kind === 'welcome') {
          return (
            <div key={m.id} className="message-enter flex flex-col">
              <AssistantShell>
                <AnalysisMarkdown content={m.text} />
              </AssistantShell>
              <MessageTime at={m.at} align="start" />
            </div>
          )
        }
        if (m.kind === 'error') {
          return (
            <div key={m.id} className="message-enter flex flex-col">
              <AssistantShell wide>
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50/90 p-4"
                >
                  <div className="flex gap-3">
                    <AlertTriangle
                      className="size-5 shrink-0 text-red-600"
                      aria-hidden
                    />
                    <div>
                      <p className="font-semibold text-red-900">
                        Something went wrong
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-red-800">
                        {m.message}
                      </p>
                      <p className="mt-3 text-sm text-red-700/90">
                        Try a different question from the menu or send again after
                        checking your connection.
                      </p>
                    </div>
                  </div>
                </div>
              </AssistantShell>
              <MessageTime at={m.at} align="start" />
            </div>
          )
        }
        return (
          <div key={m.id} className="message-enter flex flex-col">
            <AssistantShell wide>
              <AssistantSuccessBody data={m.data} />
            </AssistantShell>
            <MessageTime at={m.at} align="start" />
          </div>
        )
      })}

      {showTyping ? (
        <div className="message-enter flex gap-3">
          <ChatAssistantAvatar className="mt-1 shrink-0" />
          <div className="flex items-center gap-2 rounded-xl rounded-bl-md border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#6B7280] shadow-sm">
            <Loader2
              className="size-4 shrink-0 animate-spin text-[#5B4AE6]"
              aria-hidden
            />
            <span>Analyzing contracts…</span>
          </div>
        </div>
      ) : null}
    </div>
  )
}

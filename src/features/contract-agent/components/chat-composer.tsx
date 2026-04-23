import { ArrowRight, Loader2, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import type { DemoQueryItem } from '@/types/agent-api'

export interface ChatComposerProps {
  items: DemoQueryItem[]
  selectedId: string | null
  onSelectId: (id: string) => void
  onRun: () => void
  onClearChat: () => void
  isLoadingQueries: boolean
  isRunning: boolean
  queriesError: Error | null
}

export function ChatComposer({
  items,
  selectedId,
  onSelectId,
  onRun,
  onClearChat,
  isLoadingQueries,
  isRunning,
  queriesError,
}: ChatComposerProps) {
  const selected = selectedId
    ? items.find((q) => q.id === selectedId)
    : undefined

  if (isLoadingQueries) {
    return (
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.12)]">
        <Skeleton className="mb-4 h-9 w-full max-w-lg rounded-full" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <div className="mt-3 flex justify-between border-t border-[#F3F4F6] pt-3">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="size-12 rounded-full" />
        </div>
      </div>
    )
  }

  if (queriesError) {
    return (
      <div
        className="rounded-2xl border border-red-200 bg-red-50/80 p-5 text-sm text-red-800 shadow-md"
        role="alert"
      >
        <p className="font-semibold text-red-900">Could not load questions</p>
        <p className="mt-1 text-red-800">{queriesError.message}</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.1)] transition-shadow duration-300 hover:shadow-[0_8px_30px_-12px_rgba(91,74,230,0.15)]">
      <label className="sr-only" htmlFor="contract-query-select">
        Contract query
      </label>
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <Select
            value={selectedId ?? undefined}
            onValueChange={(v) => onSelectId(v)}
          >
            <SelectTrigger
              id="contract-query-select"
              className="h-auto min-h-11 w-full rounded-lg border-[#E5E7EB] bg-[#FAFAFA] px-3.5 py-2.5 text-left text-[14px] leading-snug text-[#1F2937] shadow-none ring-offset-white transition-colors hover:bg-[#F3F4F6] focus:border-[#5B4AE6] focus:ring-[#5B4AE6]/20"
            >
              <SelectValue placeholder="Select a question…" />
            </SelectTrigger>
            <SelectContent className="max-h-[min(24rem,70vh)]">
              {items.map((q) => (
                <SelectItem key={q.id} value={q.id} className="py-2.5">
                  <div className="flex max-w-[min(100vw-5rem,30rem)] flex-col gap-0.5 text-left">
                    <span className="font-medium leading-snug text-[#111827]">
                      {q.prompt}
                    </span>
                    <span className="text-xs font-normal text-[#6B7280]">
                      {q.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="button"
          size="icon"
          disabled={!selectedId || isRunning}
          onClick={onRun}
          className="size-11 shrink-0 rounded-lg bg-[var(--oip-accent)] text-white shadow-md transition-all hover:bg-[color-mix(in_srgb,var(--oip-accent)_86%,black)] hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
          aria-label="Send"
        >
          {isRunning ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <ArrowRight className="size-4" aria-hidden />
          )}
        </Button>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="min-w-0 truncate text-[12px] text-[#6B7280]">
          {selected ? selected.description : 'Choose one of the 3 demo questions.'}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClearChat}
          disabled={isRunning}
          className="h-8 shrink-0 gap-1.5 px-2 text-[12px] text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]"
        >
          <RotateCcw className="size-3.5" aria-hidden />
          Clear
        </Button>
      </div>
    </div>
  )
}

import { Check, ChevronDown, Copy, FileSpreadsheet } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import { ResultsTable } from '@/features/contract-agent/components/results-table'
import type { AgentResponse } from '@/types/agent-api'

export interface TechnicalDetailsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: AgentResponse | null
}

export function TechnicalDetails({
  open,
  onOpenChange,
  data,
}: TechnicalDetailsProps) {
  const [copied, setCopied] = useState(false)
  const [resultsOpen, setResultsOpen] = useState(true)

  if (!data) {
    return null
  }

  const copySql = async () => {
    try {
      await navigator.clipboard.writeText(data.query_used)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const chevronClass = open
    ? 'size-4 shrink-0 rotate-180 transition-transform duration-200'
    : 'size-4 shrink-0 transition-transform duration-200'

  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 w-full justify-between gap-2 rounded-md border-[#E5E7EB] bg-white text-[13px] text-[#374151] shadow-sm hover:bg-[#F9FAFB]"
          aria-expanded={open}
        >
          <span className="font-medium">Technical details</span>
          <ChevronDown className={chevronClass} aria-hidden />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 mt-3 space-y-3 duration-200">
        <Collapsible open={resultsOpen} onOpenChange={setResultsOpen}>
          <div className="rounded-md border border-[#E5E7EB] bg-white p-3 shadow-sm">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="flex h-auto w-full items-center justify-between gap-2 rounded-md px-0 py-0 text-left hover:bg-transparent"
                aria-expanded={resultsOpen}
              >
                <div className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-md bg-[color-mix(in_srgb,var(--oip-accent)_14%,white)] text-[var(--oip-accent)]">
                    <FileSpreadsheet className="size-4" aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-[13px] font-semibold text-[#111827]">
                      Query results
                    </h3>
                    <p className="text-[12px] text-[#6B7280]">
                      {data.results.length} record
                      {data.results.length === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>
                <span className="text-[12px] font-medium text-[var(--oip-accent)]">
                  {resultsOpen ? 'Hide' : 'Show'}
                </span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 mt-3 duration-200">
              <ResultsTable rows={data.results} />
            </CollapsibleContent>
          </div>
        </Collapsible>
        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              SQL query
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 px-2 text-[12px] text-[var(--oip-accent)] hover:bg-[color-mix(in_srgb,var(--oip-accent)_14%,white)] hover:text-[color-mix(in_srgb,var(--oip-accent)_86%,black)]"
              onClick={(e) => {
                e.preventDefault()
                void copySql()
              }}
            >
              {copied ? (
                <>
                  <Check className="size-3.5" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  Copy SQL
                </>
              )}
            </Button>
          </div>
          <pre className="oip-hide-scrollbar overflow-x-auto rounded-md bg-[#111827] p-3 font-mono text-[12px] leading-relaxed text-[#E5E7EB] shadow-inner [-webkit-overflow-scrolling:touch]">
            <code>{data.query_used}</code>
          </pre>
        </div>
        <Separator className="bg-[#E5E7EB]" />
        <div className="grid gap-2.5 sm:grid-cols-2">
          <div className="rounded-md border border-[#E5E7EB] bg-[#F9FAFB] p-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              Tables used
            </h3>
            <p className="mt-1 font-mono text-[13px] text-[#1F2937]">
              {data.data_citations.tables.join(', ')}
            </p>
          </div>
          <div className="rounded-md border border-[#E5E7EB] bg-[#F9FAFB] p-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              Columns cited
            </h3>
            <p className="mt-1 text-[13px] leading-snug text-[#374151]">
              {data.data_citations.columns.join(', ')}
            </p>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

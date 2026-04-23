import type { CalendarEntry } from '@/features/contract-agent/utils/data-calculations'
import { InsightCard } from './insight-card'

interface Props {
  quarters: Record<string, CalendarEntry[]>
  peakQuarter: string
}

/**
 * Semantic tags: Q2 → urgent red; Q3/Q4 (and Q1 same-year) → warm amber;
 * year-only keys (2027+) → emerald or blue.
 */
function calendarSemantic(quarterKey: string): { dot: string; tag: string } {
  const key = quarterKey.trim()
  if (/^\d{4}$/.test(key)) {
    const y = parseInt(key, 10)
    const useBlue = y % 2 === 1
    if (useBlue) {
      return {
        dot: 'bg-[#2563EB]',
        tag: 'border border-blue-200 bg-blue-100 text-blue-900',
      }
    }
    return {
      dot: 'bg-[#10B981]',
      tag: 'border border-emerald-200 bg-emerald-100 text-emerald-900',
    }
  }
  if (/\bQ2\b/.test(key)) {
    return {
      dot: 'bg-[#EF4444]',
      tag: 'border border-red-200 bg-red-100 text-red-800',
    }
  }
  if (/\bQ[134]\b/.test(key)) {
    return {
      dot: 'bg-[#F59E0B]',
      tag: 'border border-amber-200 bg-amber-100 text-amber-900',
    }
  }
  return {
    dot: 'bg-[#64748B]',
    tag: 'border border-slate-200 bg-slate-100 text-slate-800',
  }
}

export function RenewalCalendarCard({ quarters, peakQuarter }: Props) {
  const entries = Object.entries(quarters)

  return (
    <InsightCard title="Renewal Calendar">
      {entries.length === 0 ? (
        <p className="text-[13px] text-[#475569]">No upcoming renewals found.</p>
      ) : (
        <div className="space-y-4">
          {entries.map(([quarter, contracts]) => {
            const { dot, tag } = calendarSemantic(quarter)
            return (
              <div key={quarter}>
                <div className="mb-1.5 flex items-center gap-2">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
                  <span className="text-[13px] font-semibold text-[#1F2937]">{quarter}</span>
                  <span className={`ml-auto rounded px-2 py-0.5 text-[11px] font-medium ${tag}`}>
                    {contracts.length} contract{contracts.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <ul className="ml-4 space-y-1">
                  {contracts.map((c, i) => (
                    <li key={i} className="flex items-center justify-between text-[12px]">
                      <span className="text-[#475569]">{c.name}</span>
                      <span className="text-[#64748B]">{c.date}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}

          {peakQuarter && (
            <div className="mt-2 border-t border-[#F3F4F6] pt-3 text-[12px] text-[#475569]">
              Peak quarter: <span className="font-semibold text-[#1F2937]">{peakQuarter}</span>
            </div>
          )}
        </div>
      )}
    </InsightCard>
  )
}

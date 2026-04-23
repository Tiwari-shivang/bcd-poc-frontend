import { useState } from 'react'

import type { ClientConcentrationItem } from '@/features/contract-agent/utils/data-calculations'
import { InsightCard } from './insight-card'

interface Props {
  top: ClientConcentrationItem[]
  others: ClientConcentrationItem
  diversification: 'GOOD' | 'AT RISK'
}

/** Top clients: indigo, teal, violet; aggregate: neutral grey */
const COLORS = ['#4F46E5', '#0F766A', '#7C3AED']
const OTHERS_COLOR = '#CBD5E1'

const DIV_STYLE: Record<string, string> = {
  GOOD: 'bg-emerald-50 text-emerald-800',
  'AT RISK': 'bg-red-50 text-red-800',
}

export function ClientConcentrationCard({ top, others, diversification }: Props) {
  const all = [...top, others]
  const total = all.reduce((s, x) => s + x.count, 0)
  const [tooltip, setTooltip] = useState<string | null>(null)

  return (
    <InsightCard title="Client Concentration">
      <div className="space-y-3">
        {all.map((item, i) => {
          const isOthers = item.company === 'Others'
          const fill = isOthers ? OTHERS_COLOR : (COLORS[i] ?? OTHERS_COLOR)
          const hasWarning = !isOthers && item.hasExpiredAgreement

          return (
            <div key={item.company}>
              <div className="mb-1 flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: fill }}
                  />
                  <span className="font-medium text-[#1F2937] truncate max-w-[140px]">
                    {item.company}
                  </span>
                  {hasWarning && (
                    <span className="relative inline-flex">
                      <button
                        type="button"
                        aria-label="Data quality warning"
                        className="h-2.5 w-2.5 rounded-full bg-[#F97316] flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:ring-offset-1 hover:bg-[#EA580C] transition-colors"
                        onMouseEnter={() => setTooltip(item.company)}
                        onMouseLeave={() => setTooltip(null)}
                        onFocus={() => setTooltip(item.company)}
                        onBlur={() => setTooltip(null)}
                      />
                      {tooltip === item.company && (
                        <span
                          role="tooltip"
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 w-52 rounded-md bg-[#1F2937] px-3 py-2 text-[11px] text-white leading-snug shadow-lg pointer-events-none"
                        >
                          Agreement expired — active status mismatch. Running under extension.
                          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1F2937]" />
                        </span>
                      )}
                    </span>
                  )}
                </div>
                <span className="text-[#475569]">
                  {item.count} <span className="text-[11px]">({item.pct}%)</span>
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#F3F4F6]">
                <div
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${(item.count / total) * 100}%`,
                    backgroundColor: fill,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-[12px] text-[#475569]">Diversification</span>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${DIV_STYLE[diversification] ?? 'bg-gray-100 text-gray-600'}`}>
          {diversification}
        </span>
      </div>
    </InsightCard>
  )
}

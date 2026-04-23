import { useState } from 'react'

import type { AtRiskContract } from '@/features/contract-agent/utils/data-calculations'
import { InsightCard } from './insight-card'

interface Props {
  data: AtRiskContract[]
}

function urgencyColor(days: number): string {
  if (days <= 30) return 'text-[#EF4444]'
  if (days <= 60) return 'text-[#F59E0B]'
  return 'text-[#64748B]'
}

export function AtRiskContractsCard({ data }: Props) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? data : data.slice(0, 4)

  return (
    <InsightCard title="Contracts Expiring Soon">
      {data.length === 0 ? (
        <p className="text-[13px] text-[#6B7280]">No contracts expiring within 90 days.</p>
      ) : (
        <>
          <p className="mb-3 text-[12px] text-[#475569]">Sorted by days remaining (ascending)</p>
          <ol className="space-y-3">
            {visible.map((contract, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-[11px] font-semibold text-[#475569]">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[13px] font-medium text-[#1F2937]">
                      {contract.name}
                    </span>
                    <span className={`shrink-0 text-[12px] font-semibold ${urgencyColor(contract.days)}`}>
                      {contract.days}d
                    </span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-[#64748B]">
                    {contract.date} &middot; <span className="italic">{contract.owner}</span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
          {data.length > 4 && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="mt-3 text-[12px] font-medium text-[#06B6D4] hover:underline"
            >
              {showAll ? 'Show less' : `View all ${data.length}`}
            </button>
          )}
        </>
      )}
    </InsightCard>
  )
}

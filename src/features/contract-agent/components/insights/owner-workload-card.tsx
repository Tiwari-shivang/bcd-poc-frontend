import type { OwnerWorkloadItem } from '@/features/contract-agent/utils/data-calculations'
import { InsightCard } from './insight-card'

interface Props {
  items: OwnerWorkloadItem[]
  balance: 'BALANCED' | 'UNEVEN' | 'CRITICAL'
  total: number
}

const BALANCE_STYLE: Record<string, string> = {
  BALANCED: 'bg-emerald-50 text-emerald-700',
  UNEVEN: 'bg-yellow-50 text-yellow-700',
  CRITICAL: 'bg-red-50 text-red-700',
}

export function OwnerWorkloadCard({ items, balance, total }: Props) {
  const visible = items.slice(0, 5)

  return (
    <InsightCard title="Team Workload">
      <div className="space-y-2.5">
        {visible.map((item) => {
          const pct = total > 0 ? Math.round((item.contracts / total) * 100) : 0
          return (
            <div key={item.owner}>
              <div className="mb-1 flex items-center justify-between text-[13px]">
                <span className="font-medium text-[#1F2937] truncate max-w-[160px]">{item.owner}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[#475569]">{item.contracts} ({pct}%)</span>
                  {item.renewalsDue > 0 && (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-900">
                      {item.renewalsDue} due
                    </span>
                  )}
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#F3F4F6]">
                <div
                  className="h-1.5 rounded-full bg-[#0F766A] transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
        {items.length > 5 && (
          <p className="text-[12px] text-[#9CA3AF]">+ {items.length - 5} more owners</p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-[12px] font-medium text-[#0F766A]">Workload Balance</span>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${BALANCE_STYLE[balance] ?? 'bg-gray-100 text-gray-600'}`}>
          {balance}
        </span>
      </div>
    </InsightCard>
  )
}

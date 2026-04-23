import type { MetricCard } from '@/features/contract-agent/utils/data-calculations'
import { ChartContainer } from './chart-container'

interface Props {
  data: MetricCard[]
}

export function MetricsCardsChart({ data }: Props) {
  return (
    <ChartContainer title="Key Metrics">
      <div className="grid grid-cols-2 gap-3">
        {data.map((card) => (
          <div
            key={card.title}
            className="relative overflow-hidden rounded-lg border border-[#E5E7EB] bg-white p-4"
          >
            {/* Colored left accent bar */}
            <div
              className="absolute inset-y-0 left-0 w-1 rounded-l-lg"
              style={{ backgroundColor: card.accentColor }}
            />
            <p className="pl-2 text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
              {card.title}
            </p>
            <p className="pl-2 text-[28px] font-bold leading-tight text-[#1F2937]">
              {card.value}
            </p>
            <p className="pl-2 text-[11px] text-[#9CA3AF]">{card.subtitle}</p>
          </div>
        ))}
      </div>
    </ChartContainer>
  )
}

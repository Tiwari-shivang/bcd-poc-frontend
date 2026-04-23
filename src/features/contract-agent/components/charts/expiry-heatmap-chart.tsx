import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { QuarterBar } from '@/features/contract-agent/utils/data-calculations'
import { ChartContainer } from './chart-container'

interface Props {
  data: QuarterBar[]
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { payload: QuarterBar }[]; label?: string }) {
  if (!active || !payload?.length) return null
  const bar = payload[0].payload
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-3 shadow-lg text-[12px]">
      <p className="font-semibold text-[#1F2937] mb-1">{label}</p>
      <p className="text-[#6B7280] mb-1">{bar.count} contract{bar.count !== 1 ? 's' : ''}</p>
      {bar.contracts.map((c, i) => (
        <p key={i} className="text-[#9CA3AF]">{c}</p>
      ))}
    </div>
  )
}

export function ExpiryHeatmapChart({ data }: Props) {
  return (
    <ChartContainer title="Expirations by Quarter">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
          <XAxis dataKey="quarter" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

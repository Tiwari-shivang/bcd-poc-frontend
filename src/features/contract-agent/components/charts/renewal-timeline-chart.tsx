import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { TimelinePoint } from '@/features/contract-agent/utils/data-calculations'
import { ChartContainer } from './chart-container'

interface Props {
  data: TimelinePoint[]
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; payload: TimelinePoint }[]; label?: string }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-3 shadow-lg text-[12px]">
      <p className="font-semibold text-[#1F2937] mb-1">{label}</p>
      <p className="text-[#6B7280]">{point.count} contract{point.count !== 1 ? 's' : ''}</p>
      {point.contracts.length > 0 && (
        <ul className="mt-1 space-y-0.5">
          {point.contracts.map((c, i) => (
            <li key={i} className="text-[#9CA3AF]">{c}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function RenewalTimelineChart({ data }: Props) {
  return (
    <ChartContainer title="Contracts Expiring by Month">
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="timelineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#06B6D4"
            strokeWidth={2}
            fill="url(#timelineGrad)"
            dot={{ fill: '#06B6D4', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

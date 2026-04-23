import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import type { StatusSlice } from '@/features/contract-agent/utils/data-calculations'
import { ChartContainer } from './chart-container'

interface Props {
  data: StatusSlice[]
}

const RADIAN = Math.PI / 180
function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: {
  cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number
}) {
  if (percent < 0.05) return null
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export function StatusDistributionChart({ data }: Props) {
  const total = data.reduce((s, d) => s + d.count, 0)

  return (
    <ChartContainer title="Contract Status Distribution">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            outerRadius={90}
            dataKey="count"
            nameKey="status"
            labelLine={false}
            label={renderCustomLabel}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [
              `${value} (${Math.round((value / total) * 100)}%)`,
              name,
            ]}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

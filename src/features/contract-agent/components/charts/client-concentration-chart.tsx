import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import type { CompanySlice } from '@/features/contract-agent/utils/data-calculations'
import { ChartContainer } from './chart-container'

interface Props {
  data: CompanySlice[]
}

export function ClientConcentrationChart({ data }: Props) {
  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <ChartContainer title="Contracts by Company">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            outerRadius={90}
            innerRadius={45}
            dataKey="value"
            nameKey="company"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => {
              const numericValue =
                typeof value === 'number' ? value : Number(value ?? 0)
              return [
                `${numericValue} (${Math.round((numericValue / total) * 100)}%)`,
                String(name),
              ]
            }}
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

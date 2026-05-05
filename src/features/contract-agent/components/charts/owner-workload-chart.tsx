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

import type { OwnerBar } from '@/features/contract-agent/utils/data-calculations'
import { ChartContainer } from './chart-container'

interface Props {
  data: OwnerBar[]
}

export function OwnerWorkloadChart({ data }: Props) {
  return (
    <ChartContainer title="Contracts per Owner">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 32, left: 8, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
          <YAxis
            type="category"
            dataKey="owner"
            width={110}
            tick={{ fontSize: 11, fill: '#6B7280' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: '#F3F4F6' }}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
            formatter={(value) => {
              const numericValue =
                typeof value === 'number' ? value : Number(value ?? 0)
              return [
                `${numericValue} contract${numericValue !== 1 ? 's' : ''}`,
                'Contracts',
              ]
            }}
          />
          <Bar dataKey="contracts" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill="#06B6D4" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

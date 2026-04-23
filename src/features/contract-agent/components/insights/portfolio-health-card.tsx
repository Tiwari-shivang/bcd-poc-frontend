import { useEffect, useState } from 'react'

import type { PortfolioHealth } from '@/features/contract-agent/utils/data-calculations'
import { InsightCard } from './insight-card'

interface Props {
  data: PortfolioHealth
}

const STATUS_COLOR: Record<PortfolioHealth['status'], string> = {
  HEALTHY: '#10B981',
  GOOD: '#F59E0B',
  'AT RISK': '#EF4444',
}

const STATUS_BG: Record<PortfolioHealth['status'], string> = {
  HEALTHY: 'bg-emerald-50 text-emerald-800',
  GOOD: 'bg-amber-50 text-amber-700',
  'AT RISK': 'bg-red-50 text-red-800',
}

export function PortfolioHealthCard({ data }: Props) {
  const color = STATUS_COLOR[data.status]

  const activePct = data.total > 0 ? Math.round((data.active / data.total) * 100) : 0
  const atRiskPct = data.total > 0 ? Math.round((data.atRisk / data.total) * 100) : 0
  const lostPct = data.total > 0 ? Math.round((data.lost / data.total) * 100) : 0

  // Animate bar from 0 → score on mount
  const [barWidth, setBarWidth] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setBarWidth(data.score), 60)
    return () => clearTimeout(t)
  }, [data.score])

  // Count-up the score number over 800ms
  const [displayScore, setDisplayScore] = useState(0)
  useEffect(() => {
    const DURATION = 800
    const STEPS = 40
    const stepSize = data.score / STEPS
    let current = 0
    const id = setInterval(() => {
      current = Math.min(current + stepSize, data.score)
      setDisplayScore(Math.round(current))
      if (current >= data.score) clearInterval(id)
    }, DURATION / STEPS)
    return () => clearInterval(id)
  }, [data.score])

  return (
    <InsightCard title="Portfolio Health">
      <div className="flex items-end gap-3 mb-3">
        <span className="text-[48px] font-bold leading-none tabular-nums" style={{ color }}>
          {displayScore}
        </span>
        <span className="mb-1 text-[18px] font-medium text-[#64748B]">/100</span>
        <span
          className={`mb-1 ml-auto rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BG[data.status]}`}
        >
          {data.status}
        </span>
      </div>

      {/* Progress bar — animates from 0 to score */}
      <div className="mb-3 h-2 w-full rounded-full bg-[#F3F4F6]">
        <div
          className="h-2 rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${barWidth}%`, backgroundColor: color }}
        />
      </div>

      {/* Micro-legend chips */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Chip label={`${data.active} active`} arrow="up" color="#10B981" bg="bg-emerald-50" text="text-emerald-700" />
        <Chip label={`${data.atRisk} at-risk`} arrow="down" color="#F59E0B" bg="bg-amber-50" text="text-amber-700" />
        <Chip label={`${data.lost} lost`} arrow="down" color="#EF4444" bg="bg-red-50" text="text-red-700" />
      </div>

      <div className="space-y-2">
        <Row label="Active Contracts" value={`${data.active}/${data.total}`} pct={activePct} color="#10B981" />
        <Row label="At-Risk Soon (< 90d)" value={`${data.atRisk}/${data.total}`} pct={atRiskPct} color="#F59E0B" />
        <Row label="Lost / Closed" value={`${data.lost}/${data.total}`} pct={lostPct} color="#EF4444" />
      </div>
    </InsightCard>
  )
}

function Chip({
  label, arrow, bg, text,
}: {
  label: string
  arrow: 'up' | 'down'
  color: string
  bg: string
  text: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${bg} ${text}`}
    >
      {label}
      <span aria-hidden>{arrow === 'up' ? '↑' : '↓'}</span>
    </span>
  )
}

function Row({ label, value, pct, color }: { label: string; value: string; pct: number; color: string }) {
  return (
    <div className="flex items-center justify-between text-[13px]">
      <span className="text-[#475569]">{label}</span>
      <span className="font-medium text-[#1F2937]">
        {value}{' '}
        <span style={{ color }} className="font-normal">
          ({pct}%)
        </span>
      </span>
    </div>
  )
}

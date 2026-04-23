import { useEffect, useMemo, useState } from 'react'

import {
  buildProactiveInsights,
  getAtRiskContracts,
  getClientConcentration,
  getPortfolioHealth,
} from '@/features/contract-agent/utils/data-calculations'
import { useContractsData } from '../hooks/use-contracts-data'

const KIND_STYLES = {
  warning: {
    border: 'border-l-[#F97316]',
    bg: 'bg-[#FFF8EB]',
    dot: 'bg-[#F97316]',
    label: '⚠ Watching',
    labelColor: 'text-[#B45309]',
    textColor: 'text-[#78350F]',
  },
  alert: {
    border: 'border-l-[#EF4444]',
    bg: 'bg-[#FEF2F2]',
    dot: 'bg-[#EF4444]',
    label: '● Alert',
    labelColor: 'text-[#B91C1C]',
    textColor: 'text-[#7F1D1D]',
  },
  info: {
    border: 'border-l-[#06B6D4]',
    bg: 'bg-[#ECFEFF]',
    dot: 'bg-[#06B6D4]',
    label: '◎ Monitoring',
    labelColor: 'text-[#0891B2]',
    textColor: 'text-[#164E63]',
  },
}

export function AgentInsightBanner() {
  const { data: rows } = useContractsData()
  const [current, setCurrent] = useState(0)
  const [visible, setVisible] = useState(true)

  const insights = useMemo(() => {
    if (!rows) return []
    const now = new Date()
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    const health = getPortfolioHealth(rows, today)
    const atRisk = getAtRiskContracts(rows, today)
    const concentration = getClientConcentration(rows, today)
    const expired = concentration.top
      .filter((c) => c.hasExpiredAgreement)
      .map((c) => c.company)
    return buildProactiveInsights(health, atRisk, expired)
  }, [rows])

  useEffect(() => {
    if (insights.length <= 1) return
    const id = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setCurrent((c) => (c + 1) % insights.length)
        setVisible(true)
      }, 300)
    }, 6000)
    return () => clearInterval(id)
  }, [insights.length])

  if (!rows || insights.length === 0) return null

  const insight = insights[current]
  const style = KIND_STYLES[insight.kind]

  return (
    <div
      className={`mb-4 flex items-center gap-3 rounded-r-lg border-l-4 px-4 py-2.5 transition-opacity duration-300 ${style.border} ${style.bg} ${visible ? 'opacity-100' : 'opacity-0'}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className={`shrink-0 text-[10px] font-bold uppercase tracking-widest ${style.labelColor}`}>
        {style.label}
      </span>

      <p className={`min-w-0 flex-1 text-[12px] leading-snug ${style.textColor}`}>
        {insight.text}
      </p>

      {insights.length > 1 && (
        <div className="flex shrink-0 items-center gap-1" aria-hidden>
          {insights.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? `w-4 ${style.dot}` : 'w-1.5 bg-black/15'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
